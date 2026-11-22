// Kluivert Edegware: portfolio behaviour. No dependencies.
// Every motion checks prefers-reduced-motion.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// An older version of this site was a Flutter web build that registered a
// service worker; drop it so returning visitors don't get the cached old page.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  if (window.caches) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
}

const ALL = [...APPS, ...SIDE];
// System apps that only live on the phone's home screen.
const SYS = [
  { id: "notes", name: "Notes", short: "Case study", sys: true, svg: "notes", bg: "linear-gradient(#ffe27a,#f7c948)", color: "#7a5a00" },
  { id: "settings", name: "Settings", short: "Settings", sys: true, svg: "gear", bg: "linear-gradient(#9aa3ad,#6b737d)", color: "#fff" },
];
const HAS_CASE = !!document.getElementById("case");
const HOME = [...ALL, ...SYS.filter((a) => a.id !== "notes" || HAS_CASE)];
const byId = Object.fromEntries(HOME.map((a) => [a.id, a]));

const SVG = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 2.5v19l10.5-9.5L3 2.5zm12 8.1L6.4 3.6l9.9 5.7-1.3 1.3zm0 2.8 1.3 1.3-9.9 5.7 8.6-7zm1.7-1.4 3-1.7c.7-.4.7-1.2 0-1.6l-3-1.7L14.9 12l1.8 1.8v-.1z"/></svg>',
  apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.8 1.3 10.3.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.2zM13.9 4.9c.7-.9 1.2-2.1 1-3.3-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.2 1.2.1 2.4-.6 3.1-1.5z"/></svg>',
  gh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 8.36 22.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  term: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 4 4-4 4M12 16h7"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 8h10M7 12h10M7 16h6"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
};

// ---------------------------------------------------------------- utilities
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 1800);
}
async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); toast(`copied ${label || text}`); }
  catch (_) { toast(text); }
}
const isNarrow = () => matchMedia("(max-width: 900px)").matches;

// Average colour of an icon, so each app's splash and header match its brand.
const colorCache = {};
function iconColor(src) {
  if (colorCache[src]) return Promise.resolve(colorCache[src]);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 24;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0, 24, 24);
        const d = x.getImageData(0, 0, 24, 24).data;
        // Weight saturated pixels so a white background doesn't wash the colour out.
        let r = 0, g = 0, b = 0, w = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 128) continue;
          const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
          const wt = 0.15 + (mx - mn) / 255;
          r += d[i] * wt; g += d[i + 1] * wt; b += d[i + 2] * wt; w += wt;
        }
        r = Math.round(r / w); g = Math.round(g / w); b = Math.round(b / w);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        resolve((colorCache[src] = { bg: `rgb(${r},${g},${b})`, fg: lum > 0.62 ? "#111" : "#fff", dark: lum <= 0.62, lum }));
      } catch (_) { resolve({ bg: "#1b1f27", fg: "#fff", dark: true, lum: 0.1 }); }
    };
    img.onerror = () => resolve({ bg: "#1b1f27", fg: "#fff", dark: true, lum: 0.1 });
    img.src = src;
  });
}
const sideColor = (p) => ({ bg: `hsl(${p.hue} 62% 42%)`, fg: "#fff", dark: true, lum: 0.4 });
const appColor = (a) => a.sys ? Promise.resolve({ bg: "#f2f2f7", fg: "#111", dark: false, lum: 0.95 }) : (a.icon ? iconColor(a.icon) : Promise.resolve(sideColor(a)));
const tileHTML = (a, cls = "tile") =>
  a.sys ? `<span class="${cls} tile-sys" style="background:${a.bg};color:${a.color}">${SVG[a.svg]}</span>` :
  a.icon ? `<span class="${cls}"><img src="${a.icon}" alt=""></span>`
         : `<span class="${cls} tile-l" style="background:linear-gradient(145deg,hsl(${a.hue} 70% 52%),hsl(${a.hue + 25} 65% 34%))">${a.letter}</span>`;

// ---------------------------------------------------------------- theme
(function theme() {
  const btn = $("#theme");
  const paint = () => { const d = root.dataset.theme !== "light"; btn.textContent = d ? "☼" : "☾"; btn.setAttribute("aria-label", d ? "Switch to light theme" : "Switch to dark theme"); };
  const apply = (t) => { root.dataset.theme = t; try { localStorage.setItem("theme", t); } catch (_) {} paint(); };
  window.toggleTheme = (e) => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    if (reduced || !document.startViewTransition) return apply(next);
    const r0 = btn.getBoundingClientRect();
    const x = e?.clientX || r0.left + 17, y = e?.clientY || r0.top + 17;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => apply(next)).ready.then(() =>
      root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(.2,.9,.2,1)", pseudoElement: "::view-transition-new(root)" }));
  };
  btn.addEventListener("click", toggleTheme);
  paint();
})();

