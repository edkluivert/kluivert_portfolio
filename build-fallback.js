// Regenerates the <noscript> fallback in index.html from data.js, so search
// engines, link scrapers and no-JS visitors still get every app and link.
// Run after editing data.js:  node build-fallback.js
const fs = require("fs");
const vm = require("vm");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(__dirname + "/data.js", "utf8"), ctx);
const { APPS, SIDE, JOBS } = ctx.window;
const e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const html = `<noscript>
  <div class="wrap nojs">
    <h2>Apps I've shipped</h2>
    <ul>
${APPS.map((a) => `      <li><b>${e(a.name)}</b> (${e(a.client)}, ${e(a.year)}): ${e(a.blurb)} ${a.stores.play ? `<a href="${a.stores.play}">Google Play</a>` : ""} ${a.stores.ios ? `<a href="${a.stores.ios}">App Store</a>` : ""}</li>`).join("\n")}
    </ul>
    <h2>My own projects</h2>
    <ul>
${SIDE.map((p) => `      <li><b>${e(p.name)}</b>: ${e(p.blurb)}${p.repo ? ` <a href="${p.repo}">Source</a>` : ""}</li>`).join("\n")}
    </ul>
    <h2>Experience</h2>
    <ul>
${JOBS.map((j) => `      <li><b>${e(j.co)}</b>, ${e(j.role)} (${e(j.when)})${j.body ? `: ${e(j.body)}` : ""}</li>`).join("\n")}
    </ul>
  </div>
</noscript>`;
const p = __dirname + "/index.html";
const src = fs.readFileSync(p, "utf8");
const out = src.replace(/<!-- fallback:start -->[\s\S]*?<!-- fallback:end -->/, `<!-- fallback:start -->\n${html}\n<!-- fallback:end -->`);
if (out === src && !src.includes("fallback:start")) throw new Error("fallback markers missing in index.html");
fs.writeFileSync(p, out);
console.log(`fallback: ${APPS.length} apps, ${SIDE.length} projects, ${JOBS.length} jobs`);
