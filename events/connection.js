const { DisconnectReason } = require('@whiskeysockets/baileys');
const logger = require('../utils/logger');

module.exports = {
  name: 'connection.update',
  async handler(sock, update, context) {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      logger.success('✅ Connexion WhatsApp établie avec succès.');
      context.state.connected = true;
      context.state.lastConnectedAt = new Date().toISOString();
    }

    if (connection === 'close') {
      context.state.connected = false;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      logger.warn(`Connexion fermée (code ${statusCode}). Déconnecté définitivement : ${loggedOut}`);

      if (!loggedOut) {
        logger.info('Tentative de reconnexion automatique...');
        setTimeout(() => context.reconnect(), 3000);
      } else {
        logger.error('Session invalide. Suppression et nouvelle demande de Pairing Code requise.');
        context.clearSession();
      }
    }
  },
};
