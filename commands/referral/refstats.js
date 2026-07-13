const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'refstats',
  category: 'referral',
  description: 'Affiche vos statistiques de parrainage.',
  usage: '/refstats',
  async execute({ sock, remoteJid, senderJid }) {
    const referrals = db.users.get(`${permissions.normalizeNumber(senderJid)}:referrals`, 0);
    await sock.sendMessage(remoteJid, { text: `📊 Filleuls parrainés : ${referrals}` });
  },
};
