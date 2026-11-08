// Бебешки дневник — entry point: sign-in, bottom tab bar, data loading.
// Modules live in ./js/ (plain ES modules, no build step).
import {
  h, $, sb, q, state, bus, toast, errText, lsGet, LS_CHILD, closeSheet,
  startOfDay, addDays, sameDay, fetchEvents, TIMER_TYPES, FEED_TYPES,
} from './js/core.js';
import { renderToday, tickClocks } from './js/today.js';
import { renderSchedule } from './js/schedule.js';
import { renderAnalysis } from './js/analysis.js';
import { renderGrowth } from './js/growth.js';
import { renderSettings } from './js/settings.js';

const TABS = {
  today: { label: 'Днес', icon: '🏠', render: renderToday },
  schedule: { label: 'График', icon: '📅', render: renderSchedule },
  analysis: { label: 'Анализ', icon: '📊', render: renderAnalysis },
  growth: { label: 'Растеж', icon: '📈', render: renderGrowth },
  settings: { label: 'Настройки', icon: '⚙️', render: renderSettings },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function loadChildren() {
  state.children = await q(sb.from('children').select('*').eq('archived', false)
    .order('birth_date', { ascending: false, nullsFirst: false }));
  const saved = lsGet(LS_CHILD);
  if (!state.children.some((c) => c.id === state.childId)) {
    state.childId = (state.children.find((c) => c.id === saved) || state.children[0] || {}).id || null;
  }
}

/** Data for the Today tab: running timers, the selected day, and "last" entries. */
async function loadToday() {
  const runningP = q(sb.from('events').select('*').is('ended_at', null).in('type', TIMER_TYPES).order('started_at'));
  if (!state.childId) { state.running = await runningP; state.events = []; state.last = {}; return; }
  const base = () => sb.from('events').select('*').eq('child_id', state.childId);
  const [running, events, feed, sleep, diaper, breast] = await Promise.all([
    runningP,
    fetchEvents(state.childId, state.day, addDays(state.day, 1)),
    q(base().in('type', FEED_TYPES).order('started_at', { ascending: false }).limit(1)),
    q(base().eq('category', 'sleep').order('started_at', { ascending: false }).limit(1)),
    q(base().eq('category', 'diaper').order('started_at', { ascending: false }).limit(1)),
    q(base().eq('type', 'breast').not('ended_at', 'is', null).order('started_at', { ascending: false }).limit(1)),
  ]);
  state.running = running;
  state.events = events;
  const b = breast[0];
  state.last = {
    feeding: feed[0], sleep: sleep[0], diaper: diaper[0],
    breastSide: b ? (b.last_side || (b.side === 'right' ? 'right' : b.side === 'left' ? 'left' : null)) : null,
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  const app = $('#app');
  let page = $('#page');
  if (!page || !$('#tabbar')) {
    page = h('div', { id: 'page' });
    app.replaceChildren(
      h('header', { class: 'topbar' }, h('h1', { id: 'page-title' }, '')),
      page);
    document.body.append(tabBar());
  }
  $('#page-title').textContent = state.tab === 'today' ? 'Бебешки дневник' : TABS[state.tab].label;
  document.querySelectorAll('#tabbar button').forEach((b) => {
    const on = b.dataset.tab === state.tab;
    b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });

  if (state.tab === 'today') {
    try { await loadToday(); } catch (e) { toast(errText(e), true); }
    if (seq !== renderSeq) return; // a newer render started
  }
  await TABS[state.tab].render(page, { refresh: render });
}

function tabBar() {
  return h('nav', { id: 'tabbar', 'aria-label': 'Раздели' },
    Object.entries(TABS).map(([key, t]) => h('button', {
      'data-tab': key,
      onclick: () => {
        if (state.tab === key) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        state.tab = key; closeSheet(); window.scrollTo({ top: 0 }); render();
      },
    }, h('span', { class: 'tab-icon', 'aria-hidden': 'true' }, t.icon), h('span', { class: 'tab-lbl' }, t.label))));
}

function renderSetupMissing() {
  $('#app').replaceChildren(
    h('div', { class: 'card login' },
      h('h1', null, 'Нужна е настройка'),
      h('p', null, 'Липсва файлът config.js с адреса и ключа на Supabase. Вижте README.md, стъпка 4.')));
}

function renderLogin() {
  closeSheet();
  const tb = $('#tabbar'); if (tb) tb.remove();
  const email = h('input', { type: 'email', autocomplete: 'username', inputmode: 'email', required: true, id: 'email' });
  const pass = h('input', { type: 'password', autocomplete: 'current-password', required: true, id: 'password' });
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
// Boot
// ---------------------------------------------------------------------------

async function boot() {
  if (state.booted) return;
  state.booted = true;
  try { await loadChildren(); } catch (e) { toast(errText(e), true); }
  await render();
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
        Object.assign(state, { tab: 'today', children: [], childId: null, events: [], running: [], last: {} });
        renderLogin();
      }
    }, 0);
  });

  bus.addEventListener('changed', () => { if (state.booted) render(); });
  document.addEventListener('children-changed', async () => {
    try { await loadChildren(); } catch (e) { toast(errText(e), true); }
    render();
  });

  // Refresh when the app returns to the foreground (e.g. phone unlocked).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !state.booted) return;
    if (state.followToday && !sameDay(state.day, new Date())) state.day = startOfDay(new Date());
    render();
  });

  setInterval(() => { if (state.tab === 'today') tickClocks(); }, 1000);
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
