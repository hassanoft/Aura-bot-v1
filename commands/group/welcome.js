const db = require('../../database/db');

module.exports = {
  name: 'welcome',
  category: 'group',
  description: 'Active/désactive le message de bienvenue automatique.',
  usage: '/welcome on|off',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, args }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const enabled = args[0] === 'on';
    const groups = db.groups.get(remoteJid, {});
    groups.welcome = enabled;
    db.groups.set(remoteJid, groups);
    await sock.sendMessage(remoteJid, { text: `👋 Message de bienvenue ${enabled ? 'activé' : 'désactivé'}.` });
  },
};
