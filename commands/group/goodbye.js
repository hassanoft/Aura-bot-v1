const db = require('../../database/db');

module.exports = {
  name: 'goodbye',
  category: 'group',
  description: 'Active/désactive le message de départ automatique.',
  usage: '/goodbye on|off',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, args }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const enabled = args[0] === 'on';
    const groups = db.groups.get(remoteJid, {});
    groups.goodbye = enabled;
    db.groups.set(remoteJid, groups);
    await sock.sendMessage(remoteJid, { text: `👋 Message de départ ${enabled ? 'activé' : 'désactivé'}.` });
  },
};
