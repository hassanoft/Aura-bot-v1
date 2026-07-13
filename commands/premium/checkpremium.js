const permissions = require('../../utils/permissions');

module.exports = {
  name: 'checkpremium',
  category: 'premium',
  description: 'Vérifie rapidement le statut Premium.',
  usage: '/checkpremium',
  async execute({ sock, remoteJid, senderJid }) {
    const active = permissions.isPremium(senderJid);
    await sock.sendMessage(remoteJid, { text: active ? '✅ Premium actif.' : '❌ Pas de Premium actif.' });
  },
};
