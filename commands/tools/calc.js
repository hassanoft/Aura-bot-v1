module.exports = {
  name: 'calc',
  category: 'tools',
  description: 'Calculatrice simple (opérations de base).',
  usage: '/calc 2+2*5',
  async execute({ sock, remoteJid, args }) {
    const expr = args.join('');
    if (!/^[0-9+\-*/().\s]+$/.test(expr) || !expr) {
      return sock.sendMessage(remoteJid, { text: '❌ Expression invalide. Exemple : /calc 12*(3+4)' });
    }
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();
      await sock.sendMessage(remoteJid, { text: `🧮 ${expr} = ${result}` });
    } catch {
      await sock.sendMessage(remoteJid, { text: '❌ Impossible de calculer cette expression.' });
    }
  },
};