// ---------------------------------------------------------------- boot
const booted = new Promise((resolve) => {
  const boot = $("#boot");
  if (root.classList.contains("no-boot") || reduced) { boot.remove(); return resolve(); }
  const log = $("#bootLog");
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem("booted", "1"); } catch (_) {}
    boot.classList.add("done");
    setTimeout(() => boot.remove(), 650);
    removeEventListener("keydown", finish);
    resolve();
  };
  addEventListener("keydown", finish);
  boot.addEventListener("pointerdown", finish);

  const L = [
    [`<span class="ok">$</span> <span class="w">flutter run --release -d "Kluivert's iPhone"</span>`, 260],
    [`Launching <span class="b">lib/main.dart</span> on Kluivert's iPhone in release mode...`, 220],
    [`Resolving dependencies...                       <span class="ok">✓</span>`, 160],
    [`Running pod install...                          <span class="dim">1.2s</span>`, 200],
    [`Running Xcode build...`, 140],
    [` └─ Compiling, linking and signing...            <span class="dim">4.1s</span>`, 260],
    [`<span class="ok">✓</span> Built <span class="w">build/ios/iphoneos/Runner.app</span> <span class="dim">(10 apps · 6 yrs · 14 packages)</span>`, 200],
    [`Installing and launching...`, 240],
  ];
  (async () => {
    for (const [line, d] of L) {
      if (finished) return;
      log.innerHTML += line + "\n";
      await wait(d);
    }
    if (finished) return;
    await wait(350);
    finish();
  })();
});

// ---------------------------------------------------------------- flutter doctor
booted.then(async () => {
  const out = $("#doctor");
  const lines = [
    `<span class="t-ok">$</span> <span class="t-w">flutter doctor --profile kluivert</span>`,
    `Doctor summary (to see all details, run flutter doctor -v):`,
    `<span class="t-ok">[✓]</span> Flutter & native Android <span class="t-d">·</span> <span class="t-w">6+ years</span>`,
    `<span class="t-ok">[✓]</span> Shipped <span class="t-d">·</span> <span class="t-w">10 apps</span> live on Google Play & App Store`,
    `<span class="t-ok">[✓]</span> Production <span class="t-d">·</span> <span class="t-w">99% crash-free</span>, two enterprise apps`,
    `<span class="t-ok">[✓]</span> Reach <span class="t-d">·</span> <span class="t-w">10K+</span> installs on Yachtall, 7 languages`,
    `<span class="t-ok">[✓]</span> Open source <span class="t-d">·</span> <span class="t-w">3</span> pub.dev pkgs (160 pts) + <span class="t-w">11</span> DartNative plugins`,
    `<span class="t-a">[!]</span> Availability <span class="t-d">·</span> open to remote roles <span class="t-d">(UTC+1)</span>`,
    ``,
    `<span class="t-ok">•</span> No issues found!`,
  ];
  if (reduced) { out.innerHTML = lines.join("\n"); return; }
  await wait(250);
  for (const l of lines) { out.innerHTML += l + "\n"; await wait(l ? 110 : 60); }
});

// ---------------------------------------------------------------- phone home
const screen = $("#screen");
(function clock() {
  const tick = () => {
    const d = new Date();
    const t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "");
    $("#clock").textContent = t;
    const [hh, mm] = t.split(":");
    $("#lockTime").innerHTML = `<span>${hh}</span><span class="sep">:</span><span>${mm}</span>`;
    $("#lockDate").textContent = d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  };
  tick(); setInterval(tick, 15000);
})();

$("#icons").innerHTML = HOME.map((a, i) =>
  `<button class="ic" type="button" data-open="${a.id}" style="--i:${i}" aria-label="Open ${esc(a.name)}">${tileHTML(a)}<span class="lbl">${esc(a.short)}</span></button>`).join("");

const DOCK = [
  { lbl: "Mail", svg: SVG.mail, bg: "linear-gradient(#5ab0ff,#1a6ff0)", act: () => (location.href = "mailto:edkluivert@gmail.com") },
  { lbl: "GitHub", svg: SVG.gh, bg: "#111", act: () => open("https://github.com/edkluivert", "_blank", "noopener") },
  { lbl: "Terminal", svg: SVG.term, bg: "#0b0e13", color: "#64f0a8", act: () => { $("#contact").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); setTimeout(() => $("#shellInput").focus({ preventScroll: true }), 600); } },
  { lbl: "Résumé", svg: SVG.doc, bg: "#fff", color: "#111", act: () => open("assets/Kluivert-Edegware-Resume.pdf", "_blank", "noopener") },
];
$("#dock").innerHTML = DOCK.map((d, i) =>
  `<button class="ic" type="button" data-dock="${i}" style="--i:${HOME.length + i}" aria-label="${d.lbl}"><span class="tile" style="background:${d.bg};color:${d.color || "#fff"}">${d.svg}</span><span class="lbl">${d.lbl}</span></button>`).join("");
$("#dock").addEventListener("click", (e) => { const b = e.target.closest("[data-dock]"); if (b) DOCK[+b.dataset.dock].act(); });

if (HAS_CASE) $(".tabs a[href='#shipped']").insertAdjacentHTML("afterend", `<a href="#case"><span class="ext md"></span>case_study.md</a>`);

