# SteamBuddy Discord Bot Setup Guide

## Prerequisites

1. **Node.js**: v16.x or higher
2. **Discord Account**: With developer mode enabled
3. **Steam Web API Key**: Get one from [Steam Dev](https://steamcommunity.com/dev/apikey)
4. **Firebase Account**: For database storage

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/steambuddy.git
cd steambuddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "SteamBuddy")
3. Go to the "Bot" tab and click "Add Bot"
4. Under the bot's token, click "Copy" to copy your bot token
5. Enable "Message Content Intent" under Privileged Gateway Intents
6. Go to the "OAuth2" tab, select "bot" under scopes
7. For bot permissions, select:
   - Read Messages/View Channels
   - Send Messages
   - Embed Links
   - Use Slash Commands
8. Copy the generated URL and open it in a browser to add the bot to your server

### 4. Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Navigate to Project Settings > Service Accounts
4. Click "Generate New Private Key" and download the JSON file
5. From this file, you'll need:
   - `project_id`
   - `private_key`
   - `client_email`

### 5. Configure Environment Variables

1. Create a `.env` file in the root directory, based on `.env.example`
2. Fill in the following variables:
   - `DISCORD_TOKEN`: Your Discord bot token
   - `CLIENT_ID`: Your Discord application client ID
   - `STEAM_API_KEY`: Your Steam Web API key
   - `FIREBASE_PROJECT_ID`: From the Firebase service account JSON
   - `FIREBASE_PRIVATE_KEY`: From the Firebase service account JSON
   - `FIREBASE_CLIENT_EMAIL`: From the Firebase service account JSON

### 6. Start the Bot

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Bot Commands

- `/linksteam <Steam ID or vanity URL>`: Link your Discord account to your Steam account
- `/gamesincommon @user1 @user2...`: Compare Steam libraries with other users
- `/gamenight [minPlayers] [maxPlayers] [genre] [ownedByAll]`: Get game night suggestions
- `/refresh`: Update your Steam library data

## Troubleshooting

- **Bot not responding**: Check if the bot is online and has correct permissions
- **Command errors**: Check the console logs for details
- **Steam API errors**: Verify your API key is valid and not rate-limited

## Support

If you encounter any issues, please open an issue on the GitHub repository or contact the bot creator. 