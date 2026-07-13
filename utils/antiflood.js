const config = require('../config');

const activity = new Map(); // userId -> [timestamps]

/**
 * Retourne true si l'utilisateur dépasse la limite de messages
 * autorisée sur la fenêtre de temps configurée (anti-flood).
 */
function isFlooding(userId) {
  const now = Date.now();
  const windowMs = config.limits.antifloodWindowMs;
  const max = config.limits.antifloodMaxMessages;

  const timestamps = (activity.get(userId) || []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  activity.set(userId, timestamps);

  return timestamps.length > max;
}

module.exports = { isFlooding };
