// Shared header, footer and graphic components used by build-pages.mjs.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { METHODS, CHALLENGES, SECTORS, method, area } from "./content.mjs";

// CSS and JS are inlined into every page so each HTML file works on its own
// (opened from a zip, emailed, previewed), with no dependency on the assets/ folder.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const asset = (path) => readFileSync(resolve(ROOT, path), "utf8").trim();

export const arrow = `<span class="arrow" aria-hidden="true">→</span>`;

/* ---------- Method diagrams: each one is the method's real shape ---------- */
const DIAGRAMS = {
  swot: `<rect class="d-fill" x="70" y="10" width="88" height="88"/><rect class="d-line" x="70" y="10" width="88" height="88"/><rect class="d-line" x="162" y="10" width="88" height="88"/><rect class="d-gold-line" x="70" y="102" width="88" height="88"/><rect class="d-line" x="162" y="102" width="88" height="88"/><text class="d-text" x="114" y="62" text-anchor="middle">S</text><text class="d-text" x="206" y="62" text-anchor="middle">W</text><text class="d-text" x="114" y="154" text-anchor="middle">O</text><text class="d-text" x="206" y="154" text-anchor="middle">T</text>`,
  porter: `<path class="d-line" d="M160 46v26M160 128v26M80 100h52M188 100h52"/><circle class="d-line" cx="160" cy="26" r="20"/><circle class="d-line" cx="160" cy="174" r="20"/><circle class="d-line" cx="58" cy="100" r="20"/><circle class="d-line" cx="262" cy="100" r="20"/><circle class="d-fill" cx="160" cy="100" r="28"/><circle class="d-gold-line" cx="160" cy="100" r="28"/>`,
  ansoff: `<path class="d-line" d="M66 194V8M66 194h244"/><rect class="d-fill" x="76" y="106" width="108" height="80"/><rect class="d-line" x="76" y="106" width="108" height="80"/><rect class="d-line" x="192" y="106" width="108" height="80"/><rect class="d-line" x="76" y="18" width="108" height="80"/><rect class="d-line" x="192" y="18" width="108" height="80"/><path class="d-gold-line" d="M116 150 244 58"/><polygon class="d-gold" points="252,52 234,55 243,67"/>`,
  "value-chain": `<rect class="d-line" x="40" y="28" width="244" height="36"/><rect class="d-fill" x="40" y="28" width="244" height="36"/><path class="d-line" d="M40 92h36l12 34-12 34H40l12-34z"/><path class="d-line" d="M88 92h36l12 34-12 34H88l12-34z"/><path class="d-line" d="M136 92h36l12 34-12 34h-36l12-34z"/><path class="d-line" d="M184 92h36l12 34-12 34h-36l12-34z"/><path class="d-gold-line" d="M232 92h36l12 34-12 34h-36l12-34z"/>`,
  bmc: `<rect class="d-line" x="30" y="14" width="52" height="120"/><rect class="d-line" x="82" y="14" width="52" height="60"/><rect class="d-line" x="82" y="74" width="52" height="60"/><rect class="d-fill" x="134" y="14" width="52" height="120"/><rect class="d-gold-line" x="134" y="14" width="52" height="120"/><rect class="d-line" x="186" y="14" width="52" height="60"/><rect class="d-line" x="186" y="74" width="52" height="60"/><rect class="d-line" x="238" y="14" width="52" height="120"/><rect class="d-line" x="30" y="134" width="130" height="52"/><rect class="d-line" x="160" y="134" width="130" height="52"/>`,
  bsc: `<path class="d-line" d="M130 52 142 84M190 52 178 84M130 148 142 116M190 148 178 116"/><rect class="d-line" x="40" y="20" width="90" height="56"/><rect class="d-line" x="190" y="20" width="90" height="56"/><rect class="d-line" x="40" y="124" width="90" height="56"/><rect class="d-line" x="190" y="124" width="90" height="56"/><rect class="d-fill" x="40" y="20" width="90" height="56"/><circle class="d-fill" cx="160" cy="100" r="24"/><circle class="d-gold-line" cx="160" cy="100" r="24"/>`,
};

const ICONS = {
  cart: `<path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>`,
  factory: `<path d="M3 20V10l5 3v-3l5 3v-3l5 3V4h3v16zM7 16h2M12 16h2"/>`,
  briefcase: `<rect x="3" y="7" width="18" height="13" rx="1"/><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 13h18"/>`,
  cup: `<path d="M4 9h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10.5h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>`,
  build: `<path d="M3 20h18M5 20V10h6v10M13 20v-6h6v6M8 13v.01M8 16v.01M16 17v.01M4 10l4-5 4 5"/>`,
  truck: `<path d="M2 6h11v10H2zM13 9h4l3 3v4h-7z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>`,
};

