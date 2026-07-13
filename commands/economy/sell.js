const db = require('../../database/db');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'sell',
  category: 'economy',
  description: 'Vend un objet de votre inventaire.',
  usage: '/sell <objet>',
  async execute({ sock, remoteJid, senderJid, args }) {
    const item = args.join(' ');
    const id = permissions.normalizeNumber(senderJid);
    const account = db.economy.get(id, { balance: 0, inventory: [] });

    const index = account.inventory.indexOf(item);
    if (index === -1) return sock.sendMessage(remoteJid, { text: '❌ Objet introuvable dans ton inventaire.' });

    account.inventory.splice(index, 1);
    const price = 150;
    account.balance += price;
    db.economy.set(id, account);

    await sock.sendMessage(remoteJid, { text: `💵 Objet vendu pour ${price} FCFA. Solde : ${account.balance} FCFA` });
  },
};
