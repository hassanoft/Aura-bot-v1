const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'pay',
  category: 'economy',
  description: 'Transfère de l\'argent virtuel à un membre (en réponse à son message).',
  usage: '/pay <montant> (en réponse au membre)',
  async execute({ sock, remoteJid, senderJid, args, msg }) {
    const amount = parseInt(args[0]);
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!amount || !target) return sock.sendMessage(remoteJid, { text: 'Usage : /pay <montant> (en réponse au destinataire)' });

    const fromId = permissions.normalizeNumber(senderJid);
    const toId = permissions.normalizeNumber(target);
    const fromAccount = db.economy.get(fromId, { balance: 0, inventory: [] });

    if (fromAccount.balance < amount) return sock.sendMessage(remoteJid, { text: '❌ Solde insuffisant.' });

    const toAccount = db.economy.get(toId, { balance: 0, inventory: [] });
    fromAccount.balance -= amount;
    toAccount.balance += amount;
    db.economy.set(fromId, fromAccount);
    db.economy.set(toId, toAccount);

    await sock.sendMessage(remoteJid, { text: `💸 ${amount} FCFA envoyés avec succès.` });
  },
};
