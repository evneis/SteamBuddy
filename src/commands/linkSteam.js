const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { resolveVanityUrl, getOwnedGames, getUserInfo, isSteam64Id } = require('../utils/steamApi');
const { linkSteamAccount, isUserLinked } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linksteam')
    .setDescription('Link your Discord account to your Steam account')
    .addStringOption(option =>
      option.setName('steamid')
        .setDescription('Your Steam ID or vanity URL')
        .setRequired(true)),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const discordId = interaction.user.id;
    const steamIdInput = interaction.options.getString('steamid');
    
    try {
      // Check if already linked
      const alreadyLinked = await isUserLinked(discordId);
      if (alreadyLinked) {
        return interaction.editReply('Your Discord account is already linked to a Steam account. Use `/refresh` to update your game library.');
      }
      
      // Determine if input is a Steam64 ID or vanity URL
      let steamId;
      if (isSteam64Id(steamIdInput)) {
        steamId = steamIdInput;
      } else {
        try {
          steamId = await resolveVanityUrl(steamIdInput);
        } catch (error) {
          return interaction.editReply('Could not resolve the Steam ID or vanity URL. Please make sure you entered a valid Steam ID or profile URL.');
        }
      }
      
      // Get user info
      const userInfo = await getUserInfo(steamId);
      const username = userInfo.personaname;
      
      // Get owned games
      const ownedGames = await getOwnedGames(steamId);
      
      // Store in database
      await linkSteamAccount(discordId, steamId, username, ownedGames);
      
      // Create success embed
      const embed = new EmbedBuilder()
        .setTitle('Steam Account Linked Successfully')
        .setColor('#0099ff')
        .setDescription(`Your Discord account has been linked to the Steam account **${username}**`)
        .addFields(
          { name: 'Games Found', value: `${ownedGames.length} games in your library` }
        )
        .setThumbnail(userInfo.avatarfull)
        .setTimestamp()
        .setFooter({ text: 'SteamBuddy' });
      
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in linkSteam command:', error);
      return interaction.editReply('There was an error linking your Steam account. Please try again later.');
    }
  },
}; 