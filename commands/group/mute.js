module.exports = {
  name: 'mute',
  category: 'group',
  description: 'Passe le groupe en mode "administrateurs uniquement".',
  usage: '/mute',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    await sock.groupSettingUpdate(remoteJid, 'announcement');
    await sock.sendMessage(remoteJid, { text: '🔇 Groupe verrouillé : seuls les admins peuvent écrire.' });
  },
};
