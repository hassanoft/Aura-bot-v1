const EMOJIS = ['😀','🔥','🚀','🎉','💡','🌟','🎯','🍀','🌈','⚡'];

module.exports = {
  name: 'emoji',
  category: 'fun',
  description: 'Envoie un emoji aléatoire.',
  usage: '/emoji',
  async execute({ sock, remoteJid }) {
    const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    await sock.sendMessage(remoteJid, { text: e });
  },
};
