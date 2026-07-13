module.exports = {
  name: 'ads',
  category: 'ads',
  description: "Affiche les tarifs de publicité disponibles via le bot.",
  usage: '/ads',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, {
      text: '📢 Espace publicitaire disponible. Contacte le propriétaire via /owner pour réserver un emplacement.',
    });
  },
};
