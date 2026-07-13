const COMPLIMENTS = [
  "Tu illumines chaque conversation avec ton énergie positive !",
  "Ton travail acharné finit toujours par payer.",
  "Tu as un excellent sens de l'humour.",
];

module.exports = {
  name: 'compliment',
  category: 'fun',
  description: 'Envoie un compliment.',
  usage: '/compliment',
  async execute({ sock, remoteJid }) {
    const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    await sock.sendMessage(remoteJid, { text: `💬 ${c}` });
  },
};
