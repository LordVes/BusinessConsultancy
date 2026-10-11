# МСП Компас (MSP Compass)

A static website in Bulgarian for Bulgarian small and medium businesses. It turns the frameworks used by top consulting firms into practical, step-by-step guides.

Its structure follows a top-tier consultancy site (Bain-style): a utility bar, dropdown menus, a full-width navy hero, a featured-insights grid, statement bands, list rows with arrows, a figures band, "Накратко" boxes on articles, and a dark footer. The brand keeps its own navy, gold and teal and the compass rose.

It's plain HTML, CSS and JS with no framework. Open `index.html` directly, or host the folder anywhere: GitHub Pages, Netlify Drop or tiiny.host.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: hero with the compass, featured insights, belief statement, challenge and sector lists, figures band, five focus areas, CTA |
| `predizvikatelstva.html` | Six common business challenges, each linked to the right methods |
| `sektori.html` | Six sectors with typical questions and relevant methods |
| `metodi.html` | Methods library with a filter by focus area |
| `metod-*.html` | Six method articles, each with a "Накратко" box, when to use it, steps, typical mistakes, related challenges and more methods |
| `podhod.html` | Our approach: why the site exists, four principles (the compass points), how we work |
| `kontakti.html` | Contact details and a form (validated in the browser, **not connected to a backend yet**) |

## How it's built (Figma best practices applied to code)

1. **Variables → tokens.** `tokens/tokens.json` (W3C design-token / DTCG format) is the single source of truth. Its structure matches Figma Variables:
   - `primitives`: the raw palette. Components never use these directly.
   - `light` / `dark`: two modes of the semantic collection.
   - `color/inverse/*`: the values for navy sections. The `.on-inverse` class switches any section to them, the same way you'd apply a variable mode to a frame in Figma.
   - `scale`: spacing on an 8-pt scale, radii, the type scale, shadows and motion.

   `node scripts/build-tokens.mjs` generates `assets/css/tokens.css` from it. You can bring the JSON into Figma with a token-import plugin such as Tokens Studio.
2. **Auto layout.** All spacing between elements uses flex/grid `gap`, never margins between siblings.
3. **Text styles.** One typeface, Golos Text (designed with Cyrillic in mind), on a fixed type scale: display, h1–h4, lead, body, small, label and stat.
4. **Components and variants.** Class names match Figma component names:
   - Button, Link-arrow, Tag, Pill
   - Insight card (default/lead), Art panel (navy/teal/gold)
   - Mega menu, Row link, Stat, Bearing, Tile
   - Glance box, Steps, Split CTA, Page hero, Field
   - Header, Footer
5. **Art panels instead of photos.** Each method has its own diagram drawn in SVG: the SWOT grid, the five forces, the Ansoff matrix, the value-chain chevrons, the nine canvas blocks, and the four scorecard perspectives. Sectors use line icons. Swap in photography later if you want.
6. **Accessibility.**
   - AA colour contrast in both modes
   - visible focus rings
   - tap targets of at least 44px
   - a skip link and breadcrumbs
   - dropdown menus that work by keyboard and close with Escape
   - respects the "reduce motion" setting

## Editing content

All copy lives in `scripts/content.mjs`. The header, footer, menus and diagrams are in `scripts/layout.mjs`. Page templates are in `scripts/build-pages.mjs`. After editing, run:

```sh
node scripts/build-pages.mjs   # regenerate all HTML pages
node scripts/build-tokens.mjs  # only if you changed tokens/tokens.json
```

## To do before going live

- Replace the placeholder email `info@mspkompas.bg` in `scripts/content.mjs`.
- Connect the contact form to a backend, e.g. Formspree or Netlify Forms.
- Write the sector guides (currently marked "Наръчник в подготовка").
