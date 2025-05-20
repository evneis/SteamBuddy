const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserSteamId, updateUserOwnedGames, isUserLinked } = require('../utils/database');
const { getOwnedGames } = require('../utils/steamApi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('Refresh your Steam game library'),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const discordId = interaction.user.id;
    
    try {
      // Check if the user has linked their account
      const isLinked = await isUserLinked(discordId);
      
      if (!isLinked) {
        return interaction.editReply('You need to link your Steam account first. Use `/linksteam` to link your account.');
      }
      
      // Get the user's Steam ID
      const steamId = await getUserSteamId(discordId);
      
      if (!steamId) {
        return interaction.editReply('Could not find your Steam ID. Please try linking your account again with `/linksteam`.');
      }
      
      // Get the user's owned games
      const ownedGames = await getOwnedGames(steamId);
      
      // Update the user's owned games in the database
      await updateUserOwnedGames(discordId, ownedGames);
      
      // Create success embed
      const embed = new EmbedBuilder()
        .setTitle('Steam Library Refreshed')
        .setColor('#0099ff')
        .setDescription(`Your Steam library has been refreshed successfully.`)
        .addFields(
          { name: 'Games Found', value: `${ownedGames.length} games in your library` }
        )
        .setTimestamp()
        .setFooter({ text: 'SteamBuddy' });
      
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in refresh command:', error);
      return interaction.editReply('There was an error refreshing your Steam library. Please try again later.');
    }
  },
}; 