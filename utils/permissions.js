const config = require('../config');
const db = require('../database/db');

function normalizeNumber(jid) {
  return jid?.replace(/[^0-9]/g, '') || '';
}

function isOwner(senderJid) {
  return normalizeNumber(senderJid) === normalizeNumber(config.bot.owner.number);
}

function isPremium(senderJid) {
  const record = db.premium.get(normalizeNumber(senderJid));
  if (!record) return false;
  return new Date(record.expiresAt) > new Date();
}

async function isGroupAdmin(sock, groupId, senderJid) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const participant = metadata.participants.find((p) => p.id === senderJid);
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
  } catch {
    return false;
  }
}

module.exports = { isOwner, isPremium, isGroupAdmin, normalizeNumber };
