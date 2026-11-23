// All site content lives here. app.js renders it into the phone, the ls list,
// the palette and the shell, so a new app only needs one entry.

const PLAY = "https://play.google.com/store/apps/details?id=";

window.APPS = [
  {
    id: "tharwa-ev", name: "Tharwa EV", short: "Tharwa EV", icon: "assets/apps/tharwa-ev.png",
    client: "Funkash", year: "2026", pkg: "com.funkash.tharwa",
    stores: { play: PLAY + "com.funkash.tharwa", ios: "https://apps.apple.com/us/app/tharwa-ev/id6782017676" },
    kind: "Driver app · Nigeria", stat: "Play · App Store",
    blurb: "Nigeria's multi-operator EV-charging app, one of two enterprise apps I build and run at Funkash. Drivers find stations nearby or along a route, with live connector, price and availability data. They fund one wallet, pay any operator in the app, then start a charging session and follow it in real time.",
    tags: ["Flutter", "Bloc", "Clean architecture", "Google Maps", "Wallet & payments", "Real-time"],
  },
  {
    id: "tharwa-operator", name: "Tharwa EV Operator", short: "Operator", icon: "assets/apps/tharwa-operator.png",
    client: "Funkash", year: "2026", pkg: "com.funkash.tharwa_operator",
    stores: { play: PLAY + "com.funkash.tharwa_operator", ios: "https://apps.apple.com/us/app/tharwa-ev-operator/id6799672248" },
    kind: "Operator companion", stat: "Play · App Store",
    blurb: "The forecourt companion to the Tharwa EV Operator Portal, for the people who run charging stations. It shows a live queue of who is waiting, charging and next, upcoming driver bookings, walk-ins booked on the spot, and station details. It is deliberately lean, and it is built on the same architecture and visual language as the driver app.",
    tags: ["Flutter", "Bloc", "Queue management", "Bookings", "Shared design system"],
  },
  {
    id: "custovia", name: "Custovia", short: "Custovia", icon: "assets/apps/custovia.png",
    client: "Concept Colony", year: "2026", pkg: "com.conceptcolony.custovia",
    stores: { play: PLAY + "com.conceptcolony.custovia", ios: "https://apps.apple.com/us/app/custovia/id6813105939" },
    kind: "Service marketplace", stat: "Play · App Store",
    blurb: "A marketplace that connects customers with service providers. I built it from scratch and owned every release: passkey sign-in with cross-device revocation, a wallet and escrow payments, bookings, chat, disputes and push-driven notification routing.",
    tags: ["Flutter", "Bloc", "Passkeys", "Payments", "WebSockets", "Firebase"],
  },
  {
    id: "acire23", name: "Acire23 Network", short: "Acire23", icon: "assets/apps/acire23.png",
    client: "Bitex Consultancy, US", year: "2024–26", pkg: "com.acire.app",
    stores: { play: PLAY + "com.acire.app" },
    kind: "User app + provider app", stat: "Google Play",
    blurb: "A two-sided real-estate and home-services platform. I led both apps end to end: property discovery and requests on the user side; listing uploads, notifications and job management on the provider side. Property posting time halved and search engagement rose 40%.",
    tags: ["Flutter", "Real-time notifications", "Very Good CLI", "REST"],
    metrics: [["−50%", "posting time"], ["+40%", "search engagement"]],
  },
  {
    id: "myslates", name: "MySlates", short: "MySlates", icon: "assets/apps/myslates.png",
    client: "Asataura", year: "2024–26", pkg: "com.ATS.MySlates",
    stores: { play: PLAY + "com.ATS.MySlates" },
    kind: "Students · Parents · Teachers · Admin", stat: "5K+ installs · 4.1★",
    blurb: "A school platform made up of four apps. I built the results and report-card system that parents and teachers rely on, gamified quizzes for students, and real-time reporting dashboards for administrators. Course completion rose 40% after the gamified modules shipped.",
    tags: ["Flutter", "EdTech", "Gamification", "Dashboards"],
    metrics: [["5K+", "installs"], ["4.1★", "rating"], ["+40%", "completion"]],
  },
  {
    id: "yachtall", name: "Yachtall", short: "Yachtall", icon: "assets/apps/yachtall.png",
    client: "Yachtino GmbH, Germany", year: "2022–24", pkg: "com.yachtinogmbh.yachtall",
    stores: { play: PLAY + "com.yachtinogmbh.yachtall", ios: "https://apps.apple.com/app/yachtall-com/id977617537" },
    kind: "Boat marketplace · 7 languages", stat: "10K+ installs · 4.2★",
    blurb: "Europe's boat marketplace on mobile. I took over the app, fixed its design flaws, rebuilt the API integration and worked with the web team on shared services. Feature adoption rose 30% and data errors fell by a quarter.",
    tags: ["Flutter", "Marketplace", "Localisation", "Legacy modernisation"],
    metrics: [["10K+", "installs"], ["+30%", "adoption"], ["−25%", "data errors"]],
  },
  {
    id: "boote", name: "Boote Yachten", short: "Boote", icon: "assets/apps/boote-yachten.png",
    client: "Yachtino GmbH, Germany", year: "2022–24", pkg: "com.yachtinogmbh.boote_yachten",
    stores: { play: PLAY + "com.yachtinogmbh.boote_yachten", ios: "https://apps.apple.com/app/boote-yachten/id1243371300" },
    kind: "German market", stat: "5K+ installs",
    blurb: "The German-market sister app to Yachtall. I brought Yachtall's core across as reusable components, tuned search and filtering, and made the catalogue more responsive.",
    tags: ["Flutter", "Reusable components", "Search"],
  },
  {
    id: "happycharter", name: "Happycharter", short: "Happycharter", icon: "assets/apps/happycharter.png",
    client: "Yachtino GmbH, Germany", year: "2022–24", pkg: "com.yachtinogmbh.happy_charter",
    stores: { play: PLAY + "com.yachtinogmbh.happy_charter", ios: "https://apps.apple.com/app/happycharter/id6469506685" },
    kind: "Charter boats worldwide", stat: "Play · App Store",
    blurb: "Boat charter search across Croatia, Italy, France, Spain, Greece and beyond. I led the project setup and the API framework, then built the search and bookmark flows that get most of the use.",
    tags: ["Flutter", "API framework", "Search", "Bookmarks"],
  },
  {
    id: "swayspa", name: "SwaySpa", short: "SwaySpa", icon: "assets/apps/swayspa.png",
    client: "Asataura", year: "2024–26", pkg: "com.ats.sway_spa",
    stores: { play: PLAY + "com.ats.sway_spa", ios: "https://apps.apple.com/app/swayspa/id6759058782" },
    kind: "Spa discovery & booking", stat: "4.6★ · Play · App Store",
    blurb: "Spa discovery and booking. I automated the backend processes behind listings and content delivery, which cut the client's cost of running the platform by a quarter.",
    tags: ["Flutter", "Bookings", "Automation"],
    metrics: [["4.6★", "rating"], ["−25%", "ops cost"]],
  },
  {
    id: "limpiador", name: "Limpiador", short: "Limpiador", icon: "assets/apps/limpiador.png",
    client: "Limpiar", year: "2024", pkg: "com.limpiador.agent2",
    stores: { play: PLAY + "com.limpiador.agent2", ios: "https://apps.apple.com/gb/app/limpiador/id6480585258" },
    kind: "Agent app · property services", stat: "Play · App Store",
    blurb: "The agent app for a cleaning and property-services company: secure sign-in with a guest mode, task tracking, analytics and e-wallet payments. Retention rose 25% and login support requests fell.",
    tags: ["Flutter", "Guest mode", "E-wallet", "Analytics"],
    metrics: [["+25%", "retention"]],
  },
];

