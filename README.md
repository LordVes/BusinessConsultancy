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

Every page has a BG/EN toggle. Bulgarian is the default. The whitepaper exists in full in both languages; the English version appears only when the visitor switches to EN (English anchors carry the prefix `en-`). The self-assessment is in Bulgarian, with an English note in EN mode.

The whitepaper is also exported on every build to `output/2026-11-03-digitalna-zrelost-sredni-iznositeli.md` (Bulgarian) and `output/2026-11-03-digitalna-zrelost-sredni-iznositeli-en.md` (English).

## Privacy

- The site makes no requests to other servers. Fonts are self-hosted in `assets/fonts/` (SIL Open Font License; licence files included).
- The self-assessment sends nothing anywhere. Answers stay in the browser's `localStorage` (key `msp-dma-v1`) until the visitor clicks "Изчисти отговорите".
- No analytics, no cookies, no forms. `localStorage` also remembers the chosen language and theme.

## Editing content

| What | Where |
|---|---|
| Whitepaper data (Bulgarian): figures, frameworks, 8 dimensions, 30 criteria, hypotheses, sources | `scripts/whitepaper.mjs` |
| Whitepaper data and narrative (English), same ids and source numbers | `scripts/whitepaper-en.mjs` |
| Bulgarian whitepaper narrative and all page templates | `scripts/build-pages.mjs` |
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

1. **Review and approve the draft** (content, figures, tone, both languages).
2. **Domain.** Choose and register one (for example a `.bg` or `.com` name). Check the trademark and company-name situation for "МСП Компас / MSP Compass" first.
3. **Email.** Create a mailbox on that domain and replace the placeholder `info@mspkompas.bg` in `scripts/content.mjs`.
4. **Hosting.** Any static host works because the site is plain files: GitHub Pages, Netlify, Cloudflare Pages. Point the domain's DNS at it; HTTPS certificates are issued automatically by these hosts.
5. **Canonical URLs.** Once the domain is known, add `<link rel="canonical">` and `og:url` to every page, plus `sitemap.xml` and `robots.txt`.
6. **Legal pages.** Add an imprint (who publishes the site, contact) and a short privacy notice explaining that no personal data is collected and that the self-assessment stays in the browser.
7. **Social preview image.** Add an `og:image` so links shared on LinkedIn show a picture.
8. **Final checks.** Re-check all source links, run the site on a phone, and print the whitepaper to PDF once more.
9. **Repository visibility.** The GitHub repository is public, so drafts pushed there can be read by anyone. Make it private if drafts should stay unseen until release.
