# 🎮 SteamBuddy: A Discord Bot for Steam Game Comparison and Game Nights

**SteamBuddy** is a Discord bot that helps you and your friends decide what to play based on your shared Steam libraries. It compares owned games and suggests multiplayer-friendly options for game nights — filterable by genre, number of players, and more.

---

## 📌 Project Goals

- Help Discord users compare their Steam libraries with friends.
- Suggest multiplayer games that multiple users own.
- Encourage more spontaneous game nights through easy game discovery.
- Make the bot fast, fun, and visually appealing with Discord embeds.
- Keep everything lightweight by using free-tier tools like Firebase and the Steam Web API.

---

## 🔧 Core Features

### ✅ 1. Steam Account Linking

**Command:** `/linksteam <Steam ID or vanity URL>`

- Stores the user’s Discord ID and Steam64 ID in Firebase.
- Validates the ID using `ResolveVanityURL`.
- Tracks the user’s game library using `GetOwnedGames`.

**Firestore Structure:**

**Collection:** `users`  
**Document ID:** `<discord_user_id>`  
**Fields:**
- `steam_id`: `"7656119xxxxxx"`
- `username`: `"username"`
- `linked_at`: Timestamp
- `last_fetched`: Timestamp
- `owned_games`: Array of games with:
  - `appid`: e.g., `570`
  - `name`: e.g., `"Dota 2"`
  - `playtime_forever`: e.g., `1234` (in minutes)

---

### 🔄 2. Game Ownership Comparator

**Command:** `/gamesincommon [@user1 @user2 ...]`

- Compares the Steam libraries of mentioned users.
- Displays a sorted list of common games with:
  - ✅ Number of people who own the game
  - ⏱️ Total playtime per person
  - 🎯 Filters: multiplayer only, minimum number of players

**Bonus Emoji Indicators:**
- 🏆 Everyone owns it
- ⚠️ No one has played it

---

### 🎉 3. Game Night Suggestion Tool

**Command:** `/gamenight [minPlayers] [maxPlayers] [genre] [ownedByAll:true/false]`

- Filters for best multiplayer games across the group:
  - Game ownership count
  - Genre filtering (if metadata is available)
  - Player count range
  - "Owned by all" toggle

**Example Output:**
🎮 Game: Phasmophobia
✅ Owned by: Alice, Bob, Charlie
👥 Min Players: 2, Max Players: 4
🔥 Most played by: Alice (22h)
🛍️ https://store.steampowered.com/app/739630


---

## 📥 Update & Cache Handling

- On account linking or once per day, fetch owned games via Steam API.
- Cache results in Firebase to stay under Steam API rate limits.
- Track `last_updated` timestamps for each user.
- Allow manual refresh with `/refresh`.

---

## 🧩 Optional Add-ons

| Feature                | Description                              |
|------------------------|------------------------------------------|
| `/backlog [@user]`     | List games a user owns but hasn't played |
| `/playedlastweek`      | Show recently played games               |
| `/leaderboard`         | Rank by hours played in the past month   |
| `/linkgames`           | Allow users to manually add games        |

---

## 🛠️ Tech Stack

| Layer         | Tech                                                  |
|---------------|--------------------------------------------------------|
| Bot Framework | Discord.js or discord.py                              |
| Database      | Firebase Firestore (free tier)                        |
| API           | Steam Web API (GetOwnedGames, ResolveVanityURL, etc.) |
| Hosting       | Railway, Render, Glitch, or Replit (free options)     |
| Optional UI   | Next.js + Firebase Hosting or Discord-only embeds     |

---

## 🔐 Permissions & Rate Limits

- Only compare users who’ve opted in via `/linksteam`.
- Cache game data per user, only updating once every 24 hours unless forced.
- Use Firebase rules to control access to user-owned data.

---

## 📅 Milestone Breakdown

### Phase 1: Core Infrastructure
- [ ] Set up bot commands (`/linksteam`, `/gamesincommon`)
- [ ] Store user and game data in Firebase
- [ ] Display basic comparison results

### Phase 2: Game Night Tool
- [ ] Add filters for genre and player count
- [ ] Fetch or store static game metadata (e.g., from RAWG.io)
- [ ] Output best multiplayer game choices

### Phase 3: Extras and UX Polish
- [ ] Add `/refresh`, `/backlog`, and `/playedlastweek` commands
- [ ] Optimize embeds and error handling
- [ ] Explore optional web dashboard

---

## 🧪 Sample Command Usage

```bash
/linksteam https://steamcommunity.com/id/yourvanityurl

/gamesincommon @bob @alice

/gamenight minPlayers:2 maxPlayers:5 genre:"co-op" ownedByAll:true
