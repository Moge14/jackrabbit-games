/**
 * games.js — Jackrabbit Games dynamic game loader
 *
 * HOW TO ADD A NEW GAME:
 * 1. Create a folder inside /games/  e.g.  games/my-cool-game/
 * 2. Add a README.md with the format described below
 * 3. (Optional) Add a thumbnail: games/my-cool-game/thumbnail.png or .jpg
 * 4. (Optional) Add download files:
 *      games/my-cool-game/game-windows.exe
 *      games/my-cool-game/game-mac.zip
 * 5. Push to GitHub — it will appear on the site automatically!
 *
 * README.md format:
 * ---
 * name: My Cool Game
 * description: A short one-line summary shown on the card.
 * tags: action, puzzle
 * version: 1.0
 * date: 2025-01-01
 * emoji: 🎯
 * play_url: https://moge14.github.io/gamehub-moge14/my-cool-game
 * windows_file: game-windows.exe
 * mac_file: game-mac.zip
 * ---
 *
 * Full description text goes below the --- block.
 * You can use multiple paragraphs here.
 */

// ── CONFIG ──────────────────────────────────────────────────────────────────
const REPO_OWNER = 'moge14';           // ← your GitHub username
const REPO_NAME  = 'jackrabbit-games'; // ← your repo name
const GAMES_DIR  = 'games';            // ← folder inside the repo
const BRANCH     = 'main';             // ← branch name (main or master)
const GAMEHUB_BASE = 'https://moge14.github.io/gamehub-moge14/';

// ── UPCOMING GAMES (edit manually) ──────────────────────────────────────────
// These are shown in the "Coming Soon" section.
// Remove this array or set it to [] to hide the section.
const UPCOMING_GAMES = [
  // {
  //   name: "Space Dash",
  //   description: "Navigate an asteroid field at blistering speed.",
  //   eta: "Q2 2025"
  // },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;

/**
 * Parse the frontmatter + body from a README.md string.
 * Frontmatter block is delimited by --- on its own line.
 */
function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/m);
  if (!match) {
    // No frontmatter — treat whole file as description
    return { meta: {}, body: text.trim() };
  }
  const meta = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    meta[key] = val;
  });
  return { meta, body: match[2].trim() };
}

/** Detect OS to auto-select download */
function detectOS() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac'))  return 'mac';
  if (ua.includes('win'))  return 'windows';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

/** Build download URL for a game file */
function buildDownloadUrl(gameSlug, filename) {
  return `${RAW_BASE}/${GAMES_DIR}/${gameSlug}/${filename}`;
}

/** Build thumbnail URL — tries png then jpg */
async function getThumbnailUrl(gameSlug) {
  // We'll return a candidate; actual checking done in img onerror
  return `${RAW_BASE}/${GAMES_DIR}/${gameSlug}/thumbnail.png`;
}

