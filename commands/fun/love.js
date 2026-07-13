module.exports = {
  name: 'love',
  category: 'fun',
  description: "Calcule un pourcentage d'amour entre deux personnes.",
  usage: '/love @personne1 @personne2',
  async execute({ sock, remoteJid, args }) {
    const percent = Math.floor(Math.random() * 101);
    const names = args.join(' ') || 'vous deux';
    await sock.sendMessage(remoteJid, { text: `💞 Compatibilité pour ${names} : ${percent}%` });
  },
};
