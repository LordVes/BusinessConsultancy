// Shared header, footer, language toggle and small components used by build-pages.mjs.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// CSS and JS are inlined into every page so each HTML file works on its own
// (opened from a zip, emailed, previewed), with no dependency on the assets/ folder.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const asset = (path) => readFileSync(resolve(ROOT, path), "utf8").trim();

export const arrow = `<span class="arrow" aria-hidden="true">→</span>`;

/* ---------- Bilingual helpers ----------
   Both languages ship in the HTML. <html data-lang="bg|en"> decides which one shows
   (see styles.css "Language toggle" and main.js). Bulgarian is the default and the
   language search engines index. */
export const t = (bg, en) => `<span data-l="bg">${bg}</span><span data-l="en" lang="en">${en}</span>`;
export const tb = (bg, en, tag = "div", attrs = "") =>
  `<${tag} data-l="bg"${attrs}>${bg}</${tag}><${tag} data-l="en" lang="en"${attrs}>${en}</${tag}>`;

export const icon = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const ICONS = {
  doc: `<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>`,
  gauge: `<path d="M4 16a8 8 0 1 1 16 0"/><path d="m12 16 4-5"/><circle cx="12" cy="16" r="1.2"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/>`,
};

export const art = (kind, tone = "navy", extra = "") => {
  const body = kind === "mark"
    ? `<svg viewBox="0 0 48 48" aria-hidden="true"><use href="#mark"/></svg>`
    : icon(ICONS[kind]);
  const cls = ["art", tone !== "navy" ? `art--${tone}` : "", kind === "mark" ? "" : "art--icon", extra].filter(Boolean).join(" ");
  return `<div class="${cls}">${body}</div>`;
};

/** Insight card (Bain "featured insight" pattern). */
export const insight = ({ href, type, title, meta = "", excerpt = "", artHtml, lead = false, h = "h3" }) => `<a class="insight${lead ? " insight--lead" : ""}" href="${href}">
            ${artHtml}
            <div class="insight__body">
              <p class="t-label t-label--accent">${type}</p>
              <${h} class="insight__title">${title}</${h}>
              ${excerpt ? `<p class="t-body">${excerpt}</p>` : ""}
              ${meta ? `<p class="insight__meta t-small">${meta}</p>` : ""}
            </div>
          </a>`;

/* ---------- Navigation ---------- */
export const NAV = [
  { href: "index.html", bg: "Начало", en: "Home" },
  { href: "analizi.html", bg: "Анализи", en: "Whitepapers", also: ["digitalna-zrelost-sredni-iznositeli.html"] },
  { href: "samoocenka-digitalna-zrelost.html", bg: "Самооценка", en: "Self-assessment" },
  { href: "kontakti.html", bg: "Контакти", en: "Contact" },
];

const navHtml = (file) => NAV.map((n) => {
  const current = n.href === file || (n.also || []).includes(file);
  return `<li class="nav__item"><a class="nav__link" href="${n.href}"${current ? ' aria-current="page"' : ""}>${t(n.bg, n.en)}</a></li>`;
}).join("\n          ");

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

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Full HTML document.
 * @param {object} o
 * @param {string} o.file        output file name (for the current-page marker)
 * @param {string} o.title       Bulgarian <title>
 * @param {string} o.titleEn     English <title>, swapped in by the language toggle
 * @param {string} o.description Bulgarian meta description
 * @param {string} o.main        page body
 * @param {string} [o.head]      extra <head> markup (Open Graph, JSON-LD)
 * @param {string} [o.script]    extra inline JS for this page only
 */
export function page({ file, title, titleEn, description, main, head = "", script = "" }) {
  return `<!doctype html>
<html lang="bg" data-lang="bg" data-title-bg="${esc(title)}" data-title-en="${esc(titleEn || title)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#0D2240">
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(asset("assets/img/favicon.svg"))}">
  <meta property="og:site_name" content="МСП Компас">
  <meta property="og:locale" content="bg_BG">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
${head}
  <link rel="preload" href="assets/fonts/source-serif-4-cyrillic-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/source-sans-3-cyrillic-normal.woff2" as="font" type="font/woff2" crossorigin>
  <style>
${asset("assets/css/fonts.css")}

${asset("assets/css/tokens.css")}

${asset("assets/css/styles.css")}
  </style>
  <script>try{var d=document.documentElement,t=localStorage.getItem("msp-theme"),l=localStorage.getItem("msp-lang");if(t==="light"||t==="dark")d.setAttribute("data-theme",t);if(l==="en"){d.setAttribute("data-lang","en");d.lang="en";document.title=d.getAttribute("data-title-en")}}catch(e){}</script>
</head>
<body>
  ${symbols}
  <a class="skip-link" href="#main">${t("Към съдържанието", "Skip to content")}</a>

  <div class="utility">
    <div class="container utility__inner">
      <span class="utility__note">${t("Анализи и подходи за българските средни предприятия износители", "Insights and approaches for Bulgarian export-oriented mid-sized firms")}</span>
      <div class="utility__links">
        <div class="lang-toggle" role="group" aria-label="Език / Language">
          <button type="button" data-set-lang="bg" aria-pressed="true" lang="bg">БГ</button>
          <button type="button" data-set-lang="en" aria-pressed="false" lang="en">EN</button>
        </div>
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
      <div class="footer__top footer__top--slim">
        <div class="stack stack--md">
          ${brand("div")}
          <p class="footer__statement">${t("Посока. Яснота. Решения. Растеж.", "Direction. Clarity. Decisions. Growth.")}</p>
        </div>
        <div class="stack stack--sm">
          <p class="t-label t-label--gold">${t("Сайт", "Site")}</p>
          <ul class="footer__list">
            ${NAV.map((n) => `<li><a href="${n.href}">${t(n.bg, n.en)}</a></li>`).join("\n            ")}
          </ul>
        </div>
      </div>
      <div class="footer__base">
        <span>© <span data-year>2026</span> ${t("МСП Компас. Всички права запазени.", "MSP Compass. All rights reserved.")}</span>
        <span>${t("Сайтът не използва бисквитки за проследяване и не събира данни от самооценката.", "This site uses no tracking cookies and collects no self-assessment data.")}</span>
      </div>
    </div>
  </footer>

  <script>
${asset("assets/js/main.js")}
  </script>${script ? `\n  <script>\n${script}\n  </script>` : ""}
</body>
</html>
`;
}
