const config = require('../../config');

module.exports = {
  name: 'pricing',
  category: 'premium',
  description: 'Affiche la liste des offres Premium.',
  usage: '/pricing',
  async execute({ sock, remoteJid }) {
    const list = config.premium.plans.map((p) => `👑 ${p.name} — ${p.price} FCFA (${p.durationDays} jours)`).join('\n');
    await sock.sendMessage(remoteJid, { text: `💳 Nos offres Premium :\n\n${list}` });
  },
};
