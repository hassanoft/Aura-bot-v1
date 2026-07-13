module.exports = {
  name: 'update',
  category: 'admin',
  description: 'Rappelle la procédure de mise à jour du bot.',
  usage: '/update',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, {
      text: '🔧 Pour mettre à jour le bot : git pull && npm install, puis /restart.',
    });
  },
};
