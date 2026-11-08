// Entry forms (bottom sheets), dual breastfeeding timer actions, child form.
import {
  h, CATS, SIDES, MILK, COLORS, UNITS, CHILD_COLORS,
  state, sb, q, toast, errText, changed, child, childName, lsSet, LS_CHILD,
  openSheet, closeSheet, segmented, toLocalInput, fromLocalInput, fmtDur, breastSecs,
} from './core.js';

// ---------------------------------------------------------------------------
// Type picker
// ---------------------------------------------------------------------------

export function openTypePicker(catKey) {
  const cat = CATS[catKey];
  const grid = h('div', { class: 'type-grid' },
    Object.entries(cat.types).map(([tk, t]) => h('button', { class: `cat-${catKey}`, onclick: () => openForm(catKey, tk) }, `${t.icon} ${t.label}`)));
  openSheet(`${cat.icon} ${cat.label} · ${child().name}`, grid);
}

// ---------------------------------------------------------------------------
// Dual breastfeeding timer
// ---------------------------------------------------------------------------

const nowIso = () => new Date().toISOString();

/** Close the currently running side segment into left_sec/right_sec. */
function closeSegment(ev, at = Date.now()) {
  const upd = { left_sec: ev.left_sec || 0, right_sec: ev.right_sec || 0 };
  if (ev.active_side && ev.side_started_at) {
    const secs = Math.max(0, Math.round((at - new Date(ev.side_started_at).getTime()) / 1000));
    upd[`${ev.active_side}_sec`] += secs;
  }
  return upd;
}

const sideSummary = (L, R) => (L > 0 && R > 0 ? 'both' : R > 0 ? 'right' : 'left');

export async function startBreast(side) {
  try {
    await q(sb.from('events').insert({
      child_id: state.childId, category: 'feeding', type: 'breast', started_at: nowIso(),
      left_sec: 0, right_sec: 0, active_side: side, side_started_at: nowIso(), last_side: side, side,
    }));
    closeSheet();
    toast(`▶ ${SIDES[side]} страна`);
    changed();
  } catch (e) { toast(errText(e), true); }
}

/** Tap on a side: start/switch to it, or pause if it is already running. */
export async function tapSide(ev, side) {
  const upd = closeSegment(ev);
  if (ev.active_side === side) {
    Object.assign(upd, { active_side: null, side_started_at: null, last_side: side });
  } else {
    Object.assign(upd, { active_side: side, side_started_at: nowIso(), last_side: side });
  }
  try { await q(sb.from('events').update(upd).eq('id', ev.id)); changed(); } catch (e) { toast(errText(e), true); }
}

/** Stop any running timer (breastfeeding or sleep). */
export async function stopTimer(ev) {
  let upd = { ended_at: nowIso() };
  if (ev.type === 'breast' && (ev.left_sec != null || ev.right_sec != null)) {
    const seg = closeSegment(ev);
    upd = { ...upd, ...seg, active_side: null, side_started_at: null, side: sideSummary(seg.left_sec, seg.right_sec) };
  }
  try {
    await q(sb.from('events').update(upd).eq('id', ev.id));
    const { L, R } = breastSecs({ ...ev, ...upd });
    const dur = ev.type === 'breast' ? (L + R) * 1000 : Date.now() - new Date(ev.started_at);
    toast(`Записано · ${fmtDur(dur)}`);
    changed();
  } catch (e) { toast(errText(e), true); }
}

/** Big card shown on the Today tab while a breastfeeding session runs. */
export function breastTimerCard(ev, tickAttr) {
  const sideBtn = (side, letter) => h('button', {
    class: 'side-btn' + (ev.active_side === side ? ' on' : ''),
    'aria-pressed': String(ev.active_side === side),
    'aria-label': `${SIDES[side]} страна ${ev.active_side === side ? '(пауза)' : '(старт)'}`,
    onclick: () => tapSide(ev, side),
  },
  h('span', { class: 'side-letter' }, letter),
  h('span', { class: 'side-time', ...tickAttr(ev, side) }, ''),
  h('span', { class: 'side-state' }, ev.active_side === side ? '❚❚ пауза' : '▶ старт'));

  return h('div', { class: 'timer timer-breast cat-feeding' },
    h('div', { class: 'timer-head' },
      h('div', null,
        h('div', { class: 't-label' }, `🤱 Кърмене · ${childName(ev.child_id)}${ev.active_side ? '' : ' · пауза'}`),
        h('div', { class: 't-time', ...tickAttr(ev, 'total') }, '')),
      h('button', { class: 'btn-primary', onclick: () => stopTimer(ev) }, '■ Край')),
    h('div', { class: 'side-row' }, sideBtn('left', 'Л'), sideBtn('right', 'Д')));
}

// ---------------------------------------------------------------------------
// Generic entry form (new or edit)
// ---------------------------------------------------------------------------

