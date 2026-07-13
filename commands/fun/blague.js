const BLAGUES = [
  "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau !",
  "Quel est le sport le plus silencieux ? Le para-chute.",
  "Pourquoi les poules n'ont pas de banque ? Elles utilisent l'oeuf-shore.",
  "Que dit un escargot quand il croise une limace ? Regarde, un nudiste !",
  "Pourquoi les développeurs confondent Halloween et Noël ? Parce que OCT 31 == DEC 25.",
];

module.exports = {
  name: 'blague',
  category: 'fun',
  description: 'Envoie une blague aléatoire.',
  usage: '/blague',
  async execute({ sock, remoteJid }) {
    const blague = BLAGUES[Math.floor(Math.random() * BLAGUES.length)];
    await sock.sendMessage(remoteJid, { text: `😂 ${blague}` });
  },
};
