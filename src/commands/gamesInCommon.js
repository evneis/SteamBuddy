const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserOwnedGames, isUserLinked } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gamesincommon')
    .setDescription('Find games that you have in common with other users')
    .addUserOption(option => 
      option.setName('user1')
        .setDescription('First user to compare with')
        .setRequired(true))
    .addUserOption(option => 
      option.setName('user2')
        .setDescription('Second user to compare with')
        .setRequired(false))
    .addUserOption(option => 
      option.setName('user3')
        .setDescription('Third user to compare with')
        .setRequired(false))
    .addUserOption(option => 
      option.setName('user4')
        .setDescription('Fourth user to compare with')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('multiplayer_only')
        .setDescription('Show only multiplayer games')
        .setRequired(false)),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      // Get the users to compare
      const users = [
        interaction.user,
        interaction.options.getUser('user1'),
        interaction.options.getUser('user2'),
        interaction.options.getUser('user3'),
        interaction.options.getUser('user4')
      ].filter(Boolean); // Remove undefined users
      
      const uniqueUsers = [...new Set(users.map(user => user.id))].map(id => 
        users.find(user => user.id === id)
      );
      
      const multiplayerOnly = interaction.options.getBoolean('multiplayer_only') || false;
      
      // Check if all users have linked their Steam accounts
      const notLinkedUsers = [];
      for (const user of uniqueUsers) {
        const isLinked = await isUserLinked(user.id);
        if (!isLinked) {
          notLinkedUsers.push(user.username);
        }
      }
      
      if (notLinkedUsers.length > 0) {
        return interaction.editReply(`The following users need to link their Steam accounts first: ${notLinkedUsers.join(', ')}`);
      }
      
      // Get all users' games
      const usersGames = {};
      for (const user of uniqueUsers) {
        const games = await getUserOwnedGames(user.id);
        usersGames[user.id] = games;
      }
      
      // Find games in common
      const gameCountMap = {};
      const userGameMap = {};
      
      for (const userId in usersGames) {
        const games = usersGames[userId];
        
        games.forEach(game => {
          if (!gameCountMap[game.appid]) {
            gameCountMap[game.appid] = 0;
            userGameMap[game.appid] = {
              name: game.name,
              users: [],
              playtimes: {},
              appid: game.appid
            };
          }
          
          gameCountMap[game.appid]++;
          userGameMap[game.appid].users.push(userId);
          userGameMap[game.appid].playtimes[userId] = game.playtime_forever;
        });
      }
      
      // Filter games to those owned by at least 2 users
      const commonGames = Object.values(userGameMap)
        .filter(game => game.users.length >= 2);
      
      if (commonGames.length === 0) {
        return interaction.editReply('No games in common found between the selected users.');
      }
      
      // Sort games by number of users who own them, then by name
      commonGames.sort((a, b) => {
        if (b.users.length !== a.users.length) {
          return b.users.length - a.users.length;
        }
        return a.name.localeCompare(b.name);
      });
      
      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle('Games in Common')
        .setColor('#0099ff')
        .setDescription(`Found ${commonGames.length} games in common between ${uniqueUsers.map(u => u.username).join(', ')}`)
        .setTimestamp()
        .setFooter({ text: 'SteamBuddy' });
      
      // Add top games to the embed (max 10)
      const topGames = commonGames.slice(0, 10);
      
      topGames.forEach(game => {
        const usersList = game.users.map(id => {
          const user = uniqueUsers.find(u => u.id === id);
          const playtime = Math.floor(game.playtimes[id] / 60); // Convert minutes to hours
          return `${user.username} (${playtime}h)`;
        });
        
        const ownershipEmoji = game.users.length === uniqueUsers.length ? '🏆 ' : '';
        const noPlaytimeEmoji = Object.values(game.playtimes).every(pt => pt === 0) ? '⚠️ ' : '';
        
        embed.addFields({
          name: `${ownershipEmoji}${noPlaytimeEmoji}${game.name}`,
          value: `✅ Owned by: ${usersList.join(', ')}\n🛍️ [View in Store](https://store.steampowered.com/app/${game.appid})`,
          inline: false
        });
      });
      
      if (commonGames.length > 10) {
        embed.addFields({
          name: 'And more...',
          value: `${commonGames.length - 10} more games in common not shown.`,
          inline: false
        });
      }
      
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in gamesInCommon command:', error);
      return interaction.editReply('There was an error finding games in common. Please try again later.');
    }
  },
}; 