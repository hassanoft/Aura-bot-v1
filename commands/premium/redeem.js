const config = require('../../config');
const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'redeem',
  category: 'premium',
  description: 'Active un code Premium (donné par le propriétaire).',
  usage: '/redeem <code>',
  ownerOnly: false,
  async execute({ sock, remoteJid, senderJid, args }) {
    const code = args[0];
    if (!code) return sock.sendMessage(remoteJid, { text: 'Usage : /redeem <code>' });

    const codes = db.premium.get('codes', {});
    const entry = codes[code];
    if (!entry || entry.used) return sock.sendMessage(remoteJid, { text: '❌ Code invalide ou déjà utilisé.' });

    const plan = config.premium.plans.find((p) => p.id === entry.planId) || config.premium.plans[0];
    const expiresAt = new Date(Date.now() + plan.durationDays * 86400000).toISOString();
    db.premium.set(permissions.normalizeNumber(senderJid), { planId: plan.id, expiresAt });

    entry.used = true;
    codes[code] = entry;
    db.premium.set('codes', codes);

    await sock.sendMessage(remoteJid, { text: `🎉 Code activé ! Plan ${plan.name} actif jusqu'au ${new Date(expiresAt).toLocaleDateString('fr-FR')}.` });
  },
};
