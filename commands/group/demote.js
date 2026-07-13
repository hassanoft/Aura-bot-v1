module.exports = {
  name: 'demote',
  category: 'group',
  description: "Rétrograde un administrateur (en réponse à son message).",
  usage: '/demote (en réponse au membre)',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, msg }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Réponds au message du membre à rétrograder.' });
    await sock.groupParticipantsUpdate(remoteJid, [target], 'demote');
    await sock.sendMessage(remoteJid, { text: '✅ Administrateur rétrogradé.' });
  },
};
