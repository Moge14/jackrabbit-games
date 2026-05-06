# 🐇 Jackrabbit Games — Site Repository

This is the source for the [Jackrabbit Games](https://moge14.github.io/jackrabbit-games/) website, hosted on GitHub Pages.

## Folder Structure

```
jackrabbit-games/
├── index.html          ← main site
├── css/
│   └── style.css       ← all styles
├── js/
│   ├── games.js        ← dynamic game loader (GitHub API)
│   └── main.js         ← nav, form, modal, scroll behaviour
├── assets/
│   └── favicon.svg     ← site icon
└── games/              ← one sub-folder per game
    └── my-cool-game/
        ├── README.md           ← game metadata + description (required)
        ├── thumbnail.png       ← 16:9 card image (optional)
        ├── game-windows.exe    ← Windows download (optional)
        └── game-mac.zip        ← Mac download (optional)
```

## Adding a New Game

1. Create a folder inside `games/` — use hyphens, no spaces.  
   Example: `games/space-dash/`

2. Add a `README.md` with the following frontmatter block:

```markdown
---
name: Space Dash
description: Navigate an asteroid field at blistering speed.
tags: action, arcade
version: 1.0
date: 2025-06-01
emoji: 🚀
play_url: https://moge14.github.io/gamehub-moge14/space-dash
windows_file: game-windows.exe
mac_file: game-mac.zip
---

Full description text goes here. Can be multiple paragraphs.
```

3. (Optional) Drop in `thumbnail.png` (16:9 recommended) — falls back to the emoji if missing.

4. (Optional) Add your download files with the exact filenames you put in `windows_file` / `mac_file`.

5. **Commit & push to `main`** — the site refreshes automatically via the GitHub Contents API.

## Upcoming Games

Edit the `UPCOMING_GAMES` array near the top of `js/games.js`:

```js
const UPCOMING_GAMES = [
  {
    name: "Space Dash",
    description: "Navigate an asteroid field at blistering speed.",
    eta: "Q3 2025"
  },
];
```

## Support Email

Contact form messages go to **JooMoose3@gmail.com** (set in `js/main.js` → `SUPPORT_EMAIL`).

## GitHub Pages Setup

- Go to **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: `main`, folder: `/ (root)`
- Save — your site will be live at `https://<username>.github.io/<repo-name>/`
