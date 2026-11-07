/* Бебешки дневник — main app (plain JavaScript, no build step).
 * All user text is rendered with textContent (never innerHTML) to avoid XSS.
 */
'use strict';

// ---------------------------------------------------------------------------
// Configuration of activity types (labels in Bulgarian, codes match the DB)
// ---------------------------------------------------------------------------

const UNITS = { ml: 'мл', g: 'г', kg: 'кг', cm: 'см', C: '°C', mg: 'мг', drops: 'капки', pcs: 'бр.' };
const SIDES = { left: 'Лява', right: 'Дясна', both: 'Двете' };
const MILK = { breast_milk: 'Кърма', formula: 'Адаптирано мляко' };
const COLORS = { yellow: 'Жълто', green: 'Зелено', brown: 'Кафяво', black: 'Черно', red: 'Червено', other: 'Друго' };

// fields: side | timer | time | amount:<unit> | amount:med | milk_type | label | diaper_color
const CATS = {
  feeding: {
    label: 'Хранене', icon: '🍼',
    types: {
      breast: { label: 'Кърмене', icon: '🤱', fields: ['side', 'timer'] },
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
const TIMER_TYPES = ['breast', 'nap', 'night'];
const CHILD_COLORS = ['#7c9cff', '#f2994a', '#2a9d8f', '#e05783', '#9b59b6'];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Create a DOM element. Strings/numbers become text nodes (safe). */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'style') Object.assign(el.style, v);
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const $ = (sel, root = document) => root.querySelector(sel);
const pad = (n) => String(n).padStart(2, '0');
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
const toLocalInput = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
};
const fromLocalInput = (s) => (s ? new Date(s).toISOString() : null);
const fmtTime = (d) => new Date(d).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
const fmtNum = (n) => Number(n).toLocaleString('bg-BG', { maximumFractionDigits: 2 });

function fmtDur(ms, withSeconds = false) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  if (withSeconds) return hh ? `${hh}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
  if (hh) return `${hh} ч ${pad(mm)} мин`;
  return mm ? `${mm} мин` : '< 1 мин';
}
const fmtAgo = (d) => `преди ${fmtDur(Date.now() - new Date(d).getTime())}`;

function fmtAge(birth) {
  if (!birth) return '';
  const b = new Date(birth + 'T00:00:00');
  const days = Math.floor((startOfDay(new Date()) - b) / 86400000);
  if (days < 0) return '';
  if (days < 14) return `${days} ${days === 1 ? 'ден' : 'дни'}`;
  if (days < 60) return `${Math.floor(days / 7)} седм.`;
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 24) return `${months} мес.`;
  const y = Math.floor(months / 12), m = months % 12;
  return m ? `${y} г. ${m} мес.` : `${y} г.`;
}

function dayTitle(d) {
  const today = startOfDay(new Date());
  if (sameDay(d, today)) return 'Днес';
  if (sameDay(d, addDays(today, -1))) return 'Вчера';
  return d.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' });
}

let toastTimer;
function toast(msg, isErr = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'show' + (isErr ? ' err' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, isErr ? 4500 : 2200);
}

function errText(err) {
  const m = (err && (err.message || err.error_description)) || String(err);
  if (/Invalid login credentials/i.test(m)) return 'Грешен имейл или парола.';
  if (/Email not confirmed/i.test(m)) return 'Имейлът не е потвърден.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Няма връзка с интернет. Опитайте отново.';
  if (/JWT|session/i.test(m)) return 'Сесията изтече. Влезте отново.';
  if (/rate limit/i.test(m)) return 'Твърде много опити. Изчакайте малко.';
  if (/Password should be/i.test(m)) return 'Паролата трябва да е поне 8 знака.';
  return 'Грешка: ' + m;
}

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------

const cfg = window.APP_CONFIG;
let sb = null;
if (cfg && cfg.SUPABASE_URL && !/YOUR-/.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY) && window.supabase) {
  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
}

async function q(promise) {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
  session: null,
  booted: false,
  children: [],
  childId: null,
  day: startOfDay(new Date()),
  events: [],
  running: [],
  last: {},
};

const LS_CHILD = 'bt.childId';
function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }

const child = () => state.children.find((c) => c.id === state.childId);
const childName = (id) => (state.children.find((c) => c.id === id) || {}).name || '';

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

async function loadChildren() {
  state.children = await q(sb.from('children').select('*').eq('archived', false).order('birth_date', { ascending: false, nullsFirst: false }));
  const saved = lsGet(LS_CHILD);
  if (!state.children.some((c) => c.id === state.childId)) {
    state.childId = (state.children.find((c) => c.id === saved) || state.children[0] || {}).id || null;
  }
}

async function loadData() {
  const runningP = q(sb.from('events').select('*').is('ended_at', null).in('type', TIMER_TYPES).order('started_at'));
  if (!state.childId) { state.running = await runningP; state.events = []; state.last = {}; return; }
  const from = state.day, to = addDays(state.day, 1);
  const base = () => sb.from('events').select('*').eq('child_id', state.childId);
  const [running, events, feed, sleep, diaper] = await Promise.all([
    runningP,
    q(base().gte('started_at', from.toISOString()).lt('started_at', to.toISOString()).order('started_at', { ascending: false })),
    q(base().in('type', ['breast', 'bottle', 'solids']).order('started_at', { ascending: false }).limit(1)),
    q(base().eq('category', 'sleep').order('started_at', { ascending: false }).limit(1)),
    q(base().eq('category', 'diaper').order('started_at', { ascending: false }).limit(1)),
  ]);
  state.running = running;
  state.events = events;
  state.last = { feeding: feed[0], sleep: sleep[0], diaper: diaper[0] };
}

async function refresh() {
  try {
    await loadData();
  } catch (e) {
    toast(errText(e), true);
  }
  renderMain();
}

// ---------------------------------------------------------------------------
// Rendering: login
// ---------------------------------------------------------------------------

function renderSetupMissing() {
  $('#app').replaceChildren(
    h('div', { class: 'card login' },
      h('h1', null, 'Нужна е настройка'),
      h('p', null, 'Липсва файлът config.js с адреса и ключа на Supabase. Вижте README.md, стъпка 3.')));
}

function renderLogin() {
  closeSheet();
  const email = h('input', { type: 'email', autocomplete: 'username', inputmode: 'email', required: true, id: 'email' });
  const pass = h('input', { type: 'password', autocomplete: 'current-password', required: true, id: 'password', minlength: '8' });
  const btn = h('button', { class: 'btn-primary btn-block', type: 'submit' }, 'Влез');
  const form = h('form', {
    onsubmit: async (ev) => {
      ev.preventDefault();
      btn.disabled = true;
      try {
        await q(sb.auth.signInWithPassword({ email: email.value.trim(), password: pass.value }));
      } catch (e) {
        toast(errText(e), true);
      } finally {
        btn.disabled = false;
      }
    },
  },
  h('label', { for: 'email' }, 'Имейл'), email,
  h('label', { for: 'password' }, 'Парола'), pass,
  h('div', { class: 'form-actions' }, btn));

  $('#app').replaceChildren(
    h('div', { class: 'login' },
      h('img', { class: 'logo', src: 'icons/icon-192.png', alt: '' }),
      h('h1', null, 'Бебешки дневник'),
      h('p', { class: 'sub' }, 'Хранене, сън, пелени и здраве'),
      h('div', { class: 'card' }, form)));
}

// ---------------------------------------------------------------------------
// Rendering: main screen
// ---------------------------------------------------------------------------

function describe(ev) {
  const t = (CATS[ev.category] || {}).types?.[ev.type] || { label: ev.type };
  const parts = [];
  if (ev.side) parts.push(SIDES[ev.side].toLowerCase());
  if (ev.amount != null) parts.push(`${fmtNum(ev.amount)} ${UNITS[ev.unit] || ev.unit || ''}`.trim());
  if (ev.milk_type) parts.push(MILK[ev.milk_type].toLowerCase());
  if (ev.diaper_color) parts.push(COLORS[ev.diaper_color].toLowerCase());
  if (ev.label) parts.push(ev.label);
  if (TIMER_TYPES.includes(ev.type)) {
    if (ev.ended_at) parts.push(fmtDur(new Date(ev.ended_at) - new Date(ev.started_at)));
    else parts.push('тече…');
  }
  return { title: t.label, icon: t.icon || CATS[ev.category].icon, sub: parts.join(' · '), note: ev.note };
}

function renderMain() {
  const c = child();
  const app = $('#app');

  const top = h('div', { class: 'topbar' },
    h('h1', null, 'Бебешки дневник'),
    h('button', { class: 'icon-btn', 'aria-label': 'Настройки', onclick: openSettings }, '⚙️'));

  const chips = h('div', { class: 'chips', role: 'tablist' },
    state.children.map((k) => h('button', {
      class: 'chip' + (k.id === state.childId ? ' active' : ''), role: 'tab',
      'aria-selected': String(k.id === state.childId),
      onclick: () => { state.childId = k.id; lsSet(LS_CHILD, k.id); refresh(); },
    }, h('span', { class: 'dot', style: { background: k.color } }), k.name, h('small', null, fmtAge(k.birth_date)))));

  if (!c) {
    app.replaceChildren(top,
      h('div', { class: 'card' },
        h('h2', null, 'Добре дошли! 👋'),
        h('p', null, 'Започнете, като добавите децата си.'),
        h('button', { class: 'btn-primary btn-block', onclick: () => openChildForm() }, '+ Добави дете')));
    return;
  }

  // Running timers (all children)
  const timers = state.running.map((ev) => {
    const d = describe(ev);
    return h('div', { class: `timer cat-${ev.category}` },
      h('div', null,
        h('div', { class: 't-label' }, `${d.icon} ${d.title} · ${childName(ev.child_id)}${ev.side ? ' · ' + SIDES[ev.side].toLowerCase() : ''}`),
        h('div', { class: 't-time', 'data-since': ev.started_at }, fmtDur(Date.now() - new Date(ev.started_at), true))),
      h('button', { class: 'btn-primary', onclick: () => stopTimer(ev) }, '■ Спри'));
  });

  // Quick actions with "time since last"
  const L = state.last;
  const sleepRunning = state.running.find((r) => r.child_id === c.id && r.category === 'sleep');
  const subs = {
    feeding: L.feeding ? h('span', { 'data-ago': L.feeding.started_at }, fmtAgo(L.feeding.started_at)) : 'няма запис',
    sleep: sleepRunning ? 'спи в момента'
      : (L.sleep && L.sleep.ended_at ? h('span', null, 'будно ', h('span', { 'data-ago': L.sleep.ended_at }, fmtAgo(L.sleep.ended_at))) : 'няма запис'),
    diaper: L.diaper ? h('span', { 'data-ago': L.diaper.started_at }, fmtAgo(L.diaper.started_at)) : 'няма запис',
    health: 'тегло, температура, лекарства',
  };
  const actions = h('div', { class: 'actions' },
    Object.entries(CATS).map(([key, cat]) => h('button', { class: `action cat-${key}`, onclick: () => openTypePicker(key) },
      h('span', { class: 'a-icon' }, cat.icon),
      h('span', { class: 'a-name' }, cat.label),
      h('span', { class: 'a-sub' }, subs[key]))));

  // Day summary
  const evs = state.events;
  const feeds = evs.filter((e) => ['breast', 'bottle', 'solids'].includes(e.type)).length;
  const ml = evs.filter((e) => e.type === 'bottle' && e.unit === 'ml').reduce((s, e) => s + Number(e.amount || 0), 0);
  const sleepMs = evs.filter((e) => e.category === 'sleep' && e.ended_at)
    .reduce((s, e) => s + (new Date(e.ended_at) - new Date(e.started_at)), 0);
  const diapers = evs.filter((e) => e.category === 'diaper').length;
  const isToday = sameDay(state.day, new Date());
  state.followToday = isToday;

  const daynav = h('div', { class: 'daynav' },
    h('button', { class: 'icon-btn', 'aria-label': 'Предишен ден', onclick: () => { state.day = addDays(state.day, -1); refresh(); } }, '‹'),
    h('span', { class: 'day-title' }, dayTitle(state.day)),
    h('button', { class: 'icon-btn', 'aria-label': 'Следващ ден', disabled: isToday, onclick: () => { state.day = addDays(state.day, 1); refresh(); } }, '›'));

  const stat = (val, lbl) => h('div', { class: 'stat' }, h('b', null, val), h('span', null, lbl));
  const summary = h('div', { class: 'card' },
    h('div', { class: 'stats' },
      stat(feeds, 'хранения'),
      stat(ml ? `${fmtNum(ml)}` : '–', 'мл шише'),
      stat(sleepMs ? fmtDur(sleepMs).replace(' мин', 'м').replace(' ч ', 'ч ') : '–', 'сън'),
      stat(diapers, 'пелени')));

  const list = evs.length
    ? h('ul', { class: 'list' }, evs.map((ev) => {
      const d = describe(ev);
      return h('li', { class: 'item', onclick: () => openForm(ev.category, ev.type, ev), tabindex: '0' },
        h('span', { class: 'i-time' }, fmtTime(ev.started_at)),
        h('span', { class: `i-icon cat-${ev.category}` }, d.icon),
        h('span', { class: 'i-main' },
          h('div', { class: 'i-title' }, d.title),
          (d.sub || d.note) ? h('div', { class: 'i-sub' }, [d.sub, d.note].filter(Boolean).join(' · ')) : null));
    }))
    : h('p', { class: 'empty' }, 'Няма записи за този ден.');

  app.replaceChildren(top, chips, ...timers, actions, daynav, summary, h('div', { class: 'card' }, list));
}

// Live clocks
setInterval(() => {
  document.querySelectorAll('[data-since]').forEach((el) => {
    el.textContent = fmtDur(Date.now() - new Date(el.dataset.since), true);
  });
  document.querySelectorAll('[data-ago]').forEach((el) => {
    el.textContent = fmtAgo(el.dataset.ago);
  });
}, 1000);

// ---------------------------------------------------------------------------
// Bottom sheet
// ---------------------------------------------------------------------------

function openSheet(title, ...content) {
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
function closeSheet() { $('#sheet-root').replaceChildren(); }

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

function openTypePicker(catKey) {
  const cat = CATS[catKey];
  const grid = h('div', { class: 'type-grid' },
    Object.entries(cat.types).map(([tk, t]) => h('button', { class: `cat-${catKey}`, onclick: () => openForm(catKey, tk) }, `${t.icon} ${t.label}`)));
  openSheet(`${cat.icon} ${cat.label} · ${child().name}`, grid);
}

/** Segmented control. Returns { el, get() }. */
function segmented(options, initial, allowNone = false) {
  let value = initial;
  const buttons = Object.entries(options).map(([k, lbl]) => h('button', {
    type: 'button', class: k === value ? 'on' : '',
    onclick: () => {
      value = allowNone && value === k ? null : k;
      buttons.forEach((b, i) => b.classList.toggle('on', Object.keys(options)[i] === value));
    },
  }, lbl));
  return { el: h('div', { class: 'seg' }, buttons), get: () => value };
}

function openForm(catKey, typeKey, existing) {
  const cat = CATS[catKey];
  const type = cat.types[typeKey];
  const ev = existing || {};
  const isNew = !existing;
  const get = {};
  const body = [];

  for (const f of type.fields) {
    const [name, unitSpec] = f.split(':');
    if (name === 'side') {
      const s = segmented(SIDES, ev.side || 'left');
      get.side = s.get;
      body.push(h('label', null, 'Страна'), s.el);
    } else if (name === 'milk_type') {
      const s = segmented(MILK, ev.milk_type || 'formula');
      get.milk_type = s.get;
      body.push(h('label', null, 'Вид мляко'), s.el);
    } else if (name === 'diaper_color') {
      const sel = h('select', { id: 'f-color' }, h('option', { value: '' }, '—'),
        Object.entries(COLORS).map(([k, v]) => h('option', { value: k }, v)));
      sel.value = ev.diaper_color || '';
      get.diaper_color = () => sel.value || null;
      body.push(h('label', { for: 'f-color' }, 'Цвят (по желание)'), sel);
    } else if (name === 'label') {
      const inp = h('input', { id: 'f-label', maxlength: '120', value: ev.label || '', autocomplete: 'off' });
      get.label = () => inp.value.trim() || null;
      body.push(h('label', { for: 'f-label' }, type.labelText || 'Описание'), inp);
    } else if (name === 'amount') {
      const inp = h('input', { id: 'f-amount', type: 'number', inputmode: 'decimal', step: 'any', min: '0', value: ev.amount ?? '' });
      get.amount = () => (inp.value === '' ? null : Number(inp.value));
      if (unitSpec === 'med') {
        const sel = h('select', { id: 'f-unit' }, ['ml', 'mg', 'drops', 'pcs'].map((u) => h('option', { value: u }, UNITS[u])));
        sel.value = ev.unit || 'ml';
        get.unit = () => sel.value;
        body.push(h('div', { class: 'row' },
          h('div', null, h('label', { for: 'f-amount' }, 'Доза'), inp),
          h('div', null, h('label', { for: 'f-unit' }, 'Мерна единица'), sel)));
      } else {
        get.unit = () => unitSpec;
        const lbl = { ml: 'Количество (мл)', g: 'Количество (г, по желание)', kg: 'Тегло (кг)', cm: 'Сантиметри', C: 'Температура (°C)' }[unitSpec];
        if (unitSpec === 'C') { inp.min = '30'; inp.max = '45'; }
        body.push(h('label', { for: 'f-amount' }, lbl), inp);
      }
    }
  }

  // Time fields
  const hasTimer = type.fields.includes('timer');
  const startInp = h('input', { id: 'f-start', type: 'datetime-local', value: toLocalInput(ev.started_at || new Date()) });
  const endInp = h('input', { id: 'f-end', type: 'datetime-local', value: ev.ended_at ? toLocalInput(ev.ended_at) : '' });
  if (hasTimer) {
    body.push(h('div', { class: 'row' },
      h('div', null, h('label', { for: 'f-start' }, 'Начало'), startInp),
      h('div', null, h('label', { for: 'f-end' }, 'Край'), endInp)));
    if (!isNew && !ev.ended_at) body.push(h('p', { class: 'hint' }, 'Таймерът тече. Оставете „Край“ празно, за да продължи.'));
  } else {
    body.push(h('label', { for: 'f-start' }, 'Час'), startInp);
  }

  const note = h('textarea', { id: 'f-note', maxlength: '1000', placeholder: 'По желание' });
  note.value = ev.note || '';
  body.push(h('label', { for: 'f-note' }, 'Бележка'), note);

  function collect(mode) {
    const rec = {
      category: catKey, type: typeKey,
      amount: null, unit: null, side: null, milk_type: null, diaper_color: null, label: null,
      note: note.value.trim() || null,
    };
    for (const [k, fn] of Object.entries(get)) rec[k] = fn();
    if (rec.amount == null) rec.unit = null;
    if (mode === 'timer') {
      rec.started_at = new Date().toISOString();
      rec.ended_at = null;
    } else {
      rec.started_at = fromLocalInput(startInp.value) || new Date().toISOString();
      rec.ended_at = hasTimer ? fromLocalInput(endInp.value) : null;
    }
    // Validation
    for (const r of type.required || []) {
      if (rec[r] == null || rec[r] === '') throw new Error(r === 'amount' ? 'Въведете количество.' : 'Попълнете описанието.');
    }
    if (rec.amount != null && (Number.isNaN(rec.amount) || rec.amount < 0)) throw new Error('Невалидно количество.');
    if (rec.unit === 'C' && (rec.amount < 30 || rec.amount > 45)) throw new Error('Температурата трябва да е между 30 и 45 °C.');
    if (rec.ended_at && rec.ended_at < rec.started_at) throw new Error('Краят е преди началото.');
    if (mode === 'save' && hasTimer && isNew && !rec.ended_at) throw new Error('Въведете час на край или натиснете „Стартирай таймер“.');
    return rec;
  }

  async function save(mode) {
    let rec;
    try { rec = collect(mode); } catch (e) { toast(e.message, true); return; }
    sheet.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    try {
      if (isNew) await q(sb.from('events').insert({ ...rec, child_id: state.childId }));
      else await q(sb.from('events').update(rec).eq('id', ev.id));
      closeSheet();
      toast(mode === 'timer' ? 'Таймерът е пуснат ▶' : 'Записано ✓');
      await refresh();
    } catch (e) {
      toast(errText(e), true);
      sheet.querySelectorAll('button').forEach((b) => { b.disabled = false; });
    }
  }

  const actions = h('div', { class: 'form-actions' });
  if (isNew && hasTimer) {
    actions.append(
      h('button', { class: 'btn-primary btn-block', type: 'button', onclick: () => save('timer') }, '▶ Стартирай таймер'),
      h('p', { class: 'or' }, 'или въведете начало и край по-горе'),
      h('button', { class: 'btn-block', type: 'button', onclick: () => save('save') }, 'Запази ръчно'));
  } else {
    actions.append(h('button', { class: 'btn-primary btn-block', type: 'button', onclick: () => save('save') }, 'Запази'));
  }
  if (!isNew) {
    actions.append(h('button', {
      class: 'btn-danger btn-block', type: 'button',
      onclick: async () => {
        if (!confirm('Да изтрия ли този запис?')) return;
        try {
          await q(sb.from('events').delete().eq('id', ev.id));
          closeSheet(); toast('Изтрито'); await refresh();
        } catch (e) { toast(errText(e), true); }
      },
    }, 'Изтрий'));
  }

  const who = isNew ? child().name : childName(ev.child_id);
  const sheet = openSheet(`${type.icon} ${type.label} · ${who}`, ...body, actions);
}

async function stopTimer(ev) {
  try {
    await q(sb.from('events').update({ ended_at: new Date().toISOString() }).eq('id', ev.id));
    toast(`Спряно · ${fmtDur(Date.now() - new Date(ev.started_at))}`);
    await refresh();
  } catch (e) {
    toast(errText(e), true);
  }
}

// ---------------------------------------------------------------------------
// Settings: children, export, password, sign-out
// ---------------------------------------------------------------------------

function openSettings() {
  const kids = h('div', null, state.children.map((k) => h('div', { class: 'settings-child' },
    h('span', { class: 'dot', style: { background: k.color } }),
    h('span', { class: 'grow' }, k.name, ' ', h('small', { class: 'hint' }, k.birth_date ? `· ${fmtAge(k.birth_date)}` : '')),
    h('button', { class: 'btn-ghost', onclick: () => openChildForm(k) }, 'Редактирай'))));

  const exportBtn = (label, view, cols, order) => h('button', {
    class: 'btn-block', onclick: (e) => exportCsv(e.currentTarget, view, cols, order),
  }, label);

  const pw = h('input', { type: 'password', autocomplete: 'new-password', minlength: '8', id: 's-pw', placeholder: 'Поне 8 знака' });

  openSheet('Настройки',
    h('h3', null, 'Деца'), kids,
    h('div', { class: 'form-actions' }, h('button', { class: 'btn-block', onclick: () => openChildForm() }, '+ Добави дете')),
    h('h3', { style: { marginTop: '22px' } }, 'Експорт на данни (CSV)'),
    h('div', { class: 'form-actions' },
      exportBtn('📄 Всички записи', 'v_events',
        'child_name,category,type,started_local,ended_local,duration_min,amount,unit,side,milk_type,diaper_color,label,note,age_days', 'started_local'),
      exportBtn('📊 Дневно обобщение', 'v_daily_summary',
        'child_name,day_local,feedings,breast_min,bottle_ml,pumped_ml,sleep_hours,naps,wet_diapers,dirty_diapers,potty_successes,potty_accidents,max_temperature_c', 'day_local')),
    h('h3', { style: { marginTop: '22px' } }, 'Смяна на парола'),
    pw,
    h('div', { class: 'form-actions' }, h('button', {
      class: 'btn-block',
      onclick: async () => {
        if (pw.value.length < 8) { toast('Паролата трябва да е поне 8 знака.', true); return; }
        try { await q(sb.auth.updateUser({ password: pw.value })); pw.value = ''; toast('Паролата е сменена ✓'); }
        catch (e) { toast(errText(e), true); }
      },
    }, 'Смени паролата')),
    h('p', { class: 'hint', style: { marginTop: '22px' } }, `Вписана като: ${state.session?.user?.email || ''}`),
    h('div', { class: 'form-actions' }, h('button', {
      class: 'btn-danger btn-block',
      onclick: async () => { await sb.auth.signOut(); },
    }, 'Изход')));
}

function openChildForm(existing) {
  const k = existing || {};
  const name = h('input', { id: 'c-name', maxlength: '60', value: k.name || '', autocomplete: 'off' });
  const birth = h('input', { id: 'c-birth', type: 'date', value: k.birth_date || '' });
  const sex = segmented({ f: 'Момиче', m: 'Момче' }, k.sex || null, true);
  const color = h('input', { id: 'c-color', type: 'color', value: k.color || CHILD_COLORS[state.children.length % CHILD_COLORS.length] });

  const actions = h('div', { class: 'form-actions' },
    h('button', {
      class: 'btn-primary btn-block',
      onclick: async () => {
        const rec = { name: name.value.trim(), birth_date: birth.value || null, sex: sex.get(), color: color.value };
        if (!rec.name) { toast('Въведете име.', true); return; }
        try {
          if (existing) await q(sb.from('children').update(rec).eq('id', k.id));
          else {
            const [created] = await q(sb.from('children').insert(rec).select());
            state.childId = created.id; lsSet(LS_CHILD, created.id);
          }
          closeSheet(); toast('Записано ✓');
          await loadChildren(); await refresh();
        } catch (e) { toast(errText(e), true); }
      },
    }, 'Запази'));
  if (existing) {
    actions.append(h('button', {
      class: 'btn-danger btn-block',
      onclick: async () => {
        if (!confirm(`Изтриване на ${k.name} и ВСИЧКИ записи за детето? Това не може да се отмени.`)) return;
        try {
          await q(sb.from('children').delete().eq('id', k.id));
          closeSheet(); toast('Изтрито');
          await loadChildren(); await refresh();
        } catch (e) { toast(errText(e), true); }
      },
    }, 'Изтрий детето'));
  }

  openSheet(existing ? 'Редактиране' : 'Ново дете',
    h('label', { for: 'c-name' }, 'Име'), name,
    h('label', { for: 'c-birth' }, 'Дата на раждане'), birth,
    h('label', null, 'Пол (по желание)'), sex.el,
    h('label', { for: 'c-color' }, 'Цвят'), color,
    actions);
}

// ---- CSV export ----------------------------------------------------------

function csvCell(v) {
  if (v == null) return '';
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s) && Number.isNaN(Number(s))) s = "'" + s; // block spreadsheet formula injection
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function exportCsv(btn, view, cols, order) {
  btn.disabled = true;
  try {
    const rows = [];
    const page = 1000;
    for (let from = 0; ; from += page) {
      const data = await q(sb.from(view).select(cols).order(order).range(from, from + page - 1));
      rows.push(...data);
      if (data.length < page) break;
    }
    const header = cols.split(',');
    const lines = [header.join(','), ...rows.map((r) => header.map((c) => csvCell(r[c])).join(','))];
    const name = `${view.replace('v_', 'baby-')}-${toLocalInput(new Date()).slice(0, 10)}.csv`;
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }); // BOM → Excel shows Cyrillic
    const file = new File([blob], name, { type: 'text/csv' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: name }); // iPhone: save to Files, AirDrop, Mail…
    } else {
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: name });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
    toast(`Експортирани ${rows.length} ${rows.length === 1 ? 'ред' : 'реда'} ✓`);
  } catch (e) {
    if (e && e.name === 'AbortError') return; // share sheet cancelled
    toast(errText(e), true);
  } finally {
    btn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

async function boot() {
  if (state.booted) return;
  state.booted = true;
  try {
    await loadChildren();
  } catch (e) {
    toast(errText(e), true);
  }
  await refresh();
}

if (!sb) {
  renderSetupMissing();
} else {
  sb.auth.onAuthStateChange((event, session) => {
    state.session = session;
    // Defer: Supabase recommends not awaiting other calls inside this callback.
    setTimeout(() => {
      if (session && !state.booted) boot();
      if (!session) {
        state.booted = false;
        Object.assign(state, { children: [], childId: null, events: [], running: [], last: {} });
        renderLogin();
      }
    }, 0);
  });

  // Reload data when the app comes back to the foreground (e.g. after the phone was locked).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.booted) {
      if (state.followToday) state.day = startOfDay(new Date()); // past midnight → jump to the new day
      refresh();
    }
  });
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
