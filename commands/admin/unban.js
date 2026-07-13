const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'unban',
  category: 'admin',
  description: 'Débannit un utilisateur (en réponse à son message).',
  usage: '/unban (en réponse au membre)',
  ownerOnly: true,
  async execute({ sock, remoteJid, msg }) {
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Réponds au message du membre à débannir.' });
    const user = db.users.get(permissions.normalizeNumber(target), {});
    user.banned = false;
    db.users.set(permissions.normalizeNumber(target), user);
    await sock.sendMessage(remoteJid, { text: '✅ Utilisateur débanni.' });
  },
};