// ---------------------------------------------------------------- iOS / Android
// Same apps, two platforms. Android visitors get the Pixel by default.
const phoneEl = $("#phone");
let OS = "ios";
try { OS = localStorage.getItem("os") || (/Android/i.test(navigator.userAgent) ? "android" : "ios"); } catch (_) {}
const devName = () => (OS === "android" ? "Kluivert's Pixel 9 Pro" : "Kluivert's iPhone");
function paintOS() {
  phoneEl.classList.toggle("android", OS === "android");
  $$(".os-switch [data-os]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.os === OS)));
  $(".os-switch").dataset.on = OS;
  if (!screen.classList.contains("pre")) $("#capText").innerHTML = `running on <b>${devName()}</b> · debug`;
}
async function setOS(next) {
  if (next === OS) return;
  try { localStorage.setItem("os", next); } catch (_) {}
  if (reduced) { OS = next; return paintOS(); }
  await phoneEl.animate([{ transform: "perspective(1400px) rotateY(0)" }, { transform: "perspective(1400px) rotateY(90deg)" }], { duration: 220, easing: "ease-in" }).finished;
  OS = next; paintOS();
  await phoneEl.animate([{ transform: "perspective(1400px) rotateY(-90deg)" }, { transform: "perspective(1400px) rotateY(0)" }], { duration: 320, easing: "cubic-bezier(.2,.9,.3,1.15)" }).finished;
}
$(".os-switch").addEventListener("click", (e) => { const b = e.target.closest("[data-os]"); if (b) setOS(b.dataset.os); });
$("#gsearch").addEventListener("click", () => $("#openPalette").click());
paintOS();

// ---------------------------------------------------------------- phone boot
// Black screen + logo + progress bar, lock screen, then the lock slides up and
// the icons zoom in. Plays on every load; skipped under reduced motion.
if (!reduced) screen.classList.add("pre");
const phoneReady = booted.then(async () => {
  if (reduced) return;
  const cap = $("#capText");
  const caption = (html) => { cap.innerHTML = html; };
  caption(`booting <b>${devName()}</b>…`);
  await wait(150);
  screen.classList.add("booting");
  await wait(500);
  screen.classList.add("bs-progress");
  await wait(1850);
  screen.classList.add("locked");
  caption("locked · <b>tap or swipe up</b>");
  // Lock screen waits a moment, or until the visitor taps it.
  await new Promise((res) => {
    const t = setTimeout(res, 1600);
    $("#lock").addEventListener("pointerdown", () => { clearTimeout(t); res(); }, { once: true });
  });
  screen.classList.add("unlocking");
  caption(`running on <b>${devName()}</b> · debug`);
  await wait(1100);
  screen.classList.remove("pre", "booting", "bs-progress", "locked", "unlocking");
});

// ---------------------------------------------------------------- notifications
const NOTES = [
  { id: "myslates", title: "MySlates", body: "5K+ installs on Google Play · rated 4.1★" },
  { id: "yachtall", title: "Yachtall", body: "10K+ installs · now in 7 languages" },
  { id: "swayspa", title: "SwaySpa", body: "Rated 4.6★ on Google Play" },
];
async function notify(n) {
  if (current || document.hidden) return;
  const a = byId[n.id];
  const el = document.createElement("button");
  el.type = "button";
  el.className = "notif";
  el.innerHTML = `<img src="${a.icon}" alt=""><span><b>${esc(n.title)}</b><i>now</i><br>${esc(n.body)}</span>`;
  el.addEventListener("click", () => { el.remove(); openApp(n.id); });
  screen.appendChild(el);
  if (!reduced) await el.animate([{ transform: "translateY(-120%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 500, easing: "cubic-bezier(.2,.9,.3,1.15)" }).finished;
  await wait(4200);
  if (!el.isConnected) return;
  if (!reduced) await el.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(-120%)", opacity: 0 }], { duration: 350, easing: "ease-in", fill: "forwards" }).finished;
  el.remove();
}
phoneReady.then(async () => {
  const pick = [...NOTES].sort(() => Math.random() - 0.5).slice(0, 2);
  await wait(2600);
  await notify(pick[0]);
  await wait(16000);
  await notify(pick[1]);
});

// ---------------------------------------------------------------- app window
let current = null; // { id, win, tile }

function settingsPage() {
  const row = (label, right, attrs = "") => `<div class="st-row" ${attrs}><span>${label}</span><span class="st-r">${right}</span></div>`;
  const toggle = (id, on) => `<button type="button" class="st-tg" role="switch" aria-checked="${on}" data-set="${id}"><i></i></button>`;
  const years = new Date().getFullYear() - 2020;
  return `
    <div class="splash"></div>
    <div class="app-scroll as st">
      <div class="as-nav"><button type="button" class="as-back" data-close aria-label="Back to apps"><span class="b-ios">${SVG.back}Apps</span><span class="b-and">${SVG.arrow}</span></button><span class="as-navtitle">Settings</span></div>
      <h3 class="st-title">Settings</h3>
      <div class="st-card st-me"><span class="st-av">K</span><div><b>Kluivert Edegware</b><span>Mobile app engineer · open to remote roles</span></div></div>
      <div class="st-h">Display</div>
      <div class="st-card">
        ${row("Dark mode", toggle("theme", root.dataset.theme !== "light"))}
        ${row("Platform", `<span class="st-seg"><button type="button" data-set="ios" class="${OS === "ios" ? "on" : ""}">iOS</button><button type="button" data-set="android" class="${OS === "android" ? "on" : ""}">Android</button></span>`)}
      </div>
      <div class="st-h">About this phone</div>
      <div class="st-card">
        ${row("Owner", "Kluivert Edegware")}
        ${row("Version", `${years}.0 (years shipping)`)}
        ${row("Apps on the stores", "10")}
        ${row("Open-source packages", "14")}
        ${row("Time zone", "WAT · UTC+1")}
      </div>
      <div class="st-h">Developer options</div>
      <div class="st-card">
        ${row("Email", `<a href="mailto:edkluivert@gmail.com">edkluivert@gmail.com</a>`)}
        ${row("GitHub", `<a href="https://github.com/edkluivert" target="_blank" rel="noopener">edkluivert</a>`)}
        ${row("LinkedIn", `<a href="https://www.linkedin.com/in/kluivert-edegware-913882172" target="_blank" rel="noopener">profile</a>`)}
        ${row("Résumé", `<a href="assets/Kluivert-Edegware-Resume.pdf" target="_blank" rel="noopener">PDF</a>`)}
      </div>
      <div class="app-pad"></div>
    </div>`;
}

function appPage(a) {
  if (a.id === "settings") return settingsPage();
  const btn = (href, icon, label, alt) => `<a class="as-btn ${alt ? "alt" : ""}" href="${href}" target="_blank" rel="noopener">${icon}${label}</a>`;
  const stores = a.stores
    ? (a.stores.play ? btn(a.stores.play, SVG.play, "Google Play") : "") + (a.stores.ios ? btn(a.stores.ios, SVG.apple, "App Store", !!a.stores.play) : "")
    : a.repo ? btn(a.repo, SVG.gh, "View source") : `<span class="as-btn alt">${esc(a.status)}</span>`;
  const platform = a.stores ? (a.stores.play && a.stores.ios ? "iOS · Android" : "Android") : a.status.includes("open source") ? "Open source" : "Android";
  const info = [
    ...(a.metrics || []),
    ["Platform", platform].reverse(),
    ...(a.client ? [[a.client.split(/[ ,]/)[0], "client"]] : []),
    [a.year || a.status.split(" · ")[0], a.year ? "year" : "status"],
  ].slice(0, 4);
  const shots = [...(a.video ? [a.video] : []), ...(a.screens || [])];
  const isVid = (src) => /\.(mp4|webm|mov)$/i.test(src);
  const media = (src, i, cls) => isVid(src)
    ? `<video src="${src}" muted autoplay loop playsinline preload="metadata" aria-label="${esc(a.name)} screen recording"></video>`
    : `<img src="${src}" alt="${esc(a.name)} screenshot ${i + 1}" ${cls || ""} draggable="false">`;
  const rows = [
    ["Developer", "Kluivert Edegware"],
    a.client && ["Client", a.client],
    a.pkg && ["Package", a.pkg],
    ["Category", a.kind],
    a.stores && ["Available on", [a.stores.play && "Google Play", a.stores.ios && "App Store"].filter(Boolean).join(" · ")],
  ].filter(Boolean);
  return `
    <div class="splash">${a.icon ? `<img src="${a.icon}" alt="">` : tileHTML(a, "tile-l")}</div>
    <div class="app-scroll as">
      <div class="as-nav"><button type="button" class="as-back" data-close aria-label="Back to apps"><span class="b-ios">${SVG.back}Apps</span><span class="b-and">${SVG.arrow}</span></button><span class="as-navtitle">${esc(a.name)}</span></div>
      <div class="as-head">
        ${a.icon ? `<img class="as-icon" src="${a.icon}" alt="">` : tileHTML(a, "tile-l as-icon")}
        <div class="as-title">
          <h3>${esc(a.name)}</h3>
          <p>${esc(a.client ? a.kind : a.kind)}</p>
          <div class="as-btns">${stores}</div>
        </div>
      </div>
      <div class="as-btns as-andbtns">${stores}</div>
      <div class="as-info">${info.map(([b, s]) => `<div><span>${esc(s)}</span><b>${esc(b)}</b></div>`).join("")}</div>
      ${shots.length ? `<div class="as-shots" data-shots>${shots.map((src, i) => `<button type="button" data-shot="${i}" aria-label="View screenshot ${i + 1}">${media(src, i, 'loading="lazy"')}</button>`).join("")}</div>
        <div class="as-shot-src">${a.stores ? "screenshots from the store listing" : ""}</div>` : ""}
      <div class="as-sec"><p class="as-desc">${esc(a.blurb)}</p></div>
      <div class="as-sec"><h4>Built with</h4><div class="chips">${a.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>
      <div class="as-sec"><h4>Information</h4><dl class="as-dl">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>
      <div class="app-pad"></div>
    </div>
    ${shots.length ? `<div class="viewer" hidden>
      <div class="v-track">${shots.map((src, i) => `<div class="v-slide">${media(src, i)}</div>`).join("")}</div>
      <div class="v-bar"><span class="v-count">1 / ${shots.length}</span><button type="button" class="v-done">Done</button></div>
    </div>` : ""}`;
}

function rectIn(el, parent) {
  const a = el.getBoundingClientRect(), b = parent.getBoundingClientRect();
  return { t: a.top - b.top, l: a.left - b.left, r: b.right - a.right, btm: b.bottom - a.bottom, w: b.width, h: b.height };
}
const clipFor = (r, rad) => `inset(${r.t}px ${r.r}px ${r.btm}px ${r.l}px round ${rad}px)`;

async function openApp(id, { fullscreen = false } = {}) {
  const a = byId[id];
  if (!a) return;
  if (current) await closeApp(true);
  const col = await appColor(a);
  if (fullscreen) { screen.classList.add("fullscreen"); document.body.style.overflow = "hidden"; }
  const tile = $(`#icons [data-open="${id}"] .tile`);
  const win = document.createElement("div");
  win.className = "appwin";
  win.style.setProperty("--app-bg", col.bg);
  win.style.setProperty("--app-fg", col.fg);
  win.innerHTML = appPage(a);
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", a.name);
  screen.appendChild(win);
  screen.classList.add("app-open");
  screen.style.setProperty("--status-fg", col.fg);
  screen.style.setProperty("--ind", col.fg === "#fff" ? "rgba(255,255,255,.85)" : "rgba(0,0,0,.75)");
  win.style.setProperty("--accent", col.lum > 0.72 ? "#0a84ff" : col.bg);
  current = { id, win, tile };
  history.replaceState(null, "", `#app/${id}`);

  const failsafe = setTimeout(() => win.classList.add("ready"), 1400);
  if (!reduced && tile && !fullscreen) {
    const r = rectIn(tile, screen);
    await win.animate([{ clipPath: clipFor(r, 15) }, { clipPath: "inset(0 0 0 0 round 44px)" }],
      { duration: 480, easing: "cubic-bezier(.32,.72,0,1)" }).finished;
  } else if (!reduced) {
    await win.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" }).finished;
  }
  await wait(380);
  // Status bar sits over the app header, so it switches to the app's text colour once the splash goes.
  clearTimeout(failsafe);
  win.classList.add("ready");
  screen.style.setProperty("--status-fg", "#111");
  screen.style.setProperty("--ind", "rgba(0,0,0,.8)");
  wireApp(win);
  $(".app-scroll", win).scrollTop = 0;
}

function wireApp(win) {
  const sc = $(".app-scroll", win);
  const nav = $(".as-nav", win);
  sc.addEventListener("scroll", () => nav.classList.toggle("stuck", sc.scrollTop > 90), { passive: true });
  win.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeApp();
    const sh = e.target.closest("[data-shot]");
    if (sh && !win.dataset.dragged) openViewer(win, +sh.dataset.shot);
    if (e.target.closest(".v-done")) closeViewer(win);
    const set = e.target.closest("[data-set]");
    if (set) {
      const k = set.dataset.set;
      if (k === "theme") { toggleTheme(); set.setAttribute("aria-checked", String(root.dataset.theme !== "light")); }
      if (k === "ios" || k === "android") { setOS(k); $$(".st-seg button", win).forEach((b) => b.classList.toggle("on", b.dataset.set === k)); }
    }
    const slide = e.target.closest(".v-slide");
    if (slide) { const r = slide.getBoundingClientRect(); stepViewer(win, e.clientX > r.left + r.width / 2 ? 1 : -1); }
  });
  // Mouse users can drag the screenshot strip like a touch screen.
  const strip = $("[data-shots]", win);
  if (strip) {
    let x0 = null, s0 = 0;
    strip.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; x0 = e.clientX; s0 = strip.scrollLeft; delete win.dataset.dragged; strip.classList.add("grabbing"); });
    addEventListener("pointermove", (e) => { if (x0 == null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) win.dataset.dragged = 1; strip.scrollLeft = s0 - dx; });
    addEventListener("pointerup", () => {
      if (x0 == null) return; x0 = null; strip.classList.remove("grabbing");
      // settle on the nearest shot
      const w = strip.firstElementChild.getBoundingClientRect().width + 10;
      strip.scrollTo({ left: Math.round(strip.scrollLeft / w) * w, behavior: reduced ? "auto" : "smooth" });
      setTimeout(() => delete win.dataset.dragged, 0);
    });
  }
  const track = $(".v-track", win);
  if (track) track.addEventListener("scroll", () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    $(".v-count", win).textContent = `${i + 1} / ${track.children.length}`;
  }, { passive: true });
}
function openViewer(win, i) {
  const v = $(".viewer", win);
  if (!v) return;
  v.hidden = false;
  const track = $(".v-track", v);
  track.scrollLeft = i * track.clientWidth;
  $(".v-count", v).textContent = `${i + 1} / ${track.children.length}`;
  if (!reduced) v.animate([{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)" });
  screen.style.setProperty("--status-fg", "#fff");
  screen.style.setProperty("--ind", "rgba(255,255,255,.85)");
}
function stepViewer(win, d) {
  const t = $(".v-track", win);
  if (t) t.scrollTo({ left: t.scrollLeft + d * t.clientWidth, behavior: reduced ? "auto" : "smooth" });
}
function closeViewer(win) {
  const v = $(".viewer", win);
  if (!v || v.hidden) return false;
  v.hidden = true;
  screen.style.setProperty("--status-fg", "#111");
  screen.style.setProperty("--ind", "rgba(0,0,0,.8)");
  return true;
}

async function closeApp(instant = false) {
  if (!current) return;
  const { win, tile } = current;
  current = null;
  screen.classList.remove("app-open");
  history.replaceState(null, "", location.pathname + location.search);
  if (!instant && !reduced) {
    const wasFull = screen.classList.contains("fullscreen");
    if (tile && !wasFull) {
      win.classList.remove("ready");
      await win.animate([{ clipPath: "inset(0 0 0 0 round 44px)" }, { clipPath: clipFor(rectIn(tile, screen), 15) }],
        { duration: 380, easing: "cubic-bezier(.32,.72,0,1)", fill: "forwards" }).finished;
    } else {
      await win.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(40px)" }], { duration: 240, easing: "ease-in", fill: "forwards" }).finished;
    }
  }
  win.remove();
  if (screen.classList.contains("fullscreen")) { screen.classList.remove("fullscreen"); document.body.style.overflow = ""; }
}

$("#icons").addEventListener("click", (e) => {
  const b = e.target.closest("[data-open]");
  if (!b) return;
  if (b.dataset.open === "notes") return $("#case").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  openApp(b.dataset.open);
});
$("#homeInd").addEventListener("click", () => closeApp());
$("#homeInd").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); closeApp(); } });

