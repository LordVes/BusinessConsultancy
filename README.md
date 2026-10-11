# МСП Компас (MSP Compass)

A static website in Bulgarian for Bulgarian small and medium businesses. It turns the frameworks used by top consulting firms into practical, step-by-step guides.

It's plain HTML, CSS and JS with no framework. Open `index.html` directly, or host the folder anywhere: GitHub Pages, Netlify Drop or tiiny.host.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: hero with a compass rose, two ways in, five focus areas, a three-step process, featured methods, CTA |
| `predizvikatelstva.html` | Six common business challenges, each linked to the right frameworks |
| `sektori.html` | Six sectors, with typical questions and relevant methods |
| `metodi.html` | Library of six methods with a filter, plus steps, time needed and the result of each |
| `kontakti.html` | Contact details and a form (validated in the browser, **not connected to a backend yet**) |

## How it's built (Figma best practices applied to code)

1. **Variables → tokens.** `tokens/tokens.json` is the single source of truth, in W3C design-token (DTCG) format. Its structure matches Figma Variables:
   - `primitives`: the raw palette (navy, gold, teal, ink, neutral). Components never use these directly.
   - `light` / `dark`: two modes of the semantic collection (`color/bg/canvas`, `color/text/primary`, `color/action/primary-bg`…).
   - `scale`: spacing on an 8-pt scale, radii, the type scale, shadows and motion.

   `node scripts/build-tokens.mjs` generates `assets/css/tokens.css` from it. You can bring the JSON into Figma with a token-import plugin such as Tokens Studio, so the code and the design file share the same variables.
2. **Auto layout.** All spacing between elements uses flex/grid `gap`, never margins between siblings.
3. **Text styles.** A fixed type scale (`.t-display`, `.t-h1`…`.t-h4`, `.t-lead`, `.t-body`, `.t-small`, `.t-label`), with fluid sizes set via `clamp()`.
   - Spectral: headings
   - Golos Text: body text
   - JetBrains Mono: labels and compass bearings

   All three fonts fully support Cyrillic.
4. **Components and variants.** Class names match Figma components, e.g. `Button / variant=primary, size=lg` → `.btn.btn--primary.btn--lg`. The inventory: Button, Link-arrow, Tag, Pill, Card (default/link), Eyebrow, Section header, Bearing, Step, Method, CTA band, Field/Input, Notice, Header, Footer.
5. **Layout grid and breakpoints.** 1200px max width, fluid gutter (16–40px). Breakpoints at 720 / 840 / 960 / 1024 / 1080px.
6. **Accessibility.**
   - AA colour contrast in both modes
   - visible focus rings
   - tap targets of at least 44px
   - a skip link
   - `aria-current` marking the active page
   - respects the "reduce motion" setting

## Editing content

The text for every page is in `scripts/build-pages.mjs`. The shared header and footer are in `scripts/layout.mjs`. After editing, run:

```sh
node scripts/build-pages.mjs   # regenerate the HTML pages
node scripts/build-tokens.mjs  # only if you changed tokens/tokens.json
```

## To do before going live

- Replace the placeholder email `info@mspkompas.bg` in `scripts/build-pages.mjs`.
- Connect the contact form to a backend, e.g. Formspree or Netlify Forms.
- Write the sector guides (currently marked "Наръчник в подготовка").
