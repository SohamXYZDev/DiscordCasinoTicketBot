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
      .setImage("https://media.discordapp.net/attachments/1374310263003807778/1384544261814489109/Untitled_design_-_2025-06-17T162721.029_1.png?ex=6856c553&is=685573d3&hm=b6976c7cb0dc0a9ee6ceed3c1f3aa022e3b896f8e404c1f793b67ceda4de15f8&=&format=webp&quality=lossless")

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