window.SIDE = [
  {
    id: "awahymn", name: "Awa Hymn", short: "Awa Hymn", letter: "A", hue: 28,
    kind: "Personal · Android · released", pkg: "com.jitae.awa_hymn", status: "released",
    shot: "assets/shots/awa_hymn.png",
    blurb: "My own hymn book: search by number, word or lyric, favourites, categories and a hymn of the day. I moved it from GetX to Bloc with clean architecture and dependency injection, and users saw no change.",
    tags: ["Flutter", "Bloc", "GoRouter", "Migration"],
  },
  {
    id: "cordon", name: "Cordon", short: "Cordon", letter: "C", hue: 350,
    kind: "Android · privacy guard", status: "in development · private",
    blurb: "Protects people from loan apps that harvest their data. It runs a suspect app inside a sandbox and feeds it fake contacts, messages, call logs and location, while logging every access attempt.",
    tags: ["Kotlin", "App virtualisation", "Sandboxing"],
  },
  {
    id: "crisp", name: "Crisp", short: "Crisp", letter: "Cr", hue: 145,
    kind: "HD to WhatsApp Status", status: "complete · open source",
    repo: "https://github.com/edkluivert/crisp",
    blurb: "Posts photos and video to WhatsApp Status without the quality turning to mush. It encodes on the device so the media survives WhatsApp's compressor, then delivers through the WhatsApp Cloud API.",
    tags: ["Flutter", "Media encoding", "WhatsApp Cloud API"],
  },
  {
    id: "shuttle", name: "Shuttle", short: "Shuttle", letter: "S", hue: 210,
    kind: "Local file transfer", status: "complete · open source",
    repo: "https://github.com/edkluivert/Shuttle",
    blurb: "Moves files between nearby devices over the network they already share, or over USB when there isn't one. There's no account, nothing leaves the LAN, and the other device doesn't need anything installed.",
    tags: ["Flutter", "LAN & USB", "Networking"],
  },
];

