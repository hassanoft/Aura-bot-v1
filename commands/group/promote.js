module.exports = {
  name: 'promote',
  category: 'group',
  description: 'Promeut un membre en administrateur (en réponse à son message).',
  usage: '/promote (en réponse au membre)',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, msg }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Réponds au message du membre à promouvoir.' });
    await sock.groupParticipantsUpdate(remoteJid, [target], 'promote');
    await sock.sendMessage(remoteJid, { text: '✅ Membre promu administrateur.' });
  },
};
