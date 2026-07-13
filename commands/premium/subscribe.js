module.exports = {
  name: 'subscribe',
  category: 'premium',
  description: 'Alias de /buy.',
  usage: '/subscribe <plan>',
  async execute({ sock, remoteJid, args, commands }) {
    return commands.get('buy').execute({ sock, remoteJid, args });
  },
};
