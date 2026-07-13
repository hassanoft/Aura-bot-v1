const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'daily',
  category: 'economy',
  description: 'Récupère une récompense quotidienne.',
  usage: '/daily',
  async execute({ sock, remoteJid, senderJid }) {
    const id = permissions.normalizeNumber(senderJid);
    const account = db.economy.get(id, { balance: 0, inventory: [], lastDaily: null });
    const now = Date.now();

    if (account.lastDaily && now - account.lastDaily < 86400000) {
      const hours = Math.ceil((86400000 - (now - account.lastDaily)) / 3600000);
      return sock.sendMessage(remoteJid, { text: `⏳ Reviens dans ${hours}h pour ta prochaine récompense.` });
    }

    const reward = 500;
    account.balance += reward;
    account.lastDaily = now;
    db.economy.set(id, account);

    await sock.sendMessage(remoteJid, { text: `🎁 Récompense quotidienne reçue : +${reward} FCFA\nSolde : ${account.balance} FCFA` });
  },
};
