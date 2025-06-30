const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sendembed")
    .setDescription("Send the Ticket Panel embed with ticket options (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    // Create the main embed
    const embed = new EmbedBuilder()
      .setTitle("KingsBet - Deposit/Withdraw")
      .setDescription(
        "Click on the button corresponding to the type of ticket you wish to open.\n\n" +
        "**Minimum deposit:** $10\n" +
        "**Minimum withdraw:** $25"
      )
      .setColor(0x41fb2e)
      .setTimestamp();

    // Create the dropdown menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("games-panel-select")
      .setPlaceholder("Select a ticket type...")
      .addOptions([
        {
          label: "Deposit",
          description: "Create a deposit ticket to add funds",
          value: "deposit",
          emoji: "💰"
        },
        {
          label: "Withdraw",
          description: "Create a withdrawal ticket to cash out",
          value: "withdraw", 
          emoji: "💸"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Send the embed to the current channel
    await interaction.channel.send({ embeds: [embed], components: [row] });
    
    // Reply to the admin
    await interaction.reply({ content: "✅ Games Panel embed has been sent!", ephemeral: true });
  },
};