const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Charge tous les fichiers du dossier events/.
 * Chaque fichier exporte : { name: 'messages.upsert', handler(sock, data, context) }
 */
function loadEvents(sock, context) {
  const eventsDir = path.resolve(__dirname, '../events');
  const files = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    try {
      const event = require(path.join(eventsDir, file));
      if (!event.name || typeof event.handler !== 'function') {
        logger.warn(`Événement invalide ignoré : ${file}`);
        continue;
      }
      sock.ev.on(event.name, (data) => event.handler(sock, data, context));
      logger.info(`Événement enregistré : ${event.name}`);
    } catch (err) {
      logger.error(`Erreur de chargement événement ${file}: ${err.message}`);
    }
  }
}

module.exports = { loadEvents };
