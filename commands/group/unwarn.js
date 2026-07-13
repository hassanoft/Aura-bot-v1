const db = require('../../database/db');

module.exports = {
  name: 'unwarn',
  category: 'group',
  description: "Retire un avertissement à un membre (en réponse à son message).",
  usage: '/unwarn (en réponse au membre)',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, msg }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Réponds au message du membre.' });

    const warnings = db.groups.get(`${remoteJid}:warnings`, {});
    warnings[target] = Math.max(0, (warnings[target] || 0) - 1);
    db.groups.set(`${remoteJid}:warnings`, warnings);

    await sock.sendMessage(remoteJid, { text: `✅ Avertissement retiré. Total : ${warnings[target]}/3` });
  },
};
