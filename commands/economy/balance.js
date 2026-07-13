const db = require('../../database/db');
const permissions = require('../../utils/permissions');

function getAccount(id) {
  return db.economy.get(id, { balance: 0, inventory: [], lastDaily: null, lastWork: null });
}

module.exports = {
  name: 'balance',
  category: 'economy',
  description: 'Affiche votre solde.',
  usage: '/balance',
  async execute({ sock, remoteJid, senderJid }) {
    const account = getAccount(permissions.normalizeNumber(senderJid));
    await sock.sendMessage(remoteJid, { text: `💰 Solde : ${account.balance} FCFA` });
  },
};
