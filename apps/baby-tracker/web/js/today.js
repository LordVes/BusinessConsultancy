// "Днес" tab: running timers, quick actions, next nap, day summary, timeline.
import {
  h, CATS, FEED_TYPES, SIDES, state, child, childName, describe, fmtDur, fmtAgo, fmtTime,
  dayTitle, addDays, sameDay, activeMs, breastSecs, emptyState, childChips, fmtDurShort, fmtNum,
} from './core.js';
import { openTypePicker, openForm, openChildForm, stopTimer, breastTimerCard } from './forms.js';
import { nextNap } from './nap.js';

/** data-attributes that the 1-second ticker uses to update live clocks. */
const tickAttr = (ev, which) => ({ 'data-tick': ev.id, 'data-which': which });

export function tickClocks() {
  const now = Date.now();
  document.querySelectorAll('[data-tick]').forEach((el) => {
    const ev = state.running.find((r) => r.id === el.dataset.tick);
    if (!ev) return;
    const which = el.dataset.which;
    if (which === 'left' || which === 'right') {
      const { L, R } = breastSecs(ev, now);
      el.textContent = fmtDur((which === 'left' ? L : R) * 1000, true);
    } else {
      el.textContent = fmtDur(activeMs(ev, now), true);
    }
  });
  document.querySelectorAll('[data-ago]').forEach((el) => { el.textContent = fmtAgo(el.dataset.ago); });
}

function timerCard(ev) {
  if (ev.type === 'breast' && (ev.left_sec != null || ev.right_sec != null)) return breastTimerCard(ev, tickAttr);
  const d = describe(ev);
  return h('div', { class: `timer cat-${ev.category}` },
    h('div', null,
      h('div', { class: 't-label' }, `${d.icon} ${d.title} · ${childName(ev.child_id)}`),
      h('div', { class: 't-time', ...tickAttr(ev, 'total') }, '')),
    h('button', { class: 'btn-primary', onclick: () => stopTimer(ev) }, '■ Край'));
}

function napBanner(c, sleepRunning) {
  const n = nextNap(c, state.last.sleep, !!sleepRunning);
  if (!n) return null;
  const range = `${fmtTime(n.from)} – ${fmtTime(n.to)}`;
  const text = {
    early: ['Следваща дрямка', `около ${range}`],
    window: ['Време е за дрямка', `прозорец ${range}`],
    late: ['Прозорецът за сън е минал', `беше ${range} — следете за умора`],
  }[n.status];
  return h('div', { class: `nap-banner nap-${n.status}`, role: 'status' },
    h('span', { class: 'nap-icon', 'aria-hidden': 'true' }, n.status === 'early' ? '🕒' : '😴'),
    h('div', null,
      h('b', null, text[0]), h('div', null, text[1]),
      h('small', null, `Будно време за възрастта: ${n.window.min}–${n.window.max} мин. Ориентировъчно.`)));
}

export function renderToday(root, { refresh }) {
  const c = child();
  const chips = childChips(refresh);

  if (!c) {
    root.replaceChildren(
      h('div', { class: 'card' },
        h('h2', null, 'Добре дошли! 👋'),
        h('p', null, 'Започнете, като добавите децата си.'),
        h('button', { class: 'btn-primary btn-block', onclick: () => openChildForm() }, '+ Добави дете')));
    return;
  }

  const timers = state.running.map(timerCard);

  const L = state.last;
  const sleepRunning = state.running.find((r) => r.child_id === c.id && r.category === 'sleep');
  const lastSideTxt = L.breastSide ? ` · посл. ${SIDES[L.breastSide].toLowerCase()}` : '';
  const subs = {
    feeding: L.feeding ? h('span', null, h('span', { 'data-ago': L.feeding.started_at }, fmtAgo(L.feeding.started_at)), lastSideTxt) : 'няма запис',
    sleep: sleepRunning ? 'спи в момента'
      : (L.sleep && L.sleep.ended_at ? h('span', null, 'будно ', h('span', { 'data-ago': L.sleep.ended_at }, fmtAgo(L.sleep.ended_at))) : 'няма запис'),
    diaper: L.diaper ? h('span', { 'data-ago': L.diaper.started_at }, fmtAgo(L.diaper.started_at)) : 'няма запис',
    health: 'тегло, температура, лекарства',
  };
  const actions = h('div', { class: 'actions' },
    Object.entries(CATS).map(([key, cat]) => h('button', { class: `action cat-${key}`, onclick: () => openTypePicker(key) },
      h('span', { class: 'a-icon', 'aria-hidden': 'true' }, cat.icon),
      h('span', { class: 'a-name' }, cat.label),
      h('span', { class: 'a-sub' }, subs[key]))));

  // Day summary
  const evs = state.events;
  const feeds = evs.filter((e) => FEED_TYPES.includes(e.type)).length;
  const ml = evs.filter((e) => e.type === 'bottle' && e.unit === 'ml').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const sleepMs = evs.filter((e) => e.category === 'sleep' && e.ended_at).reduce((sum, e) => sum + activeMs(e), 0);
  const diapers = evs.filter((e) => e.category === 'diaper').length;
  const isToday = sameDay(state.day, new Date());
  state.followToday = isToday;

  const go = (n) => { state.day = addDays(state.day, n); refresh(); };
  const daynav = h('div', { class: 'daynav' },
    h('button', { class: 'icon-btn', 'aria-label': 'Предишен ден', onclick: () => go(-1) }, '‹'),
    h('span', { class: 'day-title' }, dayTitle(state.day)),
    h('button', { class: 'icon-btn', 'aria-label': 'Следващ ден', disabled: isToday, onclick: () => go(1) }, '›'));

  const stat = (val, lbl) => h('div', { class: 'stat' }, h('b', null, val), h('span', null, lbl));
  const summary = h('div', { class: 'card' },
    h('div', { class: 'stats' },
      stat(feeds, 'хранения'),
      stat(ml ? fmtNum(ml) : '–', 'мл шише'),
      stat(sleepMs ? fmtDurShort(sleepMs) : '–', 'сън'),
      stat(diapers, 'пелени')));

  const list = evs.length
    ? h('ul', { class: 'list' }, evs.slice().reverse().map((ev) => {
      const d = describe(ev);
      return h('li', null, h('button', { class: 'item', onclick: () => openForm(ev.category, ev.type, ev) },
        h('span', { class: 'i-time' }, fmtTime(ev.started_at)),
        h('span', { class: `i-icon cat-${ev.category}`, 'aria-hidden': 'true' }, d.icon),
        h('span', { class: 'i-main' },
          h('span', { class: 'i-title' }, d.title),
          (d.sub || d.note) ? h('span', { class: 'i-sub' }, [d.sub, d.note].filter(Boolean).join(' · ')) : null)));
    }))
    : emptyState('Няма записи за този ден.');

  root.replaceChildren(chips, ...timers, napBanner(c, sleepRunning) || '', actions, daynav, summary, h('div', { class: 'card' }, list));
  tickClocks();
}
