module.exports = {
  name: 'add',
  category: 'group',
  description: 'Ajoute un numéro au groupe.',
  usage: '/add 2250000000000',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, args }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const number = args[0]?.replace(/[^0-9]/g, '');
    if (!number) return sock.sendMessage(remoteJid, { text: 'Fournis un numéro. Exemple : /add 2250000000000' });
    await sock.groupParticipantsUpdate(remoteJid, [`${number}@s.whatsapp.net`], 'add');
    await sock.sendMessage(remoteJid, { text: '✅ Invitation envoyée.' });
  },
};
