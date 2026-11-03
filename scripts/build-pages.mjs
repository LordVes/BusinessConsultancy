// Generates every HTML page from scripts/content.mjs, scripts/whitepaper.mjs and the
// shared layout in scripts/layout.mjs. Also writes a Markdown copy of the whitepaper to output/.
// Run: node scripts/build-pages.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PRINCIPLES, EMAIL } from "./content.mjs";
import {
  WP, SOURCES, INDICATORS, FRAMEWORKS, PUBLIC_TOOL, LEVELS, LENSES, DIMENSIONS,
  PRINCIPLES_WP, PROCESS, PITFALLS, HYPOTHESES,
} from "./whitepaper.mjs";
import {
  WP_EN, SOURCES_EN, INDICATORS_EN, FRAMEWORKS_EN, PUBLIC_TOOL_EN, LEVELS_EN, LENSES_EN, DIMENSIONS_EN, TOC_EN, sectionsEn,
} from "./whitepaper-en.mjs";
import { page, arrow, art, insight, t, tb, asset } from "./layout.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let count = 0;
const write = (file, opts) => {
  writeFileSync(resolve(ROOT, file), page({ file, ...opts }));
  count++;
};

/* ---------- shared blocks ---------- */
const pageHero = ({ crumbs, label, title, lead, extra = "" }) => `
    <section class="page-hero on-inverse">
      <div class="container page-hero__grid">
        <div class="page-hero__copy">
          <nav aria-label="Път"><ol class="crumbs">${crumbs.map(([h, l]) => (h ? `<li><a href="${h}">${l}</a></li>` : `<li aria-current="page">${l}</li>`)).join("")}</ol></nav>
          <p class="t-label t-label--gold">${label}</p>
          <h1 class="t-h1">${title}</h1>
          <p class="t-lead">${lead}</p>
          ${extra}
        </div>
      </div>
    </section>`;

const home = t("Начало", "Home");
const wpCard = (lead = true) => insight({
  href: WP.file, lead,
  type: t("Анализ № 1 · " + WP.dateBg, "Whitepaper no. 1 · " + WP_EN.dateEn),
  title: t(WP.title, WP_EN.title),
  excerpt: t(
    "Къде са българските износители с 30–150 заети спрямо ЕС, какво предлагат консултантските рамки за оценка на зрелостта и как една фирма може да започне.",
    "Where Bulgarian exporters with 30–150 employees stand against the EU, what consulting maturity frameworks offer, and how a firm can start."),
  meta: `<span>${t("Автор: " + WP.author + ", " + WP.org, "Author: " + WP.author + ", MSP Compass")}</span><span>${t(WP.readingTime + " четене", "25 min read")}</span>`,
  artHtml: art("doc", "navy"),
});
const toolCard = () => insight({
  href: "samoocenka-digitalna-zrelost.html",
  type: t("Инструмент", "Tool"),
  title: t("Самооценка на цифровата зрялост", "Digital maturity self-assessment"),
  excerpt: t("30 критерия в 8 измерения. Резултатът се изчислява във вашия браузър и не се изпраща никъде.", "30 criteria in 8 dimensions. Scored in your browser; nothing is sent anywhere. In Bulgarian."),
  meta: `<span>${t("около 20 минути", "about 20 minutes")}</span>`,
  artHtml: art("gauge", "teal"),
});

/* ================================================================ index */
write("index.html", {
  title: "МСП Компас",
  titleEn: "MSP Compass",
  description: "Анализи за българските средни предприятия износители и как подходите на водещите консултантски компании могат да помогнат. С източник за всяка цифра.",
  main: `
    <section class="hero on-inverse" aria-labelledby="hero-title">
      <div class="container hero__grid">
        <div class="hero__copy">
          ${tb("Анализи за българските средни предприятия износители", "Insights for Bulgarian export-oriented mid-sized firms", "h1", ' class="t-display" id="hero-title"')}
          ${tb("МСП Компас описва проблемите, с които се сблъскват фирмите с 30–150 заети, които изнасят, и показва как подходите на водещите консултантски компании могат да помогнат. Всяка цифра е с източник, а хипотезите са обозначени като хипотези.",
               "MSP Compass describes the problems faced by exporting firms with 30–150 employees and shows how the approaches of leading consulting firms could help. Every figure has a source, and hypotheses are labelled as hypotheses.", "p", ' class="t-lead"')}
          <div class="hero__actions">
            <a class="btn btn--primary btn--lg" href="${WP.file}">${t("Прочетете първия анализ", "Read the first whitepaper")} ${arrow}</a>
            <a class="link-arrow" href="samoocenka-digitalna-zrelost.html">${t("Направете самооценка", "Take the self-assessment")} ${arrow}</a>
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
              const name = `<b>${t(p.name, p.en)}</b>`;
              return pos === "e" || pos === "w"
                ? `<span class="compass__point compass__point--${pos}">${name}<span class="t-label">${p.deg}</span></span>`
                : `<span class="compass__point compass__point--${pos}"><span class="t-label">${p.deg}</span>${name}</span>`;
            }).join("\n            ")}
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="section" aria-labelledby="featured-title">
      <div class="container stack stack--xl">
        <div class="section-head">
          <div class="section-head__title">
            <p class="t-label t-label--accent">${t("Ново", "New")}</p>
            ${tb("Първият анализ: цифровата зрялост на средните износители", "First whitepaper: digital maturity of mid-sized exporters", "h2", ' class="t-h2" id="featured-title"')}
          </div>
          <a class="link-arrow" href="analizi.html">${t("Всички анализи", "All whitepapers")} ${arrow}</a>
        </div>
        <div class="insights insights--two">
          ${wpCard(true)}
          ${toolCard()}
        </div>
      </div>
    </section>

    <section class="section section--subtle" aria-label="${"Как работим"}">
      <div class="container statement">
        <p class="t-label t-label--gold">${t("Как работим", "How we work")}</p>
        <div class="stack stack--lg">
          ${tb("Първо фактите, после мнението. <em>Всяка цифра има източник, а всяка хипотеза е обозначена като такава.</em>",
               "Facts first, then views. <em>Every figure has a source, and every hypothesis is labelled as one.</em>", "p", ' class="statement__text"')}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="principles-title">
      <div class="container stack stack--xl">
        <div class="section-head__title">
          <p class="t-label t-label--accent">${t("Четири принципа", "Four principles")}</p>
          ${tb("Как четем и пишем анализите", "How we read and write the whitepapers", "h2", ' class="t-h2" id="principles-title"')}
        </div>
        <ul class="bearings">
          ${PRINCIPLES.map((p) => `<li class="bearing">
            <span class="bearing__deg">${p.deg}</span>
            <div class="bearing__body bearing__body--single">
              <div class="stack stack--xs"><h3 class="t-h4">${t(p.name, p.en)}</h3><p class="t-small">${t(p.text, p.textEn)}</p></div>
            </div>
          </li>`).join("\n          ")}
        </ul>
      </div>
    </section>`,
});

