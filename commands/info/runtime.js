module.exports = {
  name: 'runtime',
  category: 'info',
  description: "Affiche le temps d'exécution du processus.",
  usage: '/runtime',
  async execute({ sock, remoteJid }) {
    const seconds = process.uptime();
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    await sock.sendMessage(remoteJid, { text: `⏱️ Temps d'exécution : ${h}h ${m}m ${s}s` });
  },
};
