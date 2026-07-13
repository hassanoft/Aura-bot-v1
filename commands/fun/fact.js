const FACTS = [
  "Le miel ne se périme jamais s'il est bien conservé.",
  "Les octopus ont trois cœurs.",
  "La tour Eiffel grandit de quelques centimètres en été à cause de la chaleur.",
];

module.exports = {
  name: 'fact',
  category: 'fun',
  description: 'Envoie un fait insolite.',
  usage: '/fact',
  async execute({ sock, remoteJid }) {
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
    await sock.sendMessage(remoteJid, { text: `📚 Le saviez-vous ? ${fact}` });
  },
};
