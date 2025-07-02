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
      .setColor(0x41fb2e)
      .setImage("https://media.discordapp.net/attachments/1374310263003807778/1384544261814489109/Untitled_design_-_2025-06-17T162721.029_1.png?ex=6856c553&is=685573d3&hm=b6976c7cb0dc0a9ee6ceed3c1f3aa022e3b896f8e404c1f793b67ceda4de15f8&=&format=webp&quality=lossless")

    // Create the button
    const button = new ButtonBuilder()
      .setCustomId("create-support-ticket")
      .setLabel("Create Ticket")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🎫");

    const row = new ActionRowBuilder().addComponents(button);

    // Send the embed to the current channel
    await interaction.channel.send({ embeds: [embed], components: [row] });
    
    // Reply to the admin
    await interaction.reply({ content: "✅ Support Panel embed has been sent!", ephemeral: true });
  },
};
