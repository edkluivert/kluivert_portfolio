// ---------------------------------------------------------------------------
// Kluivert Edegware — portfolio behaviour
// Small, dependency-free. Every effect checks prefers-reduced-motion.
// ---------------------------------------------------------------------------

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

// The previous version of this site was a Flutter web build that registered a
// service worker; visitors who saw it would otherwise keep getting the cached
// old page. Drop any registration and its caches.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  if (window.caches) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
}

// ---------- theme: follow the system unless the visitor picks one ----------
(function theme() {
  const root = document.documentElement;
  const btn = document.getElementById("theme");
  let stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch (_) {}
  if (stored === "dark" || stored === "light") root.dataset.theme = stored;

  const current = () =>
    root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  function paint() {
    const dark = current() === "dark";
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    btn.textContent = dark ? "☼" : "☾";
  }

  function apply(next) {
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (_) {}
    paint();
  }

  btn.addEventListener("click", (e) => {
    const next = current() === "dark" ? "light" : "dark";
    // Circular wipe from the button, where the browser supports view transitions.
    if (!reduced && document.startViewTransition) {
      const x = e.clientX || btn.getBoundingClientRect().left + 19;
      const y = e.clientY || btn.getBoundingClientRect().top + 19;
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const t = document.startViewTransition(() => apply(next));
      t.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 520, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      });
    } else {
      apply(next);
    }
  });
  paint();
})();

// ---------- shelf: stagger, tilt toward the cursor, dock magnification ----------
(function shelf() {
  const wrap = document.querySelector(".shelf-wrap");
  const shelf = document.querySelector(".shelf");
  if (!shelf) return;
  const icons = [...shelf.querySelectorAll("a")];
  icons.forEach((a, i) => {
    a.style.setProperty("--i", i);
    a.style.setProperty("--tilt", `${((i * 7) % 5) - 2}deg`);
  });
  if (reduced || !finePointer) return;

  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (e) => {
    const r = shelf.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    shelf.style.setProperty("--ry", `${(dx * 10).toFixed(2)}deg`);
    shelf.style.setProperty("--rx", `${(-dy * 10).toFixed(2)}deg`);
  });
  hero.addEventListener("pointerleave", () => {
    shelf.style.setProperty("--ry", "0deg");
    shelf.style.setProperty("--rx", "0deg");
  });

  // Dock effect: icons near the cursor grow, falling off with distance.
  shelf.addEventListener("pointermove", (e) => {
    icons.forEach((a) => {
      const r = a.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      const s = 1 + Math.max(0, 1 - d / 170) * 0.22;
      a.style.setProperty("--s", s.toFixed(3));
    });
  });
  shelf.addEventListener("pointerleave", () => icons.forEach((a) => a.style.removeProperty("--s")));
  wrap && wrap.addEventListener("pointerleave", () => icons.forEach((a) => a.style.removeProperty("--s")));
})();

// ---------- facts count up ----------
(function counters() {
  const els = document.querySelectorAll("[data-count]");
  if (reduced) return;
  els.forEach((el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const dur = 1100;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 650);
  });
})();

// ---------- cursor spotlight on app rows ----------
if (finePointer && !reduced) {
  document.querySelectorAll(".app").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

// ---------- magnetic buttons ----------
if (finePointer && !reduced) {
  document.querySelectorAll(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.transform = `translate(${(x * 8).toFixed(1)}px, ${(y * 8).toFixed(1)}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}

// ---------- nav pill follows the section in view; header shrinks ----------
(function nav() {
  const nav = document.querySelector(".nav");
  const pill = nav && nav.querySelector(".pill");
  const links = nav ? [...nav.querySelectorAll("a")] : [];
  const top = document.querySelector(".top");

  function moveTo(link) {
    links.forEach((l) => l.classList.toggle("active", l === link));
    if (!pill) return;
    if (!link) {
      nav.style.setProperty("--po", 0);
      return;
    }
    nav.style.setProperty("--px", `${link.offsetLeft}px`);
    nav.style.setProperty("--pw", `${link.offsetWidth}px`);
    nav.style.setProperty("--po", 1);
  }

  const sections = links.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) moveTo(links.find((l) => l.getAttribute("href") === `#${en.target.id}`));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      top.classList.toggle("scrolled", scrollY > 40);
      if (scrollY < 200) moveTo(null);
      ticking = false;
    });
  }, { passive: true });
})();

// ---------- footer year ----------
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
