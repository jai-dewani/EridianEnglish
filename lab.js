// ── Lab: Prompt Comparison Logic ──

const API_URL = 'https://eridian-api-evdmezajgbd5f8fj.eastus-01.azurewebsites.net/api/compare';
const VERSIONS = ['v1', 'v2', 'v3', 'v4'];

// ── Vote persistence ──
function getVotes() {
  try {
    return JSON.parse(localStorage.getItem('rocky-lab-votes') || '{}');
  } catch { return {}; }
}

function saveVotes(votes) {
  localStorage.setItem('rocky-lab-votes', JSON.stringify(votes));
}

function refreshVoteCounts() {
  const votes = getVotes();
  VERSIONS.forEach(id => {
    const count = votes[id] || 0;
    const countEl = document.getElementById('count-' + id);
    const tallyEl = document.getElementById('tally-' + id);
    if (countEl) countEl.textContent = count;
    if (tallyEl) tallyEl.textContent = count + ' vote' + (count === 1 ? '' : 's');
  });
}

function vote(id) {
  const votes = getVotes();
  votes[id] = (votes[id] || 0) + 1;
  saveVotes(votes);
  refreshVoteCounts();

  // Visual feedback
  const btn = document.getElementById('vote-' + id);
  btn.classList.add('voted');
  setTimeout(() => btn.classList.remove('voted'), 800);

  // Highlight winner
  highlightWinner();
}

function highlightWinner() {
  const votes = getVotes();
  let maxId = null;
  let maxCount = 0;
  VERSIONS.forEach(id => {
    const c = votes[id] || 0;
    if (c > maxCount) { maxCount = c; maxId = id; }
  });
  VERSIONS.forEach(id => {
    document.getElementById('cell-' + id).classList.toggle('winner', id === maxId && maxCount > 0);
  });
}

// ── Compare all prompts ──
async function compareAll() {
  const text = document.getElementById('lab-input').value.trim();
  if (!text) return;

  const speaker = document.getElementById('lab-speaker').value.trim() || 'Rocky';
  const listener = document.getElementById('lab-listener').value.trim() || 'Grace';
  const btn = document.getElementById('compare-btn');

  // Show loading skeletons
  VERSIONS.forEach(id => {
    const el = document.getElementById('output-' + id);
    el.className = 'compare-output placeholder';
    el.innerHTML = '<div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div>';
  });

  btn.disabled = true;
  btn.textContent = 'Comparing';
  btn.classList.add('loading-dots');

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speaker, listener }),
    });

    if (!res.ok) throw new Error('API error ' + res.status);

    const data = await res.json();

    VERSIONS.forEach(id => {
      const el = document.getElementById('output-' + id);
      if (data.results && data.results[id]) {
        el.className = 'compare-output';
        el.textContent = data.results[id];
      } else {
        el.className = 'compare-output placeholder';
        el.textContent = 'No result';
      }
    });
  } catch (err) {
    console.error('Compare failed:', err);
    VERSIONS.forEach(id => {
      const el = document.getElementById('output-' + id);
      el.className = 'compare-output placeholder';
      el.textContent = 'Error: ' + err.message;
    });
  } finally {
    btn.disabled = false;
    btn.textContent = 'Compare All \u2192';
    btn.classList.remove('loading-dots');
  }
}

// ── Test suite ──
function runTest(btnEl) {
  document.getElementById('lab-input').value = btnEl.textContent;
  compareAll();
}

function labClear() {
  document.getElementById('lab-input').value = '';
  VERSIONS.forEach(id => {
    const el = document.getElementById('output-' + id);
    el.className = 'compare-output placeholder';
    el.textContent = 'Waiting for input\u2026';
  });
}

// ── Keyboard shortcut ──
document.getElementById('lab-input').addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') compareAll();
});

// ── Init ──
refreshVoteCounts();
highlightWinner();