// ── FETCH GAME LIST ───────────────────────────────────────────────────────────
async function fetchGameList() {
  const resp = await fetch(`${API_BASE}/contents/${GAMES_DIR}?ref=${BRANCH}`, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  if (!resp.ok) throw new Error(`GitHub API error: ${resp.status}`);
  const items = await resp.json();
  // Only directories (type === 'dir') that aren't hidden
  return items.filter(i => i.type === 'dir' && !i.name.startsWith('.'));
}

// ── FETCH A SINGLE GAME'S README ─────────────────────────────────────────────
async function fetchGameReadme(gameSlug) {
  const url = `${RAW_BASE}/${GAMES_DIR}/${gameSlug}/README.md`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  return resp.text();
}

// ── BUILD GAME OBJECT ─────────────────────────────────────────────────────────
async function buildGameObject(dir) {
  const slug = dir.name;
  const readmeText = await fetchGameReadme(slug);
  const { meta, body } = readmeText ? parseFrontmatter(readmeText) : { meta: {}, body: '' };

  const os = detectOS();
  const winFile = meta.windows_file || null;
  const macFile = meta.mac_file     || null;

  // Auto-detect correct download for this OS
  let downloadFile = null;
  let downloadLabel = '⬇ Download';
  if (os === 'windows' && winFile) {
    downloadFile  = winFile;
    downloadLabel = '⬇ Download for Windows';
  } else if (os === 'mac' && macFile) {
    downloadFile  = macFile;
    downloadLabel = '⬇ Download for Mac';
  } else if (winFile) {
    downloadFile  = winFile;
    downloadLabel = '⬇ Download (.exe)';
  } else if (macFile) {
    downloadFile  = macFile;
    downloadLabel = '⬇ Download (.zip)';
  }

  const thumbUrl = `${RAW_BASE}/${GAMES_DIR}/${slug}/thumbnail.png`;

  return {
    slug,
    name:         meta.name        || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description:  meta.description || body.slice(0, 140) + (body.length > 140 ? '…' : ''),
    fullDesc:     body,
    tags:         meta.tags ? meta.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    version:      meta.version     || null,
    date:         meta.date        || null,
    emoji:        meta.emoji       || '🎮',
    playUrl:      meta.play_url    || (GAMEHUB_BASE + slug),
    downloadFile,
    downloadLabel,
    downloadUrl:  downloadFile ? buildDownloadUrl(slug, downloadFile) : null,
    winFile,
    macFile,
    thumbUrl,
  };
}

// ── RENDER GAME CARD ──────────────────────────────────────────────────────────
function renderGameCard(game, container) {
  const card = document.createElement('article');
  card.className = 'game-card reveal';
  card.setAttribute('data-slug', game.slug);

  const hasThumb = !!game.thumbUrl;

  card.innerHTML = `
    <div class="game-card-thumb">
      ${hasThumb
        ? `<img src="${game.thumbUrl}" alt="${game.name} thumbnail"
               onerror="this.parentElement.innerHTML='<span class=\\'thumb-emoji\\'>${game.emoji}</span>'">`
        : `<span class="thumb-emoji">${game.emoji}</span>`}
    </div>
    <div class="game-card-body">
      <div class="game-card-name">${game.name}</div>
      <p class="game-card-desc">${game.description}</p>
      ${game.tags.length
        ? `<div class="game-card-tags">${game.tags.map(t => `<span class="game-tag">${t}</span>`).join('')}</div>`
        : ''}
      <div class="game-card-actions">
        <a href="${game.playUrl}" target="_blank" class="btn-play" onclick="event.stopPropagation()">▶ Play Online</a>
        ${game.downloadUrl
          ? `<a href="${game.downloadUrl}" class="btn-dl" download onclick="event.stopPropagation()">${game.downloadLabel}</a>`
          : ''}
      </div>
    </div>
  `;

  card.addEventListener('click', () => openGameModal(game));
  container.appendChild(card);

  // Trigger reveal
  requestAnimationFrame(() => {
    setTimeout(() => card.classList.add('visible'), 40);
  });
}

// ── GAME MODAL ────────────────────────────────────────────────────────────────
function openGameModal(game) {
  const modal   = document.getElementById('game-modal');
  const content = document.getElementById('modal-content');

  const os = detectOS();
  let downloadButtons = '';
  if (game.winFile && game.macFile) {
    // Offer both
    downloadButtons = `
      <a href="${buildDownloadUrl(game.slug, game.winFile)}" class="btn-dl" download>⬇ Windows (.exe)</a>
      <a href="${buildDownloadUrl(game.slug, game.macFile)}" class="btn-dl" download>⬇ Mac (.zip)</a>
    `;
  } else if (game.downloadUrl) {
    downloadButtons = `<a href="${game.downloadUrl}" class="btn-dl" download>${game.downloadLabel}</a>`;
  }

  content.innerHTML = `
    <div class="modal-game-thumb">
      ${game.thumbUrl
        ? `<img src="${game.thumbUrl}" alt="${game.name}"
               onerror="this.parentElement.innerHTML='${game.emoji}'">`
        : game.emoji}
    </div>
    <div class="modal-game-name">${game.name}</div>
    <div class="modal-game-meta">
      ${game.version ? `v${game.version}` : ''}
      ${game.date ? ` · ${new Date(game.date).toLocaleDateString('en-GB', {year:'numeric',month:'long'})}` : ''}
    </div>
    ${game.tags.length
      ? `<div class="modal-game-tags">${game.tags.map(t => `<span class="game-tag">${t}</span>`).join('')}</div>`
      : ''}
    <div class="modal-game-desc">${game.fullDesc || game.description}</div>
    <div class="modal-actions">
      <a href="${game.playUrl}" target="_blank" class="btn-play">▶ Play Online</a>
      ${downloadButtons}
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeGameModal() {
  document.getElementById('game-modal').style.display = 'none';
  document.body.style.overflow = '';
}

// ── UPCOMING SECTION ──────────────────────────────────────────────────────────
function renderUpcoming() {
  const grid  = document.getElementById('upcoming-grid');
  const empty = document.getElementById('upcoming-empty');

  if (!UPCOMING_GAMES || UPCOMING_GAMES.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  UPCOMING_GAMES.forEach(game => {
    const card = document.createElement('div');
    card.className = 'upcoming-card reveal';
    card.innerHTML = `
      ${game.eta ? `<span class="upcoming-badge">Coming ${game.eta}</span>` : '<span class="upcoming-badge">Coming Soon</span>'}
      <h3>${game.name}</h3>
      ${game.description ? `<p>${game.description}</p>` : ''}
    `;
    grid.appendChild(card);
  });
}

// ── MAIN INIT ─────────────────────────────────────────────────────────────────
async function initGames() {
  const grid = document.getElementById('games-grid');

  try {
    const dirs  = await fetchGameList();
    grid.innerHTML = ''; // clear loading spinner

    if (dirs.length === 0) {
      grid.innerHTML = `<div class="games-error"><p>No games found yet. Check back soon!</p></div>`;
      document.getElementById('stat-games').textContent = '0';
      return;
    }

    // Load all games in parallel
    const games = await Promise.all(dirs.map(d => buildGameObject(d)));

    games.forEach(game => renderGameCard(game, grid));

    // Update stat counter
    document.getElementById('stat-games').textContent = games.length;

  } catch (err) {
    console.error('Failed to load games:', err);
    // Fallback: show manual games array if defined
    if (typeof MANUAL_GAMES !== 'undefined' && MANUAL_GAMES.length > 0) {
      grid.innerHTML = '';
      MANUAL_GAMES.forEach(game => renderGameCard(game, grid));
      document.getElementById('stat-games').textContent = MANUAL_GAMES.length;
    } else {
      grid.innerHTML = `
        <div class="games-error">
          <p>Couldn't load games automatically.</p>
          <p style="font-size:13px;margin-top:8px;color:var(--text3)">
            If you're testing locally, games will load when deployed to GitHub Pages.
          </p>
        </div>`;
    }
  }
}

// Export for main.js
window.JR = { initGames, renderUpcoming, closeGameModal };