window.PACKAGES = [
  { name: "translation_manager", v: "2.0.5", src: "pub.dev", url: "https://pub.dev/packages/translation_manager", note: "GetX-style .tr translations, no GetX. Locale detection + Bloc integration. 160 pts" },
  { name: "solid_x", v: "2.1.3", src: "pub.dev", url: "https://pub.dev/packages/solid_x", note: "ViewModel + StateFlow-style state management, zero codegen. 160 pts" },
  { name: "getx_exten", v: "2.0.6", src: "pub.dev", url: "https://pub.dev/packages/getx_exten", note: "Bloc-style GetListener / GetConsumer widgets for GetX. 160 pts" },
  { name: "mapbox_kit", v: "2.0.0", src: "dartpub", url: "https://dartpub.dev/plugins/mapbox_kit", note: "Mapbox Maps for DartNative over FFI. My most-installed plugin" },
  { name: "firebase_auth_kit", v: "1.0.0", src: "dartpub", url: "https://dartpub.dev/plugins/firebase_auth_kit", note: "Firebase Auth for DartNative in pure Dart, with a matching firestore_kit" },
  { name: "reanimated_dartnative", v: "0.2.0", src: "dartpub", url: "https://dartpub.dev/plugins/reanimated_dartnative", note: "Reanimated for DartNative: 60fps on the display clock, sensors over FFI" },
];

window.JOBS = [
  { co: "Funkash", role: "Mobile App Developer", when: "May 2026 – present", where: "Remote · Nigeria", head: true,
    body: "I build and run two enterprise Flutter apps, a corporate spend platform and an EV-charging platform, at a 99% crash-free rate on Android and iOS. Clean architecture and reusable components raised stability 35% and cut feature delivery time 30%.",
    note: "also May 2025 – Jan 2026" },
  { co: "Concept Colony", role: "Mobile App Developer · Contract", when: "Mar – Oct 2026", where: "Remote",
    body: "I built Custovia, a service marketplace with escrow payments, from the first commit to Google Play and the App Store: passkeys with cross-device revocation, KYC with liveness checks, a wallet, disputes and real-time chat over WebSockets." },
  { co: "Bitex Consultancy", role: "Mobile App Developer", when: "Sep 2024 – Feb 2026", where: "Remote · United States",
    body: "I led the Acire23 user and provider apps end to end, plus an events app for property launches. Performance monitoring and systematic fixes cut support tickets 30%." },
  { co: "Asataura", role: "Flutter Developer", when: "Aug 2024 – Jan 2026", where: "Remote · Kano, Nigeria",
    body: "MySlates for students, parents, teachers and admins, plus SwaySpa and FluxesSpark Parents. I built gamified learning and real-time reporting and redesigned onboarding." },
  { co: "Expectoo", role: "Flutter Developer", when: "May 2022 – Sep 2024", where: "Remote · Germany",
    body: "I modernised Yachtino's legacy Flutter apps (Yachtall, Boote Yachten and Happycharter), cutting maintenance cost 20% and improving responsiveness 30% across production releases." },
  { co: "Helixgade", role: "Mobile App Developer", when: "Apr – Jul 2021", where: "Remote",
    body: "A secure electronic-voting app on Flutter and Firebase, a marketplace rebuilt on Cloud Firestore, and a real-time task manager." },
  { co: "Zebulon Developers", role: "Android Developer", when: "Jan – Mar 2021", where: "Remote",
    body: "A photography app with an image-processing pipeline and a redesigned event-discovery flow, built in native Android." },
  { co: "Andela", role: "Mentor, Google Developers Program", when: "2019 – 2020", where: "Remote",
    body: "I mentored an Android cohort with weekly tasks and code reviews, and completion rates rose 30%." },
  { co: "University of Port Harcourt", role: "B.Sc. Mathematics and Statistics", when: "2023", where: "Rivers, Nigeria", edu: true },
];

// Store screenshots, downloaded from each app's App Store / Google Play listing
// into assets/store/<id>/1..n.
const STORE_SHOTS = {
  "tharwa-ev": [5, "webp"], "tharwa-operator": [6, "webp"], custovia: [6, "webp"], acire23: [5, "webp"],
  myslates: [4, "webp"], yachtall: [4, "webp"], boote: [5, "webp"], happycharter: [5, "webp"],
  swayspa: [6, "webp"], limpiador: [5, "webp"],
};
for (const a of window.APPS) {
  const s = STORE_SHOTS[a.id];
  if (s) a.screens = Array.from({ length: s[0] }, (_, i) => `assets/store/${a.id}/${i + 1}.${s[1]}`);
  delete a.shot;
}
for (const p of window.SIDE) if (p.shot) p.screens = [p.shot];

// Screen recordings: drop a short muted clip at assets/store/<id>/demo.mp4 and
// list the id here. It plays first in the app page's carousel.
const VIDEOS = [];
for (const id of VIDEOS) { const a = window.APPS.find((x) => x.id === id); if (a) a.video = `assets/store/${id}/demo.mp4`; }
