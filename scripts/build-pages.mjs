// Generates the five HTML pages from the content below + the shared header/footer in layout.mjs.
// Edit copy here, then run: node scripts/build-pages.mjs
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { page, arrow, methodTag, METHODS } from "./layout.mjs";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const write = (file, title, description, main) =>
  writeFileSync(resolve(OUT, file), page({ file, title, description, main }));

/* ------------------------------------------------------------------ data */

const AREAS = [
  { deg: "000°", name: "Стратегия и посока", text: "Къде сме днес, накъде искаме да стигнем и какво ще оставим настрана.", methods: ["swot", "bmc"] },
  { deg: "072°", name: "Пазар и конкуренция", text: "Кой взима маржа в бранша и как да защитим позицията си.", methods: ["porter"] },
  { deg: "144°", name: "Растеж и продажби", text: "Откъде да дойде следващият ръст: нови клиенти, продукти или пазари.", methods: ["ansoff"] },
  { deg: "216°", name: "Операции и разходи", text: "Къде създаваме стойност и къде изтичат пари и време.", methods: ["value-chain"] },
  { deg: "288°", name: "Изпълнение и показатели", text: "Как да превърнем плана в седмични действия и да видим дали работи.", methods: ["bsc"] },
];

const CHALLENGES = [
  { title: "Продажбите не растат", text: "Оборотът е на едно и също ниво от няколко години, а познатите канали вече не носят нови клиенти.", methods: ["ansoff", "porter"] },
  { title: "Оборотът расте, печалбата не", text: "Работите повече, но маржът се свива, защото разходите растат по-бързо от приходите.", methods: ["value-chain", "bmc"] },
  { title: "Не е ясно накъде да вървим", text: "Екипът дърпа в различни посоки, а решенията се взимат според спешното, не според важното.", methods: ["swot", "bmc"] },
  { title: "Конкурент сваля цените", text: "Нов играч или голяма верига натиска пазара и клиентите започват да сравняват само по цена.", methods: ["porter", "swot"] },
  { title: "Фирмата расте, контролът се губи", text: "Повече хора и повече поръчки, а собственикът все още проверява всичко лично.", methods: ["bsc", "value-chain"] },
  { title: "Обмисляме нов продукт или пазар", text: "Има идея, но не е ясно дали си струва инвестицията и какво ще промени в бизнеса.", methods: ["ansoff", "bmc"] },
];

const SECTORS = [
  { name: "Търговия", text: "Тесни маржове, оборот на стоката и натиск от големите вериги.", qs: ["Кои артикули реално носят печалба?", "Как да се отличим от веригите?"], methods: ["porter", "value-chain"] },
  { name: "Производство", text: "Капацитет, себестойност и зависимост от няколко големи клиента.", qs: ["Колко струва реално една единица продукция?", "Как да намалим зависимостта от един клиент?"], methods: ["value-chain", "ansoff"] },
  { name: "Услуги", text: "Продуктът е времето на екипа. Ценообразуването и натовареността решават всичко.", qs: ["Как да ценообразуваме по стойност, а не по часове?", "Кои клиенти ни струват повече, отколкото плащат?"], methods: ["bmc", "bsc"] },
  { name: "ХоРеКа", text: "Сезонност, текучество на персонала и растящи разходи за храна и енергия.", qs: ["Как да изгладим сезонните спадове?", "Къде изтичат разходите в кухнята?"], methods: ["value-chain", "swot"] },
  { name: "Строителство", text: "Проектен бизнес с дълги срокове на плащане, поскъпващи материали и недостиг на кадри.", qs: ["Кои проекти да приемаме и кои да откажем?", "Как да защитим маржа при ръст на цените?"], methods: ["porter", "bsc"] },
  { name: "Логистика", text: "Горивото, заплатите и пълнотата на курсовете определят маржа.", qs: ["Кои маршрути и клиенти са печеливши?", "Как да растем без нови превозни средства?"], methods: ["value-chain", "ansoff"] },
];

