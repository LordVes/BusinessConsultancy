// "Анализ" tab: period dashboard (day / week / month / 3 months / custom)
// with sleep, feeding and diaper/potty trends and comparison to the previous period.
import {
  h, s, state, child, childChips, fetchEvents, startOfDay, addDays, DAY, dayKey,
  fmtDurShort, fmtNum, fmtDate, breastSecs, emptyState, toast, errText, segmented, FEED_TYPES,
} from './core.js';

const PERIODS = { 1: 'Ден', 7: 'Седмица', 30: 'Месец', 90: '3 мес.', custom: 'Период' };
const an = { period: '7', offset: 0, from: null, to: null };

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/** Compute all metrics for events within [start, end). `all` holds a wider range for context. */
export function computeMetrics(all, start, end, now = Date.now()) {
  const S = start.getTime(), E = end.getTime();
  const days = Math.round((E - S) / DAY);
  const inRange = (ev) => { const t = new Date(ev.started_at).getTime(); return t >= S && t < E; };
  const overlap = (ev) => {
    const a = new Date(ev.started_at).getTime();
    const b = ev.ended_at ? new Date(ev.ended_at).getTime() : Math.min(now, a + 16 * 3600000);
    return Math.max(0, Math.min(b, E) - Math.max(a, S));
  };

  // Per-day buckets
  const perDay = Array.from({ length: days }, (_, i) => ({
    date: addDays(start, i), night: 0, nap: 0, feeds: 0, ml: 0, breastMin: 0, wet: 0, dirty: 0, potty: 0, accident: 0,
  }));
  const bucket = (t) => perDay[Math.round((startOfDay(t).getTime() - S) / DAY)] || null; // round: DST-safe

  const m = {
    days, sleepMs: 0, nightMs: 0, napMs: 0, naps: 0, longestMs: 0, wakings: 0, nights: 0,
    feeds: 0, ml: 0, breastMs: 0, leftS: 0, rightS: 0, solids: 0, gaps: [],
    wet: 0, dirty: 0, potty: 0, accidents: 0, perDay,
  };

  const nightGroups = new Map();
  for (const ev of all) {
    if (ev.category === 'sleep') {
      // Split sleep across days for totals
      const a = new Date(ev.started_at).getTime();
      const b = ev.ended_at ? new Date(ev.ended_at).getTime() : Math.min(now, a + 16 * 3600000);
      const ov = overlap(ev);
      if (ov <= 0) continue;
      m.sleepMs += ov;
      if (ev.type === 'night') m.nightMs += ov; else m.napMs += ov;
      for (let t = Math.max(a, S); t < Math.min(b, E);) {
        const dayEnd = addDays(startOfDay(t), 1).getTime(); // calendar day (handles 23/25 h DST days)
        const seg = Math.min(b, E, dayEnd) - t;
        if (seg <= 0) break;
        const bk = bucket(t);
        if (bk) bk[ev.type === 'night' ? 'night' : 'nap'] += seg;
        t += seg;
      }
      if (inRange(ev)) {
        if (ev.type === 'nap') m.naps++;
        if (ev.ended_at) m.longestMs = Math.max(m.longestMs, b - a);
        if (ev.type === 'night') {
          // A "night" = sleep starting between noon and the next noon
          const key = dayKey(new Date(a - 12 * 3600000));
          nightGroups.set(key, (nightGroups.get(key) || 0) + 1);
        }
      }
      continue;
    }
    if (!inRange(ev)) continue;
    const bk = bucket(new Date(ev.started_at));
    if (FEED_TYPES.includes(ev.type)) {
      m.feeds++; if (bk) bk.feeds++;
      if (ev.type === 'solids') m.solids++;
    }
    if (ev.type === 'bottle' && ev.unit === 'ml') { m.ml += Number(ev.amount || 0); if (bk) bk.ml += Number(ev.amount || 0); }
    if (ev.type === 'breast') {
      const { L, R } = breastSecs(ev, now);
      m.leftS += L; m.rightS += R; m.breastMs += (L + R) * 1000;
      if (bk) bk.breastMin += (L + R) / 60;
    }
    if (ev.category === 'diaper') {
      const wet = ['wet', 'mixed'].includes(ev.type), dirty = ['dirty', 'mixed'].includes(ev.type);
      if (wet) { m.wet++; if (bk) bk.wet++; }
      if (dirty) { m.dirty++; if (bk) bk.dirty++; }
      if (ev.type === 'potty_pee' || ev.type === 'potty_poo') { m.potty++; if (bk) bk.potty++; }
      if (ev.type === 'accident') { m.accidents++; if (bk) bk.accident++; }
    }
  }
  for (const n of nightGroups.values()) { m.nights++; m.wakings += Math.max(0, n - 1); }
  // Days with at least one record — averages use these, so days before the app was used don't dilute them.
  const touched = new Set();
  for (const ev of all) if (inRange(ev)) touched.add(dayKey(ev.started_at));
  m.trackedDays = touched.size;

  // Average gap between consecutive milk feeds (ignore gaps > 12 h = missing data)
  const feedTimes = all.filter((ev) => ['breast', 'bottle'].includes(ev.type) && inRange(ev))
    .map((ev) => new Date(ev.started_at).getTime()).sort((a, b) => a - b);
  for (let i = 1; i < feedTimes.length; i++) {
    const g = feedTimes[i] - feedTimes[i - 1];
    if (g > 10 * 60000 && g < 12 * 3600000) m.gaps.push(g);
  }
  m.avgGapMs = m.gaps.length ? m.gaps.reduce((a, b) => a + b, 0) / m.gaps.length : 0;
  return m;
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/** Change vs previous period: arrow + text (never colour alone). */
function delta(cur, prev, fmt) {
  if (prev == null || !Number.isFinite(prev) || (cur === 0 && prev === 0)) return null;
  const diff = cur - prev;
  if (Math.abs(diff) < 1e-9) return h('span', { class: 'delta same' }, '＝ без промяна');
  const pct = prev ? Math.round((diff / prev) * 100) : null;
  return h('span', { class: 'delta' }, `${diff > 0 ? '▲' : '▼'} ${fmt(Math.abs(diff))}${pct != null && Math.abs(pct) < 1000 ? ` (${diff > 0 ? '+' : '−'}${Math.abs(pct)}%)` : ''}`);
}

function tile(label, value, deltaEl, sub) {
  return h('div', { class: 'tile' },
    h('span', { class: 'tile-lbl' }, label),
    h('b', { class: 'tile-val' }, value),
    sub ? h('span', { class: 'tile-sub' }, sub) : null,
    deltaEl);
}

/**
 * Stacked bar chart per day (or per week for long periods).
 * series: [{ key, label, cls }]; rows: [{ date, [key]: value }]; fmt: value → string
 */
function barChart({ title, rows, series, fmt, unitLabel }) {
  // Aggregate to weeks when the period is long, so bars stay readable.
  let data = rows;
  let byWeek = false;
  if (rows.length > 31) {
    byWeek = true;
    data = [];
    for (let i = 0; i < rows.length; i += 7) {
      const chunk = rows.slice(i, i + 7);
      const agg = { date: chunk[0].date, n: chunk.length };
      for (const sr of series) agg[sr.key] = chunk.reduce((a, r) => a + r[sr.key], 0) / chunk.length;
      data.push(agg);
    }
  }
  const W = 340, H = 150, padL = 34, padB = 22, padT = 8, padR = 4;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const totals = data.map((r) => series.reduce((a, sr) => a + r[sr.key], 0));
  const rawMax = Math.max(...totals, 0);
  const max = niceMax(rawMax || 1);
  const n = data.length;
  const slot = innerW / n;
  const barW = Math.max(2, Math.min(28, slot * 0.7));

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': title });
  // Recessive grid: 0, half, max
  for (const v of [0, max / 2, max]) {
    const y = padT + innerH - (v / max) * innerH;
    svg.append(s('line', { x1: padL, x2: W - padR, y1: y, y2: y, class: v === 0 ? 'axis' : 'grid' }));
    svg.append(s('text', { x: padL - 4, y: y + 3, class: 'tick', 'text-anchor': 'end' }, fmt(v)));
  }
  const readout = h('p', { class: 'chart-readout', 'aria-live': 'polite' }, byWeek ? 'Средно на ден по седмици. Докоснете стълб за детайли.' : 'Докоснете стълб за детайли.');
  data.forEach((r, i) => {
    const x = padL + i * slot + (slot - barW) / 2;
    let y = padT + innerH;
    const g = s('g', { class: 'bar-group', tabindex: '0' });
    series.forEach((sr) => {
      const v = r[sr.key];
      if (!(v > 0)) return;
      const hgt = (v / max) * innerH;
      const segH = Math.max(1, hgt - 2); // 2px surface gap between stacked segments
      y -= hgt;
      g.append(s('rect', { x, y: y + 2, width: barW, height: segH, rx: Math.min(3, barW / 2), class: sr.cls }));
    });
    // Larger invisible hit target
    g.append(s('rect', { x: padL + i * slot, y: padT, width: slot, height: innerH, class: 'hit' }));
    const dateTxt = byWeek ? `седм. от ${fmtDate(r.date)}` : r.date.toLocaleDateString('bg-BG', { weekday: 'short', day: 'numeric', month: 'short' });
    const parts = series.map((sr) => `${sr.label}: ${fmt(r[sr.key])}`).join(' · ');
    const tipTxt = `${dateTxt} — ${parts}${series.length > 1 ? ` · общо ${fmt(totals[i])}` : ''}`;
    g.append(s('title', null, tipTxt));
    const show = () => {
      readout.textContent = tipTxt;
      svg.querySelectorAll('.bar-group.sel').forEach((el) => el.classList.remove('sel'));
      g.classList.add('sel');
    };
    g.addEventListener('click', show);
    g.addEventListener('focus', show);
    svg.append(g);
  });
  // X labels: first, middle, last
  const lblIdx = n <= 7 ? data.map((_, i) => i) : [0, Math.floor((n - 1) / 2), n - 1];
  for (const i of lblIdx) {
    const r = data[i];
    const txt = n <= 7 ? r.date.toLocaleDateString('bg-BG', { weekday: 'short' }) : fmtDate(r.date);
    svg.append(s('text', { x: padL + i * slot + slot / 2, y: H - 6, class: 'tick', 'text-anchor': 'middle' }, txt));
  }

  const legend = series.length > 1
    ? h('div', { class: 'chart-legend' }, series.map((sr) => h('span', null, h('span', { class: `swatch ${sr.cls}` }), sr.label)))
    : null;
  return h('div', { class: 'chart-wrap' },
    h('div', { class: 'chart-title' }, h('b', null, title), unitLabel ? h('span', { class: 'hint' }, unitLabel) : null),
    legend, svg, readout);
}

function niceMax(v) {
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}

const hrs = (ms) => fmtDurShort(ms);
const hFmt = (v) => (v >= 1 ? `${fmtNum(v, 1)}ч` : `${Math.round(v * 60)}м`);

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------

function periodRange() {
  if (an.period === 'custom' && an.from && an.to) {
    const start = startOfDay(new Date(an.from + 'T00:00:00'));
    const end = addDays(startOfDay(new Date(an.to + 'T00:00:00')), 1);
    return { start, end: end > start ? end : addDays(start, 1) };
  }
  const len = Number(an.period === 'custom' ? 7 : an.period);
  const end = addDays(startOfDay(new Date()), 1 - an.offset * len);
  return { start: addDays(end, -len), end };
}

export async function renderAnalysis(root, { refresh }) {
  const c = child();
  if (!c) { root.replaceChildren(emptyState('Добавете дете от „Настройки“.')); return; }

  const rerender = () => renderAnalysis(root, { refresh });
  const periodSeg = segmented(PERIODS, an.period, {
    onChange: (v) => {
      an.period = v; an.offset = 0;
      if (v === 'custom' && !an.from) { an.to = dayKey(new Date()); an.from = dayKey(addDays(new Date(), -13)); }
      rerender();
    },
  });
  periodSeg.el.classList.add('seg-small');

  const { start, end } = periodRange();
  const len = Math.round((end - start) / DAY);
  const prevStart = addDays(start, -len);

  const rangeTxt = len === 1 ? start.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' })
    : `${fmtDate(start)} – ${fmtDate(addDays(end, -1), { day: 'numeric', month: 'short', year: 'numeric' })}`;

  let controls;
  if (an.period === 'custom') {
    const fromInp = h('input', { type: 'date', value: an.from, max: dayKey(new Date()), 'aria-label': 'От дата' });
    const toInp = h('input', { type: 'date', value: an.to, max: dayKey(new Date()), 'aria-label': 'До дата' });
    const apply = () => {
      if (!fromInp.value || !toInp.value) return;
      if (toInp.value < fromInp.value) { toast('Крайната дата е преди началната.', true); return; }
      if ((new Date(toInp.value) - new Date(fromInp.value)) / DAY > 366) { toast('Изберете период до 1 година.', true); return; }
      an.from = fromInp.value; an.to = toInp.value; rerender();
    };
    fromInp.addEventListener('change', apply); toInp.addEventListener('change', apply);
    controls = h('div', { class: 'row', style: { marginTop: '10px' } },
      h('div', null, h('label', null, 'От'), fromInp), h('div', null, h('label', null, 'До'), toInp));
  } else {
    controls = h('div', { class: 'daynav' },
      h('button', { class: 'icon-btn', 'aria-label': 'Предишен период', onclick: () => { an.offset++; rerender(); } }, '‹'),
      h('span', { class: 'day-title' }, rangeTxt),
      h('button', { class: 'icon-btn', 'aria-label': 'Следващ период', disabled: an.offset === 0, onclick: () => { an.offset = Math.max(0, an.offset - 1); rerender(); } }, '›'));
  }

  root.replaceChildren(childChips(refresh), periodSeg.el, controls, h('p', { class: 'empty' }, 'Изчисляване…'));

  let events;
  try {
    events = await fetchEvents(c.id, addDays(prevStart, -1), end);
  } catch (e) { toast(errText(e), true); events = []; }
  if (child() !== c) return;

  const cur = computeMetrics(events, start, end);
  const prev = computeMetrics(events, prevStart, start);
  // Per-day averages over days that have records (current and previous period separately).
  const perDay = (v) => (cur.trackedDays ? v / cur.trackedDays : 0);
  const prevPerDay = (v) => (prev.trackedDays ? v / prev.trackedDays : NaN);
  const avgLbl = len === 1 ? '' : ' / ден';
  const prevName = { 1: 'предишния ден', 7: 'предишната седмица', 30: 'предишния месец', 90: 'предишните 3 месеца' }[len] || 'предишния период';

  const nothing = !events.some((ev) => { const t = new Date(ev.started_at); return t >= start && t < end; });

  // --- Sleep ---
  const sleepSec = h('section', { class: 'card' },
    h('h2', null, '😴 Сън'),
    h('div', { class: 'tiles' },
      tile(`Общо сън${avgLbl}`, hrs(perDay(cur.sleepMs)), delta(perDay(cur.sleepMs), prevPerDay(prev.sleepMs), hrs)),
      tile(`Нощен сън${avgLbl}`, hrs(perDay(cur.nightMs)), delta(perDay(cur.nightMs), prevPerDay(prev.nightMs), hrs)),
      tile(`Дрямки${avgLbl}`, `${fmtNum(perDay(cur.naps), 1)} · ${hrs(perDay(cur.napMs))}`, delta(perDay(cur.napMs), prevPerDay(prev.napMs), hrs)),
      tile('Най-дълъг сън', cur.longestMs ? hrs(cur.longestMs) : '–', delta(cur.longestMs, prev.longestMs, hrs)),
      tile('Нощни събуждания', cur.nights ? fmtNum(cur.wakings / cur.nights, 1) : '–',
        cur.nights && prev.nights ? delta(cur.wakings / cur.nights, prev.wakings / prev.nights, (v) => fmtNum(v, 1)) : null,
        'средно на нощ')),
    len > 1 ? barChart({
      title: 'Сън по дни', unitLabel: 'часове',
      rows: cur.perDay.map((r) => ({ date: r.date, night: r.night / 3600000, nap: r.nap / 3600000 })),
      series: [{ key: 'night', label: 'Нощ', cls: 'fill-sleep' }, { key: 'nap', label: 'Дрямки', cls: 'fill-sleep-light' }],
      fmt: hFmt,
    }) : null);

  // --- Feeding ---
  const totalBreast = cur.leftS + cur.rightS;
  const leftPct = totalBreast ? Math.round((cur.leftS / totalBreast) * 100) : null;
  const feedSec = h('section', { class: 'card' },
    h('h2', null, '🍼 Хранене'),
    h('div', { class: 'tiles' },
      tile(`Хранения${avgLbl}`, fmtNum(perDay(cur.feeds), 1), delta(perDay(cur.feeds), prevPerDay(prev.feeds), (v) => fmtNum(v, 1))),
      cur.avgGapMs || prev.avgGapMs ? tile('Средно между храненията', cur.avgGapMs ? hrs(cur.avgGapMs) : '–', delta(cur.avgGapMs, prev.avgGapMs, hrs)) : null,
      cur.ml || prev.ml ? tile(`Шише${avgLbl}`, cur.ml ? `${fmtNum(perDay(cur.ml), 0)} мл` : '–', delta(perDay(cur.ml), prevPerDay(prev.ml), (v) => `${fmtNum(v, 0)} мл`)) : null,
      cur.breastMs || prev.breastMs ? tile(`Кърмене${avgLbl}`, cur.breastMs ? hrs(perDay(cur.breastMs)) : '–', delta(perDay(cur.breastMs), prevPerDay(prev.breastMs), hrs)) : null,
      leftPct != null ? h('div', { class: 'tile tile-wide' },
        h('span', { class: 'tile-lbl' }, 'Баланс лява / дясна'),
        h('div', { class: 'balance', role: 'img', 'aria-label': `Лява ${leftPct}%, дясна ${100 - leftPct}%` },
          h('span', { class: 'bal-l', style: { width: `${leftPct}%` } }), h('span', { class: 'bal-r', style: { width: `${100 - leftPct}%` } })),
        h('span', { class: 'tile-sub' }, `Лява ${leftPct}% (${hrs(cur.leftS * 1000)}) · Дясна ${100 - leftPct}% (${hrs(cur.rightS * 1000)})`)) : null,
      cur.solids ? tile(`Хранения с храна${avgLbl}`, fmtNum(perDay(cur.solids), 1), delta(perDay(cur.solids), prevPerDay(prev.solids), (v) => fmtNum(v, 1))) : null),
    len > 1 ? barChart({
      title: 'Хранения по дни', unitLabel: 'брой',
      rows: cur.perDay.map((r) => ({ date: r.date, feeds: r.feeds })),
      series: [{ key: 'feeds', label: 'Хранения', cls: 'fill-feeding' }],
      fmt: (v) => fmtNum(v, 1),
    }) : null,
    len > 1 && cur.ml ? barChart({
      title: 'Мляко от шише по дни', unitLabel: 'мл',
      rows: cur.perDay.map((r) => ({ date: r.date, ml: r.ml })),
      series: [{ key: 'ml', label: 'Шише', cls: 'fill-feeding' }],
      fmt: (v) => fmtNum(v, 0),
    }) : null);

  // --- Diapers & potty ---
  const pottyTotal = cur.potty + cur.accidents;
  const hasDiapers = cur.wet + cur.dirty + prev.wet + prev.dirty > 0 || !pottyTotal;
  const diaperSec = h('section', { class: 'card' },
    h('h2', null, '🧷 Пелени и гърне'),
    h('div', { class: 'tiles' },
      hasDiapers ? tile(`Мокри${avgLbl}`, fmtNum(perDay(cur.wet), 1), delta(perDay(cur.wet), prevPerDay(prev.wet), (v) => fmtNum(v, 1))) : null,
      hasDiapers ? tile(`Акане${avgLbl}`, fmtNum(perDay(cur.dirty), 1), delta(perDay(cur.dirty), prevPerDay(prev.dirty), (v) => fmtNum(v, 1))) : null,
      pottyTotal ? tile('Гърне: успехи', `${cur.potty} от ${pottyTotal}`, null, `${Math.round((cur.potty / pottyTotal) * 100)}% успеваемост`) : null,
      pottyTotal ? tile('Инциденти', String(cur.accidents), delta(cur.accidents, prev.accidents, (v) => fmtNum(v, 0))) : null),
    len > 1 && cur.wet + cur.dirty ? barChart({
      title: 'Пелени по дни', unitLabel: 'брой',
      rows: cur.perDay.map((r) => ({ date: r.date, wet: r.wet, dirty: r.dirty })),
      series: [{ key: 'wet', label: 'Мокри', cls: 'fill-diaper' }, { key: 'dirty', label: 'Акане', cls: 'fill-diaper-light' }],
      fmt: (v) => fmtNum(v, 1),
    }) : null,
    len > 1 && pottyTotal ? barChart({
      title: 'Гърне по дни', unitLabel: 'брой',
      rows: cur.perDay.map((r) => ({ date: r.date, potty: r.potty, accident: r.accident })),
      series: [{ key: 'potty', label: 'Успехи', cls: 'fill-diaper' }, { key: 'accident', label: 'Инциденти', cls: 'fill-diaper-light' }],
      fmt: (v) => fmtNum(v, 1),
    }) : null);

  root.replaceChildren(childChips(refresh), periodSeg.el, controls,
    h('p', { class: 'hint center' }, `${len === 1 ? 'Стойности за деня' : `Средно на ден${cur.trackedDays < len ? ` (${cur.trackedDays} от ${len} дни със записи)` : ''}`} · ▲▼ спрямо ${prevName}`),
    nothing ? emptyState('Няма записи за този период.') : '',
    sleepSec, feedSec, diaperSec);
}
