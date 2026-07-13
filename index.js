const path = require('path');
const fs = require('fs');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const config = require('./config');
const logger = require('./utils/logger');
const db = require('./database/db');
const { loadCommands } = require('./utils/commandLoader');
const { loadEvents } = require('./utils/eventLoader');
const { createServer } = require('./server');

const SESSION_DIR = path.resolve(config.paths.session);

const state = {
  connected: false,
  lastConnectedAt: null,
  usersCount: () => Object.keys(db.users.all()).length,
  groupsCount: () => Object.keys(db.groups.all()).length,
};

const commands = loadCommands();
let sock = null;
let pairingNumber = null;

async function startBot() {
  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

  const { state: authState, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: authState,
    printQRInTerminal: false, // Pairing Code uniquement, pas de QR
    logger: require('pino')({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  const context = {
    commands,
    state,
    reconnect: startBot,
    clearSession: deleteSession,
  };

  loadEvents(sock, context);

  // Si un numéro d'appairage est en attente et qu'aucune session n'existe encore
  if (pairingNumber && !sock.authState.creds.registered) {
    try {
      const code = await sock.requestPairingCode(pairingNumber);
      logger.info(`Pairing Code généré pour ${pairingNumber} : ${code}`);
    } catch (err) {
      logger.error(`Échec de génération du pairing code: ${err.message}`);
    }
  }

  return sock;
}

async function requestPairingCode(number) {
  pairingNumber = number.replace(/[^0-9]/g, '');

  if (!sock) {
    await startBot();
  }

  if (sock.authState.creds.registered) {
    throw new Error('Le bot est déjà connecté. Supprimez la session pour ré-appairer.');
  }

  const code = await sock.requestPairingCode(pairingNumber);
  logger.info(`Pairing Code demandé pour ${pairingNumber}`);
  return code;
}

async function restart() {
  logger.info('Redémarrage de la connexion WhatsApp demandé.');
  try {
    sock?.end?.();
  } catch (_) {}
  await startBot();
}

function deleteSession() {
  if (fs.existsSync(SESSION_DIR)) {
    fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }
  state.connected = false;
  logger.warn('Session WhatsApp supprimée.');
}

// --- Anti-crash global : le bot ne doit jamais s'arrêter sur une erreur non gérée ---
process.on('uncaughtException', (err) => logger.error(`Exception non capturée: ${err.stack || err.message}`));
process.on('unhandledRejection', (reason) => logger.error(`Rejet de promesse non géré: ${reason}`));

// --- Démarrage ---
(async () => {
  const botContext = {
    state,
    requestPairingCode,
    restart,
    deleteSession,
    commands,
  };

  const app = createServer(botContext);
  app.listen(config.server.port, () => {
    logger.success(`🌐 Interface web disponible sur le port ${config.server.port}`);
  });

  // Démarre automatiquement la connexion si une session existe déjà
  if (fs.existsSync(SESSION_DIR) && fs.readdirSync(SESSION_DIR).length > 0) {
    await startBot();
  } else {
    logger.info('Aucune session trouvée. En attente d\'une demande de Pairing Code via /pair.');
  }
})();
