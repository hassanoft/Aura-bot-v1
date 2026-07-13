const config = require('../config');
const logger = require('../utils/logger');
const cooldown = require('../utils/cooldown');
const antiflood = require('../utils/antiflood');
const permissions = require('../utils/permissions');
const db = require('../database/db');

function extractText(message) {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    ''
  );
}

module.exports = {
  name: 'messages.upsert',
  async handler(sock, { messages, type }, context) {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const senderJid = msg.key.participant || msg.key.remoteJid;
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const text = extractText(msg.message).trim();

    if (!text.startsWith(config.bot.prefix)) return;

    // Anti-flood : trop de messages rapprochés
    if (antiflood.isFlooding(senderJid)) {
      logger.warn(`Anti-flood déclenché pour ${senderJid}`);
      return;
    }

    const args = text.slice(config.bot.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = context.commands.get(commandName);
    if (!command) return;

    // Cooldown
    if (cooldown.isOnCooldown(commandName, senderJid)) {
      const remaining = cooldown.getRemaining(commandName, senderJid);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⏳ Patiente encore ${remaining}s avant de réutiliser cette commande.`,
      });
      return;
    }

    // Permissions
    if (command.ownerOnly && !permissions.isOwner(senderJid)) {
      await sock.sendMessage(msg.key.remoteJid, { text: '🚫 Commande réservée au propriétaire du bot.' });
      return;
    }
    if (command.premiumOnly && !permissions.isPremium(senderJid)) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '👑 Commande réservée aux membres Premium. Utilise /premium pour en savoir plus.',
      });
      return;
    }
    if (command.adminOnly && isGroup) {
      const isAdmin = await permissions.isGroupAdmin(sock, msg.key.remoteJid, senderJid);
      if (!isAdmin) {
        await sock.sendMessage(msg.key.remoteJid, { text: '🚫 Commande réservée aux administrateurs du groupe.' });
        return;
      }
    }

    cooldown.trigger(commandName, senderJid);

    // Statistiques d'usage
    const stats = db.stats.get('commandUsage', {});
    stats[commandName] = (stats[commandName] || 0) + 1;
    db.stats.set('commandUsage', stats);

    try {
      await command.execute({
        sock,
        msg,
        args,
        text,
        senderJid,
        isGroup,
        remoteJid: msg.key.remoteJid,
        commands: context.commands,
      });
      logger.info(`Commande exécutée : ${commandName} par ${senderJid}`);
    } catch (err) {
      logger.error(`Erreur commande ${commandName}: ${err.message}`);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Une erreur est survenue lors de l'exécution de /${commandName}.` });
    }
  },
};
