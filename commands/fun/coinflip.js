module.exports = {
  name: 'coinflip',
  category: 'fun',
  description: 'Lance une pièce (pile ou face).',
  usage: '/coinflip',
  async execute({ sock, remoteJid }) {
    const result = Math.random() < 0.5 ? 'Pile' : 'Face';
    await sock.sendMessage(remoteJid, { text: `🪙 ${result} !` });
  },
};
