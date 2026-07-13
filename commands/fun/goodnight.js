module.exports = {
  name: 'goodnight',
  category: 'fun',
  description: 'Envoie un message de bonne nuit.',
  usage: '/goodnight',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: '🌙 Bonne nuit ! Repose-toi bien et à demain.' });
  },
};
