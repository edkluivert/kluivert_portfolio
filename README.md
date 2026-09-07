# kluivert.dev portfolio

Plain static site — no framework, no build step.

- `index.html` — all content. Add an app by copying one `<article class="app">` block in the **Shipped** section (and, if you want it on the hero shelf, one `<a>` in `.shelf`).
- `styles.css` — design tokens at the top (`:root`), light and dark themes.
- `main.js` — theme toggle, shelf animation, and a one-time cleanup of the old Flutter service worker.
- `assets/apps/` — launcher icons (192px). `assets/shots/` — screenshots (~900px tall).

Deploy: push to `main`; GitHub Pages serves the repo root.
