const db = require('../../database/db');

module.exports = {
  name: 'antilink',
  category: 'group',
  description: 'Active/désactive la suppression automatique des liens.',
  usage: '/antilink on|off',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, args }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const enabled = args[0] === 'on';
    const groups = db.groups.get(remoteJid, {});
    groups.antilink = enabled;
    db.groups.set(remoteJid, groups);
    await sock.sendMessage(remoteJid, { text: `🔗 Anti-lien ${enabled ? 'activé' : 'désactivé'}.` });
  },
};