// Swipe up from the bottom edge, or pull down at the top of the app, goes home.
(function gestures() {
  let y0 = null, fromBottom = false;
  screen.addEventListener("pointerdown", (e) => {
    if (!current || e.target.closest(".viewer, [data-shots]")) return;
    const b = screen.getBoundingClientRect();
    y0 = e.clientY; fromBottom = b.bottom - e.clientY < 40;
  });
  screen.addEventListener("pointerup", (e) => {
    if (y0 == null || !current) return;
    const dy = e.clientY - y0; y0 = null;
    const sc = $(".app-scroll", current.win);
    if ((fromBottom && dy < -50) || (dy > 110 && sc && sc.scrollTop <= 0)) closeApp();
  });
})();

// Bring the phone into view (desktop) or go fullscreen (small screens), then open.
async function launch(id) {
  await phoneReady;
  if (isNarrow()) return openApp(id, { fullscreen: true });
  const ph = $("#phone").getBoundingClientRect();
  if (ph.top < 40 || ph.bottom > innerHeight) {
    $("#phone").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    await wait(550);
  }
  const ic = $(`#icons [data-open="${id}"]`);
  if (ic && !reduced) { ic.classList.remove("flash"); void ic.offsetWidth; ic.classList.add("flash"); await wait(260); }
  openApp(id);
}

