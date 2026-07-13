module.exports = {
  name: 'link',
  category: 'group',
  description: "Récupère le lien d'invitation du groupe.",
  usage: '/link',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const code = await sock.groupInviteCode(remoteJid);
    await sock.sendMessage(remoteJid, { text: `🔗 https://chat.whatsapp.com/${code}` });
  },
};
