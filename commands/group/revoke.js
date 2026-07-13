module.exports = {
  name: 'revoke',
  category: 'group',
  description: "Révoque et régénère le lien d'invitation du groupe.",
  usage: '/revoke',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    await sock.groupRevokeInvite(remoteJid);
    await sock.sendMessage(remoteJid, { text: '♻️ Lien du groupe régénéré avec succès.' });
  },
};
