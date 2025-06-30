const { PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { getUserBalance } = require("./economy");

// Crypto addresses (same as in your deposit.js)
const CRYPTO_OPTIONS = [
  { label: "ETH", value: "eth", address: "0x1372aE9cE07a158C2896480a2b3aeAFE3d0D2590" },
  { label: "BTC", value: "btc", address: "bc1qujg5wz6vd9c9txfcmyk2n8wj97tw3a0cdchhxn" },
  { label: "SOL", value: "sol", address: "HW3eNL3ohJMfkU3CepDpfoTCSXBtW2omAZfoohZB4DDy" },
  { label: "LTC", value: "ltc", address: "ltc1q7gjdmfpl3y2hwc8s73qjh9m3wh4lhy3j4z4ms9" },
  { label: "USDC (ETH)", value: "usdc", address: "0x1372aE9cE07a158C2896480a2b3aeAFE3d0D2590" },
  { label: "USDT (ETH)", value: "usdt", address: "0x1372aE9cE07a158C2896480a2b3aeAFE3d0D2590" },
];

async function handleDepositTicket(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;
  
  // Check for existing ticket
  const existing = guild.channels.cache.find(
    c => c.name.startsWith("deposit-") && c.topic === `Deposit ticket for ${user.id}`
  );
  if (existing) {
    return interaction.reply({ content: `🚫 You already have a deposit ticket: <#${existing.id}>`, ephemeral: true });
  }
  
  // Find next ticket number
  const ticketCount = guild.channels.cache.filter(c => c.name.startsWith("deposit-")).size + 1;
  const channelName = `deposit-${ticketCount.toString().padStart(4, "0")}`;
  
  // Create private channel
  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    topic: `Deposit ticket for ${user.id}`,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] },
    ],
  });
  
  // Ephemeral reply with channel link
  await interaction.reply({ content: `✅ Your deposit ticket has been created at <#${channel.id}>`, ephemeral: true });
  
  // Embed and dropdown in the ticket channel
  const embed = new EmbedBuilder()
    .setTitle("Deposit Ticket")
    .setDescription("Which cryptocurrency would you like to use for your deposit?")
    .setColor(0x41fb2e);
    
  const select = new StringSelectMenuBuilder()
    .setCustomId("deposit-crypto-select")
    .setPlaceholder("Select a cryptocurrency...")
    .addOptions(CRYPTO_OPTIONS.map(opt => ({ label: opt.label, value: opt.value })));
    
  const row = new ActionRowBuilder().addComponents(select);
  
  await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [row] });
}

async function handleWithdrawTicket(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;
  
  // Check user balance first
  const balance = await getUserBalance(user.id);
  if (balance <= 0) {
    return interaction.reply({ content: `🚫 You don't have any chips to withdraw. Your balance: **${balance}**`, ephemeral: true });
  }
  
  // Check for existing ticket
  const existing = guild.channels.cache.find(
    c => c.name.startsWith("withdraw-") && c.topic === `Withdraw ticket for ${user.id}`
  );
  if (existing) {
    return interaction.reply({ content: `🚫 You already have a withdraw ticket: <#${existing.id}>`, ephemeral: true });
  }
  
  // Find next ticket number
  const ticketCount = guild.channels.cache.filter(c => c.name.startsWith("withdraw-")).size + 1;
  const channelName = `withdraw-${ticketCount.toString().padStart(4, "0")}`;
  
  // Create private channel
  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    topic: `Withdraw ticket for ${user.id}`,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] },
    ],
  });
  
  // Ephemeral reply with channel link
  await interaction.reply({ content: `✅ Your withdraw ticket has been created at <#${channel.id}>`, ephemeral: true });
  
  // Initial message in ticket channel asking for amount
  const embed = new EmbedBuilder()
    .setTitle("Withdraw Ticket")
    .setDescription(
      `**Your current balance:** ${balance} chips\n\n` +
      `Please specify how many chips you want to withdraw by typing the amount in this channel.\n\n` +
      `**Note:** You must have wagered at least 80% of the withdrawal amount before you can withdraw.`
    )
    .setColor(0xff6b35)
    .setFooter({ text: "Type the amount you want to withdraw in this channel" });
    
  await channel.send({ content: `<@${user.id}>`, embeds: [embed] });
}

module.exports = {
  handleDepositTicket,
  handleWithdrawTicket,
  CRYPTO_OPTIONS
};
