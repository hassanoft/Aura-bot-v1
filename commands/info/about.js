const config = require('../../config');

module.exports = {
  name: 'about',
  category: 'info',
  description: 'Présentation du projet AURA BOT.',
  usage: '/about',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, {
      text: `🤖 *${config.bot.name}*\n\nAssistant WhatsApp modulaire développé pour automatiser les échanges, gérer des groupes et offrir des services Premium.\n\nDéveloppé par ${config.bot.owner.name}.`,
    });
  },
};
