const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'inventory',
  category: 'economy',
  description: 'Affiche votre inventaire.',
  usage: '/inventory',
  async execute({ sock, remoteJid, senderJid }) {
    const account = db.economy.get(permissions.normalizeNumber(senderJid), { inventory: [] });
    const items = account.inventory?.length ? account.inventory.join(', ') : 'Vide';
    await sock.sendMessage(remoteJid, { text: `🎒 Inventaire : ${items}` });
  },
};
