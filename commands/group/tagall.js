module.exports = {
  name: 'tagall',
  category: 'group',
  description: 'Mentionne tous les membres du groupe.',
  usage: '/tagall',
  adminOnly: true,
  async execute({ sock, remoteJid, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Commande valable uniquement dans un groupe.' });
    const metadata = await sock.groupMetadata(remoteJid);
    const mentions = metadata.participants.map((p) => p.id);
    const text = mentions.map((m) => `@${m.split('@')[0]}`).join(' ');
    await sock.sendMessage(remoteJid, { text: `📢 ${text}`, mentions });
  },
};
