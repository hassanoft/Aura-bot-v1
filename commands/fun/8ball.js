const REPONSES = ["Oui, certainement.", "C'est peu probable.", "Demande à nouveau plus tard.", "Absolument !", "Non, désolé.", "Les signes indiquent que oui."];

module.exports = {
  name: '8ball',
  category: 'fun',
  description: 'Pose une question à la boule magique.',
  usage: '/8ball <question>',
  async execute({ sock, remoteJid, args }) {
    if (!args.length) return sock.sendMessage(remoteJid, { text: 'Pose une question après la commande. Exemple : /8ball vais-je réussir ?' });
    const r = REPONSES[Math.floor(Math.random() * REPONSES.length)];
    await sock.sendMessage(remoteJid, { text: `🎱 ${r}` });
  },
};
