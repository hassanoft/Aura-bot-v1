const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'ban',
  category: 'admin',
  description: "Bannit un utilisateur de l'usage du bot (en réponse à son message).",
  usage: '/ban (en réponse au membre)',
  ownerOnly: true,
  async execute({ sock, remoteJid, msg }) {
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Réponds au message du membre à bannir.' });
    const user = db.users.get(permissions.normalizeNumber(target), {});
    user.banned = true;
    db.users.set(permissions.normalizeNumber(target), user);
    await sock.sendMessage(remoteJid, { text: '🚫 Utilisateur banni du bot.' });
  },
};
