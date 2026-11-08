// "Растеж" tab: weight / length-height / head circumference on WHO percentile curves.
import {
  h, s, sb, q, child, childChips, emptyState, toast, errText, segmented, ageDays,
  fmtNum, fmtDate, UNITS,
} from './core.js';
import { openForm, openChildForm } from './forms.js';
import { WHO } from './who-data.js';

const METRICS = {
  weight: { label: 'Тегло', table: 'weight', unit: 'kg' },
  height: { label: 'Ръст', table: 'length', unit: 'cm' },
  head: { label: 'Глава', table: 'head', unit: 'cm' },
};
// WHO chart percentiles and their z-scores
const CENTILES = [[3, -1.8808], [15, -1.0364], [50, 0], [85, 1.0364], [97, 1.8808]];
const MONTH = 30.4375;
const gr = { metric: 'weight' };

// --- LMS maths ---------------------------------------------------------------

function lmsAt(rows, day) {
  if (day <= rows[0][0]) return rows[0].slice(1);
  for (let i = 1; i < rows.length; i++) {
    if (day <= rows[i][0]) {
      const [d0, L0, M0, S0] = rows[i - 1], [d1, L1, M1, S1] = rows[i];
      const f = (day - d0) / (d1 - d0);
      return [L0 + f * (L1 - L0), M0 + f * (M1 - M0), S0 + f * (S1 - S0)];
    }
  }
  return rows[rows.length - 1].slice(1);
}
const valueAtZ = ([L, M, S], z) => (L === 0 ? M * Math.exp(S * z) : M * (1 + L * S * z) ** (1 / L));
const zOf = ([L, M, S], x) => (L === 0 ? Math.log(x / M) / S : ((x / M) ** L - 1) / (L * S));

/** Standard normal CDF (Abramowitz–Stegun 7.1.26). */
function phi(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}
export function percentile(rows, day, x) {
  const p = phi(zOf(lmsAt(rows, day), x)) * 100;
  return p < 0.1 ? '< 0,1' : p > 99.9 ? '> 99,9' : fmtNum(p, p < 1 || p > 99 ? 1 : 0);
}

// --- Chart --------------------------------------------------------------------

function growthChart(rows, points, maxDay, metric) {
  const W = 340, H = 240, padL = 36, padR = 26, padT = 10, padB = 26;
  const iw = W - padL - padR, ih = H - padT - padB;
  const step = maxDay <= 120 ? 7 : 15;
  const days = [];
  for (let d = 0; d <= maxDay; d += step) days.push(d);
  if (days[days.length - 1] !== maxDay) days.push(maxDay);

  const curves = CENTILES.map(([p, z]) => ({ p, pts: days.map((d) => [d, valueAtZ(lmsAt(rows, d), z)]) }));
  let lo = Math.min(...curves[0].pts.map((p) => p[1]), ...points.map((p) => p.v));
  let hi = Math.max(...curves[4].pts.map((p) => p[1]), ...points.map((p) => p.v));
  const pad = (hi - lo) * 0.05; lo = Math.max(0, lo - pad); hi += pad;

  const X = (d) => padL + (d / maxDay) * iw;
  const Y = (v) => padT + ih - ((v - lo) / (hi - lo)) * ih;
  const path = (pts) => pts.map(([d, v], i) => `${i ? 'L' : 'M'}${X(d).toFixed(1)},${Y(v).toFixed(1)}`).join('');

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart growth', role: 'img', 'aria-label': `${METRICS[metric].label} спрямо перцентилите на СЗО` });

  // Y grid (4 ticks)
  for (let i = 0; i <= 4; i++) {
    const v = lo + ((hi - lo) * i) / 4;
    svg.append(s('line', { x1: padL, x2: W - padR, y1: Y(v), y2: Y(v), class: i === 0 ? 'axis' : 'grid' }));
    svg.append(s('text', { x: padL - 4, y: Y(v) + 3, class: 'tick', 'text-anchor': 'end' }, fmtNum(v, metric === 'weight' ? 1 : 0)));
  }
  // X ticks in months
  const maxM = maxDay / MONTH;
  const mStep = maxM <= 6 ? 1 : maxM <= 12 ? 2 : maxM <= 24 ? 3 : 6;
  for (let m = 0; m <= maxM + 0.01; m += mStep) {
    svg.append(s('text', { x: X(m * MONTH), y: H - 8, class: 'tick', 'text-anchor': 'middle' }, `${m}`));
  }
  svg.append(s('text', { x: W - padR, y: H - 8, class: 'tick', 'text-anchor': 'start' }, ' мес.'));

  // 15–85 band, then centile lines with direct labels at the right edge
  const band = [...curves[1].pts, ...curves[3].pts.slice().reverse()];
  svg.append(s('path', { d: `${path(band)}Z`, class: 'p-band' }));
  for (const c of curves) {
    svg.append(s('path', { d: path(c.pts), class: c.p === 50 ? 'p-line p50' : 'p-line' }));
    const last = c.pts[c.pts.length - 1];
    svg.append(s('text', { x: X(last[0]) + 3, y: Y(last[1]) + 3, class: 'tick p-lbl' }, String(c.p)));
  }

  // Child's measurements: 2px line + ≥8px dots with a surface ring
  if (points.length > 1) svg.append(s('path', { d: path(points.map((p) => [p.day, p.v])), class: 'm-line' }));
  for (const p of points) {
    svg.append(s('circle', { cx: X(p.day), cy: Y(p.v), r: 4.5, class: 'm-dot' },
      s('title', null, `${fmtDate(p.date, { day: 'numeric', month: 'short', year: 'numeric' })}: ${fmtNum(p.v)} ${UNITS[METRICS[metric].unit]} · ${p.pct}-и перцентил`)));
  }
  return svg;
}