const METHOD_DETAILS = [
  {
    id: "swot", area: "strategy", areaName: "Стратегия и посока",
    q: "Къде сме днес и какво ни позволява това?",
    when: "Преди годишно планиране, при смяна на посоката или преди разговор с банка или инвеститор.",
    time: "1,5–2 часа", people: "3–5 души от различни звена", result: "Една страница с 3–5 приоритета",
    steps: [
      "Съберете малък екип от различни звена и отделете 90 минути без прекъсвания.",
      "Попълнете четирите полета: силни и слаби страни (вътре във фирмата), възможности и заплахи (на пазара).",
      "Оставете най-много 5 точки на поле, подредени по влияние върху печалбата.",
      "Превърнете комбинациите в действия: как силите използват възможностите и как слабостите се пазят от заплахите.",
    ],
  },
  {
    id: "porter", area: "market", areaName: "Пазар и конкуренция",
    q: "Колко печеливш е нашият пазар и кой взима маржа?",
    when: "При натиск върху цените, при навлизане в нов пазар или когато доставчик или клиент диктува условията.",
    time: "2–3 часа", people: "Собственик и търговски ръководител", result: "Карта на натиска с 1–2 защитни хода",
    steps: [
      "Определете точно пазара: продукт, тип клиенти и география.",
      "Оценете всяка сила от 1 до 5: съперничество в бранша, нови участници, заместители, сила на доставчиците, сила на клиентите.",
      "За всяка висока оценка запишете конкретната причина и пример от последната година.",
      "Изберете 1–2 хода, които намаляват натиска: дългосрочни договори, диференциация или нови канали.",
    ],
  },
  {
    id: "ansoff", area: "growth", areaName: "Растеж и продажби",
    q: "Откъде да дойде следващият ръст?",
    when: "Когато продажбите стагнират или има няколко идеи за растеж и трябва да изберете една.",
    time: "2 часа", people: "Собственик и екипът по продажби", result: "Подреден списък с растежни ходове",
    steps: [
      "Разпределете идеите за растеж в четири полета: същите продукти на същия пазар, нови пазари, нови продукти, диверсификация.",
      "За всяка идея оценете нужната инвестиция и риска по скала от 1 до 5.",
      "Започнете от полето с най-нисък риск. Обикновено това е по-голям дял от сегашните клиенти.",
      "Задайте срок и един измерим показател за всеки избран ход.",
    ],
  },
  {
    id: "value-chain", area: "ops", areaName: "Операции и разходи",
    q: "Къде създаваме стойност и къде губим пари?",
    when: "Когато оборотът расте, а печалбата не, или преди решение за аутсорсинг или автоматизация.",
    time: "Половин ден", people: "Ръководители на основните звена", result: "Карта на разходите и 1–2 конкретни икономии",
    steps: [
      "Начертайте пътя на една поръчка: доставка, производство или подготовка, продажба, доставка до клиента, обслужване.",
      "За всяка стъпка запишете разходите и времето, което отнема.",
      "Отбележете стъпките, за които клиентът реално плаща, и тези, които само струват.",
      "Изберете една стъпка за оптимизация или аутсорсинг през следващото тримесечие.",
    ],
  },
  {
    id: "bmc", area: "strategy", areaName: "Стратегия и посока",
    q: "Как точно печелим пари и какво се променя, ако сменим един елемент?",
    when: "При нов продукт или пазар, при спад в приходите или когато трябва да обясните бизнеса на партньор.",
    time: "2–3 часа", people: "Собственик и 1–2 ключови души", result: "Бизнес моделът на една страница",
    steps: [
      "Попълнете деветте полета: клиенти, стойност, канали, взаимоотношения, приходи, ресурси, дейности, партньори, разходи.",
      "Започнете от клиентските сегменти и предложението за стойност. Останалите полета следват от тях.",
      "Проверете дали приходите покриват разходите при реалистични обеми.",
      "Направете втора версия за новата идея и сравнете двете една до друга.",
    ],
  },
  {
    id: "bsc", area: "exec", areaName: "Изпълнение и показатели",
    q: "Как да разберем, че стратегията работи?",
    when: "Когато фирмата расте и собственикът вече не може да следи всичко лично.",
    time: "1 ден за настройка", people: "Целият ръководен екип", result: "Табло с 8–12 показателя",
    steps: [
      "Изберете 2–3 цели във всяка от четирите перспективи: финанси, клиенти, вътрешни процеси, хора и развитие.",
      "Задайте по един показател и целева стойност за всяка цел.",
      "Определете отговорник и честота на измерване. Веднъж месечно е достатъчно за повечето МСП.",
      "Преглеждайте таблото на редовна среща и коригирайте действията, не целите.",
    ],
  },
];

