module.exports = {
  name: 'hidetag',
  category: 'group',
  description: 'Envoie un message en mentionnant tout le monde sans les afficher.',
  usage: '/hidetag <message>',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup, args }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const metadata = await sock.groupMetadata(remoteJid);
    const mentions = metadata.participants.map((p) => p.id);
    await sock.sendMessage(remoteJid, { text: args.join(' ') || '📢', mentions });
  },
};
