const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserOwnedGames, isUserLinked } = require('../utils/database');

// This would ideally be populated with real data from a source like SteamSpy, RAWG.io API, etc.
// For now, we'll just have a sample of common genres and multiplayer games with their player counts
const gameMetadata = {
  // Sample data structure - would need to be populated with actual data
  // appid: { genre: ['Action', 'Multiplayer'], minPlayers: 2, maxPlayers: 8 }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gamenight')
    .setDescription('Find the best games for a game night with friends')
    .addIntegerOption(option => 
      option.setName('minplayers')
        .setDescription('Minimum number of players')
        .setRequired(false)
        .setMinValue(2))
    .addIntegerOption(option => 
      option.setName('maxplayers')
        .setDescription('Maximum number of players')
        .setRequired(false)
        .setMinValue(2))
    .addStringOption(option => 
      option.setName('genre')
        .setDescription('Game genre to filter by')
        .setRequired(false)
        .addChoices(
          { name: 'Action', value: 'action' },
          { name: 'Adventure', value: 'adventure' },
          { name: 'Co-op', value: 'co-op' },
          { name: 'FPS', value: 'fps' },
          { name: 'MMO', value: 'mmo' },
          { name: 'Multiplayer', value: 'multiplayer' },
          { name: 'Racing', value: 'racing' },
          { name: 'RPG', value: 'rpg' },
          { name: 'Simulation', value: 'simulation' },
          { name: 'Sports', value: 'sports' },
          { name: 'Strategy', value: 'strategy' }
        ))
    .addBooleanOption(option => 
      option.setName('ownedbyall')
        .setDescription('Only show games owned by all members in the server')
        .setRequired(false)),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const minPlayers = interaction.options.getInteger('minplayers') || 2;
      const maxPlayers = interaction.options.getInteger('maxplayers') || 99;
      const genre = interaction.options.getString('genre');
      const ownedByAll = interaction.options.getBoolean('ownedbyall') || false;
      
      // Get all users in the server who have linked their accounts
      const guild = interaction.guild;
      const members = await guild.members.fetch();
      
      const linkedMembers = [];
      for (const [memberId, member] of members) {
        if (await isUserLinked(memberId)) {
          linkedMembers.push(member);
        }
      }
      
      if (linkedMembers.length === 0) {
        return interaction.editReply('No users in this server have linked their Steam accounts. Use `/linksteam` to link your account.');
      }
      
      // Get all members' games
      const allGames = {};
      const memberGames = {};
      
      for (const member of linkedMembers) {
        const games = await getUserOwnedGames(member.id);
        memberGames[member.id] = games;
        
        games.forEach(game => {
          if (!allGames[game.appid]) {
            allGames[game.appid] = {
              appid: game.appid,
              name: game.name,
              owners: [],
              playtimes: {}
            };
          }
          
          allGames[game.appid].owners.push(member.id);
          allGames[game.appid].playtimes[member.id] = game.playtime_forever;
        });
      }
      
      // Filter by ownership
      let filteredGames = Object.values(allGames);
      
      if (ownedByAll) {
        filteredGames = filteredGames.filter(game => game.owners.length === linkedMembers.length);
      } else {
        // Require at least 2 members to own the game
        filteredGames = filteredGames.filter(game => game.owners.length >= 2);
      }
      
      // For this first version, we'll simply prioritize games that more members own
      // In a future version, we could integrate with external APIs to get more game metadata
      // such as genre, player counts, etc.
      
      // Sort by most owned, then by most played
      filteredGames.sort((a, b) => {
        if (b.owners.length !== a.owners.length) {
          return b.owners.length - a.owners.length;
        }
        
        const totalPlaytimeA = Object.values(a.playtimes).reduce((sum, playtime) => sum + playtime, 0);
        const totalPlaytimeB = Object.values(b.playtimes).reduce((sum, playtime) => sum + playtime, 0);
        
        return totalPlaytimeB - totalPlaytimeA;
      });
      
      // Take the top 5 games
      const recommendedGames = filteredGames.slice(0, 5);
      
      if (recommendedGames.length === 0) {
        return interaction.editReply('No suitable games found based on your filters. Try adjusting your criteria.');
      }
      
      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle('🎮 Game Night Recommendations')
        .setColor('#0099ff')
        .setDescription(`Found ${filteredGames.length} potential games for your game night!\nHere are the top recommendations:`)
        .setTimestamp()
        .setFooter({ text: 'SteamBuddy' });
      
      recommendedGames.forEach(game => {
        const owners = game.owners.map(id => {
          const member = linkedMembers.find(m => m.id === id);
          const playtime = Math.floor(game.playtimes[id] / 60); // Convert minutes to hours
          return `${member.user.username}${playtime > 0 ? ` (${playtime}h)` : ''}`;
        });
        
        // Find who played it the most
        let mostPlayedById = null;
        let mostPlaytime = -1;
        
        for (const [id, playtime] of Object.entries(game.playtimes)) {
          if (playtime > mostPlaytime) {
            mostPlaytime = playtime;
            mostPlayedById = id;
          }
        }
        
        let mostPlayedBy = '';
        if (mostPlayedById && mostPlaytime > 0) {
          const member = linkedMembers.find(m => m.id === mostPlayedById);
          mostPlayedBy = `\n🔥 Most played by: ${member.user.username} (${Math.floor(mostPlaytime / 60)}h)`;
        }
        
        embed.addFields({
          name: game.name,
          value: `✅ Owned by: ${owners.join(', ')}${mostPlayedBy}\n🛍️ [View in Store](https://store.steampowered.com/app/${game.appid})`,
          inline: false
        });
      });
      
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in gameNight command:', error);
      return interaction.editReply('There was an error finding game night recommendations. Please try again later.');
    }
  },
}; 