const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const QRCode = require('qrcode');
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Global variables
let sock = null;
let qrCode = null;
let isConnected = false;
let autoReplies = [];

// Logger
const logger = P({ level: 'silent' });

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        connected: isConnected,
        qrCode: qrCode,
        autoReplies: autoReplies
    });
});

app.post('/api/auto-replies', (req, res) => {
    const { keyword, reply } = req.body;
    if (!keyword || !reply) {
        return res.status(400).json({ error: 'Keyword and reply are required' });
    }

    autoReplies.push({ keyword: keyword.toLowerCase(), reply });
    saveAutoReplies();
    res.json({ success: true, autoReplies });
});

app.delete('/api/auto-replies/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < autoReplies.length) {
        autoReplies.splice(index, 1);
        saveAutoReplies();
        res.json({ success: true, autoReplies });
    } else {
        res.status(400).json({ error: 'Invalid index' });
    }
});

app.post('/api/disconnect', (req, res) => {
    if (sock) {
        sock.logout();
        sock = null;
        isConnected = false;
        qrCode = null;
        // Clear auth session
        fs.removeSync('./auth_info_baileys');
        io.emit('status', { connected: false, qrCode: null });
    }
    res.json({ success: true });
});

// Save auto replies to file
function saveAutoReplies() {
    fs.writeJsonSync('./auto_replies.json', autoReplies);
}

// Load auto replies from file
function loadAutoReplies() {
    try {
        if (fs.existsSync('./auto_replies.json')) {
            autoReplies = fs.readJsonSync('./auto_replies.json');
        }
    } catch (error) {
        console.log('No existing auto replies found');
        autoReplies = [];
    }
}

// WhatsApp connection function
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

    sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state,
        browser: ['WhatsApp Auto Reply', 'Chrome', '1.0.0']
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            try {
                qrCode = await QRCode.toDataURL(qr);
                io.emit('qr', qrCode);
                console.log('QR Code generated');
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);

            isConnected = false;
            qrCode = null;
            io.emit('status', { connected: false, qrCode: null });

            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 3000);
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connection opened');
            isConnected = true;
            qrCode = null;
            io.emit('status', { connected: true, qrCode: null });
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];

        if (!message.key.fromMe && message.message) {
            const messageText = message.message.conversation ||
                              message.message.extendedTextMessage?.text || '';

            if (messageText) {
                console.log('Received message:', messageText);

                // Check for auto replies
                const lowerText = messageText.toLowerCase();
                for (const autoReply of autoReplies) {
                    if (lowerText.includes(autoReply.keyword)) {
                        try {
                            await sock.sendMessage(message.key.remoteJid, {
                                text: autoReply.reply
                            });
                            console.log(`Auto replied to "${messageText}" with "${autoReply.reply}"`);
                            break;
                        } catch (error) {
                            console.error('Error sending auto reply:', error);
                        }
                    }
                }
            }
        }
    });
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected');

    // Send current status
    socket.emit('status', {
        connected: isConnected,
        qrCode: qrCode,
        autoReplies: autoReplies
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Initialize
loadAutoReplies();
connectToWhatsApp();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});