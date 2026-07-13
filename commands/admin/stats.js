const db = require('../../database/db');

module.exports = {
  name: 'stats',
  category: 'admin',
  description: "Affiche les statistiques d'utilisation du bot.",
  usage: '/stats',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    const usage = db.stats.get('commandUsage', {});
    const total = Object.values(usage).reduce((a, b) => a + b, 0);
    const top = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([cmd, count]) => `/${cmd} : ${count}`).join('\n') || 'Aucune donnée.';
    await sock.sendMessage(remoteJid, { text: `📊 Statistiques\n\nCommandes exécutées : ${total}\n\nTop commandes :\n${top}` });
  },
};
