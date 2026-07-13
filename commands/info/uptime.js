module.exports = {
  name: 'uptime',
  category: 'info',
  description: 'Alias de /runtime.',
  usage: '/uptime',
  async execute({ sock, remoteJid }) {
    const seconds = process.uptime();
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    await sock.sendMessage(remoteJid, { text: `🟢 En ligne depuis ${h}h ${m}m` });
  },
};
