// Shared building blocks: constants, DOM helpers, dates, Supabase client, state.
// All user text is rendered with textContent (never innerHTML) to avoid XSS.

// ---------------------------------------------------------------------------
// Activity types (labels in Bulgarian, codes match the database)
// ---------------------------------------------------------------------------

export const UNITS = { ml: 'мл', g: 'г', kg: 'кг', cm: 'см', C: '°C', mg: 'мг', drops: 'капки', pcs: 'бр.' };
export const SIDES = { left: 'Лява', right: 'Дясна', both: 'Двете' };
export const MILK = { breast_milk: 'Кърма', formula: 'Адаптирано мляко' };
export const COLORS = { yellow: 'Жълто', green: 'Зелено', brown: 'Кафяво', black: 'Черно', red: 'Червено', other: 'Друго' };

// fields: breast | timer | time | side | amount:<unit> | amount:med | milk_type | label | diaper_color
export const CATS = {
  feeding: {
    label: 'Хранене', icon: '🍼',
    types: {
      breast: { label: 'Кърмене', icon: '🤱', fields: ['breast'] },
      bottle: { label: 'Шише', icon: '🍼', fields: ['amount:ml', 'milk_type', 'time'], required: ['amount'] },
      solids: { label: 'Храна', icon: '🥣', fields: ['label', 'amount:g', 'time'], labelText: 'Какво яде?' },
      pumping: { label: 'Изцеждане', icon: '🫙', fields: ['side', 'amount:ml', 'time'] },
    },
  },
  sleep: {
    label: 'Сън', icon: '😴',
    types: {
      nap: { label: 'Дрямка', icon: '😴', fields: ['timer'] },
      night: { label: 'Нощен сън', icon: '🌙', fields: ['timer'] },
    },
  },
  diaper: {
    label: 'Пелена / гърне', icon: '🧷',
    types: {
      wet: { label: 'Мокра', icon: '💧', fields: ['time'] },
      dirty: { label: 'Акане', icon: '💩', fields: ['diaper_color', 'time'] },
      mixed: { label: 'Мокра + акане', icon: '🧷', fields: ['diaper_color', 'time'] },
      dry: { label: 'Суха', icon: '✨', fields: ['time'] },
      potty_pee: { label: 'Гърне: пишка', icon: '🚽', fields: ['time'] },
      potty_poo: { label: 'Гърне: ако', icon: '🚽', fields: ['time'] },
      accident: { label: 'Инцидент', icon: '🙈', fields: ['time'] },
    },
  },
  health: {
    label: 'Здраве', icon: '🩺',
    types: {
      weight: { label: 'Тегло', icon: '⚖️', fields: ['amount:kg', 'time'], required: ['amount'] },
      height: { label: 'Ръст', icon: '📏', fields: ['amount:cm', 'time'], required: ['amount'] },
      head: { label: 'Обиколка на главата', icon: '📐', fields: ['amount:cm', 'time'], required: ['amount'] },
      temperature: { label: 'Температура', icon: '🌡️', fields: ['amount:C', 'time'], required: ['amount'] },
      medicine: { label: 'Лекарство', icon: '💊', fields: ['label', 'amount:med', 'time'], labelText: 'Име на лекарството', required: ['label'] },
      vaccine: { label: 'Ваксина', icon: '💉', fields: ['label', 'time'], labelText: 'Коя ваксина?' },
      symptom: { label: 'Симптом', icon: '🤒', fields: ['label', 'time'], labelText: 'Какво наблюдавате?', required: ['label'] },
      doctor: { label: 'Преглед при лекар', icon: '👩‍⚕️', fields: ['label', 'time'], labelText: 'Лекар / причина' },
    },
  },
};
export const TIMER_TYPES = ['breast', 'nap', 'night'];
export const FEED_TYPES = ['breast', 'bottle', 'solids'];
export const CHILD_COLORS = ['#7c9cff', '#f2994a', '#2a9d8f', '#e05783', '#9b59b6'];

export const typeInfo = (ev) => (CATS[ev.category] && CATS[ev.category].types[ev.type]) || { label: ev.type, icon: '•' };

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

/** Create an HTML element. Strings/numbers become text nodes (safe). */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  setAttrs(el, attrs);
  appendKids(el, kids);
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Create an SVG element (same API as h). */
export function s(tag, attrs, ...kids) {
  const el = document.createElementNS(SVG_NS, tag);
  setAttrs(el, attrs);
  appendKids(el, kids);
  return el;
}

function setAttrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style') Object.assign(el.style, v);
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
}
function appendKids(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
}

export const $ = (sel, root = document) => root.querySelector(sel);

