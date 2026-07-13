const { buildHelpMenu } = require('../../utils/menuBuilder');

module.exports = {
  name: 'menu',
  aliases: ['help'],
  category: 'info',
  description: 'Affiche le menu complet des commandes disponibles.',
  usage: '/menu',
  async execute({ sock, remoteJid, commands, msg }) {
    const senderName = msg.pushName || '';
    const menu = buildHelpMenu(commands, senderName);
    await sock.sendMessage(remoteJid, { text: menu });
  },
};
