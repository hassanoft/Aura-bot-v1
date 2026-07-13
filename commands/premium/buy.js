const config = require('../../config');

module.exports = {
  name: 'buy',
  category: 'premium',
  description: "Lance la procédure d'achat Premium.",
  usage: '/buy <plan>',
  async execute({ sock, remoteJid, args }) {
    const planId = args[0];
    const plan = config.premium.plans.find((p) => p.id === planId);
    if (!plan) {
      const list = config.premium.plans.map((p) => `${p.id} : ${p.price} FCFA / ${p.durationDays}j`).join('\n');
      return sock.sendMessage(remoteJid, { text: `Plans disponibles :\n${list}\n\nExemple : /buy pro` });
    }
    await sock.sendMessage(remoteJid, {
      text: `🛒 Plan sélectionné : ${plan.name} (${plan.price} FCFA)\nContacte le propriétaire via /owner pour finaliser le paiement.`,
    });
  },
};
