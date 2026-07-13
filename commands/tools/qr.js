module.exports = {
  name: 'qr',
  category: 'tools',
  description: 'Génère un lien de QR code à partir d\'un texte.',
  usage: '/qr <texte>',
  async execute({ sock, remoteJid, args }) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(remoteJid, { text: 'Fournis un texte. Exemple : /qr https://example.com' });
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    await sock.sendMessage(remoteJid, { image: { url }, caption: '📌 QR Code généré' });
  },
};