const AREA_FILTERS = [
  ["all", "Всички"],
  ["strategy", "Стратегия"],
  ["market", "Пазар"],
  ["growth", "Растеж"],
  ["ops", "Операции"],
  ["exec", "Изпълнение"],
];

/* ------------------------------------------------------------------ index */

write("index.html", "МСП Компас", "Стратегическите рамки на водещите консултантски компании, приложени към българските малки и средни предприятия.", `
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero__grid">
        <div class="hero__copy">
          <p class="eyebrow t-label">Стратегия за малкия и средния бизнес</p>
          <h1 class="t-display" id="hero-title">Консултантското знание на най-добрите, <span class="t-em">отворено</span> за българския бизнес.</h1>
          <p class="t-lead">Рамките, с които водещите консултантски компании работят за световни корпорации, обяснени на ясен език и приложени към реалностите на българските малки и средни предприятия.</p>
          <div class="hero__actions">
            <a class="btn btn--primary btn--lg" href="predizvikatelstva.html">Започнете от проблема ${arrow}</a>
            <a class="btn btn--secondary btn--lg" href="metodi.html">Разгледайте методите</a>
          </div>
        </div>

        <figure class="compass" aria-label="Компас с четирите принципа: Посока, Яснота, Решения, Растеж">
          <div class="compass__dial"></div>
          <div class="compass__ticks"></div>
          <div class="compass__ticks compass__ticks--major"></div>
          <svg class="compass__rose" viewBox="0 0 200 200" aria-hidden="true">
            <g transform="rotate(45 100 100)">
              <polygon points="100,30 106,100 94,100" style="fill:var(--color-border-default)"/>
              <polygon points="100,170 106,100 94,100" style="fill:var(--color-border-default)"/>
              <polygon points="30,100 100,94 100,106" style="fill:var(--color-border-default)"/>
              <polygon points="170,100 100,94 100,106" style="fill:var(--color-border-default)"/>
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
            <span class="compass__point compass__point--n"><span class="t-label">N 000°</span><b>Посока</b></span>
            <span class="compass__point compass__point--e"><b>Яснота</b><span class="t-label">E 090°</span></span>
            <span class="compass__point compass__point--s"><span class="t-label">S 180°</span><b>Решения</b></span>
            <span class="compass__point compass__point--w"><b>Растеж</b><span class="t-label">W 270°</span></span>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="section" aria-labelledby="ways-title">
      <div class="container stack stack--xl">
        <div class="section-head">
          <p class="eyebrow t-label">Как да започнете</p>
          <h2 class="t-h2" id="ways-title">Два входа към едни и същи инструменти</h2>
        </div>
        <div class="entry">
          <a class="card card--link entry__card" href="predizvikatelstva.html">
            <span class="entry__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg></span>
            <div class="stack stack--sm">
              <h3 class="t-h3">По предизвикателство</h3>
              <p class="t-body">Знаете какво не работи, но не и откъде да започнете. Изберете ситуацията, която описва вашия бизнес, и вижте кои рамки помагат.</p>
            </div>
            <span class="card__foot link-arrow">Шест типични ситуации ${arrow}</span>
          </a>
          <a class="card card--link entry__card" href="metodi.html">
            <span class="entry__icon entry__icon--gold" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
            <div class="stack stack--sm">
              <h3 class="t-h3">По метод</h3>
              <p class="t-body">Чували сте за SWOT или Петте сили на Портър и искате да ги приложите правилно. Всеки метод е описан стъпка по стъпка.</p>
            </div>
            <span class="card__foot link-arrow">Библиотека с методи ${arrow}</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section section--subtle" aria-labelledby="areas-title">
      <div class="container stack stack--xl">
        <div class="section-head section-head--split">
          <div class="stack">
            <p class="eyebrow t-label">Пет посоки на работа</p>
            <h2 class="t-h2" id="areas-title">Всяко управленско решение сочи в една от пет посоки</h2>
          </div>
          <p class="t-body">Подредихме методите по въпроса, на който отговарят. Така стигате до правилния инструмент, без да знаете името му предварително.</p>
        </div>
        <ul class="bearings" role="list">
          ${AREAS.map((a) => `<li class="bearing">
            <span class="bearing__deg t-label">${a.deg}</span>
            <div class="bearing__body">
              <h3 class="t-h4">${a.name}</h3>
              <p class="t-small">${a.text}</p>
              <div class="bearing__methods">${a.methods.map(methodTag).join("")}</div>
            </div>
          </li>`).join("\n          ")}
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="how-title">
      <div class="container stack stack--xl">
        <div class="section-head">
          <p class="eyebrow t-label">Как работи</p>
          <h2 class="t-h2" id="how-title">От проблем до решение в три стъпки</h2>
        </div>
        <ol class="steps" role="list">
          <li class="step">
            <span class="step__num">1</span>
            <h3 class="t-h4">Назовете предизвикателството</h3>
            <p class="t-small">Опишете с прости думи какво не работи: продажби, маржове, екип или посока.</p>
          </li>
          <li class="step">
            <span class="step__num">2</span>
            <h3 class="t-h4">Изберете рамката</h3>
            <p class="t-small">Всяка ситуация води до една или две рамки, които отговарят точно на вашия въпрос.</p>
          </li>
          <li class="step">
            <span class="step__num">3</span>
            <h3 class="t-h4">Приложете и измерете</h3>
            <p class="t-small">Следвайте стъпките с екипа си и проследете резултата с един ясен показател.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="featured-title">
      <div class="container stack stack--xl">
        <div class="section-head section-head--split">
          <div class="stack">
            <p class="eyebrow t-label">Методи</p>
            <h2 class="t-h2" id="featured-title">Три рамки, с които да започнете</h2>
          </div>
          <a class="link-arrow" href="metodi.html">Всички шест метода ${arrow}</a>
        </div>
        <div class="grid grid--3">
          ${["swot", "ansoff", "value-chain"].map((id) => {
            const m = METHOD_DETAILS.find((x) => x.id === id);
            return `<a class="card card--link" href="metodi.html#${id}">
            <div class="card__meta"><span class="t-label">${m.areaName}</span><span class="t-label">${m.time}</span></div>
            <h3 class="t-h3">${METHODS[id]}</h3>
            <p class="method-card__q">„${m.q}“</p>
            <span class="card__foot link-arrow">Как се прилага ${arrow}</span>
          </a>`;
          }).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="cta-title">
      <div class="container">
        <div class="cta-band">
          <div class="stack">
            <p class="eyebrow t-label">Конкретен казус?</p>
            <h2 class="t-h2" id="cta-title">Разкажете ни за вашия бизнес и ще ви посочим откъде да започнете.</h2>
            <p class="t-lead">Кратко описание е достатъчно. Отговаряме в рамките на два работни дни.</p>
          </div>
          <a class="btn btn--on-inverse btn--lg" href="kontakti.html">Опишете казуса ${arrow}</a>
        </div>
      </div>
    </section>`);

