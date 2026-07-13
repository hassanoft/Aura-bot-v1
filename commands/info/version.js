const config = require('../../config');

module.exports = {
  name: 'version',
  category: 'info',
  description: 'Affiche la version actuelle du bot.',
  usage: '/version',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: `📦 ${config.bot.name} — Version ${config.bot.version}` });
  },
};
