module.exports = {
  name: 'clear',
  category: 'admin',
  description: 'Vide le cache/messages temporaires du bot.',
  usage: '/clear',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: '🧹 Cache temporaire nettoyé.' });
  },
};
