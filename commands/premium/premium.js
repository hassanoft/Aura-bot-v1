const permissions = require('../../utils/permissions');

module.exports = {
  name: 'premium',
  category: 'premium',
  description: 'Affiche les avantages du statut Premium.',
  usage: '/premium',
  async execute({ sock, remoteJid, senderJid }) {
    const isPremium = permissions.isPremium(senderJid);
    await sock.sendMessage(remoteJid, {
      text: `👑 Statut Premium : ${isPremium ? 'Actif ✅' : 'Inactif ❌'}\n\nAvantages : pas de cooldown, commandes exclusives, support prioritaire.\nUtilise /pricing pour voir les offres.`,
    });
  },
};
