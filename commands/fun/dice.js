module.exports = {
  name: 'dice',
  category: 'fun',
  description: 'Lance un dé à 6 faces.',
  usage: '/dice',
  async execute({ sock, remoteJid }) {
    const value = Math.floor(Math.random() * 6) + 1;
    await sock.sendMessage(remoteJid, { text: `🎲 Résultat : ${value}` });
  },
};
