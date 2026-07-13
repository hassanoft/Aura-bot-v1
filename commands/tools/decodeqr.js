module.exports = {
  name: 'decodeqr',
  category: 'tools',
  description: 'Explique comment décoder un QR code (à partir d\'une image envoyée).',
  usage: '/decodeqr (en réponse à une image)',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, {
      text: "📷 Réponds à une image contenant un QR code avec cette commande. Le décodage d'image nécessite le module 'jsqr' installé côté serveur.",
    });
  },
};
