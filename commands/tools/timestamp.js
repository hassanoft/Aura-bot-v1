module.exports = {
  name: 'timestamp',
  category: 'tools',
  description: "Affiche l'horodatage Unix actuel.",
  usage: '/timestamp',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: `⏰ Timestamp actuel : ${Math.floor(Date.now() / 1000)}` });
  },
};
