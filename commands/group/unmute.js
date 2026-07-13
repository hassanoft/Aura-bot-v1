module.exports = {
  name: 'unmute',
  category: 'group',
  description: 'Réautorise tous les membres à écrire.',
  usage: '/unmute',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    await sock.groupSettingUpdate(remoteJid, 'not_announcement');
    await sock.sendMessage(remoteJid, { text: '🔊 Groupe déverrouillé : tout le monde peut écrire.' });
  },
};
