const { db } = require('../config/firebase');

// User collection reference
const usersRef = db.collection('users');

// Link a Discord user to their Steam account
const linkSteamAccount = async (discordId, steamId, username, ownedGames) => {
  try {
    await usersRef.doc(discordId).set({
      steam_id: steamId,
      username: username,
      linked_at: new Date(),
      last_fetched: new Date(),
      owned_games: ownedGames.map(game => ({
        appid: game.appid,
        name: game.name,
        playtime_forever: game.playtime_forever || 0
      }))
    });
    
    return true;
  } catch (error) {
    console.error('Error linking Steam account:', error);
    throw error;
  }
};

// Check if a Discord user has linked their Steam account
const isUserLinked = async (discordId) => {
  try {
    const userDoc = await usersRef.doc(discordId).get();
    return userDoc.exists;
  } catch (error) {
    console.error('Error checking if user is linked:', error);
    throw error;
  }
};

// Get a user's Steam ID
const getUserSteamId = async (discordId) => {
  try {
    const userDoc = await usersRef.doc(discordId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return userDoc.data().steam_id;
  } catch (error) {
    console.error('Error getting user\'s Steam ID:', error);
    throw error;
  }
};

// Get a user's owned games
const getUserOwnedGames = async (discordId) => {
  try {
    const userDoc = await usersRef.doc(discordId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return userDoc.data().owned_games;
  } catch (error) {
    console.error('Error getting user\'s owned games:', error);
    throw error;
  }
};

// Update a user's owned games
const updateUserOwnedGames = async (discordId, ownedGames) => {
  try {
    await usersRef.doc(discordId).update({
      owned_games: ownedGames.map(game => ({
        appid: game.appid,
        name: game.name,
        playtime_forever: game.playtime_forever || 0
      })),
      last_fetched: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user\'s owned games:', error);
    throw error;
  }
};

// Get user data
const getUserData = async (discordId) => {
  try {
    const userDoc = await usersRef.doc(discordId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

module.exports = {
  linkSteamAccount,
  isUserLinked,
  getUserSteamId,
  getUserOwnedGames,
  updateUserOwnedGames,
  getUserData
}; 