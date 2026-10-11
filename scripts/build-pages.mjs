// Generates every HTML page from scripts/content.mjs + the shared layout in scripts/layout.mjs.
// Run: node scripts/build-pages.mjs
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AREAS, METHODS, CHALLENGES, SECTORS, PRINCIPLES, EMAIL, method, area } from "./content.mjs";
import { page, arrow, art, icon, insight, methodInsight, methodTag } from "./layout.mjs";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let count = 0;
const write = (file, title, description, main) => {
  writeFileSync(resolve(OUT, file), page({ file, title, description, main }));
  count++;
};

/* ---------- shared blocks ---------- */
const splitCta = (title = "Имате конкретен казус?", text = "Опишете ситуацията с няколко изречения. До два работни дни ще ви посочим рамка и първа стъпка.") => `
    <section class="section section--flush-top" aria-label="Контакт">
      <div class="container">
        <div class="split">
          ${art("mark", "navy", "on-inverse")}
          <div class="split__body">
            <p class="t-label t-label--accent">Говорете с нас</p>
            <h2 class="t-h2">${title}</h2>
            <p class="t-lead">${text}</p>
            <a class="btn btn--primary btn--lg" href="kontakti.html">Опишете казуса ${arrow}</a>
          </div>
        </div>
      </div>
    </section>`;

const pageHero = ({ crumbs, label, title, lead, aside = "", extra = "" }) => `
    <section class="page-hero on-inverse">
      <div class="container page-hero__grid${aside ? " page-hero__grid--art" : ""}">
        <div class="page-hero__copy">
          <nav aria-label="Път"><ol class="crumbs">${crumbs.map(([h, l]) => (h ? `<li><a href="${h}">${l}</a></li>` : `<li aria-current="page">${l}</li>`)).join("")}</ol></nav>
          <p class="t-label t-label--gold">${label}</p>
          <h1 class="t-h1">${title}</h1>
          <p class="t-lead">${lead}</p>
          ${extra}
        </div>
        ${aside}
      </div>
    </section>`;

const rowLink = (href, title, sub = "") =>
  `<li><a class="row-link" href="${href}"><span>${title}${sub ? `<small>${sub}</small>` : ""}</span>${arrow}</a></li>`;

