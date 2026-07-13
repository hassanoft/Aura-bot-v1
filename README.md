# 🤖 AURA BOT

Bot WhatsApp professionnel construit avec **Node.js** et **@whiskeysockets/baileys**, avec connexion par **Pairing Code**, interface web moderne, architecture modulaire et plus de 85 commandes réparties en 9 catégories.

---

## ✨ Fonctionnalités

- Connexion WhatsApp par **Pairing Code** (pas de QR code)
- Sauvegarde et reconnexion automatique de session
- Architecture modulaire : chaque commande et chaque évènement dans son propre fichier
- Chargement automatique des commandes et des évènements
- Logger professionnel (console + fichiers + API `/logs`)
- Anti-spam, anti-flood, anti-crash, cooldown par commande
- Système de permissions : propriétaire / admin de groupe / Premium
- Base de données JSON simple, facilement remplaçable par une vraie base
- Interface web (dashboard) en thème sombre, responsive, avec animations
- API Express complète (7 routes JSON)
- Prêt pour un déploiement **Render** et **GitHub Pages**

---

## 📁 Structure du projet

```
AURA-BOT/
├── index.js              # Point d'entrée : connexion WhatsApp + démarrage serveur
├── server.js              # API Express (routes /pair, /status, /health, ...)
├── config.js               # Configuration centrale
├── package.json
├── render.yaml              # Déploiement Render
├── .env.example
├── auth/                    # Réservé pour extensions d'authentification
├── commands/                # Une commande = un fichier
│   ├── info/  fun/  tools/  group/  admin/  premium/  referral/  ads/  economy/
├── events/                  # Un évènement Baileys = un fichier
│   ├── messages.js
│   └── connection.js
├── database/                 # Base JSON (users, groups, premium, economy, stats)
├── logs/                      # Logs quotidiens
├── sessions/                  # Session WhatsApp (Baileys multi-file auth state)
├── utils/                     # logger, permissions, cooldown, antiflood, loaders, menu
├── web/                        # Interface web (HTML / CSS / JS vanilla)
└── .github/workflows/          # Déploiement automatique de web/ sur GitHub Pages
```

---

## 🚀 Installation

### Prérequis
- Node.js 18 ou supérieur
- npm

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/hassanoft/AURA-BOT.git
cd AURA-BOT

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# puis modifier .env avec ton numéro propriétaire, etc.

# 4. Démarrer le bot
npm start
```

Le serveur démarre sur `http://localhost:3000` (ou le port défini dans `.env`).

### Connexion WhatsApp

1. Ouvre `http://localhost:3000` dans un navigateur.
2. Entre ton numéro WhatsApp (avec indicatif, sans `+` ni espaces).
3. Clique sur **Générer**.
4. Sur ton téléphone : **WhatsApp → Paramètres → Appareils liés → Lier un appareil → Associer avec un numéro de téléphone**.
5. Saisis le code affiché sur le dashboard.

La session est ensuite sauvegardée dans `sessions/` et la reconnexion est automatique au redémarrage.

---

## 🔌 API Express

| Méthode | Route              | Description                                  |
|---------|---------------------|-----------------------------------------------|
| POST    | `/pair`             | Démarre l'appairage, retourne le pairing code |
| GET     | `/status`           | État de connexion, statistiques générales      |
| GET     | `/health`           | Endpoint de surveillance (uptime monitors)     |
| GET     | `/session`          | Vérifie si une session existe                  |
| DELETE  | `/session`          | Supprime la session courante                   |
| GET     | `/logs`             | Retourne les derniers logs                     |
| POST    | `/restart`          | Redémarre la connexion WhatsApp                |

Toutes les routes retournent du JSON.

---

## 📚 Commandes disponibles

Tape `/menu` ou `/help` dans le bot pour voir le menu complet, généré automatiquement à partir des commandes chargées. Catégories :

- **ℹ️ Informations** — `/menu`, `/ping`, `/info`, `/runtime`, `/owner`, `/about`, `/status`...
- **🎉 Fun** — `/blague`, `/devinette`, `/quiz`, `/8ball`, `/dice`, `/compliment`...
- **🛠️ Outils** — `/calc`, `/qr`, `/base64`, `/password`, `/uuid`, `/shorturl`...
- **👥 Groupes** — `/tagall`, `/promote`, `/kick`, `/antilink`, `/warn`...
- **👑 Premium** — `/premium`, `/buy`, `/pricing`, `/redeem`...
- **💰 Économie** — `/balance`, `/daily`, `/work`, `/pay`, `/leaderboard`...
- **🤝 Affiliation** — `/refer`, `/invite`, `/refstats`...
- **📢 Publicité** — `/broadcast`, `/ads`, `/sendpromo`
- **⚙️ Administration** — `/restart`, `/backup`, `/stats`, `/ban`... (propriétaire uniquement)

### Ajouter une nouvelle commande

Crée un fichier dans le sous-dossier de la catégorie concernée :

```js
// commands/fun/exemple.js
module.exports = {
  name: 'exemple',
  category: 'fun',
  description: 'Description courte de la commande.',
  usage: '/exemple',
  // ownerOnly / adminOnly / premiumOnly: true (optionnel)
  async execute({ sock, remoteJid, args, senderJid }) {
    await sock.sendMessage(remoteJid, { text: 'Réponse de la commande.' });
  },
};
```

Le fichier est chargé automatiquement au démarrage, aucune modification ailleurs n'est nécessaire.

---

## ☁️ Déploiement

### Render (exécution du bot)

1. Pousse le projet sur GitHub.
2. Sur Render : **New → Web Service**, connecte le dépôt.
3. Render détecte `render.yaml` automatiquement (build : `npm install`, start : `npm start`).
4. Renseigne les variables d'environnement (`OWNER_NUMBER`, `OWNER_NAME`, etc.) dans le dashboard Render.
5. Le endpoint `/health` est utilisé par Render pour la surveillance automatique.
6. Un disque persistant est monté sur `sessions/` pour conserver la connexion WhatsApp entre les redémarrages.

### GitHub Pages (interface web uniquement)

Le workflow `.github/workflows/deploy-pages.yml` déploie automatiquement le contenu de `web/` sur GitHub Pages à chaque push sur `main` touchant ce dossier. Ce site sert uniquement d'interface de démonstration : le bot réel tourne sur Render.

> ⚠️ GitHub Actions n'est **pas** utilisé pour maintenir le bot connecté en permanence — seul Render fait tourner le processus Node.js en continu.

---

## 🔒 Bonnes pratiques respectées

- Aucune donnée sensible en dur dans le code (tout passe par `.env`)
- Anti-crash global (`uncaughtException` / `unhandledRejection`)
- Respect des conditions d'utilisation WhatsApp : pas de spam automatisé de masse, permissions vérifiées avant chaque action sensible
- Code entièrement modulaire, sans duplication, un fichier = une responsabilité

---

## 👤 Auteur

Développé par **Hassan** ([@hassanoft](https://github.com/hassanoft)) — projets sous la marque **AURA**.
