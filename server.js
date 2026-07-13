const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const logger = require('./utils/logger');

/**
 * Crée l'application Express.
 * `botContext` est un objet partagé fourni par index.js contenant :
 *   { state, requestPairingCode, restart, disconnect, deleteSession, commands }
 */
function createServer(botContext) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'web')));

  // POST /pair : démarre l'appairage et retourne le pairing code
  app.post('/pair', async (req, res) => {
    try {
      const { number } = req.body;
      if (!number) return res.status(400).json({ success: false, error: 'Numéro WhatsApp requis.' });

      const code = await botContext.requestPairingCode(number);
      res.json({ success: true, code });
    } catch (err) {
      logger.error(`Erreur /pair: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /status : état de connexion + statistiques générales
  app.get('/status', (req, res) => {
    const { state } = botContext;
    res.json({
      success: true,
      connected: state.connected,
      lastConnectedAt: state.lastConnectedAt,
      uptime: process.uptime(),
      version: config.bot.version,
      usersCount: state.usersCount(),
      groupsCount: state.groupsCount(),
    });
  });

  // GET /health : endpoint de surveillance (Render / uptime monitors)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // GET /session : indique si une session existe et fournit un lien de téléchargement
  app.get('/session', (req, res) => {
    const sessionDir = path.resolve(config.paths.session);
    const exists = fs.existsSync(sessionDir) && fs.readdirSync(sessionDir).length > 0;
    res.json({ success: true, exists });
  });

  // DELETE /session : supprime la session en cours (force une nouvelle connexion)
  app.delete('/session', (req, res) => {
    try {
      botContext.deleteSession();
      res.json({ success: true, message: 'Session supprimée.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /logs : les N derniers logs en mémoire
  app.get('/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    res.json({ success: true, logs: logger.getRecent(limit) });
  });

  // POST /restart : redémarre la connexion WhatsApp (pas le process entier)
  app.post('/restart', async (req, res) => {
    try {
      await botContext.restart();
      res.json({ success: true, message: 'Redémarrage lancé.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /session/download : télécharge l'archive de session (utilisé par le bouton web)
  app.get('/session/download', (req, res) => {
    const sessionDir = path.resolve(config.paths.session);
    if (!fs.existsSync(sessionDir)) return res.status(404).json({ success: false, error: 'Aucune session.' });
    res.json({ success: true, files: fs.readdirSync(sessionDir) });
  });

  return app;
}

module.exports = { createServer };
