🔧 Core Features
✅ 1. Steam Account Linking
Command: /linksteam <Steam ID or vanity URL>

Stores the user’s Discord ID and Steam64 ID in Firestore.

Validates ID via ResolveVanityURL.

Tracks user’s game library using GetOwnedGames.

Firestore Structure:

json
Copy
Edit
users/
  <discord_user_id>:
    steam_id: "7656119xxxxxx"
    username: "username"
    linked_at: timestamp
    last_fetched: timestamp
    owned_games: [
      {
        appid: 570,
        name: "Dota 2",
        playtime_forever: 1234
      },
      ...
    ]
🔄 2. Game Ownership Comparator
Command: /gamesincommon [@user1 @user2 ...]

Compares the Steam libraries of mentioned users.

Displays a sorted list of common games with:

✅ Player counts (who owns it)

⏱️ Total playtime per person

🎯 Optionally filter by: multiplayer only, minimum # of players

Bonus: Include emojis for popularity, like:

🏆 = Everyone owns it

⚠️ = No one has launched it

🎉 3. Game Night Suggestion Tool
Command: /gamenight [minPlayers] [maxPlayers] [genre] [ownedByAll:true/false]

Filters the most suitable games across the group based on:

Game ownership count

Optional genre filtering (via a cached genre lookup table or external metadata API like RAWG.io)

Optional player count range

Optional tag: “owned by all”

Presents the top 3–5 games:

plaintext
Copy
Edit
🎮 Game: Phasmophobia
✅ Owned by: Alice, Bob, Charlie
👥 Min Players: 2, Max Players: 4
🔥 Most played by: Alice (22h)
🛍️ Link: https://store.steampowered.com/app/739630
📥 4. Update & Cache Handling
On account linking or once per day, fetch game library from Steam API.

Cache results in Firebase to avoid excessive API calls (free Steam API is rate-limited).

Firebase rules:

Store per-user owned_games list.

Add a last_updated timestamp.

Only refresh if:

User runs /refresh

Daily cron job (optional)

🧩 Optional Add-ons
Feature	Description
/backlog [@user]	Show games user owns but never played
/playedlastweek [@user]	Show user’s recently played games
/linkgames	Link games from other platforms manually
/leaderboard	Rank friends by hours played last month

🛠️ Tech Stack
Layer	Tech
Bot Framework	Discord.js or discord.py
Database	Firebase Firestore (free)
Steam API	GetOwnedGames, ResolveVanityURL
Deployment	Railway / Render / Glitch / Replit (all free options)
Optional Frontend	Next.js + Firebase Hosting or Discord embeds only

🔐 Permissions & Rate Limits
Only show game comparisons between users who’ve explicitly opted in via /linksteam.

Do not cache more than 1 request per user per 24 hours unless they trigger a refresh.

📅 Milestone Breakdown
✅ Phase 1: Core Infrastructure
 Set up bot commands (/linksteam, /gamesincommon)

 Store user + game data in Firebase

 Basic game comparison output

🚀 Phase 2: Game Night Tool
 Add filters for genre and player count

 Fetch/store static game metadata (RAWG.io or your own JSON)

 Sort and present top games for game night

🌟 Phase 3: Quality of Life + Extras
 Periodic updates or scheduled reports

 /refresh command to pull fresh data

 Bonus features like /backlog, /playedlastweek

🧪 Sample Command Use
bash
Copy
Edit
/linksteam https://steamcommunity.com/id/yourvanityurl

/gamesincommon @bob @alice

/gamenight minPlayers:2 maxPlayers:5 genre:"co-op" ownedByAll:true
