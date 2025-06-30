const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const commandsPath = path.join(__dirname, "../commands");

  for (const item of fs.readdirSync(commandsPath)) {
    const itemPath = path.join(commandsPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isFile() && item.endsWith('.js')) {
      // Handle files directly in commands folder
      const command = require(itemPath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`[WARN] The command at ${item} is missing "data" or "execute".`);
      }
    } else if (stat.isDirectory()) {
      // Handle files in subfolders
      for (const file of fs.readdirSync(itemPath)) {
        if (file.endsWith('.js')) {
          const command = require(path.join(itemPath, file));
          if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
          } else {
            console.warn(`[WARN] The command at ${file} is missing "data" or "execute".`);
          }
        }
      }
    }
  }
};