// --- Tab -----------------------------------------------------------------------

export async function renderGrowth(root, { refresh }) {
  const c = child();
  if (!c) { root.replaceChildren(emptyState('Добавете дете от „Настройки“.')); return; }
  const rerender = () => renderGrowth(root, { refresh });
  const seg = segmented(Object.fromEntries(Object.entries(METRICS).map(([k, v]) => [k, v.label])), gr.metric,
    { onChange: (v) => { gr.metric = v; rerender(); } });

  if (!c.birth_date || !c.sex) {
    root.replaceChildren(childChips(refresh), h('div', { class: 'card' },
      h('p', null, 'За кривите на растеж са нужни дата на раждане и пол на детето.'),
      h('button', { class: 'btn-primary btn-block', onclick: () => openChildForm(c) }, 'Попълни данните')));
    return;
  }

  root.replaceChildren(childChips(refresh), seg.el, h('p', { class: 'empty' }, 'Зареждане…'));
  let rowsDb;
  try {
    rowsDb = await q(sb.from('events').select('*').eq('child_id', c.id).eq('category', 'health')
      .in('type', ['weight', 'height', 'head']).order('started_at'));
  } catch (e) { toast(errText(e), true); rowsDb = []; }
  if (child() !== c) return;

  const metric = gr.metric;
  const table = WHO[METRICS[metric].table][c.sex === 'f' ? 'girl' : 'boy'];
  const points = rowsDb.filter((ev) => ev.type === metric && ev.amount != null)
    .map((ev) => {
      const day = ageDays(c.birth_date, new Date(ev.started_at));
      const v = Number(ev.amount);
      return { ev, day, v, date: new Date(ev.started_at), pct: day >= 0 && day <= 1856 ? percentile(table, day, v) : '–' };
    })
    .filter((p) => p.day >= 0 && p.day <= 1856);

  const nowDay = ageDays(c.birth_date);
  const lastDay = Math.max(nowDay, ...points.map((p) => p.day));
  const maxDay = Math.min(1856, Math.max(182, Math.ceil((lastDay + 60) / MONTH) * MONTH));

  const latest = points[points.length - 1];
  const unit = UNITS[METRICS[metric].unit];
  const summary = latest
    ? h('div', { class: 'tiles' },
      h('div', { class: 'tile' }, h('span', { class: 'tile-lbl' }, 'Последно измерване'), h('b', { class: 'tile-val' }, `${fmtNum(latest.v)} ${unit}`),
        h('span', { class: 'tile-sub' }, `${fmtDate(latest.date)} · на ${ageLabel(latest.day)}`)),
      h('div', { class: 'tile' }, h('span', { class: 'tile-lbl' }, 'Перцентил (СЗО)'), h('b', { class: 'tile-val' }, latest.pct),
        h('span', { class: 'tile-sub' }, `по-${Number(String(latest.pct).replace(',', '.')) >= 50 ? 'голямо' : 'малко'} от ${pctWord(latest.pct)}`)))
    : h('p', { class: 'hint' }, 'Все още няма измервания.');

  const addBtn = h('button', { class: 'btn-primary btn-block', onclick: () => openForm('health', metric) }, `+ Ново измерване: ${METRICS[metric].label.toLowerCase()}`);

  const list = points.length
    ? h('table', { class: 'm-table' },
      h('thead', null, h('tr', null, h('th', null, 'Дата'), h('th', null, 'Възраст'), h('th', null, unit), h('th', null, 'Перц.'))),
      h('tbody', null, points.slice().reverse().map((p) => h('tr', { tabindex: '0', onclick: () => openForm('health', metric, p.ev) },
        h('td', null, fmtDate(p.date, { day: 'numeric', month: 'short', year: '2-digit' })),
        h('td', null, ageLabel(p.day)), h('td', null, fmtNum(p.v)), h('td', null, p.pct)))))
    : null;

  root.replaceChildren(childChips(refresh), seg.el,
    h('div', { class: 'card' },
      h('div', { class: 'chart-title' }, h('b', null, `${METRICS[metric].label} · ${c.sex === 'f' ? 'момиче' : 'момче'}`),
        h('span', { class: 'hint' }, `${unit} / възраст в месеци`)),
      h('div', { class: 'chart-legend' },
        h('span', null, h('span', { class: 'swatch sw-health' }), c.name),
        h('span', null, h('span', { class: 'swatch sw-p50' }), '50-и перцентил'),
        h('span', null, h('span', { class: 'swatch sw-band' }), '15–85')),
      growthChart(table, points, maxDay, metric),
      summary),
    addBtn,
    list ? h('div', { class: 'card' }, h('h3', null, 'Измервания'), list) : '',
    h('p', { class: 'hint' }, 'Криви: Стандарти за растеж на деца на СЗО (WHO, 2006), 0–5 години. Линиите показват 3, 15, 50, 85 и 97 перцентил. '
      + 'Перцентилът е ориентировъчен; за недоносени бебета се използва коригирана възраст — консултирайте се с педиатър.'));
}

function ageLabel(day) {
  if (day < 14) return `${day} дни`;
  if (day < 91) return `${Math.floor(day / 7)} седм.`;
  const m = Math.floor(day / MONTH);
  return m < 24 ? `${m} мес.` : `${Math.floor(m / 12)} г. ${m % 12} мес.`;
}
function pctWord(p) {
  const n = Number(String(p).replace(',', '.').replace(/[<> ]/g, ''));
  if (!Number.isFinite(n)) return '';
  const pct = n >= 50 ? Math.round(n) : Math.round(100 - n);
  return `${pct}% от децата на същата възраст`;
}
