const fetch = require('node-fetch');

const STEAM_API_BASE = 'https://api.steampowered.com';

// Resolve a Steam vanity URL to get the Steam64 ID
const resolveVanityUrl = async (vanityUrl) => {
  try {
    const cleanVanityUrl = vanityUrl.replace(/^(https?:\/\/)?(steamcommunity\.com\/id\/)?/, '').replace(/\/$/, '');
    
    const response = await fetch(
      `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${cleanVanityUrl}`
    );
    
    const data = await response.json();
    
    if (data.response && data.response.success === 1) {
      return data.response.steamid;
    } else {
      throw new Error(data.response?.message || 'Failed to resolve Steam ID');
    }
  } catch (error) {
    console.error('Error resolving vanity URL:', error);
    throw error;
  }
};

// Validate if a string is a Steam64 ID
const isSteam64Id = (id) => {
  return /^7656119\d{10}$/.test(id);
};

// Get a user's owned games
const getOwnedGames = async (steamId) => {
  try {
    const response = await fetch(
      `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
    );
    
    const data = await response.json();
    
    if (data.response && 'games' in data.response) {
      return data.response.games;
    } else {
      throw new Error('Failed to retrieve owned games');
    }
  } catch (error) {
    console.error('Error getting owned games:', error);
    throw error;
  }
};

// Get user information from Steam
const getUserInfo = async (steamId) => {
  try {
    const response = await fetch(
      `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    );
    
    const data = await response.json();
    
    if (data.response && data.response.players && data.response.players.length > 0) {
      return data.response.players[0];
    } else {
      throw new Error('Failed to retrieve user information');
    }
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
};

module.exports = {
  resolveVanityUrl,
  getOwnedGames,
  getUserInfo,
  isSteam64Id
}; 