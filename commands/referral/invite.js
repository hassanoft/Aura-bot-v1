const config = require('../../config');

module.exports = {
  name: 'invite',
  category: 'referral',
  description: 'Envoie un message d\'invitation à partager.',
  usage: '/invite',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, {
      text: `📨 Rejoins-moi sur ${config.bot.name}, un assistant WhatsApp complet et gratuit à découvrir !`,
    });
  },
};