/* ------------------------------------------------------------------ challenges */

write("predizvikatelstva.html", "Предизвикателства · МСП Компас", "Шест типични ситуации в малкия и средния бизнес и рамките, които помагат при всяка от тях.", `
    <section class="page-head">
      <div class="container page-head__inner">
        <p class="eyebrow t-label">Вашите предизвикателства</p>
        <h1 class="t-h1">Започнете от това, което не работи</h1>
        <p class="t-lead">Повечето собственици не търсят „SWOT анализ“. Търсят отговор защо продажбите стоят на място. Изберете ситуацията, която най-точно описва вашия бизнес.</p>
      </div>
    </section>

    <section class="section">
      <div class="container stack stack--xl">
        <div class="grid grid--3">
          ${CHALLENGES.map((c) => `<article class="card">
            <h2 class="challenge__title">${c.title}</h2>
            <p class="t-body">${c.text}</p>
            <div class="card__foot challenge__start">
              <p class="t-label" style="color:var(--color-text-muted)">Започнете с</p>
              <div class="cluster">${c.methods.map(methodTag).join("")}</div>
            </div>
          </article>`).join("\n          ")}
        </div>

        <div class="cta-band">
          <div class="stack">
            <h2 class="t-h3">Не откривате своя случай?</h2>
            <p class="t-lead">Опишете ситуацията с няколко изречения и ще ви предложим подходяща рамка.</p>
          </div>
          <a class="btn btn--on-inverse btn--lg" href="kontakti.html">Пишете ни ${arrow}</a>
        </div>
      </div>
    </section>`);

