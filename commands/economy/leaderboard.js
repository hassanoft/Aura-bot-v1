const db = require('../../database/db');

module.exports = {
  name: 'leaderboard',
  category: 'economy',
  description: 'Classement des utilisateurs les plus riches.',
  usage: '/leaderboard',
  async execute({ sock, remoteJid }) {
    const all = db.economy.all();
    const ranked = Object.entries(all)
      .sort((a, b) => (b[1].balance || 0) - (a[1].balance || 0))
      .slice(0, 10)
      .map(([id, acc], i) => `${i + 1}. ${id} — ${acc.balance} FCFA`)
      .join('\n') || 'Aucune donnée.';
    await sock.sendMessage(remoteJid, { text: `🏆 Classement :\n\n${ranked}` });
  },
};
