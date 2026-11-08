// "Настройки" tab: children, CSV export, password, sign-out.
import { h, sb, q, state, toast, errText, fmtAge, toLocalInput } from './core.js';
import { openChildForm } from './forms.js';

const EXPORTS = {
  events: {
    label: '📄 Всички записи', view: 'v_events', order: 'started_local',
    cols: 'child_name,category,type,started_local,ended_local,duration_min,active_min,amount,unit,side,left_min,right_min,last_side,milk_type,diaper_color,label,note,age_days',
  },
  daily: {
    label: '📊 Дневно обобщение', view: 'v_daily_summary', order: 'day_local',
    cols: 'child_name,day_local,feedings,breast_min,bottle_ml,pumped_ml,sleep_hours,naps,wet_diapers,dirty_diapers,potty_successes,potty_accidents,max_temperature_c',
  },
};

export function renderSettings(root) {
  const kids = h('div', null, state.children.map((k) => h('div', { class: 'settings-child' },
    h('span', { class: 'dot', style: { background: k.color } }),
    h('span', { class: 'grow' }, k.name, ' ', h('small', { class: 'hint' }, k.birth_date ? `· ${fmtAge(k.birth_date)}` : '')),
    h('button', { class: 'btn-ghost', onclick: () => openChildForm(k) }, 'Редактирай'))));

  const pw = h('input', { type: 'password', autocomplete: 'new-password', minlength: '8', id: 's-pw', placeholder: 'Поне 8 знака' });

  root.replaceChildren(
    h('div', { class: 'card' },
      h('h2', null, 'Деца'), kids,
      h('div', { class: 'form-actions' }, h('button', { class: 'btn-block', onclick: () => openChildForm() }, '+ Добави дете'))),
    h('div', { class: 'card' },
      h('h2', null, 'Експорт на данни (CSV)'),
      h('p', { class: 'hint' }, 'За Excel, архив или анализ. На iPhone изберете „Запази във Файлове“.'),
      h('div', { class: 'form-actions' },
        Object.values(EXPORTS).map((x) => h('button', { class: 'btn-block', onclick: (e) => exportCsv(e.currentTarget, x) }, x.label)))),
    h('div', { class: 'card' },
      h('h2', null, 'Смяна на парола'),
      h('label', { for: 's-pw' }, 'Нова парола'), pw,
      h('div', { class: 'form-actions' }, h('button', {
        class: 'btn-block',
        onclick: async () => {
          if (pw.value.length < 8) { toast('Паролата трябва да е поне 8 знака.', true); return; }
          try { await q(sb.auth.updateUser({ password: pw.value })); pw.value = ''; toast('Паролата е сменена ✓'); } catch (e) { toast(errText(e), true); }
        },
      }, 'Смени паролата'))),
    h('div', { class: 'card' },
      h('p', { class: 'hint' }, `Вписана като: ${state.session?.user?.email || ''}`),
      h('button', { class: 'btn-danger btn-block', onclick: async () => { await sb.auth.signOut(); } }, 'Изход')));
}

// ---- CSV export ---------------------------------------------------------------

function csvCell(v) {
  if (v == null) return '';
  let str = String(v);
  if (/^[=+\-@\t\r]/.test(str) && Number.isNaN(Number(str))) str = "'" + str; // block spreadsheet formula injection
  return /[",\n\r;]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

async function exportCsv(btn, { view, cols, order }) {
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
      await navigator.share({ files: [file], title: name });
    } else {
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: name });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
    toast(`Експортирани ${rows.length} ${rows.length === 1 ? 'ред' : 'реда'} ✓`);
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    toast(errText(e), true);
  } finally {
    btn.disabled = false;
  }
}
