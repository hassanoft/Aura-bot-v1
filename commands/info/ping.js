module.exports = {
  name: 'ping',
  category: 'info',
  description: 'Vérifie la latence du bot.',
  usage: '/ping',
  async execute({ sock, remoteJid }) {
    const start = Date.now();
    const sent = await sock.sendMessage(remoteJid, { text: '🏓 Calcul en cours...' });
    const latency = Date.now() - start;
    await sock.sendMessage(remoteJid, { text: `🏓 Pong ! Latence : ${latency}ms` }, { quoted: sent });
  },
};
