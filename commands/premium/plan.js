const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'plan',
  category: 'premium',
  description: 'Affiche le plan Premium actuel et sa date d\'expiration.',
  usage: '/plan',
  async execute({ sock, remoteJid, senderJid }) {
    const record = db.premium.get(permissions.normalizeNumber(senderJid));
    if (!record) return sock.sendMessage(remoteJid, { text: 'Aucun abonnement Premium actif.' });
    await sock.sendMessage(remoteJid, { text: `📄 Plan : ${record.planId}\nExpire le : ${new Date(record.expiresAt).toLocaleDateString('fr-FR')}` });
  },
};
