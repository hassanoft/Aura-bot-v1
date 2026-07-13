const crypto = require('crypto');

module.exports = {
  name: 'uuid',
  category: 'tools',
  description: 'Génère un identifiant UUID v4.',
  usage: '/uuid',
  async execute({ sock, remoteJid }) {
    const id = crypto.randomUUID();
    await sock.sendMessage(remoteJid, { text: `🆔 ${id}` });
  },
};
