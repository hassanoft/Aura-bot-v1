const config = require('../../config');

module.exports = {
  name: 'info',
  category: 'info',
  description: 'Informations générales sur le bot.',
  usage: '/info',
  async execute({ sock, remoteJid }) {
    const text = `🤖 *${config.bot.name}*\n\nVersion : ${config.bot.version}\nPréfixe : ${config.bot.prefix}\nPropriétaire : ${config.bot.owner.name}\n\nBot WhatsApp professionnel construit avec Node.js et Baileys.`;
    await sock.sendMessage(remoteJid, { text });
  },
};
