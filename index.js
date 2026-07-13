require("dotenv").config();

const path = require("path");
const fs = require("fs");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const config = require("./config");
const logger = require("./utils/logger");
const db = require("./database/db");

const { loadCommands } = require("./utils/commandLoader");
const { loadEvents } = require("./utils/eventLoader");
const { createServer } = require("./server");

// ===============================
// CONFIG TERMUX
// ===============================

// Stocker la session dans un dossier persistant
const SESSION_DIR = path.resolve(
  process.env.SESSION_DIR || 
  path.join("/data/data/com.termux/files/home/.aura-session")
);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Version WhatsApp
let WA_VERSION = [2, 3000, 1015901307];

// ===============================
// ÉTAT DU BOT
// ===============================

const state = {
  connected: false,
  lastConnectedAt: null,
  usersCount() {
    return Object.keys(db.users.all()).length;
  },
  groupsCount() {
    return Object.keys(db.groups.all()).length;
  }
};

const commands = loadCommands();

let sock = null;
let authState = null;
let saveCreds = null;
let reconnecting = false;
let pairingRunning = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 100; // Plus élevé pour Termux

// ===============================
// ANIMATION DÉMARRAGE
// ===============================

function showBanner() {
  console.log(`
╔══════════════════════════════════════╗
║        🤖 AURA BOT - TERMUX         ║
║         WhatsApp Bot 24/7            ║
╚══════════════════════════════════════╝
`);
}

// ===============================
// START WHATSAPP
// ===============================

async function startBot() {
  try {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logger.error("❌ Trop de tentatives");
      logger.info("⏰ Reset automatique dans 10 minutes...");
      
      setTimeout(() => {
        reconnectAttempts = 0;
        reconnecting = false;
        logger.info("🔄 Reprise des tentatives...");
        startBot();
      }, 600000);
      
      return;
    }

    // Créer le dossier de session
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
      logger.info("📁 Session: " + SESSION_DIR);
    }

    const auth = await useMultiFileAuthState(SESSION_DIR);
    authState = auth.state;
    saveCreds = auth.saveCreds;

    // Essayer de récupérer la dernière version
    try {
      const { version } = await fetchLatestBaileysVersion();
      WA_VERSION = version;
      logger.info("📱 WhatsApp v" + version.join("."));
    } catch (e) {
      logger.warn("⚠️ Version fallback: " + WA_VERSION.join("."));
    }

    if (authState.creds.registered) {
      logger.success("✅ Session existante - Reconnexion auto");
    } else {
      logger.info("🆕 Nouvelle session");
      logger.info("💡 Scannez le QR code qui va s'afficher");
      logger.info("   Ou utilisez le pairing code via l'API");
    }

    sock = makeWASocket({
      version: WA_VERSION,
      auth: {
        creds: authState.creds,
        keys: makeCacheableSignalKeyStore(
          authState.keys,
          pino({ level: "silent" })
        )
      },
      browser: ["AURA BOT", "Chrome", "10.0.0"],
      logger: pino({ level: "silent" }),
      printQRInTerminal: !process.env.DISABLE_QR,
      connectTimeoutMs: 120000,
      keepAliveIntervalMs: 30000,
      markOnlineOnConnect: true,
      defaultQueryTimeoutMs: 60000,
      syncFullHistory: false,
      retryRequestDelayMs: 10000,
      emitOwnEvents: true,
      generateHighQualityLinkPreview: true
    });

    sock.ev.on("creds.update", saveCreds);

    const context = {
      commands,
      state,
      reconnect: startBot,
      clearSession: deleteSession
    };

    loadEvents(sock, context);

    // Gestion connexion
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Afficher QR code
      if (qr && !authState.creds.registered) {
        logger.info("📱 QR Code prêt ! Scannez avec WhatsApp");
      }

      if (connection === "connecting") {
        logger.info("🔌 Connexion...");
      }

      if (connection === "open") {
        state.connected = true;
        state.lastConnectedAt = new Date();
        reconnectAttempts = 0;
        reconnecting = false;

        const botNumber = sock.user?.id?.split(":")[0] || "Inconnu";
        
        logger.success("✅ Connecté !");
        logger.info("📞 +" + botNumber);
        logger.info("👥 " + state.usersCount() + " utilisateurs");
        logger.info("👥 " + state.groupsCount() + " groupes");
        logger.info("⏰ " + state.lastConnectedAt.toLocaleString());
        
        // Notification Termux (optionnel)
        if (process.env.TERMUX_NOTIFICATION === "true") {
          require("child_process").exec(
            `termux-notification --title "Aura Bot" --content "Connecté à WhatsApp" --priority high`
          );
        }
      }

      if (connection === "close") {
        state.connected = false;

        const code = lastDisconnect?.error?.output?.statusCode;
        const erreur = lastDisconnect?.error?.message || "Inconnue";

        logger.warn("🔌 Déconnecté");
        logger.warn("📊 Code: " + (code || "N/A"));
        logger.warn("💬 " + erreur);

        if (code === DisconnectReason.loggedOut) {
          logger.error("🚫 Session invalidée");
          logger.info("💡 Supprimez " + SESSION_DIR + " et redémarrez");
          deleteSession();
          reconnectAttempts = MAX_RECONNECT_ATTEMPTS;
          
          if (process.env.TERMUX_NOTIFICATION === "true") {
            require("child_process").exec(
              `termux-notification --title "Aura Bot" --content "⚠️ Session invalidée" --priority urgent`
            );
          }
          return;
        }

        // Reconnexion
        if (!reconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnecting = true;
          reconnectAttempts++;

          const waitTime = Math.min(5000 * reconnectAttempts, 60000);

          logger.info(
            "🔄 Reconnexion " +
            reconnectAttempts + "/" + MAX_RECONNECT_ATTEMPTS +
            " dans " + waitTime / 1000 + "s"
          );

          await delay(waitTime);

          try { sock?.end(); } catch (e) {}
          sock = null;
          reconnecting = false;

          await startBot();
        }
      }
    });

    return sock;

  } catch (error) {
    logger.error("❌ Erreur: " + error.message);
    await delay(10000);
    if (!reconnecting) return startBot();
  }
}

