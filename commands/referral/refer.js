const permissions = require('../../utils/permissions');

module.exports = {
  name: 'refer',
  category: 'referral',
  description: 'Affiche votre lien de parrainage.',
  usage: '/refer',
  async execute({ sock, remoteJid, senderJid }) {
    const code = permissions.normalizeNumber(senderJid).slice(-6);
    await sock.sendMessage(remoteJid, { text: `🤝 Ton code de parrainage : REF-${code}\nPartage-le pour gagner des récompenses !` });
  },
};