// ---------------------------------------------------------------- ls list
$("#lsList").innerHTML =
  `<div class="ls-head"><span></span><span>name</span><span>client</span><span>stores</span><span>signal</span><span></span></div>` +
  APPS.map((a) => `
    <button class="ls-row rv" type="button" role="listitem" data-launch="${a.id}">
      <img src="${a.icon}" alt="" loading="lazy">
      <span class="ls-name">${esc(a.name)}<small>${esc(a.pkg)}</small></span>
      <span class="ls-client">${esc(a.client)} <span class="ls-year">· ${esc(a.year)}</span></span>
      <span class="store-dots ls-stores">${a.stores.play ? "<i>play</i>" : ""}${a.stores.ios ? "<i>ios</i>" : ""}</span>
      <span class="ls-stat">${esc(a.stat)}</span>
      <span class="go" aria-hidden="true">→</span>
    </button>`).join("");

// ---------------------------------------------------------------- side projects
$("#sideList").innerHTML = SIDE.map((p) => `
  <button class="proj rv" type="button" data-launch="${p.id}">
    ${tileHTML(p, "tile-l")}
    <div>
      <span class="status-tag ${p.status.startsWith("in dev") ? "" : "ok"}">● ${esc(p.status)}</span>
      <h3>${esc(p.name)}</h3>
      <div class="kind">${esc(p.kind)}</div>
      <p>${esc(p.blurb)}</p>
      <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    </div>
  </button>`).join("");

