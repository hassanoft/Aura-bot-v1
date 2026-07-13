const fs = require('fs');
const path = require('path');
const config = require('../../config');

module.exports = {
  name: 'backup',
  category: 'admin',
  description: 'Crée une sauvegarde de la base de données.',
  usage: '/backup',
  ownerOnly: true,
  async execute({ sock, remoteJid }) {
    const dbDir = path.resolve(config.paths.database);
    const backupDir = path.join(dbDir, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${stamp}.json`);
    const files = fs.readdirSync(dbDir).filter((f) => f.endsWith('.json'));
    const snapshot = {};
    for (const f of files) snapshot[f] = JSON.parse(fs.readFileSync(path.join(dbDir, f), 'utf-8'));
    fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2));

    await sock.sendMessage(remoteJid, { text: `💾 Sauvegarde créée : ${path.basename(backupFile)}` });
  },
};