/* ------------------------------------------------------------------ sectors */

write("sektori.html", "Сектори · МСП Компас", "Как стратегическите рамки се прилагат в търговията, производството, услугите, ХоРеКа, строителството и логистиката.", `
    <section class="page-head">
      <div class="container page-head__inner">
        <p class="eyebrow t-label">Сектори</p>
        <h1 class="t-h1">Една и съща рамка, различен бранш</h1>
        <p class="t-lead">Матрицата на Ансоф изглежда различно в ресторант и в транспортна фирма. Тук събираме типичните въпроси във всеки сектор и методите, които им отговарят.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid grid--3">
          ${SECTORS.map((s) => `<article class="card">
            <div class="sector__head">
              <h2 class="t-h3">${s.name}</h2>
              <span class="pill">Наръчник в подготовка</span>
            </div>
            <p class="t-body">${s.text}</p>
            <ul class="qlist">${s.qs.map((q) => `<li>${q}</li>`).join("")}</ul>
            <div class="card__foot cluster">${s.methods.map(methodTag).join("")}</div>
          </article>`).join("\n          ")}
        </div>
      </div>
    </section>`);

/* ------------------------------------------------------------------ methods */

write("metodi.html", "Методи · МСП Компас", "Шест стратегически рамки, описани стъпка по стъпка за малки и средни предприятия.", `
    <section class="page-head">
      <div class="container page-head__inner">
        <p class="eyebrow t-label">Методи и инструменти</p>
        <h1 class="t-h1">Шест рамки, които всеки собственик може да приложи</h1>
        <p class="t-lead">За всяка рамка: на какъв въпрос отговаря, кога да я използвате, колко време отнема и как да я приложите с екипа си.</p>
      </div>
    </section>

    <section class="section">
      <div class="container library">
        <aside class="toc" aria-label="Съдържание">
          <p class="t-label" style="color:var(--color-text-muted)">Съдържание</p>
          <nav class="toc__list">
            ${METHOD_DETAILS.map((m) => `<a class="toc__link" href="#${m.id}">${METHODS[m.id]}</a>`).join("\n            ")}
          </nav>
        </aside>

        <div class="stack stack--lg">
          <div class="filters" role="group" aria-label="Филтър по посока">
            ${AREA_FILTERS.map(([v, l], i) => `<button class="chip" type="button" data-filter="${v}" aria-pressed="${i === 0}">${l}</button>`).join("\n            ")}
          </div>
          <p class="t-small" id="filter-status" aria-live="polite">Показани са всички 6 метода.</p>

          ${METHOD_DETAILS.map((m) => `<article class="method" id="${m.id}" data-area="${m.area}">
            <header class="method__head">
              <div class="card__meta"><span class="t-label" style="color:var(--color-text-gold)">${m.areaName}</span></div>
              <h2 class="t-h2">${METHODS[m.id]}</h2>
              <p class="method-card__q">„${m.q}“</p>
            </header>
            <div class="method__cols">
              <div class="stack">
                <p class="t-body"><strong style="color:var(--color-text-primary)">Кога:</strong> ${m.when}</p>
                <dl class="facts">
                  <dt>Време</dt><dd>${m.time}</dd>
                  <dt>Участници</dt><dd>${m.people}</dd>
                  <dt>Резултат</dt><dd>${m.result}</dd>
                </dl>
              </div>
              <div class="stack stack--sm">
                <h3 class="t-label" style="color:var(--color-text-muted)">Стъпки</h3>
                <ol class="method__steps">${m.steps.map((s) => `<li><span>${s}</span></li>`).join("")}</ol>
              </div>
            </div>
          </article>`).join("\n          ")}
        </div>
      </div>
    </section>`);

