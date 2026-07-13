module.exports = {
  name: 'broadcast',
  category: 'ads',
  description: 'Diffuse un message à tous les groupes suivis par le bot.',
  usage: '/broadcast <message>',
  ownerOnly: true,
  async execute({ sock, remoteJid, args }) {
    const message = args.join(' ');
    if (!message) return sock.sendMessage(remoteJid, { text: 'Usage : /broadcast <message>' });

    const groups = await sock.groupFetchAllParticipating();
    const ids = Object.keys(groups);
    for (const id of ids) {
      try {
        await sock.sendMessage(id, { text: `📢 ${message}` });
      } catch (_) {}
    }
    await sock.sendMessage(remoteJid, { text: `✅ Message diffusé à ${ids.length} groupe(s).` });
  },
};