export const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

export const art = (kind, tone = "navy", extra = "") => {
  const body = DIAGRAMS[kind]
    ? `<svg viewBox="0 0 320 200" aria-hidden="true">${DIAGRAMS[kind]}</svg>`
    : kind === "mark"
      ? `<svg viewBox="0 0 48 48" aria-hidden="true"><use href="#mark"/></svg>`
      : icon(kind);
  const cls = ["art", tone !== "navy" ? `art--${tone}` : "", DIAGRAMS[kind] ? "" : "art--icon", extra].filter(Boolean).join(" ");
  return `<div class="${cls}">${body}</div>`;
};

export const methodTag = (id) => `<a class="tag" href="${method(id).file}">${method(id).name}</a>`;

/** Insight card (Bain "featured insight" pattern). */
export const insight = ({ href, type, title, meta = "", excerpt = "", artHtml, lead = false, h = "h3", attrs = "" }) => `<a class="insight${lead ? " insight--lead" : ""}" href="${href}"${attrs}>
            ${artHtml}
            <div class="insight__body">
              <p class="t-label t-label--accent">${type}</p>
              <${h} class="insight__title">${title}</${h}>
              ${excerpt ? `<p class="t-body">${excerpt}</p>` : ""}
              ${meta ? `<p class="insight__meta t-small">${meta}</p>` : ""}
            </div>
          </a>`;

export const methodInsight = (m, opts = {}) =>
  insight({
    href: m.file,
    type: `Метод · ${area(m.area).short}`,
    title: m.name,
    excerpt: opts.excerpt ? `„${m.q}“` : "",
    meta: `<span>${m.time}</span><span>${m.result}</span>`,
    artHtml: art(m.id, m.art),
    ...opts,
  });

/* ---------- Header ---------- */
const chev = `<svg class="nav__chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg>`;

const MEGA = [
  {
    id: "challenges", label: "Предизвикателства", href: "predizvikatelstva.html",
    files: ["predizvikatelstva.html"],
    intro: "Започнете от проблема, който виждате всеки ден. Всяка ситуация води до една или две рамки.",
    links: CHALLENGES.map((c) => [`predizvikatelstva.html#${c.id}`, c.title]),
    feature: { href: "predizvikatelstva.html#marzh", type: "Предизвикателство", title: "Оборотът расте, печалбата не", artHtml: art("value-chain", "navy") },
  },
  {
    id: "sectors", label: "Сектори", href: "sektori.html",
    files: ["sektori.html"],
    intro: "Една и съща рамка изглежда различно в ресторант и в транспортна фирма.",
    links: SECTORS.map((s) => [`sektori.html#${s.id}`, s.name]),
    feature: { href: "sektori.html#horeka", type: "Сектор", title: "ХоРеКа: сезонност и разходи в кухнята", artHtml: art("cup", "gold") },
  },
  {
    id: "methods", label: "Методи", href: "metodi.html",
    files: ["metodi.html", ...METHODS.map((m) => m.file)],
    intro: "Шест рамки на водещите консултантски компании, описани стъпка по стъпка.",
    links: METHODS.map((m) => [m.file, m.name]),
    feature: { href: "metod-swot.html", type: "Метод", title: "SWOT анализ за 90 минути", artHtml: art("swot", "teal") },
  },
];

const PLAIN = [["podhod.html", "Подход"], ["kontakti.html", "Контакти"]];

function navHtml(file) {
  const megas = MEGA.map((m) => `<li class="nav__item">
            <button class="nav__link nav__trigger${m.files.includes(file) ? " is-current" : ""}" type="button" aria-expanded="false" aria-controls="mega-${m.id}">${m.label}${chev}</button>
            <div class="mega" id="mega-${m.id}" hidden>
              <div class="container mega__inner">
                <div class="mega__intro">
                  <p class="t-h3">${m.label}</p>
                  <p class="t-body">${m.intro}</p>
                  <a class="link-arrow" href="${m.href}">Всички ${m.label.toLowerCase()} ${arrow}</a>
                </div>
                <ul class="mega__links">
                  ${m.links.map(([h, l]) => `<li><a href="${h}">${l}<span class="arrow" aria-hidden="true">→</span></a></li>`).join("\n                  ")}
                  <li class="mega__all"><a href="${m.href}">Преглед на всички<span class="arrow" aria-hidden="true">→</span></a></li>
                </ul>
                <a class="mega__feature" href="${m.feature.href}">
                  ${m.feature.artHtml}
                  <p class="t-label t-label--accent">${m.feature.type}</p>
                  <p class="t-h4">${m.feature.title}</p>
                </a>
              </div>
            </div>
          </li>`);
  const plain = PLAIN.map(([h, l]) => `<li class="nav__item"><a class="nav__link" href="${h}"${h === file ? ' aria-current="page"' : ""}>${l}</a></li>`);
  return [...megas, ...plain].join("\n          ");
}

