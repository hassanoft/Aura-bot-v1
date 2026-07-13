module.exports = {
  name: 'riddle',
  category: 'fun',
  description: 'Version anglaise de /devinette.',
  usage: '/riddle',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, {
      text: "🧩 The more you take, the more you leave behind. What am I?\n\n💡 Answer: Footsteps",
    });
  },
};
