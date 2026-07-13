const fs = require('fs');
const path = require('path');
const config = require('../config');

const LEVELS = { info: '\x1b[36mINFO\x1b[0m', warn: '\x1b[33mWARN\x1b[0m', error: '\x1b[31mERROR\x1b[0m', success: '\x1b[32mOK\x1b[0m' };

// Buffer en mémoire pour l'API /logs (dernières 500 lignes)
const memoryLogs = [];
const MAX_MEMORY_LOGS = 500;

function ensureLogDir() {
  const dir = path.resolve(config.paths.logs);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeToFile(line) {
  try {
    const dir = ensureLogDir();
    const file = path.join(dir, `${new Date().toISOString().slice(0, 10)}.log`);
    fs.appendFileSync(file, line + '\n');
  } catch (err) {
    // Ne jamais crasher le bot pour un problème de log
    console.error('Impossible d\'écrire le log:', err.message);
  }
}

function log(level, message) {
  const timestamp = new Date().toISOString();
  const plainLine = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  const coloredLine = `[${timestamp}] [${LEVELS[level] || level}] ${message}`;

  console.log(coloredLine);
  writeToFile(plainLine);

  memoryLogs.push({ timestamp, level, message });
  if (memoryLogs.length > MAX_MEMORY_LOGS) memoryLogs.shift();
}

module.exports = {
  info: (msg) => log('info', msg),
  warn: (msg) => log('warn', msg),
  error: (msg) => log('error', msg),
  success: (msg) => log('success', msg),
  getRecent: (limit = 100) => memoryLogs.slice(-limit),
};
