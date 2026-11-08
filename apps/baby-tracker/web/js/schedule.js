// "График" tab: Gantt-style schedule — hours down the left, 7 days across the top.
// Duration activities (sleep, breastfeeding, timed entries) are bars; instant
// activities (bottle, diaper, health...) are short markers. Tap any mark to edit it.
import {
  h, CATS, child, childChips, fetchEvents, startOfDay, addDays, sameDay,
  fmtTime, fmtDurShort, activeMs, describe, emptyState, toast, errText, lsGet, lsSet, typeInfo,
} from './core.js';
import { openForm } from './forms.js';

const HOUR_PX = 26; // height of one hour row
const DAYS = 7;
const LS_FILTER = 'bt.schedFilter';

const sched = {
  end: startOfDay(new Date()), // last (right-most) day shown
  filter: (() => { try { return JSON.parse(lsGet(LS_FILTER)) || null; } catch { return null; } })()
    || { sleep: true, feeding: true, diaper: true, health: true },
};

const isBar = (ev) => ev.ended_at || ['breast', 'nap', 'night'].includes(ev.type);

export async function renderSchedule(root, { refresh }) {
  const c = child();
  if (!c) { root.replaceChildren(emptyState('Добавете дете от „Настройки“.')); return; }

  const first = addDays(sched.end, -(DAYS - 1));
  const days = Array.from({ length: DAYS }, (_, i) => addDays(first, i));
  const isCurrent = sameDay(sched.end, new Date());

  const go = (n) => {
    const next = addDays(sched.end, n * DAYS);
    sched.end = next > startOfDay(new Date()) ? startOfDay(new Date()) : next;
    renderSchedule(root, { refresh });
  };

  // Header: child chips, week navigation, legend/filters
  const rangeTxt = `${days[0].toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })} – ${days[DAYS - 1].toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}`;
  const nav = h('div', { class: 'daynav' },
    h('button', { class: 'icon-btn', 'aria-label': 'Предишна седмица', onclick: () => go(-1) }, '‹'),
    h('span', { class: 'day-title' }, isCurrent ? `Последните 7 дни` : rangeTxt),
    h('button', { class: 'icon-btn', 'aria-label': 'Следваща седмица', disabled: isCurrent, onclick: () => go(1) }, '›'));

  const legend = h('div', { class: 'legend', role: 'group', 'aria-label': 'Покажи' },
    Object.entries(CATS).map(([k, cat]) => h('button', {
      class: `legend-item${sched.filter[k] ? ' on' : ''}`, 'aria-pressed': String(!!sched.filter[k]),
      onclick: () => { sched.filter[k] = !sched.filter[k]; lsSet(LS_FILTER, JSON.stringify(sched.filter)); renderSchedule(root, { refresh }); },
    }, h('span', { class: `swatch sw-${k}` }), cat.label.replace(' / гърне', ''))));

  root.replaceChildren(childChips(refresh), nav, legend, h('p', { class: 'empty' }, 'Зареждане…'));

  let events;
  try {
    // Start one day earlier so night sleep that began the evening before is included.
    events = await fetchEvents(c.id, addDays(first, -1), addDays(sched.end, 1));
  } catch (e) { toast(errText(e), true); events = []; }
  if (child() !== c) return; // child switched while loading

  const visible = events.filter((ev) => sched.filter[ev.category]);
  const now = Date.now();

  // Grid
  const hours = h('div', { class: 'g-hours', 'aria-hidden': 'true' },
    Array.from({ length: 24 }, (_, i) => h('div', { class: 'g-hour', style: { height: `${HOUR_PX}px` } }, i % 2 === 0 ? `${String(i).padStart(2, '0')}` : '')));

  const cols = days.map((d) => {
    const dStart = d.getTime(), dEnd = addDays(d, 1).getTime();
    const col = h('div', { class: 'g-col' + (sameDay(d, new Date()) ? ' today' : ''), style: { height: `${24 * HOUR_PX}px` } });
    // Hour lines
    for (let i = 1; i < 24; i++) col.append(h('div', { class: 'g-line' + (i % 6 === 0 ? ' major' : ''), style: { top: `${i * HOUR_PX}px` } }));

    for (const ev of visible) {
      const s = new Date(ev.started_at).getTime();
      const t = typeInfo(ev);
      const d0 = describe(ev);
      const label = `${t.label}, ${fmtTime(ev.started_at)}${ev.ended_at ? '–' + fmtTime(ev.ended_at) : ''}${d0.sub ? ', ' + d0.sub : ''}`;
      if (isBar(ev)) {
        const e = ev.ended_at ? new Date(ev.ended_at).getTime() : now;
        if (e <= dStart || s >= dEnd) continue;
        const top = ((Math.max(s, dStart) - dStart) / 3600000) * HOUR_PX;
        const bottom = ((Math.min(e, dEnd) - dStart) / 3600000) * HOUR_PX;
        col.append(h('button', {
          class: `g-bar bar-${ev.category}${ev.type === 'nap' ? ' nap' : ''}${ev.ended_at ? '' : ' running'}`,
          style: { top: `${top}px`, height: `${Math.max(4, bottom - top - 1)}px` },
          title: label, 'aria-label': label,
          onclick: () => openForm(ev.category, ev.type, ev),
        }, bottom - top > 22 ? h('span', { class: 'g-bar-txt' }, fmtDurShort(activeMs(ev, now))) : null));
      } else {
        if (s < dStart || s >= dEnd) continue;
        const top = ((s - dStart) / 3600000) * HOUR_PX;
        col.append(h('button', {
          class: `g-mark mark-${ev.category}`, style: { top: `${top - 4}px` },
          title: label, 'aria-label': label,
          onclick: () => openForm(ev.category, ev.type, ev),
        }));
      }
    }
    if (sameDay(d, new Date())) {
      const nowTop = ((now - dStart) / 3600000) * HOUR_PX;
      col.append(h('div', { class: 'g-now', style: { top: `${nowTop}px` }, 'aria-hidden': 'true' }));
    }
    return col;
  });

  // Day headers (sticky) and daily totals footer
  const head = h('div', { class: 'g-head' }, h('div', { class: 'g-corner' }),
    days.map((d) => h('div', { class: 'g-dayname' + (sameDay(d, new Date()) ? ' today' : '') },
      h('span', null, d.toLocaleDateString('bg-BG', { weekday: 'short' })), h('b', null, d.getDate()))));

  const totals = days.map((d) => {
    const dStart = d.getTime(), dEnd = addDays(d, 1).getTime();
    let sleepMs = 0, feeds = 0, diapers = 0;
    for (const ev of events) {
      const s = new Date(ev.started_at).getTime();
      if (ev.category === 'sleep') {
        const e = ev.ended_at ? new Date(ev.ended_at).getTime() : now;
        sleepMs += Math.max(0, Math.min(e, dEnd) - Math.max(s, dStart));
      } else if (s >= dStart && s < dEnd) {
        if (['breast', 'bottle', 'solids'].includes(ev.type)) feeds++;
        if (ev.category === 'diaper') diapers++;
      }
    }
    return { sleepMs, feeds, diapers };
  });
  const foot = h('div', { class: 'g-foot' },
    h('div', { class: 'g-corner g-foot-lbl' }, h('span', null, '😴'), h('span', null, '🍼'), h('span', null, '🧷')),
    totals.map((t) => h('div', { class: 'g-total' },
      h('span', null, t.sleepMs ? fmtDurShort(t.sleepMs).replace(' ', '') : '–'),
      h('span', null, t.feeds || '–'),
      h('span', null, t.diapers || '–'))));

  const grid = h('div', { class: 'gantt card' },
    head,
    h('div', { class: 'g-body' }, hours, h('div', { class: 'g-cols' }, cols)),
    foot);

  // Swipe left/right to change week
  let x0 = null, y0 = null;
  grid.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  grid.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx > 0 ? -1 : 1);
  });

  root.replaceChildren(childChips(refresh), nav, legend, grid,
    h('p', { class: 'hint center' }, 'Плъзнете наляво/надясно за друга седмица. Докоснете запис, за да го редактирате.'));

  // Scroll so the current hour is in view on first open of the current week
  if (isCurrent) {
    const y = grid.getBoundingClientRect().top + window.scrollY + Math.max(0, (new Date().getHours() - 6) * HOUR_PX);
    if (window.scrollY < 10) window.scrollTo({ top: y - 120 });
  }
}
