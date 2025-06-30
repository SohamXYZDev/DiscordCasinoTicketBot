require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const commands = [];
const commandsPath = path.join(__dirname, "commands");

for (const item of fs.readdirSync(commandsPath)) {
  const itemPath = path.join(commandsPath, item);
  const stat = fs.statSync(itemPath);
  
  if (stat.isFile() && item.endsWith('.js')) {
    // Handle files directly in commands folder
    const command = require(itemPath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    }
  } else if (stat.isDirectory()) {
    // Handle files in subfolders
    for (const file of fs.readdirSync(itemPath)) {
      if (file.endsWith('.js')) {
        const command = require(path.join(itemPath, file));
        if ("data" in command && "execute" in command) {
          commands.push(command.data.toJSON());
        }
      }
    }
  }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: [] }
        );
    console.log("🛰️ Clearing old guild commands...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, "1202527903028482048"),
      { body: [] }
    );
    console.log("🛰️ Deploying slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, "1202527903028482048"),
      { body: commands }
    );
    console.log("✅ Slash commands deployed.");
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error);
  }
})();
