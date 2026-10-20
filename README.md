# Aport

Phone app (PWA, Polish UI) for obedience and trick training of a border collie, shared by two people.

- `docs/` — the website (vanilla JS modules, no build). Data lives on the phone (IndexedDB) and optionally syncs
  through one shared Supabase table (`supabase/schema.sql`, `docs/js/config.js`).
- `docs/js/exercises.js` — built-in exercise library (stages with pass criteria).
- `docs/js/logic.js` — daily plan, "ready for next stage" rule, streaks, badges (tested by `node scripts/test.mjs`).
- Preview: `node scripts/serve.cjs` → http://localhost:5220
- Before every release: `node scripts/release.cjs` (bumps the version so phones offer the update).
