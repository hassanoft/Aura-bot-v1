const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Parcourt commands/<categorie>/*.js et construit une Map de commandes.
 * Chaque fichier de commande doit exporter :
 * { name, aliases?, category, description, usage?, ownerOnly?, adminOnly?, premiumOnly?, execute(ctx) }
 */
function loadCommands() {
  const commandsDir = path.resolve(__dirname, '../commands');
  const commands = new Map();
  const categories = fs.readdirSync(commandsDir).filter((f) =>
    fs.statSync(path.join(commandsDir, f)).isDirectory()
  );

  for (const category of categories) {
    const categoryPath = path.join(commandsDir, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      try {
        const cmd = require(path.join(categoryPath, file));
        if (!cmd.name || typeof cmd.execute !== 'function') {
          logger.warn(`Commande invalide ignorée : ${category}/${file}`);
          continue;
        }
        cmd.category = cmd.category || category;
        commands.set(cmd.name, cmd);
        (cmd.aliases || []).forEach((alias) => commands.set(alias, cmd));
      } catch (err) {
        logger.error(`Erreur de chargement ${category}/${file}: ${err.message}`);
      }
    }
  }

  logger.success(`${commands.size} commandes chargées (alias inclus)`);
  return commands;
}

module.exports = { loadCommands };
