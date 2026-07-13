module.exports = {
  name: 'kick',
  category: 'group',
  description: 'Exclut un membre du groupe (en réponse à son message).',
  usage: '/kick (en réponse au membre)',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, msg }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Réponds au message du membre à exclure.' });
    await sock.groupParticipantsUpdate(remoteJid, [target], 'remove');
    await sock.sendMessage(remoteJid, { text: '👋 Membre exclu du groupe.' });
  },
};