document.addEventListener("click", (e) => { const b = e.target.closest("[data-launch]"); if (b) launch(b.dataset.launch); });

// ---------------------------------------------------------------- pubspec
(function pubspec() {
  const pad = Math.max(...PACKAGES.map((p) => p.name.length + p.v.length)) + 6;
  const L = [
    `<span class="y-k">name</span>: <span class="y-v">kluivert_edegware</span>`,
    `<span class="y-k">description</span>: <span class="y-s">"Libraries pulled out of production apps."</span>`,
    `<span class="y-k">publisher</span>: <span class="y-p">edkluivert</span>`,
    ``,
    `<span class="y-k">dependencies</span>:`,
    `  <span class="y-c"># pub.dev · Flutter</span>`,
    ...PACKAGES.filter((p) => p.src === "pub.dev").map(dep),
    ``,
    `  <span class="y-c"># dartpub.dev · DartNative plugins (11 total)</span>`,
    ...PACKAGES.filter((p) => p.src !== "pub.dev").map(dep),
    ``,
    `<span class="y-c"># click a dependency to open it</span>`,
  ];
  function dep(p) {
    const gap = " ".repeat(Math.max(2, pad - p.name.length - p.v.length));
    return { html: `  <span class="y-k">${p.name}</span>: <span class="y-v">^${p.v}</span>${gap}<span class="note"># ${esc(p.note)}</span>`, url: p.url };
  }
  $("#pubspec").innerHTML = L.map((l) => typeof l === "string"
    ? `<div class="ln"><span>${l || " "}</span></div>`
    : `<a class="ln dep" href="${l.url}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><span>${l.html}</span></a>`).join("");
})();

// ---------------------------------------------------------------- README tab
$("#readme").innerHTML = `
  <h3># Kluivert Edegware</h3>
  <p>Mobile app engineer in Rivers, Nigeria, working remotely. Six years of Flutter and native Android across fintech,
  EV charging, property, schools and boat marketplaces.</p>
  <h4>## how I work</h4>
  <ul>
    <li>Clean architecture, feature-first, with <code>Bloc</code> for state. Features stay boring and predictable.</li>
    <li>I pull reusable code out of production apps and publish it: <code>solid_x</code>, <code>translation_manager</code>, <code>getx_exten</code> and DartNative plugins.</li>
    <li>I own the whole path: API design, store release, then crash-free numbers once real people are using it.</li>
  </ul>
  <h4>## install</h4>
  <p><code>mailto:edkluivert@gmail.com</code></p>`;
$$(".editor-tabs [data-tab]").forEach((b) => b.addEventListener("click", () => {
  $$(".editor-tabs [data-tab]").forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", String(on)); });
  $("#pubspec").hidden = b.dataset.tab !== "pubspec";
  $("#readme").hidden = b.dataset.tab !== "readme";
}));