// ---------------------------------------------------------------------------
// Dates & formatting
// ---------------------------------------------------------------------------

export const DAY = 86400000;
export const pad = (n) => String(n).padStart(2, '0');
export const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
export const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
export const toLocalInput = (d) => { const x = new Date(d); return `${dayKey(x)}T${pad(x.getHours())}:${pad(x.getMinutes())}`; };
export const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);
export const fmtTime = (d) => new Date(d).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
export const fmtNum = (n, digits = 2) => Number(n).toLocaleString('bg-BG', { maximumFractionDigits: digits });
export const fmtDate = (d, opts = { day: 'numeric', month: 'short' }) => new Date(d).toLocaleDateString('bg-BG', opts);

export function fmtDur(ms, withSeconds = false) {
  if (!(ms > 0)) ms = 0;
  const sec = Math.floor(ms / 1000);
  const hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60), ss = sec % 60;
  if (withSeconds) return hh ? `${hh}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
  if (hh) return `${hh} ч ${pad(mm)} мин`;
  return mm ? `${mm} мин` : '< 1 мин';
}
/** Short form for tight spaces: "1ч 05м", "35м". */
export function fmtDurShort(ms) {
  const m = Math.round((ms || 0) / 60000);
  if (m < 60) return `${m}м`;
  return `${Math.floor(m / 60)}ч ${pad(m % 60)}м`;
}
export const fmtAgo = (d) => `преди ${fmtDur(Date.now() - new Date(d).getTime())}`;

export function ageDays(birth, at = new Date()) {
  if (!birth) return null;
  return Math.floor((startOfDay(at) - new Date(birth + 'T00:00:00')) / DAY);
}

export function fmtAge(birth) {
  const days = ageDays(birth);
  if (days == null || days < 0) return '';
  if (days < 14) return `${days} ${days === 1 ? 'ден' : 'дни'}`;
  if (days < 60) return `${Math.floor(days / 7)} седм.`;
  const b = new Date(birth + 'T00:00:00'), now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 24) return `${months} мес.`;
  const y = Math.floor(months / 12), m = months % 12;
  return m ? `${y} г. ${m} мес.` : `${y} г.`;
}

export function dayTitle(d) {
  const today = startOfDay(new Date());
  if (sameDay(d, today)) return 'Днес';
  if (sameDay(d, addDays(today, -1))) return 'Вчера';
  return new Date(d).toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ---------------------------------------------------------------------------
// Breastfeeding dual timer maths
// ---------------------------------------------------------------------------

/** Seconds per side, including the currently running segment. Handles old single-side entries. */
export function breastSecs(ev, now = Date.now()) {
  if (ev.left_sec == null && ev.right_sec == null) {
    const end = ev.ended_at ? new Date(ev.ended_at).getTime() : now;
    const total = Math.max(0, (end - new Date(ev.started_at).getTime()) / 1000);
    if (ev.side === 'right') return { L: 0, R: total };
    if (ev.side === 'both') return { L: total / 2, R: total / 2 };
    return { L: total, R: 0 };
  }
  let L = ev.left_sec || 0, R = ev.right_sec || 0;
  if (!ev.ended_at && ev.active_side && ev.side_started_at) {
    const extra = Math.max(0, (now - new Date(ev.side_started_at).getTime()) / 1000);
    if (ev.active_side === 'left') L += extra; else R += extra;
  }
  return { L, R };
}

/** Active duration in ms: fed minutes for breastfeeding, wall-clock for everything else. */
export function activeMs(ev, now = Date.now()) {
  if (ev.type === 'breast') { const { L, R } = breastSecs(ev, now); return (L + R) * 1000; }
  if (!TIMER_TYPES.includes(ev.type) && !ev.ended_at) return 0;
  const end = ev.ended_at ? new Date(ev.ended_at).getTime() : now;
  return Math.max(0, end - new Date(ev.started_at).getTime());
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

let toastTimer;
export function toast(msg, isErr = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'show' + (isErr ? ' err' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, isErr ? 4500 : 2200);
}

export function errText(err) {
  const m = (err && (err.message || err.error_description)) || String(err);
  if (/Invalid login credentials/i.test(m)) return 'Грешен имейл или парола.';
  if (/Email not confirmed/i.test(m)) return 'Имейлът не е потвърден.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Няма връзка с интернет. Опитайте отново.';
  if (/JWT|session/i.test(m)) return 'Сесията изтече. Влезте отново.';
  if (/rate limit/i.test(m)) return 'Твърде много опити. Изчакайте малко.';
  if (/Password should be/i.test(m)) return 'Паролата трябва да е поне 8 знака.';
  if (/left_sec|right_sec|active_side|last_side/i.test(m)) return 'Базата данни трябва да се обнови: изпълнете отново schema.sql в Supabase.';
  return 'Грешка: ' + m;
}

// ---------------------------------------------------------------------------
// Supabase client, state, events bus
// ---------------------------------------------------------------------------

const cfg = window.APP_CONFIG;
export const sb = (cfg && cfg.SUPABASE_URL && !/YOUR-/.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY) && window.supabase)
  ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  })
  : null;

export async function q(promise) {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
}

/** All events of a child that start in [from, to), oldest first (paged). */
export async function fetchEvents(childId, from, to) {
  const rows = [];
  const page = 1000;
  for (let off = 0; ; off += page) {
    const data = await q(sb.from('events').select('*').eq('child_id', childId)
      .gte('started_at', new Date(from).toISOString()).lt('started_at', new Date(to).toISOString())
      .order('started_at').range(off, off + page - 1));
    rows.push(...data);
    if (data.length < page) break;
  }
  return rows;
}

export const state = {
  session: null,
  booted: false,
  tab: 'today',
  children: [],
  childId: null,
  day: startOfDay(new Date()),
  followToday: true,
  events: [],
  running: [],
  last: {},
};

/** Fired after any data change; the app listens and re-renders. */
export const bus = new EventTarget();
export const changed = () => bus.dispatchEvent(new Event('changed'));

export const LS_CHILD = 'bt.childId';
export function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
export function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }

export const child = () => state.children.find((c) => c.id === state.childId);
export const childName = (id) => (state.children.find((c) => c.id === id) || {}).name || '';

// ---------------------------------------------------------------------------
// Bottom sheet & small widgets
// ---------------------------------------------------------------------------

export function openSheet(title, ...content) {
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' },
      h('h2', null, title),
      h('button', { class: 'icon-btn btn-ghost', 'aria-label': 'Затвори', onclick: closeSheet }, '✕')),
    ...content);
  const overlay = h('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) closeSheet(); } }, sheet);
  $('#sheet-root').replaceChildren(overlay);
  return sheet;
}
export function closeSheet() { $('#sheet-root').replaceChildren(); }

/** Segmented control. Returns { el, get() }. */
export function segmented(options, initial, { allowNone = false, onChange } = {}) {
  let value = initial;
  const keys = Object.keys(options);
  const buttons = keys.map((k) => h('button', {
    type: 'button', class: k === value ? 'on' : '', 'aria-pressed': String(k === value),
    onclick: () => {
      value = allowNone && value === k ? null : k;
      buttons.forEach((b, i) => { b.classList.toggle('on', keys[i] === value); b.setAttribute('aria-pressed', String(keys[i] === value)); });
      if (onChange) onChange(value);
    },
  }, options[k]));
  return { el: h('div', { class: 'seg' }, buttons), get: () => value };
}

/** Child switcher chips (shared by all tabs). */
export function childChips(onPick) {
  return h('div', { class: 'chips', role: 'tablist', 'aria-label': 'Дете' },
    state.children.map((k) => h('button', {
      class: 'chip' + (k.id === state.childId ? ' active' : ''), role: 'tab',
      'aria-selected': String(k.id === state.childId),
      onclick: () => { state.childId = k.id; lsSet(LS_CHILD, k.id); onPick(); },
    }, h('span', { class: 'dot', style: { background: k.color } }), k.name, h('small', null, fmtAge(k.birth_date)))));
}

/** One-line human description of an event. */
export function describe(ev) {
  const t = typeInfo(ev);
  const parts = [];
  if (ev.type === 'breast') {
    const { L, R } = breastSecs(ev);
    if (L >= 30) parts.push(`Л ${fmtDurShort(L * 1000)}`);
    if (R >= 30) parts.push(`Д ${fmtDurShort(R * 1000)}`);
    if (!ev.ended_at) parts.push(ev.active_side ? 'тече…' : 'пауза');
  } else {
    if (ev.side) parts.push(SIDES[ev.side].toLowerCase());
    if (ev.amount != null) parts.push(`${fmtNum(ev.amount)} ${UNITS[ev.unit] || ev.unit || ''}`.trim());
    if (ev.milk_type) parts.push(MILK[ev.milk_type].toLowerCase());
    if (ev.diaper_color) parts.push(COLORS[ev.diaper_color].toLowerCase());
    if (ev.label) parts.push(ev.label);
    if (TIMER_TYPES.includes(ev.type)) parts.push(ev.ended_at ? fmtDur(activeMs(ev)) : 'тече…');
  }
  return { title: t.label, icon: t.icon, sub: parts.join(' · '), note: ev.note };
}

export function emptyState(text) { return h('p', { class: 'empty' }, text); }
