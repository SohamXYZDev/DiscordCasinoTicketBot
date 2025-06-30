require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const connectDB = require("./config/db");
const GuildConfig = require("./models/GuildConfig");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
require("./handlers/commandHandler")(client);

client.once("ready", async () => {
  await connectDB();
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // Handle main games panel dropdown
  if (interaction.isStringSelectMenu() && interaction.customId === 'games-panel-select') {
    const { handleDepositTicket, handleWithdrawTicket } = require('./utils/ticketHandlers');
    const selectedValue = interaction.values[0];
    
    if (selectedValue === 'deposit') {
      return handleDepositTicket(interaction);
    } else if (selectedValue === 'withdraw') {
      return handleWithdrawTicket(interaction);
    }
  }
  
  // Handle select menu for deposit crypto selection
  if (interaction.isStringSelectMenu() && interaction.customId === 'deposit-crypto-select') {
    const depositCmd = require('./commands/deposit.js');
    return depositCmd.handleComponent(interaction);
  }
  
  // Handle select menu for withdraw crypto selection
  if (interaction.isStringSelectMenu() && interaction.customId === 'withdraw-crypto-select') {
    const withdrawCmd = require('./commands/withdraw.js');
    return withdrawCmd.handleComponent(interaction);
  }
  
  if (interaction.isStringSelectMenu() && interaction.customId === 'help-category-select') {
    const helpCmd = require('./commands/help/help.js'); // Adjust path if needed
    return helpCmd.handleComponent(interaction);
  }
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Command logging
  if (interaction.guildId) {
    const config = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (config && config.logChannel) {
      const logChannel = await client.channels.fetch(config.logChannel).catch(() => null);
      if (logChannel && logChannel.isTextBased()) {
        const user = interaction.user;
        const logMsg = `📝 **/${interaction.commandName}** used by <@${user.id}> (${user.tag})${interaction.options && interaction.options.data.length ? ` | Options: ${interaction.options.data.map(o => `${o.name}: ${o.value}`).join(", ")}` : ""}`;
        logChannel.send({ content: logMsg }).catch(() => {});
      }
    }
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ There was an error executing that command.", ephemeral: true });
  }
});

// Handle messages in withdraw ticket channels for amount input
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  
  // Check if this is a withdraw ticket channel
  if (message.channel.name && message.channel.name.startsWith('withdraw-') && 
      message.channel.topic && message.channel.topic.includes(`Withdraw ticket for ${message.author.id}`)) {
    
    const amount = parseInt(message.content.trim());
    
    // Validate amount is a number
    if (isNaN(amount) || amount <= 0) {
      return message.reply("❌ Please enter a valid positive number for the withdrawal amount.");
    }
    
    const { getUserBalance } = require('./utils/economy');
    const Bet = require('./models/Bet');
    const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
    const { CRYPTO_OPTIONS } = require('./utils/ticketHandlers');
    
    try {
      // Check user balance
      const balance = await getUserBalance(message.author.id);
      if (amount > balance) {
        return message.reply(`🚫 You do not have enough chips to withdraw. Your balance: **${balance}**`);
      }
      
      // Check wagering requirement (80% of withdrawal amount)
      const bets = await Bet.find({ userId: message.author.id });
      const totalWagered = bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
      if (totalWagered < 0.8 * amount) {
        return message.reply(`🚫 You must wager at least 80% of the amount you want to withdraw before you can withdraw. You have wagered **${totalWagered}** out of **${Math.ceil(0.8 * amount)}** required.`);
      }
      
      // Create embed and dropdown for crypto selection
      const embed = new EmbedBuilder()
        .setTitle("Withdraw Request")
        .setDescription(`**Amount to withdraw:** ${amount} chips\n\nSelect the cryptocurrency you want to withdraw to:`)
        .setColor(0xff6b35);
        
      const select = new StringSelectMenuBuilder()
        .setCustomId("withdraw-crypto-select")
        .setPlaceholder("Select a cryptocurrency...")
        .addOptions(CRYPTO_OPTIONS.map(opt => ({ label: opt.label, value: opt.value })));
        
      const row = new ActionRowBuilder().addComponents(select);
      
      await message.reply({ embeds: [embed], components: [row] });
      
    } catch (error) {
      console.error('Error processing withdraw amount:', error);
      message.reply("❌ An error occurred while processing your withdrawal request.");
    }
  }
});

client.login(process.env.TOKEN);
