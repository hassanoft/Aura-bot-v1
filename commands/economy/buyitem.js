const db = require('../../database/db');
const permissions = require('../../utils/permissions');

const SHOP = { epee: 300, bouclier: 400, potion: 100 };

module.exports = {
  name: 'buyitem',
  category: 'economy',
  description: 'Achète un objet dans la boutique virtuelle.',
  usage: '/buyitem <epee|bouclier|potion>',
  async execute({ sock, remoteJid, senderJid, args }) {
    const item = args[0];
    const price = SHOP[item];
    if (!price) {
      const list = Object.entries(SHOP).map(([k, v]) => `${k} : ${v} FCFA`).join('\n');
      return sock.sendMessage(remoteJid, { text: `🛍️ Boutique :\n${list}` });
    }

    const id = permissions.normalizeNumber(senderJid);
    const account = db.economy.get(id, { balance: 0, inventory: [] });
    if (account.balance < price) return sock.sendMessage(remoteJid, { text: '❌ Solde insuffisant.' });

    account.balance -= price;
    account.inventory.push(item);
    db.economy.set(id, account);

    await sock.sendMessage(remoteJid, { text: `✅ ${item} acheté ! Solde restant : ${account.balance} FCFA` });
  },
};