/* ================================================================ whitepapers index */
write("analizi.html", {
  title: "Анализи · МСП Компас",
  titleEn: "Whitepapers · MSP Compass",
  description: "Анализи на МСП Компас за българските средни предприятия износители: проблем, данни с източници и подходи за решение.",
  main: `
${pageHero({
  crumbs: [["index.html", home], [null, t("Анализи", "Whitepapers")]],
  label: t("Анализи", "Whitepapers"),
  title: t("Проблем, данни и подход за решение", "Problem, evidence and a way to address it"),
  lead: t("Всеки анализ описва един проблем на българските средни предприятия износители, показва какво казват данните и как подходите на консултантските компании могат да помогнат.",
          "Each whitepaper describes one problem faced by Bulgarian mid-sized exporters, shows what the data says and how consulting approaches could help. Available in Bulgarian and English."),
})}

    <section class="section">
      <div class="container stack stack--xl">
        <div class="insights insights--two">
          ${wpCard(true)}
          ${toolCard()}
        </div>
      </div>
    </section>`,
});

/* ================================================================ whitepaper */
// The article is rendered twice: Bulgarian (default) and English (shown via the EN toggle).
// English ids carry the prefix "en-" so anchors and source links stay unique.
const DATA = {
  bg: { INDICATORS, FRAMEWORKS, PUBLIC_TOOL, DIMENSIONS, LEVELS, LENSES, PRINCIPLES_WP, PROCESS, PITFALLS, HYPOTHESES,
        srcText: (id) => SOURCES.find((s) => s.id === id).text, P: "" },
  en: { INDICATORS: INDICATORS_EN, FRAMEWORKS: FRAMEWORKS_EN, PUBLIC_TOOL: PUBLIC_TOOL_EN, DIMENSIONS: DIMENSIONS_EN, LEVELS: LEVELS_EN, LENSES: LENSES_EN,
        srcText: (id) => SOURCES_EN[id], P: "en-" },
};
const LBL = {
  bg: {
    indAria: "Таблица: България спрямо ЕС", indCap: "Дял на предприятията с 50–249 заети, освен ако е посочено друго (%)",
    indicator: "Показател", bgCol: "България", euCol: "ЕС-27", year: "Година",
    fwAria: "Таблица: консултантски рамки", fwCap: "Рамки за цифрова зрялост на консултантски компании и един публичен инструмент на ЕС",
    fwCols: ["Рамка", "Измерения", "Скала", "Брой критерии", "Доказателствена база", "Ограничения за фирма с 60 души"],
    fwShort: ["Измерения", "Скала", "Брой критерии", "Доказателствена база", "Ограничения"], publicTool: "Публичен инструмент",
    dimAria: "Таблица: осемте измерения", dimCap: "Осемте измерения, ключовият въпрос и какво показват националните данни",
    dimCols: ["Измерение", "Ключов въпрос", "Национални данни за България"],
    lvlAria: "Таблица: скала на зрялост", lvlCap: "Скала в четири нива", lvlCols: ["Ниво", "Наименование", "Как изглежда"],
    lensAria: "Таблица: две гледни точки", lensCap: "Двете гледни точки за всяко измерение", level: "Ниво",
    criteria: "критерия", toc: "Съдържание",
  },
  en: {
    indAria: "Table: Bulgaria vs the EU", indCap: "Share of enterprises with 50–249 employees unless stated otherwise (%)",
    indicator: "Indicator", bgCol: "Bulgaria", euCol: "EU-27", year: "Year",
    fwAria: "Table: consulting frameworks", fwCap: "Digital maturity frameworks from consulting firms, plus one public EU tool",
    fwCols: ["Framework", "Dimensions", "Scale", "Number of criteria", "Evidence base", "Limits for a 60-person firm"],
    fwShort: ["Dimensions", "Scale", "Number of criteria", "Evidence base", "Limits"], publicTool: "Public tool",
    dimAria: "Table: the eight dimensions", dimCap: "The eight dimensions, the key question and what national data shows",
    dimCols: ["Dimension", "Key question", "National data for Bulgaria"],
    lvlAria: "Table: maturity scale", lvlCap: "A four-level scale", lvlCols: ["Level", "Name", "What it looks like"],
    lensAria: "Table: two perspectives", lensCap: "The two perspectives for each dimension", level: "Level",
    criteria: "criteria", toc: "Contents",
  },
};
const makeCite = (P) => (...ids) => (ids.length
  ? `<sup class="cite">[${ids.map((i) => `<a href="#${P}src-${i}">${i}</a>`).join(", ")}]</sup>`
  : "");