/* ------------------------------------------------------------------ contact */

write("kontakti.html", "Контакти · МСП Компас", "Опишете предизвикателството на вашия бизнес и ще ви посочим откъде да започнете.", `
    <section class="page-head">
      <div class="container page-head__inner">
        <p class="eyebrow t-label">Контакти</p>
        <h1 class="t-h1">Разкажете ни за вашия бизнес</h1>
        <p class="t-lead">Няколко изречения са достатъчни. Ще ви отговорим с конкретна рамка и първа стъпка.</p>
      </div>
    </section>

    <section class="section">
      <div class="container contact">
        <div class="stack stack--lg">
          <div class="stack">
            <h2 class="t-h3">Какво следва</h2>
            <ol class="steps" role="list" style="grid-template-columns:1fr;gap:var(--space-5)">
              <li class="step"><span class="step__num">1</span><p class="t-small">Изпращате кратко описание на ситуацията.</p></li>
              <li class="step"><span class="step__num">2</span><p class="t-small">До два работни дни получавате препоръка за рамка и първа стъпка.</p></li>
              <li class="step"><span class="step__num">3</span><p class="t-small">Ако е нужно, уговаряме 30-минутен разговор.</p></li>
            </ol>
          </div>
          <div class="stack stack--sm">
            <p class="t-label" style="color:var(--color-text-muted)">Имейл</p>
            <div class="copy-row">
              <strong id="email">info@mspkompas.bg</strong>
              <button class="btn btn--secondary" type="button" data-copy="#email">Копирай</button>
            </div>
          </div>
        </div>

        <div class="card" style="padding:clamp(24px,4vw,40px)">
          <form class="form" id="contact-form" novalidate>
            <div class="form__row">
              <div class="field">
                <label for="f-name">Име</label>
                <input class="input" id="f-name" name="name" autocomplete="name" required>
              </div>
              <div class="field">
                <label for="f-company">Фирма</label>
                <input class="input" id="f-company" name="company" autocomplete="organization">
              </div>
            </div>
            <div class="form__row">
              <div class="field">
                <label for="f-email">Имейл</label>
                <input class="input" id="f-email" name="email" type="email" autocomplete="email" required>
              </div>
              <div class="field">
                <label for="f-sector">Сектор</label>
                <select class="select" id="f-sector" name="sector">
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
            <div class="cluster" style="justify-content:space-between">
              <p class="t-small">Всички полета без „Фирма“ и „Сектор“ са задължителни.</p>
              <button class="btn btn--primary btn--lg" type="submit">Изпрати ${arrow}</button>
            </div>
            <div class="notice" id="form-notice" role="status" hidden></div>
          </form>
        </div>
      </div>
    </section>`);

console.log("pages written to", OUT);
