module.exports = {
  name: 'base64',
  category: 'tools',
  description: 'Encode ou décode du texte en Base64.',
  usage: '/base64 encode <texte> | /base64 decode <texte>',
  async execute({ sock, remoteJid, args }) {
    const mode = args.shift();
    const text = args.join(' ');
    if (!mode || !text) return sock.sendMessage(remoteJid, { text: 'Usage : /base64 encode|decode <texte>' });

    try {
      const result = mode === 'decode'
        ? Buffer.from(text, 'base64').toString('utf-8')
        : Buffer.from(text, 'utf-8').toString('base64');
      await sock.sendMessage(remoteJid, { text: `🔐 Résultat : ${result}` });
    } catch {
      await sock.sendMessage(remoteJid, { text: '❌ Erreur de conversion.' });
    }
  },
};
