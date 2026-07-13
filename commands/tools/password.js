module.exports = {
  name: 'password',
  category: 'tools',
  description: 'Génère un mot de passe sécurisé aléatoire.',
  usage: '/password [longueur]',
  async execute({ sock, remoteJid, args }) {
    const length = Math.min(Math.max(parseInt(args[0]) || 12, 6), 64);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    await sock.sendMessage(remoteJid, { text: `🔑 Mot de passe généré :\n${pwd}` });
  },
};
