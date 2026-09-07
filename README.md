# kluivert.dev portfolio

Plain static site — no framework, no build step.

- `index.html` — all content. Add an app by copying one `<article class="app">` block in the **Shipped** section (and, if you want it on the hero shelf, one `<a>` in `.shelf`).
- `styles.css` — design tokens at the top (`:root`), light and dark themes.
- `main.js` — theme toggle, shelf animation, and a one-time cleanup of the old Flutter service worker.
- `assets/apps/` — launcher icons (192px). `assets/shots/` — screenshots (~900px tall).
- `resume.html` — print-first résumé (A4, two pages). Edit it, then regenerate the PDF the hero links to:

  ```sh
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
    --no-pdf-header-footer --virtual-time-budget=12000 \
    --print-to-pdf=assets/Kluivert-Edegware-Resume.pdf "file://$PWD/resume.html"
  ```

Deploy: push to `main`; GitHub Pages serves the repo root.