const symbols = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="mark" viewBox="0 0 48 48">
      <circle class="mark-ring" cx="24" cy="24" r="21.5"/>
      <polygon class="mark-ew" points="45,24 24,20 24,28"/>
      <polygon class="mark-ew" points="3,24 24,20 24,28"/>
      <polygon class="mark-n" points="24,2.5 28.5,24 19.5,24"/>
      <polygon class="mark-s" points="24,45.5 28.5,24 19.5,24"/>
      <circle class="mark-hub" cx="24" cy="24" r="3"/>
    </symbol>
  </svg>`;

const brand = (tag = "a") => `<${tag} class="brand"${tag === "a" ? ' href="index.html" aria-label="МСП Компас, начало"' : ""}>
        <svg class="brand__mark" aria-hidden="true"><use href="#mark"/></svg>
        <span class="brand__text"><span class="brand__name">МСП Компас</span><span class="brand__sub">MSP Compass</span></span>
      </${tag}>`;

const footerCol = (title, links) => `<div class="stack stack--sm">
          <p class="t-label t-label--gold">${title}</p>
          <ul class="footer__list">
            ${links.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("\n            ")}
          </ul>
        </div>`;

export function page({ file, title, description, main }) {
  return `<!doctype html>
<html lang="bg">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#0D2240">
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(asset("assets/img/favicon.svg"))}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,700;1,400&display=swap">
  <style>
${asset("assets/css/tokens.css")}

${asset("assets/css/styles.css")}
  </style>
  <script>try{var t=localStorage.getItem("msp-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
</head>
<body>
  ${symbols}
  <a class="skip-link" href="#main">Към съдържанието</a>

  <div class="utility">
    <div class="container utility__inner">
      <span class="utility__note">Стратегия за малкия и средния бизнес в България</span>
      <div class="utility__links">
        <a href="podhod.html">За МСП Компас</a>
        <a href="kontakti.html">Контакти</a>
        <span aria-label="Език: български">БГ</span>
      </div>
    </div>
  </div>

  <header class="site-header">
    <div class="container site-header__inner">
      ${brand()}
      <nav class="nav" aria-label="Основна навигация">
        <ul class="nav__list" id="nav-list" role="list" data-open="false">
          ${navHtml(file)}
        </ul>
        <div class="nav__actions">
          <a class="btn btn--primary nav__cta" href="kontakti.html">Опишете казуса</a>
          <button class="icon-btn theme-toggle" type="button" aria-label="Смени светла/тъмна тема">
            <svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>
            <svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          </button>
          <button class="icon-btn nav-toggle" type="button" aria-controls="nav-list" aria-expanded="false" aria-label="Меню">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
          </button>
        </div>
      </nav>
    </div>
  </header>

  <main id="main">
${main}
  </main>

  <footer class="site-footer on-inverse">
    <div class="container">
      <div class="footer__top">
        <div class="stack stack--md">
          ${brand("div")}
          <p class="footer__statement">Посока. Яснота. Решения. Растеж.</p>
        </div>
        ${footerCol("Предизвикателства", CHALLENGES.map((c) => [`predizvikatelstva.html#${c.id}`, c.title]))}
        ${footerCol("Сектори", SECTORS.map((s) => [`sektori.html#${s.id}`, s.name]))}
        ${footerCol("Методи", METHODS.map((m) => [m.file, m.name]))}
        ${footerCol("МСП Компас", [["index.html", "Начало"], ["podhod.html", "Нашият подход"], ["kontakti.html", "Контакти"]])}
      </div>
      <div class="footer__base">
        <span>© <span data-year>2026</span> МСП Компас. Всички права запазени.</span>
        <span>Стратегическите рамки на водещите консултантски компании, за българските МСП.</span>
      </div>
    </div>
  </footer>

  <script>
${asset("assets/js/main.js")}
  </script>
</body>
</html>
`;
}