// ===============================
// PAIRING CODE
// ===============================

async function requestPairingCode(number) {
  if (pairingRunning) {
    throw new Error("⏳ Pairing en cours");
  }

  pairingRunning = true;

  try {
    const phone = number.replace(/\D/g, "");

    if (phone.length < 10) {
      throw new Error("❌ Numéro invalide");
    }

    logger.info("📱 Pairing pour: +" + phone);

    if (!sock) {
      await startBot();
      
      let tentatives = 0;
      while ((!sock || !authState) && tentatives < 30) {
        await delay(2000);
        tentatives++;
      }

      if (!sock || !authState) {
        throw new Error("❌ Socket non initialisé");
      }
    }

    if (authState?.creds?.registered) {
      return {
        success: true,
        message: "Déjà connecté",
        alreadyConnected: true
      };
    }

    await delay(3000);
    const code = await sock.requestPairingCode(phone);
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

    logger.success("══════════════════════");
    logger.success("📲 CODE: " + formattedCode);
    logger.success("══════════════════════");
    logger.info("1. WhatsApp > Appareils connectés");
    logger.info("2. Lier un appareil");
    logger.info("3. Entrez: " + formattedCode);
    logger.info("⏰ Expire dans 2 min");

    return {
      success: true,
      code: code,
      formattedCode: formattedCode,
      phone: phone
    };

  } catch (error) {
    logger.error("❌ Erreur: " + error.message);
    throw error;
  } finally {
    pairingRunning = false;
  }
}

// ===============================
// RESTART
// ===============================

async function restart() {
  logger.info("🔄 Redémarrage...");
  try { sock?.end(); } catch (e) {}
  sock = null;
  reconnecting = false;
  reconnectAttempts = 0;
  await delay(3000);
  await startBot();
}

// ===============================
// DELETE SESSION
// ===============================

function deleteSession() {
  logger.warn("🗑️ Suppression session...");
  try {
    if (fs.existsSync(SESSION_DIR)) {
      fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(SESSION_DIR, { recursive: true });
    state.connected = false;
    sock = null;
    authState = null;
    logger.success("✅ Session supprimée");
  } catch (error) {
    logger.error("❌ Erreur: " + error.message);
  }
}

// ===============================
// STATUT
// ===============================

function getStatus() {
  const os = require("os");
  return {
    connected: state.connected,
    uptime: process.uptime(),
    platform: "termux",
    android: os.release(),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
    users: state.usersCount(),
    groups: state.groupsCount(),
    reconnects: reconnectAttempts + "/" + MAX_RECONNECT_ATTEMPTS,
    session: SESSION_DIR,
    nodeVersion: process.version,
    battery: "🔋 (sur secteur recommandé)"
  };
}

// ===============================
// ANTI-CRASH
// ===============================

process.on("uncaughtException", (err) => {
  logger.error("💥 Crash: " + err.message);
});

process.on("unhandledRejection", (reason) => {
  logger.error("⚠️ Erreur: " + reason);
});

// ===============================
// DÉMARRAGE
// ===============================

(async () => {
  showBanner();

  try {
    const app = createServer({
      state,
      commands,
      requestPairingCode,
      restart,
      deleteSession,
      getStatus
    });

    const PORT = process.env.PORT || 10000;

    // Routes
    app.get("/status", (req, res) => {
      res.json(getStatus());
    });

    app.get("/ping", (req, res) => {
      res.json({ alive: true, connected: state.connected });
    });

    // Interface simple pour Termux
    app.get("/", (req, res) => {
      res.send(`
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: monospace; 
              background: #1a1a2e; 
              color: #e94560; 
              padding: 20px;
              text-align: center;
            }
            .card {
              background: #16213e;
              padding: 20px;
              border-radius: 10px;
              margin: 10px 0;
            }
            .online { color: #00ff88; }
            .offline { color: #ff4444; }
          </style>
        </head>
        <body>
          <h1>🤖 AURA BOT</h1>
          <div class="card">
            <p>Statut: <span class="${state.connected ? 'online' : 'offline'}">
              ${state.connected ? '✅ EN LIGNE' : '❌ HORS LIGNE'}
            </span></p>
            <p>📱 WhatsApp</p>
          </div>
        </body>
        </html>
      `);
    });

    app.listen(PORT, "0.0.0.0", () => {
      logger.success("🌐 Interface: http://localhost:" + PORT);
      logger.info("📊 Status: http://localhost:" + PORT + "/status");
    });

    await startBot();

  } catch (error) {
    logger.error("💀 Erreur fatale: " + error.message);
  }
})();

// ===============================
// SURVEILLANCE
// ===============================

setInterval(() => {
  const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const uptime = Math.floor(process.uptime() / 60);

  logger.info(
    "💓 " + uptime + "min | RAM: " + mem + "MB | " +
    (state.connected ? "✅" : "❌")
  );

  if (!state.connected && !reconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    logger.warn("⚠️ Reconnexion auto...");
    startBot().catch(e => logger.error("❌ " + e.message));
  }
}, 5 * 60 * 1000);