const config = require('../../config');

module.exports = {
  name: 'owner',
  category: 'info',
  description: 'Affiche le contact du propriétaire du bot.',
  usage: '/owner',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, {
      text: `👑 Propriétaire : ${config.bot.owner.name}\n📞 Contact : wa.me/${config.bot.owner.number}`,
    });
  },
};
