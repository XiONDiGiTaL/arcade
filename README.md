# Arcade — XiØN Digital

The central hub for the browser games: a static, single-page game wall that opens each
title on its own site.

Live target: **https://xiondigital.net/Arcade/**

## What's inside

```
index.html           the whole page (games are plain markup — works without JS)
assets/css/style.css layout, cards, responsive rules
assets/js/arcade.js  synthesised hover/click sounds, genre filters, spotlight, clock
assets/img/*.jpg     16:9 screenshots of each game (1200 × 675)
```

No build step, no dependencies, no framework. Assets are referenced with relative paths,
so the site works at `/Arcade/`, at a custom domain root, or opened straight from disk.

## The wall

| Game | Genre | Link |
| --- | --- | --- |
| Meldra | falling-block puzzle, solo & co-op | `xiondigital.net/meldra/` |
| Voxel Rage: Janitscharen | voxel brawler, co-op | `xiondigital.net/voxelrage/` |
| Kanka Kombat: Nutella Nights | pixel beat 'em up, co-op | `xiondigital.net/kankakombat/` |
| Leap Buddies | voxel platformer, two-player co-op | `xiondigital.net/leapbuddies/` |
| Grease & Gold: World Tour | 16-bit beat 'em up, single player | `xiondigital.net/grease-and-gold-world-tour/` |

## Adding a game

1. Drop a 16:9 screenshot into `assets/img/` (1200 × 675 JPEG is the size the rest use).
2. Copy any `<a class="game">` block in `index.html` and edit:
   - `href` — the game's own URL
   - `data-tags` — any of `beat-em-up`, `puzzle`, `platformer`, `co-op` (space separated)
   - the `<img src>`, `alt`, tag chip, title, subtitle and meta line
3. Update the "Titles" counter in the hero if the number changes.

Filters read `data-tags`, so no JavaScript changes are needed. A new genre also needs a
button in the `.filters` group with the same `data-filter` value.

## Local preview

```bash
python -m http.server 4173
# then open http://localhost:4173/
```

## Deploying to GitHub Pages

1. Push this repository as **`Arcade`** under the `XiONDiGiTaL` account.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. Done — the project site is served at `https://xiondigital.net/Arcade/`.

Notes:

- Do **not** add a `CNAME` file here. The `xiondigital.net` domain belongs to the
  `xiondigital.github.io` user site; project sites inherit it automatically, and a CNAME in
  a project repo would conflict.
- GitHub Pages project URLs are case-sensitive: keep the repo name `Arcade` to match the
  intended `/Arcade/` path.

## Design notes

- Palette: near-black `#04060b`, cyan `#4de3ff`, violet `#8b6cff`; Sora + JetBrains Mono.
- Cards lift and glow on hover, the screenshot zooms slightly, and a pointer-tracked
  spotlight follows the cursor.
- Interface sounds are generated with the Web Audio API (no audio files); the SFX toggle
  remembers its state in `localStorage`.
- `prefers-reduced-motion` disables the aurora drift, reveal animations and transitions.
