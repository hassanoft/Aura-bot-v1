const API = ''; // même origine que le serveur Express

const els = {
  connDot: document.getElementById('connDot'),
  connLabel: document.getElementById('connLabel'),
  phoneInput: document.getElementById('phoneInput'),
  pairBtn: document.getElementById('pairBtn'),
  codeText: document.getElementById('codeText'),
  auraRing: document.getElementById('auraRing'),
  reconnectBtn: document.getElementById('reconnectBtn'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  downloadSessionBtn: document.getElementById('downloadSessionBtn'),
  deleteSessionBtn: document.getElementById('deleteSessionBtn'),
  restartBtn: document.getElementById('restartBtn'),
  usersCount: document.getElementById('usersCount'),
  groupsCount: document.getElementById('groupsCount'),
  uptimeVal: document.getElementById('uptimeVal'),
  consoleLog: document.getElementById('consoleLog'),
  historyList: document.getElementById('historyList'),
};

function addHistory(text) {
  if (els.historyList.querySelector('.muted')) els.historyList.innerHTML = '';
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString('fr-FR')} — ${text}`;
  els.historyList.prepend(li);
}

function formatUptime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

async function fetchStatus() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    if (!data.success) return;

    const online = data.connected;
    els.connDot.className = `dot ${online ? 'online' : 'offline'}`;
    els.connLabel.textContent = online ? 'Connecté' : 'Déconnecté';
    els.usersCount.textContent = data.usersCount ?? 0;
    els.groupsCount.textContent = data.groupsCount ?? 0;
    els.uptimeVal.textContent = formatUptime(data.uptime || 0);
  } catch {
    els.connLabel.textContent = 'Serveur injoignable';
    els.connDot.className = 'dot offline';
  }
}

async function fetchLogs() {
  try {
    const res = await fetch(`${API}/logs?limit=30`);
    const data = await res.json();
    if (!data.success) return;

    els.consoleLog.innerHTML = data.logs.length
      ? data.logs.map((l) => `<p class="console-line ${l.level}">[${l.level.toUpperCase()}] ${l.message}</p>`).join('')
      : '<p class="console-line muted">En attente d\'évènements...</p>';
    els.consoleLog.scrollTop = els.consoleLog.scrollHeight;
  } catch {
    // silencieux : le dashboard continue de fonctionner sans les logs
  }
}

els.pairBtn.addEventListener('click', async () => {
  const number = els.phoneInput.value.trim();
  if (!number) return addHistory('Numéro requis pour générer un code.');

  els.pairBtn.disabled = true;
  els.pairBtn.textContent = 'Génération...';

  try {
    const res = await fetch(`${API}/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number }),
    });
    const data = await res.json();

    if (data.success) {
      els.codeText.textContent = data.code;
      els.auraRing.classList.add('active');
      addHistory(`Pairing code généré pour ${number}`);
    } else {
      addHistory(`Échec : ${data.error}`);
    }
  } catch {
    addHistory('Erreur réseau lors de la demande de code.');
  } finally {
    els.pairBtn.disabled = false;
    els.pairBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h7l-1 8 11-14h-7l0-6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg> Générer';
  }
});

els.reconnectBtn.addEventListener('click', async () => {
  addHistory('Reconnexion demandée...');
  await fetch(`${API}/restart`, { method: 'POST' });
});

els.restartBtn.addEventListener('click', async () => {
  addHistory('Redémarrage demandé...');
  await fetch(`${API}/restart`, { method: 'POST' });
});

els.disconnectBtn.addEventListener('click', async () => {
  if (!confirm('Supprimer la session et se déconnecter ?')) return;
  await fetch(`${API}/session`, { method: 'DELETE' });
  addHistory('Session supprimée. Déconnexion effectuée.');
  els.codeText.textContent = '— — — — — —';
  els.auraRing.classList.remove('active');
});

els.deleteSessionBtn.addEventListener('click', async () => {
  if (!confirm('Confirmer la suppression définitive de la session ?')) return;
  await fetch(`${API}/session`, { method: 'DELETE' });
  addHistory('Session supprimée manuellement.');
});

els.downloadSessionBtn.addEventListener('click', async () => {
  const res = await fetch(`${API}/session/download`);
  const data = await res.json();
  if (data.success) {
    addHistory(`Session disponible : ${data.files.length} fichier(s).`);
  } else {
    addHistory('Aucune session à télécharger.');
  }
});

// Rafraîchissement périodique
fetchStatus();
fetchLogs();
setInterval(fetchStatus, 5000);
setInterval(fetchLogs, 4000);
