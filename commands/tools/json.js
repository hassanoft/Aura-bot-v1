module.exports = {
  name: 'json',
  category: 'tools',
  description: 'Formate un texte JSON brut.',
  usage: '/json {"a":1}',
  async execute({ sock, remoteJid, args }) {
    const raw = args.join(' ');
    try {
      const parsed = JSON.parse(raw);
      await sock.sendMessage(remoteJid, { text: '```' + JSON.stringify(parsed, null, 2) + '```' });
    } catch {
      await sock.sendMessage(remoteJid, { text: '❌ JSON invalide.' });
    }
  },
};
