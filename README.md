# CS:GO RCON Tools

![CS:GO RCON Tools Screenshot](screenshot.png)

A modern, feature-rich Electron application for managing and controlling CS:GO game servers through RCON. Designed with usability and aesthetics in mind.

## Overview

CS:GO RCON Tools provides an intuitive graphical interface for administering Counter-Strike: Global Offensive servers. This application simplifies server management with pre-configured commands, real-time console output, and a clean, modern interface that supports both light and dark themes.

## Key Features

- **Modern Interface**: Clean, responsive design with light/dark mode support
- **Real-time Console**: View server responses in real-time with color-coded output
- **Command Autocomplete**: Integrated autocomplete for common CS:GO commands
- **Quick Command Buttons**: One-click access to frequently used commands
- **Map Changer**: Easily switch between maps via dropdown selection
- **Connection History**: Automatic saving of recent server connections
- **Improved Visual Status**: Clear connection status indicator with visual feedback
- **Logically Grouped Commands**: Specialized sections for managing different aspects:
  - Game Controls (restart, warmup management)
  - Game Settings (cheats, friendly fire)
  - Bot Controls (add/remove bots)

## Installation

### Prerequisites

- Node.js 14+ and npm
- Electron

### Setup

1. Clone the repository:

```bash
git clone https://github.com/csgo-rcon-tools/csgo-rcon-tools.git
cd csgo-rcon-tools
```

2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm start
```

## Usage

### Connecting to a Server

1. Enter your server's hostname/IP address
2. Specify the RCON port (default: 25575)
3. Enter the RCON password
4. Click "Connect"

### Using Commands

There are three ways to send commands to your server:

1. **Quick Command Buttons**: Click any of the pre-configured command buttons
2. **Command Input**: Type a command directly in the input field and press "Send"
3. **Command Autocomplete**: Start typing in the command field to see suggested commands

### Changing Maps

1. Select a map from the dropdown menu
2. Click "Change Map"
3. The server will load the selected map

### Theme Toggle

- Click the sun/moon icon in the top-right corner to switch between light and dark mode

## Command Categories

### Common Commands

- `status` - View player list and server information
- `help` - Show available commands
- `stats` - Display server statistics

### Game Controls

- `mp_restartgame 1` - Restart the current game
- `mp_warmup_start` - Start warmup period
- `mp_warmup_end` - End warmup period

### Game Settings

- `sv_cheats 1/0` - Enable/disable cheats
- `mp_friendlyfire 1/0` - Enable/disable friendly fire
- `mp_limitteams 0` - Disable team limit
- `mp_autoteambalance 0` - Disable auto team balance

### Bot Controls

- `bot_add_t` - Add a Terrorist bot
- `bot_add_ct` - Add a Counter-Terrorist bot
- `bot_kick` - Kick all bots

### Advanced Settings

- `mp_freezetime 0` - Disable freeze time
- `mp_roundtime 60` - Set round time to 60 minutes
- `mp_startmoney 16000` - Start with $16000
- `sv_infinite_ammo 1` - Enable infinite ammunition

## Troubleshooting

### Cannot Connect to Server

- Verify the server is running and accessible
- Check that the RCON port is open on your firewall
- Ensure the RCON password is correct
- Confirm RCON is enabled on the server with `rcon_password` set

### Commands Not Working

- Make sure you're connected (status indicator shows "Connected")
- Some commands may require specific permissions or sv_cheats enabled
- Check the console output for any error messages

### Application Crashes

- Check your Node.js and Electron versions are up to date
- Make sure all dependencies are installed properly
- Look for error messages in the console logs

## Screenshots

### Light Mode

![Light Mode Screenshot](light-mode.png)

### Dark Mode

![Dark Mode Screenshot](dark-mode.png)

## Development

### Tech Stack

- **Electron**: For cross-platform desktop application
- **Vanilla JavaScript**: For frontend logic
- **Tailwind CSS**: For styling (compiled to regular CSS)
- **Electron Store**: For persistent storage
- **RCON Client**: For server communication

### Project Structure

```
csgo-rcon-tools/
├── src/                 # Source files
│   ├── main.js          # Main process - Electron app initialization
│   ├── preload.js       # Preload script - Safe communication channel
│   └── renderer/        # Renderer process - UI components
│       ├── index.html   # Main HTML structure
│       ├── renderer.js  # UI interaction logic
│       └── styles.css   # Application styling
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation
```

### Adding New Commands

To add new quick command buttons:

1. Update the HTML to add a new button with a `data-command` attribute
2. The button will automatically work with the global click handler

### Building for Production

You can build the application for different platforms using the following commands:

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux

# Build for all platforms (Windows, macOS, and Linux)
npm run build:all
```

#### Build Outputs

The build process will create the following files in the `dist` directory:

- **Windows**:

  - `csgo-rcon-tools Setup x.x.x.exe` (Installer)
  - `csgo-rcon-tools-x.x.x-win.zip` (Portable ZIP)

- **macOS**:

  - `csgo-rcon-tools-x.x.x.dmg` (Disk Image)
  - `csgo-rcon-tools-x.x.x-mac.zip` (Portable ZIP)

- **Linux**:
  - `csgo-rcon-tools-x.x.x.AppImage` (AppImage)
  - `csgo-rcon-tools_x.x.x_amd64.deb` (Debian Package)
  - `csgo-rcon-tools-x.x.x.x86_64.rpm` (RPM Package)
  - `csgo-rcon-tools-x.x.x-linux.zip` (Portable ZIP)

### Customizing the Build

You can customize the build by modifying the `build` configuration in `package.json`:

```json
"build": {
  "appId": "com.csgo.rcontools",
  "productName": "CS:GO RCON Tools",
  "files": [
    "src/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "directories": {
    "buildResources": "resources",
    "output": "dist"
  },
  // Platform-specific configurations...
}
```

#### Custom Icons

To use custom icons, place your icon files in the `resources` directory:

- Windows: `icon.ico` (256x256 or larger)
- macOS: `icon.icns` (1024x1024 recommended)
- Linux: `icon.png` (512x512 recommended)

If the `resources` directory doesn't exist, create it at the root of the project:

```bash
mkdir resources
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Created with ❤️ for CS:GO server administrators
