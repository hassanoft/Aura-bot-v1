module.exports = {
  name: 'shorturl',
  category: 'tools',
  description: 'Raccourcit un lien via is.gd.',
  usage: '/shorturl <url>',
  async execute({ sock, remoteJid, args }) {
    const url = args[0];
    if (!url) return sock.sendMessage(remoteJid, { text: 'Fournis une URL. Exemple : /shorturl https://example.com' });
    try {
      const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      const short = await res.text();
      await sock.sendMessage(remoteJid, { text: `🔗 Lien raccourci : ${short}` });
    } catch {
      await sock.sendMessage(remoteJid, { text: '❌ Impossible de raccourcir ce lien.' });
    }
  },
};
