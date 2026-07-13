module.exports = {
  name: 'sendpromo',
  category: 'ads',
  description: 'Envoie un message promotionnel dans le groupe courant.',
  usage: '/sendpromo <message>',
  adminOnly: true,
  async execute({ sock, remoteJid, args }) {
    const message = args.join(' ');
    if (!message) return sock.sendMessage(remoteJid, { text: 'Usage : /sendpromo <message>' });
    await sock.sendMessage(remoteJid, { text: `🎯 *Promotion*\n\n${message}` });
  },
};
