module.exports = {
  name: 'roast',
  category: 'fun',
  description: 'Alias de /insulte.',
  usage: '/roast',
  async execute({ sock, remoteJid, commands }) {
    const insulte = commands.get('insulte');
    return insulte.execute({ sock, remoteJid });
  },
};
