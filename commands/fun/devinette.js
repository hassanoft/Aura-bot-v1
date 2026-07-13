const DEVINETTES = [
  { q: "Je n'ai pas de bouche mais je peux parler. Qui suis-je ?", r: "Un écho" },
  { q: "Plus on m'enlève, plus je grandis. Qui suis-je ?", r: "Un trou" },
  { q: "Je vole sans ailes, je pleure sans yeux. Qui suis-je ?", r: "Un nuage" },
];

module.exports = {
  name: 'devinette',
  category: 'fun',
  description: 'Envoie une devinette avec sa réponse.',
  usage: '/devinette',
  async execute({ sock, remoteJid }) {
    const d = DEVINETTES[Math.floor(Math.random() * DEVINETTES.length)];
    await sock.sendMessage(remoteJid, { text: `🤔 ${d.q}\n\n💡 Réponse : ${d.r}` });
  },
};
