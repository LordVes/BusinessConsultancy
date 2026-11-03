# МСП Компас (MSP Compass)

A static thought-leadership website for Bulgarian export-oriented companies with 30–150 employees. It publishes whitepapers that describe a problem with sourced data, followed by ideas on how consulting approaches could address it. The goal is professional reputation: no pricing and no sales calls to action.

It's plain HTML, CSS and JS with no framework. Open `index.html` directly, or host the folder anywhere (GitHub Pages, Netlify Drop, tiiny.host). Every page works on its own: CSS and JS are inlined at build time.

## Pages

| File | Page |
|---|---|
| `index.html` | Intro: what MSP Compass is, the latest whitepaper, how we work (four principles) |
| `analizi.html` | Whitepapers index |
| `digitalna-zrelost-sredni-iznositeli.html` | Whitepaper no. 1: digital maturity of Bulgarian mid-sized exporters (Bulgarian, with an English summary) |
| `samoocenka-digitalna-zrelost.html` | Self-assessment: 30 criteria in 8 dimensions, scored in the browser |
| `kontakti.html` | Email contact only; no form and no data collection |

Every page has a BG/EN toggle. Site chrome is fully bilingual. The whitepaper and the self-assessment are in Bulgarian, with an English summary shown when EN is selected.

The whitepaper is also exported to `output/2026-11-03-digitalna-zrelost-sredni-iznositeli.md` on every build.

## Privacy

- The self-assessment sends nothing anywhere. Answers stay in the browser's `localStorage` (key `msp-dma-v1`) until the visitor clicks "Изчисти отговорите".
- No analytics, no cookies, no forms.
- The pages load fonts from Google Fonts, which sends the visitor's IP address to Google. Self-host the fonts if that is a concern.

## Editing content

| What | Where |
|---|---|
| Whitepaper data: figures, frameworks, 8 dimensions, 30 criteria, hypotheses, sources | `scripts/whitepaper.mjs` |
| Whitepaper narrative and all page templates | `scripts/build-pages.mjs` |
| Site-wide copy (principles, email) | `scripts/content.mjs` |
| Header, footer, navigation, language helpers `t()` / `tb()` | `scripts/layout.mjs` |
| Self-assessment logic | `assets/js/assessment.js` |
| Styles | `assets/css/styles.css` (tokens in `tokens/tokens.json`) |

Every figure in `scripts/whitepaper.mjs` carries a source id from `SOURCES`. Keep it that way: no figure without a source.

After editing, run:

```sh
node scripts/build-pages.mjs   # regenerate all HTML pages and the Markdown export
node scripts/build-tokens.mjs  # only if you changed tokens/tokens.json
```

To preview locally:

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

## How it's built (Figma best practices applied to code)

1. **Variables → tokens.** `tokens/tokens.json` (W3C design-token / DTCG format) is the single source of truth, structured like Figma Variables (primitives, light/dark modes, inverse colours, scale). `node scripts/build-tokens.mjs` generates `assets/css/tokens.css`.
2. **Auto layout.** All spacing between elements uses flex/grid `gap`.
3. **Text styles.** Source Serif 4 for headlines and Source Sans 3 for text, both with full Cyrillic.
4. **Components.** Class names match Figma component names: Button, Link-arrow, Insight card, Bearing, Glance box, Steps, Page hero, Data table, Callout, Level badge.
5. **Accessibility.** AA contrast in both themes, visible focus rings, 44px tap targets, skip link, breadcrumbs, keyboard-operable form controls, reduced-motion support. Wide tables stack into cards on phones.
6. **Print.** The whitepaper and the self-assessment have a print stylesheet; "Печат или PDF" opens the browser's print dialog.

## To do before going live

- Replace the placeholder email `info@mspkompas.bg` in `scripts/content.mjs`.
- Add the production domain, then a canonical URL and `og:url` per page.
- Decide whether to self-host fonts (see Privacy).