function wpParts(lang) {
  const D = DATA[lang], L = LBL[lang], c = makeCite(D.P);
  const wrap = (aria, cls, cap, head, body) => `<div class="table-wrap" role="region" aria-label="${aria}" tabindex="0">
          <table class="${cls}">
            <caption>${cap}</caption>
            <thead><tr>${head}</tr></thead>
            <tbody>
              ${body}
            </tbody>
          </table>
        </div>`;
  const fwRow = (f) => `<tr>
                <th scope="row">${f.name}<span class="dma-sub">${f.by} ${c(...f.src)}</span></th>
                ${[f.dims, f.scale, f.criteria, f.evidence, f.limits].map((v, i) => `<td data-label="${L.fwShort[i]}">${v}</td>`).join("")}
              </tr>`;
  return {
    P: D.P,
    cite: c,
    srcUrl: (id) => SOURCES.find((s) => s.id === id).url,
    indicatorTable: wrap(L.indAria, "data-table", L.indCap,
      `<th scope="col">${L.indicator}</th><th scope="col" class="t-num">${L.bgCol}</th><th scope="col" class="t-num">${L.euCol}</th><th scope="col" class="t-num">${L.year}</th>`,
      D.INDICATORS.map((r) => `<tr><th scope="row">${r.name} ${c(...r.src)}</th><td class="t-num">${r.bg}</td><td class="t-num">${r.eu}</td><td class="t-num">${r.year}</td></tr>`).join("\n              ")),
    fwTable: wrap(L.fwAria, "data-table data-table--wide data-table--stack", L.fwCap,
      L.fwCols.map((h) => `<th scope="col">${h}</th>`).join(""),
      `${D.FRAMEWORKS.map(fwRow).join("\n              ")}
              <tr class="data-table__group"><th scope="rowgroup" colspan="6">${L.publicTool}</th></tr>
              ${fwRow(D.PUBLIC_TOOL)}`),
    dimTable: wrap(L.dimAria, "data-table", L.dimCap,
      L.dimCols.map((h) => `<th scope="col">${h}</th>`).join(""),
      D.DIMENSIONS.map((d, i) => `<tr><th scope="row">${i + 1}. ${d.name}</th><td>${d.question}</td><td>${d.data} ${c(...(d.src || []))}</td></tr>`).join("\n              ")),
    levelTable: wrap(L.lvlAria, "data-table", L.lvlCap,
      `<th scope="col" class="t-num">${L.lvlCols[0]}</th><th scope="col">${L.lvlCols[1]}</th><th scope="col">${L.lvlCols[2]}</th>`,
      D.LEVELS.map((l) => `<tr><td class="t-num"><span class="lvl lvl--${l.n}">${l.n}</span></td><th scope="row">${l.name}</th><td>${l.text}</td></tr>`).join("\n              ")),
    lensTable: wrap(L.lensAria, "data-table", L.lensCap,
      `<th scope="col" class="t-num">${L.level}</th><th scope="col">${D.LENSES.manage.name}: ${D.LENSES.manage.q}</th><th scope="col">${D.LENSES.use.name}: ${D.LENSES.use.q}</th>`,
      [0, 1, 2, 3].map((i) => `<tr><td class="t-num">${i + 1}</td><td>${D.LENSES.manage.levels[i]}</td><td>${D.LENSES.use.levels[i]}</td></tr>`).join("\n              ")),
    criteriaAppendix: D.DIMENSIONS.map((d, i) => `<details class="crit-group">
            <summary><span class="t-h4">${i + 1}. ${d.name}</span><span class="dma-sub">${d.criteria.length} ${L.criteria}</span></summary>
            ${d.criteria.map((cr) => `<div class="crit">
              <p class="crit__name">${cr.id.toUpperCase()} · ${cr.name}</p>
              <ol class="crit__levels">${cr.levels.map((l, j) => `<li><span class="lvl lvl--${j + 1}">${j + 1}</span><span>${l}</span></li>`).join("")}</ol>
            </div>`).join("\n            ")}
          </details>`).join("\n          "),
    sourcesList: `<ol class="sources">
            ${SOURCES.map((s) => `<li id="${D.P}src-${s.id}"><span>${D.srcText(s.id)}.</span> <a href="${s.url}" rel="noopener">${s.url.replace(/^https?:\/\//, "").slice(0, 90)}${s.url.length > 98 ? "…" : ""}</a></li>`).join("\n            ")}
          </ol>`,
  };
}

const TOC = [
  ["rezyume", "Резюме"],
  ["zashto", "1. Защо темата е важна"],
  ["dnes", "2. Къде сме днес"],
  ["ramki", "3. Какво предлагат консултантските рамки"],
  ["podhod", "4. Подход в осем измерения"],
  ["proces", "5. Процесът: 4–6 седмици"],
  ["kapani", "6. Пет капана"],
  ["mostove", "7. Инструменти за прехода"],
  ["posoka", "8. Накъде се движат изискванията"],
  ["hipotezi", "9. Хипотези за проверка"],
  ["kriterii", "Приложение: 30 критерия"],
  ["metodologia", "Методологични бележки"],
  ["iztochnici", "Източници"],
];

const sectionsBg = (x) => {
  const c = x.cite;
  return [
  ["rezyume", "Резюме", `
          <div class="glance">
            <ul>
              <li><strong>38,3% от българските МСП</strong> (10–249 заети) достигат поне основно ниво на цифрова интензивност през 2025 г. при 71,4% в ЕС. Това е едно от най-ниските нива в ЕС и е под траекторията в националната пътна карта. ${c(1, 9)}</li>
              <li><strong>При фирмите с 50–249 заети</strong> нивото е по-високо, но разликата остава: 55,4% срещу 86,7%. ERP използват 41,9% (ЕС: 69,9%), CRM 16,8% (ЕС: 43,8%). ${c(1, 5)}</li>
              <li><strong>Разликата в изкуствения интелект расте:</strong> при фирмите с 50–249 заети тя се увеличава от 7,5 процентни пункта през 2023 г. до 17,1 пункта през 2025 г. ${c(2)}</li>
              <li><strong>По сигурност България е последна в ЕС:</strong> 31,3% от българските предприятия прилагат поне 5 от 11 мерки за киберсигурност при 56,9% в ЕС, най-ниският дял в ЕС (2024). ${c(9)}</li>
              <li><strong>Прегледахме 6 консултантски рамки и 1 публичен инструмент на ЕС.</strong> Всички съчетават стратегия и операции, но бенчмарковете им са изградени върху големи компании.</li>
              <li><strong>Предлагаме подход в 8 измерения и 4 нива</strong> с 30 наблюдаеми критерия и безплатна самооценка, която работи изцяло във вашия браузър.</li>
              <li><strong>Пет хипотези</strong> са формулирани за проверка. Все още няма резултати от проучване.</li>
            </ul>
          </div>`],

  ["zashto", "1. Защо темата е важна за износителите", `
          <p class="t-body">Този анализ е за собственици и управители на български фирми с 30–150 заети, които изнасят. За тях цифровата зрялост засяга пряко начина, по който работят с чуждестранните клиенти: как приемат поръчки, как издават документи, как проследяват партиди и как доказват, че данните им са защитени.</p>
          <p class="t-body">Групата е важна за износа. През 2024 г. 899 български производствени предприятия с 50–249 заети са изнасяли стоки, или 28% от всички производители износители. Те формират 18,0% от стойността на износа на стоки от преработващата промишленост; 77,1% се падат на предприятията с 250 и повече заети. ${c(8)} Тези данни показват броя на износителите и стойността на износа, но не и какъв дял от оборота на фирмата е износ. Такъв показател по размер на фирмата не открихме.</p>
          <p class="t-body">Европейската комисия отбелязва, че ниската цифрова интензивност на МСП може да ограничи растежа на производителността и мястото на българските фирми в по-високите звена на европейските вериги на стойност. ${c(9)}</p>`],

  ["dnes", "2. Къде сме днес: данните", `
          <p class="t-body">Евростат измерва цифровизацията на предприятията с годишно проучване, което в България се провежда от НСИ. Проучването обхваща фирмите с 10 и повече заети. ${c(11)}</p>
          <p class="t-body">През 2025 г. 38,3% от българските МСП (10–249 заети) достигат поне основно ниво на цифрова интензивност при 71,4% в ЕС. През 2023 г. делът е бил 28,4% при 57,9% в ЕС. ${c(1, 9)} Част от този ръст може да се дължи на промяна в начина на изчисление: през 2025 г. показателят за използване на социални мрежи е заменен с наличие на уебсайт, който обикновено има по-висок дял. ${c(10)} Според ЕК България изостава от траекторията в своята национална пътна карта. ${c(9)}</p>
          ${x.indicatorTable}
          <p class="t-body"><strong>Какво се вижда в таблицата.</strong> Разликата е най-голяма при системите, които свързват функциите и превръщат данните в решения: CRM (16,8% срещу 43,8%) и софтуер за бизнес анализи (12,3% срещу 34,3%). ${c(5)} При изкуствения интелект разликата расте: през 2025 г. 8,55% от всички предприятия с 10 и повече заети използват поне една технология с ИИ при 19,95% в ЕС. ${c(2)} Около 16% от тези предприятия продават по електронен път (16,2% срещу 23,6% в ЕС). ${c(4)}</p>
          <p class="t-body">Разликата при наемането на ИКТ специалисти е по-малка от разликите при технологиите: 31,5% срещу 43,0% при фирмите с 50–249 заети през 2024 г. ${c(7)} В проучване на БСК от 2025 г. сред 847 фирми 40% посочват липсата на цифрови умения като основна пречка, 33% посочват финансовите ограничения, а 15% ограничения достъп до информация. ${c(9)}</p>
          <aside class="callout">
            <p class="t-label t-label--accent">Как да четем тези числа</p>
            <ul>
              <li>Националният показател включва и фирмите с 10–49 заети. За сегмента 30–150 заети той е долна граница, а не сравнение с фирми като вашата.</li>
              <li>Данните за 50–249 заети са по-близо до сегмента, но включват и фирми до 249 души.</li>
              <li>Версия 3 и версия 4 на индекса за цифрова интензивност са различни показатели. Сравнявайте само в рамките на една версия.</li>
              <li>Тези данни не показват дали изнасящите фирми са по-зрели от останалите.</li>
            </ul>
          </aside>`],

  ["ramki", "3. Какво предлагат консултантските рамки", `
          <p class="t-body">Прегледахме шест рамки за цифрова зрялост, публикувани от консултантски компании, и един публичен инструмент на ЕС. За всяка записахме измеренията, скалата, броя на критериите, доказателствената база, датата и ограниченията за фирма с около 60 заети.</p>
          ${x.fwTable}
          <p class="t-body"><strong>Какво не използвахме.</strong> Не открихме използваем първичен източник от McKinsey: сайтът mckinsey.com не можа да бъде отворен от нашата среда, затова не разчитаме на вторични описания на рамката Digital Quotient. Страниците на PwC и Strategy& за Industry 4.0 отказаха достъп, а основната страница на Deloitte Румъния за Digital DNA не е налична. Тези рамки не са включени в таблицата. Добавихме Bain, чиято страница е достъпна.</p>
          <h3 class="t-h3">Какво е общото: нашето прочитане</h3>
          <ul class="ticks">
            <li>Всички рамки съчетават стратегия и операции. Deloitte отчита, че фокусът само върху едното от двете не носи очаквания ефект върху печалбата и приходите. ${c(14)}</li>
            <li>Скалите са между 3 и 6 нива и описват преход от отделни инициативи към цялостна промяна. ${c(12, 13, 14, 15)}</li>
            <li>KPMG разделя две гледни точки: колко целенасочено се управлява цифровизацията и колко широко се използва. ${c(15)} Заимстваме тази идея.</li>
            <li>Бенчмарковете на консултантските компании са изградени основно върху големи компании. За фирма с 60 души сравнението с „лидерите“ е по-малко полезно от профила спрямо собствените ѝ цели.</li>
          </ul>`],

  ["podhod", "4. Подход за оценка в осем измерения", `
          <p class="callout callout--plain"><strong>Авторски подход на МСП Компас.</strong> Изграден е от прегледаните рамки и е пригоден за фирми с 30–150 заети. Все още не е проверен с проучване.</p>
          <h3 class="t-h3">Четири принципа</h3>
          <ol class="steps-big">
            ${PRINCIPLES_WP.map((p) => `<li><div class="stack stack--xs"><h4 class="t-h4">${p.name}</h4><p class="t-body">${p.text}</p></div></li>`).join("\n            ")}
          </ol>
          <h3 class="t-h3">Осем измерения</h3>
          ${x.dimTable}
          <h3 class="t-h3">Четири нива</h3>
          <p class="t-body">Всеки от 30-те критерия има описание за всяко ниво, което може да се провери на място. Пълният списък е в <a href="#kriterii">приложението</a> и в <a href="samoocenka-digitalna-zrelost.html">самооценката</a>.</p>
          ${x.levelTable}
          <h3 class="t-h3">Две гледни точки</h3>
          <p class="t-body">За всяко измерение се отговаря и на два въпроса: колко целенасочено се управлява и колко широко се използва. Фирма може да има добре управляван проект, който се ползва само в един отдел, или обратното. Двете оценки показват къде е проблемът.</p>
          ${x.lensTable}`],

  ["proces", "5. Процесът: 4–6 седмици", `
          <ol class="steps-big">
            ${PROCESS.map((p) => `<li><div class="stack stack--xs"><p class="t-label t-label--accent">${p.when}</p><h3 class="t-h4">${p.name}</h3><p class="t-body">${p.text}</p></div></li>`).join("\n            ")}
          </ol>`],

  ["kapani", "6. Пет капана", `
          <ul class="pitfalls">
            ${PITFALLS.map((p) => `<li><strong>${p.name}.</strong> ${p.text}</li>`).join("\n            ")}
          </ul>`],

  ["mostove", "7. Инструменти за прехода", `
          <h3 class="t-h3">Самооценка</h3>
          <p class="t-body"><a href="samoocenka-digitalna-zrelost.html">Самооценката</a> съдържа същите 30 критерия. Показва профил по измерения, най-слабия критерий във всяко измерение и как изглежда следващото ниво. Изчислява се изцяло във вашия браузър; нищо не се изпраща.</p>
          <h3 class="t-h3">Оценка чрез европейски център за цифрови иновации</h3>
          <p class="t-body">В България работят 12 европейски центъра за цифрови иновации (EDIH), финансирани с 31,8 млн. евро по програмата PRIDST. ${c(9)} Те прилагат общоевропейския инструмент DMA преди и след своята подкрепа. ${c(18)} Според ЕК достъпът до услугите им се затруднява от административна сложност. ${c(9)} Списъкът на центровете е в <a href="${x.srcUrl(21)}" rel="noopener">каталога на ЕК</a>. ${c(21)}</p>
          <h3 class="t-h3">Програми за финансиране</h3>
          <div class="table-wrap" role="region" aria-label="Таблица: програми за финансиране" tabindex="0">
            <table class="data-table data-table--stack">
              <caption>Проверени данни за програми 2021–2027 (условията се променят; проверявайте актуалната процедура)</caption>
              <thead><tr><th scope="col">Програма или мярка</th><th scope="col">Какво финансира</th><th scope="col">За кого</th><th scope="col">Бележка</th></tr></thead>
              <tbody>
                <tr><th scope="row">ПКИП, „Дигитализация на предприятията“ (методология от април 2025 г.) ${c(19)}</th><td data-label="Какво финансира">Инвестиции в ИКТ; от 5 000 до 50 000 лв. на проект, до 70% безвъзмездна помощ, режим de minimis; общ бюджет 80 млн. лв.</td><td data-label="За кого">Само микро и малки предприятия</td><td data-label="Бележка">Фирмите с 50 и повече заети не са допустими по тази процедура.</td></tr>
                <tr><th scope="row">ПКИП, мерки „Дигитализация на предприятията“ и „Въвеждане на технологии на Индустрия 4.0“ ${c(9)}</th><td data-label="Какво финансира">Според ЕК: над 1 600 одобрени проекта за 29,58 млн. евро, с изпълнение от 2026 г.</td><td data-label="За кого">Не сме проверили условията за средни предприятия</td><td data-label="Бележка">Проверете в ИСУН. ${c(20)}</td></tr>
                <tr><th scope="row">ПРЧР (Програма „Развитие на човешките ресурси“) ${c(9)}</th><td data-label="Какво финансира">Обучения за цифрови умения на заети: операции „Digital Skills“ (20,5 млн. евро), „New Skills“ (38 млн. евро) и „Qualification, Skills and Career Development of Employed Persons“ (около 62 млн. евро)</td><td data-label="За кого">Работници и фирми</td><td data-label="Бележка">Имената са по доклада на ЕК; българските наименования и условия проверете в ИСУН. ${c(20)}</td></tr>
                <tr><th scope="row">„Digital Bulgaria – SMEs“ ${c(9)}</th><td data-label="Какво финансира">Безвъзмездна помощ за киберсигурност: 61 договора за около 1,8 млн. евро (юни 2025 – март 2026 г.)</td><td data-label="За кого">МСП</td><td data-label="Бележка">Приключила; показва посоката на подкрепата.</td></tr>
              </tbody>
            </table>
          </div>`],

  ["posoka", "8. Накъде се движат изискванията", `
          <p class="callout callout--plain"><strong>Тълкуване.</strong> Този раздел е нашият прочит на източниците, а не установен факт.</p>
          <h3 class="t-h4">Основите за данни и ИИ стават условие</h3>
          <p class="t-body">Факт: при фирмите с 50–249 заети използването на ИИ в България е нараснало от 5,5% през 2023 г. до 13,3% през 2025 г., но в ЕС е нараснало от 13,1% до 30,4%. ${c(2)} ЕК препоръчва на България да ускори използването на ИИ, облачни услуги и анализ на данни сред МСП чрез повече консултантска подкрепа и умения. ${c(9)}</p>
          <p class="t-body">Тълкуване: ИИ дава резултат само върху подредени основни данни и свързани системи. За повечето средни фирми първата стъпка към ИИ вероятно е измерението „Данни и технологична основа“, а не нов инструмент.</p>
          <h3 class="t-h4">Сигурността и данните стават изискване на купувачите</h3>
          <p class="t-body">Факт: през февруари 2026 г. България въведе директивата NIS2 в Закона за киберсигурност. Обхватът е 18 сектора, а изискванията за управление на риска и докладване са по-строги за средните и големите предприятия. ${c(9)} По пулс-проучване на БСК от пролетта на 2025 г. само 9,4% от фирмите се смятат за напълно готови, а над една трета не са започнали подготовка или не знаят за задълженията си. ${c(9)}</p>
          <p class="t-body">Тълкуване: клиентите в обхвата на NIS2 ще изискват повече доказателства за сигурност и от своите доставчици. За износителите въпросниците за сигурност вероятно ще станат част от търговския разговор.</p>`],

  ["hipotezi", "9. Хипотези за проверка", `
          <p class="callout callout--plain"><strong>Това са хипотези, а не изводи.</strong> Все още няма резултати от проучване. Всяка хипотеза е придружена с наличните данни и с начина, по който ще я проверим.</p>
          <ol class="hypotheses">
            ${HYPOTHESES.map((h, i) => `<li>
              <p class="t-label t-label--accent">Хипотеза ${i + 1}</p>
              <h3 class="t-h4">${h.name}</h3>
              <p class="t-body"><strong>Какво знаем.</strong> ${h.context} ${h.src.length ? c(...h.src) : ""}</p>
              <p class="t-body"><strong>Как ще я проверим.</strong> ${h.test}</p>
            </li>`).join("\n            ")}
          </ol>`],

  ["kriterii", "Приложение: 30 критерия с описания на нивата", `
          <p class="t-body no-print">Отворете измерение, за да видите критериите. При печат всички се отварят автоматично.</p>
          ${x.criteriaAppendix}`],

  ["metodologia", "Методологични бележки и ограничения", `
          <ul class="ticks">
            <li>Данните на Евростат са изтеглени от официалния API на 3 ноември 2026 г. Процентите са закръглени до една десетична.</li>
            <li>„МСП“ в данните на Евростат и ЕК означава предприятия с 10–249 заети. Микропредприятията не са включени.</li>
            <li>ЕК посочва, че 13,90% от МСП продават онлайн, а таблиците на Евростат показват 14,85% за уеб продажби и 15,87% за всички електронни продажби (10–249 заети, 2025). Не успяхме да установим откъде идва разликата и затова използваме таблиците на Евростат.</li>
            <li>Показателят на ЕК за облачни услуги (15,74%) се различава от показателя на Евростат за купени облачни услуги (17,83% за 10+ заети, 2025). Използваме показателя на Евростат.</li>
            <li>Данните за износа по размер на предприятието са за 2024 г. и включват само стоки.</li>
            <li>Изданието от 2023 г. на Digital Maturity Index на Deloitte Германия не можа да бъде отворено; цитираме изданието от 2025 г.</li>
            <li>Не използваме източници, които не успяхме да отворим.</li>
          </ul>`],

  ["iztochnici", "Източници", `
          ${x.sourcesList}
          <p class="t-small">Всички връзки са проверени на 3 ноември 2026 г.</p>`],
];
};

const SECTIONS = { bg: sectionsBg(wpParts("bg")), en: sectionsEn(wpParts("en")) };
const renderSections = (lang) => SECTIONS[lang].map(([id, title, body]) => {
  const fid = DATA[lang].P + id;
  return `
        <section id="${fid}" aria-labelledby="${fid}-h">
          <h2 class="t-h2" id="${fid}-h">${title}</h2>${body}
        </section>`;
}).join("\n");
const tocHtml = (lang) => `<nav class="toc" aria-labelledby="${DATA[lang].P}toc-h">
            <p class="t-label t-label--accent" id="${DATA[lang].P}toc-h">${LBL[lang].toc}</p>
            <ol>
              ${(lang === "bg" ? TOC : TOC_EN).map(([id, l]) => `<li><a href="#${DATA[lang].P}${id}">${l}</a></li>`).join("\n              ")}
            </ol>
          </nav>`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: WP.title,
  alternativeHeadline: WP_EN.title,
  description: WP.description,
  inLanguage: ["bg", "en"],
  datePublished: WP.dateIso,
  dateModified: WP.dateIso,
  author: { "@type": "Person", name: WP.author },
  publisher: { "@type": "Organization", name: "МСП Компас" },
  about: ["цифрова зрялост", "цифрова трансформация", "малки и средни предприятия", "износ", "България"],
};

write(WP.file, {
  title: `${WP.title} · МСП Компас`,
  titleEn: `${WP_EN.title} · MSP Compass`,
  description: WP.description,
  head: `  <meta property="og:type" content="article">
  <meta property="article:published_time" content="${WP.dateIso}">
  <meta property="article:author" content="${WP.author}">
  <meta name="author" content="${WP.author}, ${WP.org}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  script: `window.addEventListener("beforeprint", () => document.querySelectorAll("details").forEach((d) => { d.dataset.wasOpen = d.open; d.open = true; }));
window.addEventListener("afterprint", () => document.querySelectorAll("details").forEach((d) => { d.open = d.dataset.wasOpen === "true"; }));`,
  main: `
${pageHero({
  crumbs: [["index.html", home], ["analizi.html", t("Анализи", "Whitepapers")], [null, t("Цифрова зрялост", "Digital maturity")]],
  label: t("Анализ № 1", "Whitepaper no. 1"),
  title: t(WP.title, WP_EN.title),
  lead: t(WP.subtitle, WP_EN.subtitle),
  extra: `<dl class="meta-row meta-row--inverse">
            <div><dt class="t-label">${t("Автор", "Author")}</dt><dd>${WP.author}, ${t(WP.org, WP_EN.org)}</dd></div>
            <div><dt class="t-label">${t("Дата", "Date")}</dt><dd><time datetime="${WP.dateIso}">${t(WP.dateBg, WP_EN.dateEn)}</time></dd></div>
            <div><dt class="t-label">${t("Версия", "Version")}</dt><dd>${WP_EN.version}</dd></div>
            <div><dt class="t-label">${t("Четене", "Reading time")}</dt><dd>${t(WP.readingTime, WP_EN.readingTime)}</dd></div>
          </dl>`,
})}

    <section class="section">
      <div class="container article">
        <div class="article__main">
          <div class="wp-lang" data-l="bg">
${renderSections("bg")}
          </div>
          <div class="wp-lang" data-l="en" lang="en">
${renderSections("en")}
          </div>
        </div>
        <aside class="aside no-print" aria-label="${t("Съдържание", "Contents").replace(/<[^>]+>/g, " ").trim()}">
          <div data-l="bg">${tocHtml("bg")}</div>
          <div data-l="en" lang="en">${tocHtml("en")}</div>
          <div class="stack stack--sm">
            <a class="btn btn--primary" href="samoocenka-digitalna-zrelost.html">${t("Направете самооценка", "Take the self-assessment")} ${arrow}</a>
            <button class="btn btn--secondary" type="button" data-print>${t("Печат или PDF", "Print or PDF")}</button>
          </div>
        </aside>
      </div>
    </section>`,
});

/* ================================================================ self-assessment */
const toolData = DIMENSIONS.map((d) => ({ id: d.id, name: d.name, criteria: d.criteria.map((c) => ({ id: c.id, name: c.name, levels: c.levels })) }));
const sel = (name, label, opts, def = "") => `<div class="field field--inline">
                <label for="${name}">${label}</label>
                <select class="select input" id="${name}" name="${name}">
                  ${def === "" ? `<option value="">Изберете</option>` : ""}
                  ${opts.map((o, i) => `<option value="${i + 1}"${String(i + 1) === def ? " selected" : ""}>${i + 1} · ${o}</option>`).join("")}
                </select>
              </div>`;

const toolForm = DIMENSIONS.map((d, i) => `
          <fieldset class="dma-dim" id="dim-${d.id}">
            <legend><span class="t-label t-label--accent">Измерение ${i + 1} от 8</span><span class="t-h3">${d.name}</span></legend>
            <p class="t-body">${d.question}</p>
            <div class="dma-lenses">
              ${sel(`m-${d.id}`, `${LENSES.manage.name}: ${LENSES.manage.q}`, LENSES.manage.levels)}
              ${sel(`u-${d.id}`, `${LENSES.use.name}: ${LENSES.use.q}`, LENSES.use.levels)}
              ${sel(`t-${d.id}`, "Целево ниво за това измерение (според стратегията)", LEVELS.map((l) => l.name), "3")}
            </div>
            ${d.criteria.map((c) => `<fieldset class="dma-crit">
              <legend>${c.id.toUpperCase()} · ${c.name}</legend>
              <div class="dma-options">
                ${c.levels.map((l, j) => `<label class="dma-opt"><input type="radio" name="${c.id}" value="${j + 1}"><span class="lvl lvl--${j + 1}">${j + 1}</span><span>${l}</span></label>`).join("\n                ")}
              </div>
            </fieldset>`).join("\n            ")}
          </fieldset>`).join("\n");

write("samoocenka-digitalna-zrelost.html", {
  title: "Самооценка на цифровата зрялост · МСП Компас",
  titleEn: "Digital maturity self-assessment · MSP Compass",
  description: "Безплатна самооценка на цифровата зрялост в 8 измерения и 30 критерия за фирми с 30–150 заети. Изчислява се във вашия браузър; нищо не се изпраща.",
  head: `  <meta property="og:type" content="website">`,
  script: asset("assets/js/assessment.js"),
  main: `
${pageHero({
  crumbs: [["index.html", home], [null, t("Самооценка", "Self-assessment")]],
  label: t("Инструмент", "Tool"),
  title: "Самооценка на цифровата зрялост",
  lead: "30 критерия в 8 измерения, по подхода от анализа „" + WP.shortTitle + "“. Около 20 минути.",
})}

    <section class="section">
      <div class="container article">
        <div class="article__main">
          <div class="notice" data-l="en" lang="en"><strong>In English.</strong> This self-assessment is in Bulgarian. It runs entirely in your browser: answers are never sent anywhere, and are kept only in this browser so you can come back later. Use “Изчисти отговорите” to delete them.</div>
          <div class="callout">
            <p class="t-label t-label--accent">Как работи</p>
            <ul>
              <li>За всеки критерий изберете описанието, което най-точно отговаря на това, което се вижда във фирмата днес. Ако се колебаете, изберете по-ниското ниво.</li>
              <li>Не е нужно да попълните всичко. Резултатът се обновява след всеки отговор.</li>
              <li>Целевото ниво по подразбиране е 3. Променете го там, където стратегията ви изисква друго.</li>
              <li><strong>Поверителност:</strong> отговорите се изчисляват във вашия браузър и не се изпращат никъде. Пазят се само в този браузър, докато не натиснете „Изчисти отговорите“.</li>
            </ul>
          </div>
          <form id="dma-form" class="dma-form" onsubmit="return false">
${toolForm}
          </form>

          <section id="rezultat" aria-labelledby="rezultat-h" class="dma-results-wrap">
            <h2 class="t-h2" id="rezultat-h">Вашият профил</h2>
            <p class="t-body" id="dma-empty">Отговорете на поне един критерий, за да видите профила.</p>
            <div id="dma-results" hidden>
              <div class="table-wrap" role="region" aria-label="Профил по измерения" tabindex="0">
                <table class="data-table data-table--stack">
                  <caption>Средно ниво, най-слаб критерий и двете гледни точки по измерения. Вертикалната линия показва целта.</caption>
                  <thead><tr><th scope="col">Измерение</th><th scope="col">Профил (1–4)</th><th scope="col" class="t-num">Средно</th><th scope="col">Най-слаб критерий</th><th scope="col" class="t-num">Управл. / разпростр.</th></tr></thead>
                  <tbody id="dma-profile"></tbody>
                </table>
              </div>
              <h3 class="t-h3">Откъде да започнете</h3>
              <p class="t-body">Критериите с най-голяма разлика спрямо целта и как изглежда следващото им ниво. Това е отправна точка за разговор, а не препоръка.</p>
              <ol class="dma-next" id="dma-next"></ol>
            </div>
          </section>
          <script type="application/json" id="dma-data">${JSON.stringify(toolData).replace(/</g, "\\u003c")}</script>
        </div>
        <aside class="aside no-print" aria-label="Напредък">
          <div class="dma-progress-box">
            <p class="t-label t-label--accent">Попълнени критерии</p>
            <p class="t-h3" id="dma-progress" aria-live="polite">0 / 30</p>
            <div class="dma-progress" role="progressbar" aria-label="Попълнени критерии" aria-valuemin="0" aria-valuemax="30" aria-valuenow="0"><span id="dma-progress-bar"></span></div>
            <a class="link-arrow" href="#rezultat">Към профила ${arrow}</a>
          </div>
          <div class="stack stack--sm">
            <button class="btn btn--secondary" type="button" data-print>Печат или PDF</button>
            <button class="btn btn--secondary" type="button" id="dma-reset">Изчисти отговорите</button>
            <a class="link-arrow" href="${WP.file}#podhod">Как е изграден подходът ${arrow}</a>
          </div>
        </aside>
      </div>
    </section>`,
});

/* ================================================================ contact */
write("kontakti.html", {
  title: "Контакти · МСП Компас",
  titleEn: "Contact · MSP Compass",
  description: "Въпроси, коментари по анализите и предложения за следващи теми за МСП Компас.",
  main: `
${pageHero({
  crumbs: [["index.html", home], [null, t("Контакти", "Contact")]],
  label: t("Контакти", "Contact"),
  title: t("Коментари и предложения за теми", "Comments and topic suggestions"),
  lead: t("Ако имате коментар по анализ, забелязана грешка в данните или тема, която да разгледаме, пишете ни.",
          "If you have a comment on a whitepaper, spotted an error in the data, or have a topic we should look at, write to us."),
})}

    <section class="section">
      <div class="container stack stack--xl contact-simple">
        <div class="stack stack--sm">
          <p class="t-label t-label--muted">${t("Имейл", "Email")}</p>
          <div class="copy-row">
            <strong id="email">${EMAIL}</strong>
            <button class="btn btn--secondary" type="button" data-copy="#email">${t("Копирай", "Copy")}</button>
          </div>
        </div>
        ${tb("Сайтът няма форма за контакт и не събира лични данни. Пишете ни директно на имейла.",
             "The site has no contact form and collects no personal data. Please write to the email address directly.", "p", ' class="t-body"')}
      </div>
    </section>`,
});

/* ================================================================ Markdown export of the whitepaper */
const md = (html) => html
  .replace(/<sup class="cite">\[(.*?)\]<\/sup>/g, (_, inner) => `[${inner.replace(/<[^>]+>/g, "")}]`)
  .replace(/<caption>(.*?)<\/caption>/g, "\n*$1*\n")
  .replace(/<table[^>]*>([\s\S]*?)<\/table>/g, (_, tb) => {
    const rows = [...tb.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => c[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()));
    if (!rows.length) return "";
    const w = Math.max(...rows.map((r) => r.length));
    const line = (r) => `| ${[...r, ...Array(w - r.length).fill("")].join(" | ")} |`;
    return `\n${line(rows[0])}\n|${" --- |".repeat(w)}\n${rows.slice(1).map(line).join("\n")}\n`;
  })
  .replace(/<summary>([\s\S]*?)<\/summary>/g, (_, s) => `\n#### ${s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`)
  .replace(/<p class="crit__name">(.*?)<\/p>/g, "\n**$1**\n")
  .replace(/<h3[^>]*>(.*?)<\/h3>/g, "\n### $1\n")
  .replace(/<h4[^>]*>(.*?)<\/h4>/g, "\n#### $1\n")
  .replace(/<li[^>]*>/g, "\n- ")
  .replace(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/g, (_, h, l) => (h.startsWith("#") || !/^https?:/.test(h) ? l : `[${l}](${h})`))
  .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
  .replace(/<\/p>/g, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/\n[ \t]+/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const mdDoc = (lang) => lang === "bg" ? `# ${WP.title}

${WP.subtitle}

Автор: ${WP.author}, ${WP.org} · ${WP.dateBg} · ${WP.version}

> Генерирано от scripts/build-pages.mjs. Не редактирайте ръчно; редактирайте scripts/whitepaper.mjs и scripts/build-pages.mjs.

${SECTIONS.bg.map(([, title, body]) => `## ${title}\n\n${md(body)}`).join("\n\n")}
` : `# ${WP_EN.title}

${WP_EN.subtitle}

Author: ${WP.author}, ${WP_EN.org} · ${WP_EN.dateEn} · Version ${WP_EN.version}

> Generated by scripts/build-pages.mjs. Do not edit by hand; edit scripts/whitepaper-en.mjs instead.

${SECTIONS.en.map(([, title, body]) => `## ${title}\n\n${md(body)}`).join("\n\n")}
`;
mkdirSync(resolve(ROOT, "output"), { recursive: true });
writeFileSync(resolve(ROOT, "output", `${WP.dateIso}-${WP.slug}.md`), mdDoc("bg"));
writeFileSync(resolve(ROOT, "output", `${WP.dateIso}-${WP.slug}-en.md`), mdDoc("en"));

console.log(`${count} pages written, plus output/${WP.dateIso}-${WP.slug}.md and -en.md`);
