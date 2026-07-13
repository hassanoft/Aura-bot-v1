const db = require('../../database/db');

module.exports = {
  name: 'warn',
  category: 'group',
  description: 'Donne un avertissement à un membre (en réponse à son message).',
  usage: '/warn (en réponse au membre)',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, msg }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Réponds au message du membre à avertir.' });

    const warnings = db.groups.get(`${remoteJid}:warnings`, {});
    warnings[target] = (warnings[target] || 0) + 1;
    db.groups.set(`${remoteJid}:warnings`, warnings);

    await sock.sendMessage(remoteJid, { text: `⚠️ Avertissement ${warnings[target]}/3 donné à @${target.split('@')[0]}`, mentions: [target] });
  },
};
