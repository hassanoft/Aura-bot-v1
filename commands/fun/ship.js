module.exports = {
  name: 'ship',
  category: 'fun',
  description: 'Alias amusant de /love.',
  usage: '/ship @personne1 @personne2',
  async execute({ sock, remoteJid, args }) {
    const percent = Math.floor(Math.random() * 101);
    const names = args.join(' ') || 'ce duo';
    await sock.sendMessage(remoteJid, { text: `🚢 Ship de ${names} : ${percent}% de compatibilité !` });
  },
};
