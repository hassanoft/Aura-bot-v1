const config = require('../config');

const CATEGORY_LABELS = {
  info: 'ℹ️ INFORMATIONS',
  fun: '🎉 FUN',
  tools: '🛠️ OUTILS',
  group: '👥 GROUPES',
  premium: '👑 PREMIUM',
  economy: '💰 ÉCONOMIE',
  referral: '🤝 AFFILIATION',
  ads: '📢 PUBLICITÉ',
  admin: '⚙️ ADMINISTRATION',
};

// Ordre d'affichage souhaité dans le menu
const CATEGORY_ORDER = ['info', 'fun', 'tools', 'group', 'premium', 'economy', 'referral', 'ads', 'admin'];

const SEPARATOR = '━━━━━━━━━━━━━━━━━━━━━━';

/**
 * Construit dynamiquement le texte du menu /help
 * à partir de la Map de commandes chargées.
 */
function buildHelpMenu(commands, senderName = '') {
  const byCategory = new Map();

  // On ne garde qu'une occurrence par commande (pas les alias en doublon)
  const seen = new Set();
  for (const cmd of commands.values()) {
    if (seen.has(cmd.name)) continue;
    seen.add(cmd.name);
    const list = byCategory.get(cmd.category) || [];
    list.push(cmd);
    byCategory.set(cmd.category, list);
  }

  let menu = '';
  menu += `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`;
  menu += `┃           🚀 A U R A         ┃\n`;
  menu += `┃      WhatsApp Assistant      ┃\n`;
  menu += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
  menu += `👋 Bienvenue ${senderName ? '@' + senderName : ''}\n\n`;
  menu += `📦 Version : ${config.bot.version}\n`;
  menu += `⚡ Préfixe : ${config.bot.prefix}\n`;
  menu += `🟢 Statut : En ligne\n\n`;
  menu += `${SEPARATOR}\n📚 COMMANDES DISPONIBLES\n${SEPARATOR}\n\n`;

  for (const category of CATEGORY_ORDER) {
    const list = byCategory.get(category);
    if (!list || list.length === 0) continue;

    menu += `${CATEGORY_LABELS[category] || category.toUpperCase()}\n`;
    menu += list.map((c) => `${config.bot.prefix}${c.name}`).join(' • ');
    menu += `\n\n${SEPARATOR}\n\n`;
  }

  menu += `🤖 ${config.bot.name}\nDéveloppé par ${config.bot.owner.name}\nVersion ${config.bot.version}\n${SEPARATOR}`;

  return menu;
}

/**
 * Construit une version "liste interactive" WhatsApp (List Message)
 * utilisable quand le client WhatsApp le supporte.
 */
function buildInteractiveMenu(commands) {
  const byCategory = new Map();
  const seen = new Set();
  for (const cmd of commands.values()) {
    if (seen.has(cmd.name)) continue;
    seen.add(cmd.name);
    const list = byCategory.get(cmd.category) || [];
    list.push(cmd);
    byCategory.set(cmd.category, list);
  }

  const sections = CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => ({
    title: CATEGORY_LABELS[category] || category.toUpperCase(),
    rows: byCategory.get(category).map((c) => ({
      title: `${config.bot.prefix}${c.name}`,
      description: c.description || '',
      rowId: `${config.bot.prefix}${c.name}`,
    })),
  }));

  return {
    text: `🚀 *${config.bot.name}* — Menu interactif`,
    footer: `Développé par ${config.bot.owner.name}`,
    title: 'Menu des commandes',
    buttonText: 'Voir les commandes',
    sections,
  };
}

module.exports = { buildHelpMenu, buildInteractiveMenu, CATEGORY_LABELS, CATEGORY_ORDER };
