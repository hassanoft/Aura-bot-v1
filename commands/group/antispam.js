const db = require('../../database/db');

module.exports = {
  name: 'antispam',
  category: 'group',
  description: 'Active/désactive la protection anti-spam du groupe.',
  usage: '/antispam on|off',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, args }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const enabled = args[0] === 'on';
    const groups = db.groups.get(remoteJid, {});
    groups.antispam = enabled;
    db.groups.set(remoteJid, groups);
    await sock.sendMessage(remoteJid, { text: `🚫 Anti-spam ${enabled ? 'activé' : 'désactivé'}.` });
  },
};
