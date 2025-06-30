const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sendsupportembed")
    .setDescription("Send the Support Panel embed with support ticket option (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    // Create the main embed
    const embed = new EmbedBuilder()
      .setTitle("KingsBet - Support")
      .setDescription("Click on the button to create a support ticket")
      .setColor(0x3498db)
      .setTimestamp();

    // Create the button
    const button = new ButtonBuilder()
      .setCustomId("create-support-ticket")
      .setLabel("Create Support Ticket")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎫");

    const row = new ActionRowBuilder().addComponents(button);

    // Send the embed to the current channel
    await interaction.channel.send({ embeds: [embed], components: [row] });
    
    // Reply to the admin
    await interaction.reply({ content: "✅ Support Panel embed has been sent!", ephemeral: true });
  },
};
