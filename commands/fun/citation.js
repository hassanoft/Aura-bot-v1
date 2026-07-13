const CITATIONS = [
  "« Le succès, c'est se promener d'échec en échec avec enthousiasme. » — Winston Churchill",
  "« La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre. » — Albert Einstein",
  "« Ce qui ne nous tue pas nous rend plus forts. » — Nietzsche",
];

module.exports = {
  name: 'citation',
  category: 'fun',
  description: 'Envoie une citation inspirante.',
  usage: '/citation',
  async execute({ sock, remoteJid }) {
    const c = CITATIONS[Math.floor(Math.random() * CITATIONS.length)];
    await sock.sendMessage(remoteJid, { text: `✨ ${c}` });
  },
};