// ---------------------------------------------------------------- git log
(function gitlog() {
  const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7); };
  $("#gitlog").innerHTML = JOBS.map((j) => {
    const refs = j.head ? `<span class="c-ref h">HEAD → main</span>` : j.edu ? `<span class="c-ref t">tag: bsc</span>` : `<span class="c-ref b">${j.co.toLowerCase().replace(/\s+/g, "-")}</span>`;
    return `<li class="commit rv ${j.head ? "head" : ""} ${j.edu ? "edu" : ""}">
      <span class="node"></span>
      <div>
        <div class="c-line"><span class="c-hash">${hash(j.co + j.when)}</span>${refs}<span class="c-when">${esc(j.when)}</span></div>
        <div class="c-title">${esc(j.co)} <span>· ${esc(j.role)}</span></div>
        <div class="c-meta">${esc(j.where)}${j.note ? ` · ${esc(j.note)}` : ""}</div>
        ${j.body ? `<p class="c-body">${esc(j.body)}</p>` : ""}
      </div></li>`;
  }).join("");
})();

// ---------------------------------------------------------------- shell
(function shell() {
  const out = $("#shellOut"), input = $("#shellInput");
  const hist = []; let hi = 0;
  const print = (html, cls = "") => { const d = document.createElement("div"); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const link = (href, txt) => `<a href="${href}" target="_blank" rel="noopener">${txt}</a>`;
  const C = {
    help: () => [
      "<span class='t-w'>available commands</span>",
      "  <span class='t-ok'>whoami</span>      short bio",
      "  <span class='t-ok'>contact</span>     every way to reach me",
      "  <span class='t-ok'>email</span>       copy my email address",
      "  <span class='t-ok'>apps</span>        list shipped apps",
      "  <span class='t-ok'>open</span> &lt;app&gt;  launch an app on the phone",
      "  <span class='t-ok'>stack</span>       what I work with",
      "  <span class='t-ok'>resume</span>      open the PDF",
      "  <span class='t-ok'>theme</span>       toggle light / dark",
      "  <span class='t-ok'>clear</span>       clear the screen",
    ].join("\n"),
    whoami: () => "Kluivert Edegware. Mobile app engineer in Rivers, Nigeria, working remotely.\nSix years of Flutter and native Android: fintech, EV charging, property, schools and boat marketplaces.",
    contact: () => [
      `email     ${link("mailto:edkluivert@gmail.com", "edkluivert@gmail.com")}`,
      `github    ${link("https://github.com/edkluivert", "github.com/edkluivert")}`,
      `linkedin  ${link("https://www.linkedin.com/in/kluivert-edegware-913882172", "in/kluivert-edegware")}`,
      `phone     ${link("tel:+2349047550339", "+234 904 755 0339")}`,
    ].join("\n"),
    email: () => { copy("edkluivert@gmail.com", "email"); return "<span class='t-ok'>✓</span> edkluivert@gmail.com copied to clipboard"; },
    apps: () => APPS.map((a) => `<span class='t-b'>${a.id.padEnd(16)}</span>${esc(a.name)} <span class='t-d'>· ${esc(a.stat)}</span>`).join("\n") + "\n<span class='t-d'>try: open yachtall</span>",
    open: (arg) => {
      const q = (arg || "").toLowerCase();
      const a = ALL.find((x) => x.id === q || x.name.toLowerCase().startsWith(q));
      if (!q) return "usage: open &lt;app&gt;  (see: apps)";
      if (!a) return `<span class='t-r'>open: no such app: ${esc(arg)}</span>`;
      launch(a.id);
      return `<span class='t-ok'>✓</span> launching ${esc(a.name)}…`;
    },
    stack: () => "<span class='t-w'>mobile</span>    Flutter · Dart · Kotlin · Jetpack Compose · DartNative\n<span class='t-w'>state</span>     Bloc · clean architecture · DI\n<span class='t-w'>backend</span>   Firebase · REST · WebSockets\n<span class='t-w'>product</span>   payments · passkeys · maps · KYC · CI/CD",
    resume: () => { open("assets/Kluivert-Edegware-Resume.pdf", "_blank", "noopener"); return "opening resume.pdf…"; },
    theme: () => { toggleTheme(); return "theme toggled"; },
    ls: () => "shipped/  side_projects/  pubspec.yaml  contact.sh  resume.pdf",
    pwd: () => "/home/kluivert",
    date: () => new Date().toString(),
    sudo: (arg) => /hire/.test(arg || "") ? "<span class='t-ok'>[sudo]</span> permission granted. Opening mail client…" + (setTimeout(() => (location.href = "mailto:edkluivert@gmail.com?subject=Let's%20work%20together"), 700), "") : "kluivert is not in the sudoers file. This incident will be reported. (try: sudo hire-me)",
    exit: () => "nice try.",
  };
  C["hire-me"] = () => C.sudo("hire");
  C.cat = (arg) => arg === "contact.sh" ? C.contact() : arg === "pubspec.yaml" ? "see the pubspec.yaml section above ↑" : `cat: ${esc(arg || "")}: permission denied`;

  print("Last login: " + new Date().toDateString() + " on ttys001", "t-d");
  print("Type <span class='t-ok'>help</span> to see what this shell can do.");

  $("#shellForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = "";
    print(`<span class='t-ok'>➜</span> <span class='t-b'>~</span> ${esc(raw)}`);
    if (!raw) return;
    hist.push(raw); hi = hist.length;
    const [cmd, ...rest] = raw.split(/\s+/);
    if (cmd === "clear") { out.innerHTML = ""; return; }
    const fn = C[cmd.toLowerCase()];
    print(fn ? fn(rest.join(" ")) : `zsh: command not found: ${esc(cmd)}. Try <span class='t-ok'>help</span>`);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hi > 0) { input.value = hist[--hi]; e.preventDefault(); }
    if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; e.preventDefault(); }
    if (e.key === "Tab") {
      e.preventDefault();
      const v = input.value;
      const [c, a] = v.split(/\s+/);
      if (a !== undefined) { const m = ALL.find((x) => x.id.startsWith(a.toLowerCase())); if (m) input.value = `${c} ${m.id}`; }
      else { const m = Object.keys(C).find((k) => k.startsWith(c)); if (m) input.value = m + " "; }
    }
  });
  $("#shell").addEventListener("click", (e) => { if (!e.target.closest("a") && !getSelection().toString()) input.focus({ preventScroll: true }); });
})();

