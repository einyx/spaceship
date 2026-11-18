# Spaceship IDE, forked for Prysm

This is our fork of [chuanqisun/spaceship](https://github.com/chuanqisun/spaceship) (MIT). Everything here
is theirs except the changes below, which wire the cockpit to Prysm instead of to two vendor APIs.

- **Fork:** https://github.com/einyx/spaceship
- **Our branch:** `prysm` (the fork's default branch)
- **Upstream:** `upstream` → https://github.com/chuanqisun/spaceship

The product builds this from the fork: `scripts/build-spaceship.sh` checks it out at `vendor/spaceship` and
clones it from the fork when it is not there, so the product carries no vendored copy of it.

## What we changed

- **`src/llm/prysm.ts`** (new): the host seam. The page that hosts the IDE sets
  `window.__PRYSM_SPACE__` with two methods: `answer()` — the words of the next answer, as they
  arrive — and `setSteering(...)` — told what the user steered, so the host can send it with the
  next message. The IDE's text comes from that seam instead of from Cerebras.
- **`src/text/main.ts`**: when the host is present, the text source is the seam above and the
  simulator/live switches are out of the way; every steering change is published to the host.
- **`src/text/pointer.ts`**: the custom-cursor flag goes on the cockpit container (`#sp-shell`)
  rather than on `document.documentElement`, so it cannot leak to the rest of the dashboard.
- **`src/text/prysm-relevance.ts`** (new): the relevance the IDE shows for the host's answers.
- **ids**: every id the app queries is namespaced `sp-*` (`#text` → `#sp-text` and so on), so a
  cockpit can live inside a page that has its own `#text` and friends.
- **`vite.config.ts`**, **`index.html`**: the build emits an es module (`MODE=lib`) with the ids and
  the rules scoped, so the cockpit sits inside a light dashboard without painting the whole page black.

## What stayed upstream

The renderer, the knobs, the drag, the fan menu, the sounds, the story prompts
(`src/llm/cerebras.ts`, `src/llm/decisions.ts`, `src/text/live-*.ts`) — untouched, so the upstream
app still builds and runs on its own (`MODE=page npm run build`).

## Working on it

```bash
cd vendor/spaceship
git checkout prysm
# ... work, then:
npm run format
git commit -am "…" && git push origin prysm
```

To take an upstream change:

```bash
cd vendor/spaceship
git fetch upstream
git rebase upstream/master prysm     # or: git merge upstream/master
npm run format
git push --force-with-lease origin prysm
```

## Build

`scripts/build-spaceship.sh` (in the product) compiles the source as an es module
(`MODE=lib vite build`) and writes, into `state/spaceship` (or `SPACESHIP_DIR`):

- `space.js` — the module; the dashboard loads it with `<script type="module">`
- `space.css` — the app's styles, every rule scoped to `#view-chat` and every id renamed `sp-*`
- `assets/` — the hashed fonts and images

If you cite the upstream work, this is its preferred form:

```bibtex
@misc{sun2026spaceship,
  author       = {Sun, Chuanqi},
  title        = {Spaceship {IDE}: Steer Your Ideas in Realtime, Space Pilot Style},
  year         = 2026,
  publisher    = {GitHub},
  howpublished = {\url{https://github.com/chuanqisun/spaceship}},
}
```
