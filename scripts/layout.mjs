export const NAV = [
  ["index.html", "Начало"],
  ["predizvikatelstva.html", "Предизвикателства"],
  ["sektori.html", "Сектори"],
  ["metodi.html", "Методи"],
  ["kontakti.html", "Контакти"],
];

export const METHODS = {
  swot: "SWOT анализ",
  porter: "Петте сили на Портър",
  ansoff: "Матрица на Ансоф",
  "value-chain": "Верига на стойността",
  bmc: "Канава на бизнес модела",
  bsc: "Балансирана система от показатели",
};

export const arrow = `<span class="arrow" aria-hidden="true">→</span>`;

export const methodTag = (id) =>
  `<a class="tag" href="metodi.html#${id}"><span class="tag__dot" aria-hidden="true"></span>${METHODS[id]}</a>`;

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
        <span class="brand__text">
          <span class="brand__name">МСП Компас</span>
          <span class="brand__sub t-label">MSP Compass</span>
        </span>
      </${tag}>`;

export function page({ file, title, description, main }) {
  const navItems = NAV.map(
    ([href, label]) =>
      `<li><a class="nav__link" href="${href}"${href === file ? ' aria-current="page"' : ""}>${label}</a></li>`
  ).join("\n            ");

  return `<!doctype html>
<html lang="bg">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#0D2240">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&family=Spectral:ital,wght@0,500;0,600;0,700;1,500&display=swap">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/styles.css">
  <script>try{var t=localStorage.getItem("msp-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
</head>
<body>
  ${symbols}
  <a class="skip-link" href="#main">Към съдържанието</a>

  <header class="site-header">
    <div class="container site-header__inner">
      ${brand()}
      <nav class="nav" aria-label="Основна навигация">
        <ul class="nav__list" id="nav-list" role="list" data-open="false">
            ${navItems}
        </ul>
        <a class="btn btn--primary nav__cta" href="kontakti.html">Опишете казуса</a>
        <button class="icon-btn theme-toggle" type="button" aria-label="Смени светла/тъмна тема">
          <svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>
          <svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <button class="icon-btn nav-toggle" type="button" aria-controls="nav-list" aria-expanded="false" aria-label="Меню">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
        </button>
      </nav>
    </div>
  </header>

  <main id="main">
${main}
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer__grid">
        <div class="stack">
          ${brand("div")}
          <p class="footer__tagline">Посока. Яснота. Решения. Растеж.</p>
          <p class="t-small" style="max-width:36ch">Стратегическите рамки на водещите консултантски компании, приложени към българските малки и средни предприятия.</p>
        </div>
        <div class="stack stack--sm">
          <p class="t-label" style="color:var(--color-text-muted)">Навигация</p>
          <ul class="footer__list">
            ${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("\n            ")}
          </ul>
        </div>
        <div class="stack stack--sm">
          <p class="t-label" style="color:var(--color-text-muted)">Методи</p>
          <ul class="footer__list">
            ${Object.entries(METHODS).map(([id, n]) => `<li><a href="metodi.html#${id}">${n}</a></li>`).join("\n            ")}
          </ul>
        </div>
      </div>
      <div class="footer__base t-small">
        <span>© <span data-year>2026</span> МСП Компас</span>
        <span class="t-label">N 000° · Посока</span>
      </div>
    </div>
  </footer>

  <script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}
