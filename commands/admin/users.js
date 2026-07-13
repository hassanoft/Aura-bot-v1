const db = require('../../database/db');

module.exports = {
  name: 'users',
  category: 'admin',
  description: 'Affiche le nombre total d\'utilisateurs connus.',
  usage: '/users',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    const count = Object.keys(db.users.all()).length;
    await sock.sendMessage(remoteJid, { text: `👤 Utilisateurs enregistrés : ${count}` });
  },
};
