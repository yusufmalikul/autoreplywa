# WhatsApp Auto Reply Bot

A modern, web-based WhatsApp auto-reply bot built with Baileys (unofficial WhatsApp API) and Express.js. Features a beautiful single-page interface for QR code scanning and auto-reply management.

## Features

- 🤖 **Automatic Replies**: Set up keyword-based auto replies
- 📱 **QR Code Authentication**: Easy WhatsApp connection via QR code
- 🌐 **Web Interface**: Beautiful, responsive single-page application
- ⚡ **Real-time Updates**: Live connection status and message handling
- 💾 **Persistent Storage**: Auto replies are saved and restored
- 🔄 **Auto Reconnection**: Automatic reconnection on connection loss

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- WhatsApp account
- macOS, Windows, or Linux

## Installation

1. **Clone or download this project**
   ```bash
   cd autoreply
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### 1. Connect WhatsApp

1. Open the web interface at `http://localhost:3000`
2. You'll see a QR code on the screen
3. Open WhatsApp on your phone
4. Go to **Settings** → **Linked Devices** → **Link a Device**
5. Scan the QR code displayed on the website
6. Wait for the connection to be established

### 2. Set Up Auto Replies

Once connected, you can:

1. **Add Auto Replies**:
   - Enter a keyword (trigger word)
   - Enter the reply message
   - Click "Add Auto Reply"

2. **Manage Auto Replies**:
   - View all active auto replies
   - Delete unwanted auto replies
   - Auto replies are automatically saved

3. **How Auto Replies Work**:
   - When someone sends a message containing your keyword
   - The bot automatically replies with your configured message
   - Keywords are case-insensitive
   - Only works for incoming messages (not your own messages)

### 3. Disconnect

- Click the "Disconnect WhatsApp" button to logout
- This will clear the session and require QR code scanning again

## API Endpoints

The application also provides REST API endpoints:

- `GET /api/status` - Get connection status and auto replies
- `POST /api/auto-replies` - Add new auto reply
- `DELETE /api/auto-replies/:index` - Delete auto reply
- `POST /api/disconnect` - Disconnect WhatsApp

## File Structure

```
autoreply/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/
│   └── index.html         # Web interface
├── auth_info_baileys/     # WhatsApp session data (auto-generated)
└── auto_replies.json      # Saved auto replies (auto-generated)
```

## Configuration

### Environment Variables

You can set these environment variables:

- `PORT` - Server port (default: 3000)

### Auto Reply Examples

Here are some example auto replies you might want to set up:

| Keyword | Reply |
|---------|-------|
| `hello` | `Hi there! Thanks for messaging me. I'll get back to you soon!` |
| `price` | `Please check our website for current pricing: www.example.com` |
| `hours` | `We're open Monday-Friday 9AM-5PM EST` |
| `support` | `For technical support, please email support@example.com` |

## Troubleshooting

### Common Issues

1. **QR Code not appearing**
   - Restart the server
   - Clear browser cache
   - Check console for errors

2. **Connection keeps dropping**
   - Ensure stable internet connection
   - WhatsApp may have rate limits
   - Try restarting the application

3. **Auto replies not working**
   - Check if WhatsApp is connected
   - Verify keywords are set correctly
   - Check server console for errors

### Logs

The server logs important events to the console:
- Connection status changes
- Incoming messages
- Auto reply triggers
- Errors and warnings

## Security Notes

- Keep your `auth_info_baileys` folder secure
- Don't share your session files
- Use this responsibly and respect WhatsApp's terms of service
- Consider rate limiting for production use

## Limitations

- This is an unofficial API and may break with WhatsApp updates
- WhatsApp may detect and restrict automated behavior
- Use responsibly to avoid account restrictions
- Not recommended for high-volume commercial use

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Disclaimer

This project uses an unofficial WhatsApp API. Use at your own risk. The developers are not responsible for any account restrictions or bans that may result from using this software.