/* ================================================================ index */
write("index.html", "МСП Компас", "Стратегическите рамки на водещите консултантски компании, приложени към българските малки и средни предприятия.", `
    <section class="hero on-inverse" aria-labelledby="hero-title">
      <div class="container hero__grid">
        <div class="hero__copy">
          <span class="hero__rule" aria-hidden="true"></span>
          <h1 class="t-display" id="hero-title">Консултантското знание на най-добрите, отворено за българския бизнес.</h1>
          <p class="t-lead">Рамките, с които водещите консултантски компании работят за световни корпорации, обяснени на ясен език и приложени към реалностите на българските малки и средни предприятия.</p>
          <div class="hero__actions">
            <a class="btn btn--primary btn--lg" href="predizvikatelstva.html">Започнете от проблема ${arrow}</a>
            <a class="link-arrow" href="metodi.html">Разгледайте методите ${arrow}</a>
          </div>
        </div>
        <figure class="compass" aria-label="Компас с четирите принципа: Посока, Яснота, Решения, Растеж">
          <div class="compass__dial"></div>
          <div class="compass__ticks"></div>
          <div class="compass__ticks compass__ticks--major"></div>
          <svg class="compass__rose" viewBox="0 0 200 200" aria-hidden="true">
            <g transform="rotate(45 100 100)" style="fill:var(--color-border-default)">
              <polygon points="100,30 106,100 94,100"/><polygon points="100,170 106,100 94,100"/>
              <polygon points="30,100 100,94 100,106"/><polygon points="170,100 100,94 100,106"/>
            </g>
            <polygon points="100,4 100,100 88,100" style="fill:var(--color-accent-gold)"/>
            <polygon points="100,4 112,100 100,100" style="fill:var(--color-text-gold)"/>
            <polygon points="100,196 100,100 112,100" style="fill:var(--color-accent-teal)"/>
            <polygon points="100,196 88,100 100,100" style="fill:var(--color-text-accent)"/>
            <polygon points="196,100 100,100 100,88" style="fill:var(--color-text-primary)"/>
            <polygon points="196,100 100,112 100,100" style="fill:var(--color-text-secondary)"/>
            <polygon points="4,100 100,100 100,112" style="fill:var(--color-text-primary)"/>
            <polygon points="4,100 100,88 100,100" style="fill:var(--color-text-secondary)"/>
            <circle cx="100" cy="100" r="7" style="fill:var(--color-bg-surface);stroke:var(--color-text-primary);stroke-width:2"/>
          </svg>
          <figcaption>
            ${PRINCIPLES.map((p, i) => {
              const pos = ["n", "e", "s", "w"][i];
              return pos === "e" || pos === "w"
                ? `<span class="compass__point compass__point--${pos}"><b>${p.name}</b><span class="t-label">${p.deg}</span></span>`
                : `<span class="compass__point compass__point--${pos}"><span class="t-label">${p.deg}</span><b>${p.name}</b></span>`;
            }).join("\n            ")}
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="section" aria-labelledby="featured-title">
      <div class="container stack stack--xl">
        <div class="section-head">
          <div class="section-head__title">
            <p class="t-label t-label--accent">Акценти</p>
            <h2 class="t-h2" id="featured-title">Откъде да започнете тази седмица</h2>
          </div>
          <a class="link-arrow" href="metodi.html">Всички методи ${arrow}</a>
        </div>
        <div class="insights">
          ${insight({
            href: "predizvikatelstva.html#marzh", type: "Предизвикателство", lead: true,
            title: "Оборотът расте, печалбата не: къде изтичат парите",
            excerpt: "Когато разходите растат по-бързо от приходите, отговорът рядко е в продажбите. Веригата на стойността показва коя стъпка струва повече, отколкото носи.",
            meta: "<span>Верига на стойността</span><span>Канава на бизнес модела</span>",
            artHtml: art("value-chain", "navy"),
          })}
          ${methodInsight(method("swot"), { title: "SWOT анализ за 90 минути" })}
          ${methodInsight(method("ansoff"), { title: "Матрица на Ансоф: откъде да дойде ръстът" })}
          ${insight({ href: "sektori.html#horeka", type: "Сектор", title: "ХоРеКа: как да изгладим сезонните спадове", meta: "<span>SWOT анализ</span><span>Верига на стойността</span>", artHtml: art("cup", "teal") })}
          ${methodInsight(method("bsc"), { title: "Табло с показатели за фирма с 20 души" })}
        </div>
      </div>
    </section>

    <section class="section section--subtle" aria-label="Нашата позиция">
      <div class="container statement">
        <p class="t-label t-label--gold">В какво вярваме</p>
        <div class="stack stack--lg">
          <p class="statement__text">Добрата стратегия не е привилегия на корпорациите. <em>Тя е навик, който всяка фирма може да изгради.</em></p>
          <a class="link-arrow" href="podhod.html">Нашият подход ${arrow}</a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="what-title">
      <div class="container stack stack--xl">
        <div class="section-head__title">
          <p class="t-label t-label--accent">Какво правим</p>
          <h2 class="t-h2" id="what-title">Помагаме по проблем и по бранш</h2>
        </div>
        <div class="grid grid--2">
          <div class="stack stack--md">
            <h3 class="t-h3">Предизвикателства</h3>
            <ul class="row-list">
              ${CHALLENGES.map((c) => rowLink(`predizvikatelstva.html#${c.id}`, c.title)).join("\n              ")}
            </ul>
          </div>
          <div class="stack stack--md">
            <h3 class="t-h3">Сектори</h3>
            <ul class="row-list">
              ${SECTORS.map((s) => rowLink(`sektori.html#${s.id}`, s.name)).join("\n              ")}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section on-inverse" aria-labelledby="glance-title">
      <div class="container stack stack--xl">
        <div class="section-head__title">
          <p class="t-label t-label--gold">МСП Компас накратко</p>
          <h2 class="t-h2" id="glance-title">Практични рамки, не теория</h2>
        </div>
        <ul class="stats">
          <li class="stat"><span class="stat__num">6</span><p class="t-body">стратегически рамки, описани стъпка по стъпка</p></li>
          <li class="stat"><span class="stat__num">6</span><p class="t-body">сектора с техните типични въпроси</p></li>
          <li class="stat"><span class="stat__num">90<small>мин.</small></span><p class="t-body">за първия резултат със SWOT анализ</p></li>
          <li class="stat"><span class="stat__num">1<small>стр.</small></span><p class="t-body">е резултатът от всеки метод: ясен и готов за действие</p></li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="areas-title">
      <div class="container stack stack--xl">
        <div class="section-head">
          <div class="section-head__title">
            <p class="t-label t-label--accent">Пет посоки на работа</p>
            <h2 class="t-h2" id="areas-title">Всяко управленско решение сочи в една от пет посоки</h2>
          </div>
        </div>
        <ul class="bearings">
          ${AREAS.map((a) => `<li class="bearing">
            <span class="bearing__deg">${a.deg}</span>
            <div class="bearing__body">
              <div class="stack stack--xs"><h3 class="t-h4">${a.name}</h3><p class="t-small">${a.text}</p></div>
              <div class="cluster">${METHODS.filter((m) => m.area === a.id).map((m) => methodTag(m.id)).join("")}</div>
            </div>
          </li>`).join("\n          ")}
        </ul>
      </div>
    </section>
${splitCta()}`);

/* ================================================================ challenges */
write("predizvikatelstva.html", "Предизвикателства · МСП Компас", "Шест типични ситуации в малкия и средния бизнес и рамките, които помагат при всяка от тях.", `
${pageHero({
  crumbs: [["index.html", "Начало"], [null, "Предизвикателства"]],
  label: "Предизвикателства",
  title: "Започнете от това, което не работи",
  lead: "Повечето собственици не търсят „SWOT анализ“. Търсят отговор защо продажбите стоят на място. Изберете ситуацията, която най-точно описва вашия бизнес.",
})}

    <section class="section">
      <div class="container grid grid--3">
        ${CHALLENGES.map((c) => `<article class="tile" id="${c.id}">
          <p class="t-label t-label--accent">Предизвикателство</p>
          <h2 class="t-h3">${c.title}</h2>
          <p class="t-body">${c.text}</p>
          <div class="tile__foot">
            <p class="t-label t-label--muted">Започнете с</p>
            <ul class="row-list row-list--sm">${c.methods.map((id) => rowLink(method(id).file, method(id).name)).join("")}</ul>
          </div>
        </article>`).join("\n        ")}
      </div>
    </section>
${splitCta("Не откривате своя случай?", "Опишете ситуацията с няколко изречения и ще ви предложим подходяща рамка.")}`);

/* ================================================================ sectors */
write("sektori.html", "Сектори · МСП Компас", "Как стратегическите рамки се прилагат в търговията, производството, услугите, ХоРеКа, строителството и логистиката.", `
${pageHero({
  crumbs: [["index.html", "Начало"], [null, "Сектори"]],
  label: "Сектори",
  title: "Една и съща рамка, различен бранш",
  lead: "Матрицата на Ансоф изглежда различно в ресторант и в транспортна фирма. Тук събираме типичните въпроси във всеки сектор и методите, които им отговарят.",
})}

    <section class="section">
      <div class="container grid grid--3">
        ${SECTORS.map((s) => `<article class="tile" id="${s.id}">
          <div class="tile__head">
            <span class="tile__icon">${icon(s.icon)}</span>
            <span class="pill">Наръчник в подготовка</span>
          </div>
          <h2 class="t-h3">${s.name}</h2>
          <p class="t-body">${s.text}</p>
          <ul class="qlist">${s.qs.map((q) => `<li>${q}</li>`).join("")}</ul>
          <div class="tile__foot">
            <p class="t-label t-label--muted">Полезни методи</p>
            <div class="cluster">${s.methods.map(methodTag).join("")}</div>
          </div>
        </article>`).join("\n        ")}
      </div>
    </section>
${splitCta()}`);

/* ================================================================ methods index */
write("metodi.html", "Методи · МСП Компас", "Шест стратегически рамки, описани стъпка по стъпка за малки и средни предприятия.", `
${pageHero({
  crumbs: [["index.html", "Начало"], [null, "Методи"]],
  label: "Методи и инструменти",
  title: "Шест рамки, които всеки собственик може да приложи",
  lead: "За всяка рамка: на какъв въпрос отговаря, кога да я използвате, колко време отнема и как да я приложите с екипа си.",
})}

    <section class="section">
      <div class="container stack stack--xl">
        <div class="stack stack--md">
          <div class="tabs" role="group" aria-label="Филтър по посока">
            <button class="tab" type="button" data-filter="all" aria-pressed="true">Всички</button>
            ${AREAS.map((a) => `<button class="tab" type="button" data-filter="${a.id}" aria-pressed="false">${a.name}</button>`).join("\n            ")}
          </div>
          <p class="t-small" id="filter-status" aria-live="polite">Показани са всички 6 метода.</p>
        </div>
        <div class="grid grid--3">
          ${METHODS.map((m) => methodInsight(m, { excerpt: true, h: "h2", attrs: ` data-area="${m.area}"` })).join("\n          ")}
        </div>
      </div>
    </section>
${splitCta()}`);

/* ================================================================ method detail pages */
for (const m of METHODS) {
  const a = area(m.area);
  const challenges = CHALLENGES.filter((c) => c.methods.includes(m.id));
  const others = METHODS.filter((x) => x.id !== m.id).sort((x, y) => (y.area === m.area) - (x.area === m.area)).slice(0, 3);
  write(m.file, `${m.name} · МСП Компас`, `${m.name}: ${m.q} Стъпки, време и типични грешки за малки и средни предприятия.`, `
${pageHero({
  crumbs: [["index.html", "Начало"], ["metodi.html", "Методи"], [null, m.name]],
  label: `Метод · ${a.name}`,
  title: m.name,
  lead: `„${m.q}“`,
  extra: `<dl class="meta-row">
            <div><dt class="t-label t-label--muted">Време</dt><dd>${m.time}</dd></div>
            <div><dt class="t-label t-label--muted">Участници</dt><dd>${m.people}</dd></div>
            <div><dt class="t-label t-label--muted">Резултат</dt><dd>${m.result}</dd></div>
          </dl>`,
  aside: art(m.id, m.art),
})}

    <section class="section">
      <div class="container article">
        <div class="article__main">
          <div class="glance">
            <p class="t-label t-label--gold">Накратко</p>
            <ul>
              <li><strong>Отговаря на въпроса:</strong> ${m.q}</li>
              <li><strong>Отнема:</strong> ${m.time}, с участието на ${m.people.charAt(0).toLowerCase() + m.people.slice(1)}.</li>
              <li><strong>Резултат:</strong> ${m.result.charAt(0).toLowerCase() + m.result.slice(1)}.</li>
            </ul>
          </div>
          <section aria-labelledby="when-title">
            <h2 class="t-h2" id="when-title">Кога да го използвате</h2>
            <p class="t-lead">${m.when}</p>
          </section>
          <section aria-labelledby="how-title">
            <h2 class="t-h2" id="how-title">Как се прилага</h2>
            <ol class="steps-big">${m.steps.map((s) => `<li><span>${s}</span></li>`).join("")}</ol>
          </section>
          <section aria-labelledby="pit-title">
            <h2 class="t-h2" id="pit-title">Типични грешки</h2>
            <ul class="pitfalls">${m.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul>
          </section>
        </div>
        <aside class="aside" aria-label="Свързано">
          <div class="stack stack--sm">
            <p class="t-label t-label--muted">Посока</p>
            <p class="t-h4"><span class="t-label--gold">${a.deg}</span> ${a.name}</p>
            <p class="t-small">${a.text}</p>
          </div>
          <div class="stack stack--sm">
            <p class="t-label t-label--muted">Подходящ при</p>
            <ul class="row-list row-list--sm">${challenges.map((c) => rowLink(`predizvikatelstva.html#${c.id}`, c.title)).join("")}</ul>
          </div>
          <a class="btn btn--primary" href="kontakti.html">Помощ с прилагането ${arrow}</a>
        </aside>
      </div>
    </section>

    <section class="section section--subtle" aria-labelledby="more-title">
      <div class="container stack stack--xl">
        <div class="section-head">
          <div class="section-head__title">
            <p class="t-label t-label--accent">Продължете</p>
            <h2 class="t-h2" id="more-title">Още методи</h2>
          </div>
          <a class="link-arrow" href="metodi.html">Всички методи ${arrow}</a>
        </div>
        <div class="grid grid--3">
          ${others.map((o) => methodInsight(o)).join("\n          ")}
        </div>
      </div>
    </section>
`);
}

/* ================================================================ approach */
write("podhod.html", "Нашият подход · МСП Компас", "Как МСП Компас превежда консултантските рамки на езика на малкия и средния бизнес.", `
${pageHero({
  crumbs: [["index.html", "Начало"], [null, "Подход"]],
  label: "Нашият подход",
  title: "Рамките на големите консултанти, приложени без голям бюджет",
  lead: "Водещите консултантски компании решават проблемите на корпорациите с няколко доказани рамки. Същите рамки работят и за фирма с 10 или 50 души, ако са обяснени ясно и приложени към реалните ѝ въпроси.",
})}

    <section class="section">
      <div class="container statement">
        <p class="t-label t-label--gold">Защо съществуваме</p>
        <div class="stack stack--lg">
          <p class="statement__text">Малкият бизнес взима същите трудни решения като големия, <em>но без екип от анализатори.</em></p>
          <p class="t-lead">МСП Компас събира рамките, които работят, описва ги стъпка по стъпка и ги свързва с проблемите, които собствениците срещат всеки ден.</p>
        </div>
      </div>
    </section>

    <section class="section section--subtle" aria-labelledby="principles-title">
      <div class="container stack stack--xl">
        <div class="section-head__title">
          <p class="t-label t-label--accent">Четири принципа</p>
          <h2 class="t-h2" id="principles-title">Четирите посоки на компаса</h2>
        </div>
        <div class="grid grid--4">
          ${PRINCIPLES.map((p) => `<article class="tile">
            <p class="t-label t-label--gold t-num">${p.deg}</p>
            <h3 class="t-h3">${p.name}</h3>
            <p class="t-body">${p.text}</p>
          </article>`).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="process-title">
      <div class="container stack stack--xl">
        <div class="section-head__title">
          <p class="t-label t-label--accent">Как работим с вас</p>
          <h2 class="t-h2" id="process-title">От проблем до решение в три стъпки</h2>
        </div>
        <ol class="process">
          <li><h3 class="t-h4">Назовете предизвикателството</h3><p class="t-body">Опишете с прости думи какво не работи: продажби, маржове, екип или посока.</p></li>
          <li><h3 class="t-h4">Изберете рамката</h3><p class="t-body">Всяка ситуация води до една или две рамки, които отговарят точно на вашия въпрос.</p></li>
          <li><h3 class="t-h4">Приложете и измерете</h3><p class="t-body">Следвайте стъпките с екипа си и проследете резултата с един ясен показател.</p></li>
        </ol>
      </div>
    </section>
${splitCta()}`);

/* ================================================================ contact */
write("kontakti.html", "Контакти · МСП Компас", "Опишете предизвикателството на вашия бизнес и ще ви посочим откъде да започнете.", `
${pageHero({
  crumbs: [["index.html", "Начало"], [null, "Контакти"]],
  label: "Контакти",
  title: "Разкажете ни за вашия бизнес",
  lead: "Няколко изречения са достатъчни. Ще ви отговорим с конкретна рамка и първа стъпка.",
})}

    <section class="section">
      <div class="container contact">
        <div class="stack stack--xl">
          <div class="stack stack--md">
            <h2 class="t-h3">Какво следва</h2>
            <ol class="process" style="grid-template-columns:1fr">
              <li><p class="t-body">Изпращате кратко описание на ситуацията.</p></li>
              <li><p class="t-body">До два работни дни получавате препоръка за рамка и първа стъпка.</p></li>
              <li><p class="t-body">Ако е нужно, уговаряме 30-минутен разговор.</p></li>
            </ol>
          </div>
          <div class="stack stack--sm">
            <p class="t-label t-label--muted">Имейл</p>
            <div class="copy-row">
              <strong id="email">${EMAIL}</strong>
              <button class="btn btn--secondary" type="button" data-copy="#email">Копирай</button>
            </div>
          </div>
        </div>

        <form class="form" id="contact-form" novalidate>
          <div class="form__row">
            <div class="field"><label for="f-name">Име</label><input class="input" id="f-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="f-company">Фирма</label><input class="input" id="f-company" name="company" autocomplete="organization"></div>
          </div>
          <div class="form__row">
            <div class="field"><label for="f-email">Имейл</label><input class="input" id="f-email" name="email" type="email" autocomplete="email" required></div>
            <div class="field">
              <label for="f-sector">Сектор</label>
              <select class="select input" id="f-sector" name="sector">
                <option value="">Изберете</option>
                ${SECTORS.map((s) => `<option>${s.name}</option>`).join("")}
                <option>Друг</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="f-message">Какво искате да промените?</label>
            <span class="hint" id="f-message-hint">Например: „Оборотът расте, но печалбата пада от две години.“</span>
            <textarea class="textarea" id="f-message" name="message" aria-describedby="f-message-hint" required></textarea>
          </div>
          <div class="form__foot">
            <p class="t-small">Всички полета без „Фирма“ и „Сектор“ са задължителни.</p>
            <button class="btn btn--primary btn--lg" type="submit">Изпрати ${arrow}</button>
          </div>
          <div class="notice" id="form-notice" role="status" hidden></div>
        </form>
      </div>
    </section>`);

console.log(`${count} pages written`);
