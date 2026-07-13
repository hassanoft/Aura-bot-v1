const logger = require('../../utils/logger');

module.exports = {
  name: 'logs',
  category: 'admin',
  description: 'Affiche les derniers logs du bot.',
  usage: '/logs',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    const recent = logger.getRecent(15);
    const text = recent.map((l) => `[${l.level.toUpperCase()}] ${l.message}`).join('\n') || 'Aucun log disponible.';
    await sock.sendMessage(remoteJid, { text: `📋 Derniers logs :\n\n${text}` });
  },
};
