module.exports = {
  name: 'status',
  category: 'info',
  description: "Affiche l'état actuel de la connexion.",
  usage: '/status',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: '🟢 Statut : Bot en ligne et opérationnel.' });
  },
};
