const QUESTIONS = [
  { q: "Quelle est la capitale de la Côte d'Ivoire ?", r: "Yamoussoukro" },
  { q: "Combien de continents compte la Terre ?", r: "7" },
  { q: "Quel est le plus grand océan du monde ?", r: "L'océan Pacifique" },
];

module.exports = {
  name: 'quiz',
  category: 'fun',
  description: 'Lance une question de culture générale.',
  usage: '/quiz',
  async execute({ sock, remoteJid }) {
    const item = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    await sock.sendMessage(remoteJid, { text: `🧠 Quiz : ${item.q}\n\n(Réponse dans 10s...)` });
    setTimeout(() => sock.sendMessage(remoteJid, { text: `✅ Réponse : ${item.r}` }), 10000);
  },
};
