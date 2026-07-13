require('dotenv').config();

module.exports = {
  bot: {
    name: process.env.BOT_NAME || 'AURA BOT',
    version: '1.0.0',
    prefix: process.env.BOT_PREFIX || '/',
    owner: {
      number: process.env.OWNER_NUMBER || '2250500525480',
      name: process.env.OWNER_NAME || 'Hassan Sougue',
    },
  },

  server: {
    port: process.env.PORT || 3000,
  },

  paths: {
    session: process.env.SESSION_PATH || './sessions',
    database: process.env.DATABASE_PATH || './database',
    logs: process.env.LOGS_PATH || './logs',
  },

  limits: {
    cooldownMs: parseInt(process.env.COOLDOWN_MS || '3000', 10),
    antifloodWindowMs: parseInt(process.env.ANTIFLOOD_WINDOW_MS || '10000', 10),
    antifloodMaxMessages: parseInt(process.env.ANTIFLOOD_MAX_MESSAGES || '8', 10),
  },

  premium: {
    plans: [
      { id: 'basic', name: 'Basique', price: 1000, durationDays: 30 },
      { id: 'pro', name: 'Pro', price: 2500, durationDays: 30 },
      { id: 'vip', name: 'VIP', price: 5000, durationDays: 90 },
    ],
  },
};
