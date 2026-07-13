const db = require('../../database/db');

module.exports = {
  name: 'groups',
  category: 'admin',
  description: 'Liste les groupes connus du bot.',
  usage: '/groups',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    const groups = Object.keys(db.groups.all()).filter((k) => !k.includes(':'));
    await sock.sendMessage(remoteJid, { text: `👥 Groupes suivis : ${groups.length}` });
  },
};
