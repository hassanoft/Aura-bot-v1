module.exports = {
  name: 'expandurl',
  category: 'tools',
  description: "Retrouve l'URL complète derrière un lien raccourci.",
  usage: '/expandurl <url>',
  async execute({ sock, remoteJid, args }) {
    const url = args[0];
    if (!url) return sock.sendMessage(remoteJid, { text: 'Fournis un lien court. Exemple : /expandurl https://is.gd/xyz' });
    try {
      const res = await fetch(url, { redirect: 'follow' });
      await sock.sendMessage(remoteJid, { text: `🔗 URL complète : ${res.url}` });
    } catch {
      await sock.sendMessage(remoteJid, { text: "❌ Impossible de résoudre ce lien." });
    }
  },
};
