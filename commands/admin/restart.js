module.exports = {
  name: 'restart',
  category: 'admin',
  description: 'Redémarre la connexion WhatsApp du bot.',
  usage: '/restart',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: '🔄 Redémarrage en cours...' });
    process.emit('bot:restart');
  },
};