export function openForm(catKey, typeKey, existing) {
  if (typeKey === 'breast') return openBreastForm(existing);
  const type = CATS[catKey].types[typeKey];
  const ev = existing || {};
  const isNew = !existing;
  const get = {};
  const body = [];

  for (const f of type.fields) {
    const [name, unitSpec] = f.split(':');
    if (name === 'side') {
      const sg = segmented(SIDES, ev.side || 'left');
      get.side = sg.get;
      body.push(h('label', null, 'Страна'), sg.el);
    } else if (name === 'milk_type') {
      const sg = segmented(MILK, ev.milk_type || 'formula');
      get.milk_type = sg.get;
      body.push(h('label', null, 'Вид мляко'), sg.el);
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

  const note = noteField(ev);
  body.push(...note.els);

  function collect(mode) {
    const rec = {
      category: catKey, type: typeKey,
      amount: null, unit: null, side: null, milk_type: null, diaper_color: null, label: null,
      note: note.get(),
    };
    for (const [k, fn] of Object.entries(get)) rec[k] = fn();
    if (rec.amount == null) rec.unit = null;
    if (mode === 'timer') {
      rec.started_at = nowIso();
      rec.ended_at = null;
    } else {
      rec.started_at = fromLocalInput(startInp.value) || nowIso();
      rec.ended_at = hasTimer ? fromLocalInput(endInp.value) : null;
    }
    for (const r of type.required || []) {
      if (rec[r] == null || rec[r] === '') throw new Error(r === 'amount' ? 'Въведете количество.' : 'Попълнете описанието.');
    }
    if (rec.amount != null && (Number.isNaN(rec.amount) || rec.amount < 0)) throw new Error('Невалидно количество.');
    if (rec.unit === 'C' && (rec.amount < 30 || rec.amount > 45)) throw new Error('Температурата трябва да е между 30 и 45 °C.');
    if (rec.ended_at && rec.ended_at < rec.started_at) throw new Error('Краят е преди началото.');
    if (mode === 'save' && hasTimer && isNew && !rec.ended_at) throw new Error('Въведете час на край или натиснете „Стартирай таймер“.');
    return rec;
  }

  const actions = h('div', { class: 'form-actions' });
  const save = (mode) => saveEvent(sheet, isNew, ev, () => collect(mode), mode === 'timer' ? 'Таймерът е пуснат ▶' : 'Записано ✓');
  if (isNew && hasTimer) {
    actions.append(
      h('button', { class: 'btn-primary btn-block', type: 'button', onclick: () => save('timer') }, '▶ Стартирай таймер'),
      h('p', { class: 'or' }, 'или въведете начало и край по-горе'),
      h('button', { class: 'btn-block', type: 'button', onclick: () => save('save') }, 'Запази ръчно'));
  } else {
    actions.append(h('button', { class: 'btn-primary btn-block', type: 'button', onclick: () => save('save') }, 'Запази'));
  }
  if (!isNew) actions.append(deleteButton(ev));

  const who = isNew ? child().name : childName(ev.child_id);
  const sheet = openSheet(`${type.icon} ${type.label} · ${who}`, ...body, actions);
}

function noteField(ev) {
  const note = h('textarea', { id: 'f-note', maxlength: '1000', placeholder: 'По желание' });
  note.value = ev.note || '';
  return { els: [h('label', { for: 'f-note' }, 'Бележка'), note], get: () => note.value.trim() || null };
}

async function saveEvent(sheet, isNew, ev, collect, okMsg) {
  let rec;
  try { rec = collect(); } catch (e) { toast(e.message, true); return; }
  sheet.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  try {
    if (isNew) await q(sb.from('events').insert({ ...rec, child_id: state.childId }));
    else await q(sb.from('events').update(rec).eq('id', ev.id));
    closeSheet();
    toast(okMsg);
    changed();
  } catch (e) {
    toast(errText(e), true);
    sheet.querySelectorAll('button').forEach((b) => { b.disabled = false; });
  }
}

function deleteButton(ev) {
  return h('button', {
    class: 'btn-danger btn-block', type: 'button',
    onclick: async () => {
      if (!confirm('Да изтрия ли този запис?')) return;
      try {
        await q(sb.from('events').delete().eq('id', ev.id));
        closeSheet(); toast('Изтрито'); changed();
      } catch (e) { toast(errText(e), true); }
    },
  }, 'Изтрий');
}

// ---------------------------------------------------------------------------
// Breastfeeding form: start a side timer, or enter minutes per side
// ---------------------------------------------------------------------------

function openBreastForm(existing) {
  const ev = existing || {};
  const isNew = !existing;
  const running = !isNew && !ev.ended_at;
  const body = [];

  if (isNew) {
    const lastSide = state.last.breastSide;
    const suggest = lastSide === 'left' ? 'right' : lastSide === 'right' ? 'left' : null;
    body.push(
      lastSide ? h('p', { class: 'hint' }, `Последно завършихте на ${SIDES[lastSide].toLowerCase()} страна.`) : null,
      h('div', { class: 'side-row' },
        ['left', 'right'].map((side) => h('button', {
          class: 'side-btn start' + (suggest === side ? ' suggest' : ''), type: 'button', onclick: () => startBreast(side),
        }, h('span', { class: 'side-letter' }, side === 'left' ? 'Л' : 'Д'), h('span', { class: 'side-state' }, `▶ ${SIDES[side]}`),
        suggest === side ? h('span', { class: 'side-hint' }, 'предложение') : null))),
      h('p', { class: 'or' }, 'или въведете ръчно минутите за всяка страна'));
  }

  const { L, R } = isNew ? { L: 0, R: 0 } : breastSecs(ev);
  const startInp = h('input', { id: 'f-start', type: 'datetime-local', value: toLocalInput(ev.started_at || new Date(Date.now() - 20 * 60000)) });
  const leftInp = h('input', { id: 'f-left', type: 'number', inputmode: 'numeric', min: '0', step: '1', value: isNew ? '' : Math.round(L / 60) });
  const rightInp = h('input', { id: 'f-right', type: 'number', inputmode: 'numeric', min: '0', step: '1', value: isNew ? '' : Math.round(R / 60) });
  const lastSeg = segmented({ left: 'Лява', right: 'Дясна' }, ev.last_side || (ev.side === 'right' ? 'right' : 'left'));

  body.push(h('label', { for: 'f-start' }, 'Начало'), startInp);
  if (!running) {
    body.push(
      h('div', { class: 'row' },
        h('div', null, h('label', { for: 'f-left' }, 'Лява (мин)'), leftInp),
        h('div', null, h('label', { for: 'f-right' }, 'Дясна (мин)'), rightInp)),
      h('label', null, 'Завършихте на'), lastSeg.el);
  } else {
    body.push(h('p', { class: 'hint' }, 'Таймерът тече — управлявайте страните от картата на екран „Днес“.'));
  }
  const note = noteField(ev);
  body.push(...note.els);

  function collect() {
    const started = fromLocalInput(startInp.value) || nowIso();
    if (running) return { started_at: started, note: note.get() };
    const lMin = leftInp.value === '' ? 0 : Number(leftInp.value);
    const rMin = rightInp.value === '' ? 0 : Number(rightInp.value);
    if ([lMin, rMin].some((v) => Number.isNaN(v) || v < 0)) throw new Error('Невалидни минути.');
    if (lMin + rMin <= 0) throw new Error('Въведете минути поне за едната страна.');
    if (lMin + rMin > 240) throw new Error('Над 4 часа? Проверете минутите.');
    const left_sec = Math.round(lMin * 60), right_sec = Math.round(rMin * 60);
    return {
      category: 'feeding', type: 'breast', started_at: started,
      ended_at: new Date(new Date(started).getTime() + (left_sec + right_sec) * 1000).toISOString(),
      left_sec, right_sec, active_side: null, side_started_at: null,
      last_side: lastSeg.get(), side: sideSummary(left_sec, right_sec), note: note.get(),
    };
  }

  const actions = h('div', { class: 'form-actions' },
    h('button', { class: (isNew ? '' : 'btn-primary ') + 'btn-block', type: 'button', onclick: () => saveEvent(sheet, isNew, ev, collect, 'Записано ✓') },
      isNew ? 'Запази ръчно' : 'Запази'));
  if (!isNew) actions.append(deleteButton(ev));
  const sheet = openSheet(`🤱 Кърмене · ${isNew ? child().name : childName(ev.child_id)}`, ...body, actions);
}

// ---------------------------------------------------------------------------
// Child form
// ---------------------------------------------------------------------------

export function openChildForm(existing) {
  const k = existing || {};
  const name = h('input', { id: 'c-name', maxlength: '60', value: k.name || '', autocomplete: 'off' });
  const birth = h('input', { id: 'c-birth', type: 'date', value: k.birth_date || '' });
  const sex = segmented({ f: 'Момиче', m: 'Момче' }, k.sex || null, { allowNone: true });
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
          document.dispatchEvent(new Event('children-changed'));
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
          document.dispatchEvent(new Event('children-changed'));
        } catch (e) { toast(errText(e), true); }
      },
    }, 'Изтрий детето'));
  }

  openSheet(existing ? 'Редактиране' : 'Ново дете',
    h('label', { for: 'c-name' }, 'Име'), name,
    h('label', { for: 'c-birth' }, 'Дата на раждане'), birth,
    h('label', null, 'Пол (нужен за кривите на растеж)'), sex.el,
    h('label', { for: 'c-color' }, 'Цвят'), color,
    actions);
}
