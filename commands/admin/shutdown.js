module.exports = {
  name: 'shutdown',
  category: 'admin',
  description: 'Arrête complètement le processus du bot.',
  usage: '/shutdown',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: '🛑 Arrêt du bot en cours...' });
    setTimeout(() => process.exit(0), 1000);
  },
};
