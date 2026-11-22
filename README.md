# kluivert.dev portfolio

Plain static site, no framework. A boot screen, then an interactive phone (iOS or Android) whose
app icons open into store-style pages with real screenshots, plus terminal-styled sections and a ⌘K palette.

- `data.js`: all content (apps, side projects, packages, jobs, screenshot counts). Add an app here and it
  appears on the phone, in the `ls` list, the palette and the shell. Then run `node build-fallback.js`
  to refresh the no-JavaScript fallback in `index.html`.
- `index.html`: page shell. `styles.css`: tokens at the top, dark/light and iOS/Android styles.
- `app.js`: boot, phone, app pages, palette, shell; also clears the old Flutter service worker.
- `assets/apps/`: launcher icons (192px). `assets/store/<id>/`: store screenshots (640px WebP).
  Optional screen recording: `assets/store/<id>/demo.mp4`, listed in `VIDEOS` in `data.js`.
- `assets/og.png`: link-preview image. Deep links: `#app/<id>` opens that app on the phone.
- `resume.html` — print-first résumé (A4, two pages). Edit it, then regenerate the PDF the hero links to:

  ```sh
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
    --no-pdf-header-footer --virtual-time-budget=12000 \
    --print-to-pdf=assets/Kluivert-Edegware-Resume.pdf "file://$PWD/resume.html"
  ```

Deploy: push to `main`; GitHub Pages serves the repo root.

## Job tracker

`tracker/` holds a scheduled job tracker: a GitHub Action scans public job feeds,
scores them against `tracker/profile.yml`, emails a digest, and sends the résumé
when a match is approved on the dashboard at `/tracker/`. Setup and daily use are
in [tracker/README.md](tracker/README.md).
