const config = require('../config');

const cooldowns = new Map(); // key: `${command}:${userId}` -> timestamp

function isOnCooldown(command, userId) {
  const key = `${command}:${userId}`;
  const last = cooldowns.get(key);
  if (!last) return false;
  return Date.now() - last < config.limits.cooldownMs;
}

function getRemaining(command, userId) {
  const key = `${command}:${userId}`;
  const last = cooldowns.get(key) || 0;
  const remaining = config.limits.cooldownMs - (Date.now() - last);
  return Math.max(0, Math.ceil(remaining / 1000));
}

function trigger(command, userId) {
  cooldowns.set(`${command}:${userId}`, Date.now());
}

module.exports = { isOnCooldown, getRemaining, trigger };
