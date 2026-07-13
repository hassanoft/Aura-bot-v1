module.exports = {
  name: 'parrainage',
  category: 'referral',
  description: 'Alias français de /refer.',
  usage: '/parrainage',
  async execute({ sock, remoteJid, commands, senderJid }) {
    return commands.get('refer').execute({ sock, remoteJid, senderJid });
  },
};