// ---------------------------------------------------------------- command palette
(function palette() {
  const pal = $("#palette"), input = $("#paletteInput"), list = $("#paletteList");
  const go = (h) => () => $(h).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  const items = [
    ...ALL.map((a) => ({ label: `Open ${a.name}`, grp: a.client ? "app" : "side project", icon: a.icon, letter: a.letter, run: () => launch(a.id), keys: `${a.name} ${a.pkg || ""} ${a.tags.join(" ")}` })),
    { label: "Go to Shipped", grp: "section", pi: "§", run: go("#shipped") },
    ...(HAS_CASE ? [{ label: "Read the Tharwa EV case study", grp: "section", pi: "§", keys: "architecture case", run: go("#case") }] : []),
    { label: "Go to Side projects", grp: "section", pi: "§", run: go("#products") },
    { label: "Go to Packages", grp: "section", pi: "§", run: go("#oss") },
    { label: "Go to Experience", grp: "section", pi: "§", run: go("#experience") },
    { label: "Go to Contact", grp: "section", pi: "§", run: go("#contact") },
    { label: "Copy email address", grp: "action", pi: "@", run: () => copy("edkluivert@gmail.com", "email") },
    { label: "Open résumé (PDF)", grp: "action", pi: "↗", run: () => open("assets/Kluivert-Edegware-Resume.pdf", "_blank", "noopener") },
    { label: "Open GitHub", grp: "action", pi: "↗", run: () => open("https://github.com/edkluivert", "_blank", "noopener") },
    { label: "Toggle theme", grp: "action", pi: "◐", run: () => toggleTheme() },
    { label: "Switch phone to Android / iOS", grp: "action", pi: "⇄", keys: "pixel iphone platform", run: () => setOS(OS === "ios" ? "android" : "ios") },
  ];
  let shown = [], sel = 0, lastFocus = null;
  const score = (it, q) => {
    if (!q) return 1;
    const hay = (it.label + " " + (it.keys || "") + " " + it.grp).toLowerCase();
    if (hay.includes(q)) return 2 + (it.label.toLowerCase().includes(q) ? 1 : 0);
    let i = 0; for (const ch of hay) if (ch === q[i]) i++; // subsequence fuzzy match
    return i === q.length ? 0.5 : 0;
  };
  function render() {
    const q = input.value.trim().toLowerCase();
    shown = items.map((it) => [it, score(it, q)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([it]) => it);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length
      ? shown.map((it, i) => `<li role="option" data-i="${i}" aria-selected="${i === sel}">${it.icon ? `<img src="${it.icon}" alt="">` : `<span class="pi">${it.letter || it.pi}</span>`}${esc(it.label)}<span class="grp">${it.grp}</span></li>`).join("")
      : `<li class="empty">No matches. Try "yacht", "kotlin" or "email".</li>`;
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }
  const show = () => { lastFocus = document.activeElement; pal.hidden = false; input.value = ""; sel = 0; render(); input.focus(); };
  const hide = () => { pal.hidden = true; lastFocus?.focus?.({ preventScroll: true }); };
  const run = (i) => { const it = shown[i]; if (!it) return; hide(); setTimeout(it.run, 60); };

  $("#openPalette").addEventListener("click", show);
  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { sel = (sel + 1) % Math.max(1, shown.length); render(); e.preventDefault(); }
    if (e.key === "ArrowUp") { sel = (sel - 1 + shown.length) % Math.max(1, shown.length); render(); e.preventDefault(); }
    if (e.key === "Enter") run(sel);
  });
  list.addEventListener("click", (e) => { const li = e.target.closest("[data-i]"); if (li) run(+li.dataset.i); });
  list.addEventListener("mousemove", (e) => { const li = e.target.closest("[data-i]"); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); } });
  pal.addEventListener("click", (e) => { if (e.target === pal) hide(); });

  addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? show() : hide(); }
    else if (e.key === "/" && !typing && pal.hidden) { e.preventDefault(); show(); }
    else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && current && !$(".viewer", current.win)?.hidden && !typing) { e.preventDefault(); stepViewer(current.win, e.key === "ArrowRight" ? 1 : -1); }
    else if (e.key === "Escape") { if (!pal.hidden) hide(); else if (current && !closeViewer(current.win)) closeApp(); }
  });
})();

// ---------------------------------------------------------------- scroll: reveal + active tab
(function scrollFx() {
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach((el, i) => { el.style.transitionDelay = `${(i % 6) * 45}ms`; io.observe(el); });
  } else $$(".rv").forEach((el) => el.classList.add("in"));

  const tabs = $$(".tabs a");
  const so = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) tabs.forEach((t) => t.classList.toggle("on", t.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach((s) => so.observe(s));
})();

$("#year").textContent = new Date().getFullYear();

// Deep link: #app/yachtall opens that app once the boot finishes.
phoneReady.then(() => {
  const m = location.hash.match(/^#app\/([\w-]+)/);
  if (m && byId[m[1]]) setTimeout(() => launch(m[1]), 400);
});
