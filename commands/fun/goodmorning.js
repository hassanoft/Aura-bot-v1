module.exports = {
  name: 'goodmorning',
  category: 'fun',
  description: 'Envoie un message de bonjour.',
  usage: '/goodmorning',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: '☀️ Bonjour ! Que ta journée soit remplie de belles opportunités !' });
  },
};
