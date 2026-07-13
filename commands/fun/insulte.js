const INSULTES_LEGERES = [
  "Tu es tellement lent que même Internet Explorer te dépasse.",
  "T'as le charisme d'un mode avion.",
  "Ton niveau de chance rivalise avec celui d'un parapluie troué.",
];

module.exports = {
  name: 'insulte',
  category: 'fun',
  description: "Envoie une pique légère et humoristique (usage entre amis uniquement).",
  usage: '/insulte',
  async execute({ sock, remoteJid }) {
    const i = INSULTES_LEGERES[Math.floor(Math.random() * INSULTES_LEGERES.length)];
    await sock.sendMessage(remoteJid, { text: `😏 ${i}` });
  },
};
