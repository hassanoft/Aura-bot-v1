const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'work',
  category: 'economy',
  description: 'Travaille pour gagner de l\'argent virtuel.',
  usage: '/work',
  async execute({ sock, remoteJid, senderJid }) {
    const id = permissions.normalizeNumber(senderJid);
    const account = db.economy.get(id, { balance: 0, inventory: [], lastWork: null });
    const now = Date.now();

    if (account.lastWork && now - account.lastWork < 3600000) {
      const minutes = Math.ceil((3600000 - (now - account.lastWork)) / 60000);
      return sock.sendMessage(remoteJid, { text: `⏳ Repose-toi encore ${minutes} min avant de retravailler.` });
    }

    const earned = Math.floor(Math.random() * 300) + 100;
    account.balance += earned;
    account.lastWork = now;
    db.economy.set(id, account);

    await sock.sendMessage(remoteJid, { text: `💼 Tu as travaillé et gagné ${earned} FCFA !\nSolde : ${account.balance} FCFA` });
  },
};
