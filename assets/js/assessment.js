// MSP Compass digital maturity self-assessment.
// Runs entirely in the browser: no network requests, no analytics. Answers are kept
// only in this browser's localStorage (key below) so a half-finished assessment
// survives a reload; "Изчисти" removes them.
(() => {
  const form = document.getElementById("dma-form");
  if (!form) return;
  const DIMS = JSON.parse(document.getElementById("dma-data").textContent);
  const KEY = "msp-dma-v1";
  const total = DIMS.reduce((n, d) => n + d.criteria.length, 0);

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage unavailable */ } };
  let state = load();

  // Restore saved answers into the form.
  Object.entries(state).forEach(([name, value]) => {
    const el = form.querySelector(`[name="${name}"][value="${value}"]`) || form.querySelector(`select[name="${name}"]`);
    if (!el) return;
    if (el.type === "radio") el.checked = true; else el.value = value;
  });

  const fmt = (x) => x.toFixed(1).replace(".", ",");
  const val = (name) => { const v = Number(state[name]); return v >= 1 && v <= 4 ? v : null; };

  const out = {
    progress: document.getElementById("dma-progress"),
    bar: document.getElementById("dma-progress-bar"),
    profile: document.getElementById("dma-profile"),
    next: document.getElementById("dma-next"),
    empty: document.getElementById("dma-empty"),
    results: document.getElementById("dma-results"),
  };

  function render() {
    const answered = DIMS.reduce((n, d) => n + d.criteria.filter((c) => val(c.id)).length, 0);
    out.progress.textContent = `${answered} / ${total}`;
    out.bar.style.width = `${(answered / total) * 100}%`;
    out.bar.parentElement.setAttribute("aria-valuenow", String(answered));

    const rows = [];
    const gaps = [];
    DIMS.forEach((d) => {
      const scores = d.criteria.map((c) => ({ c, v: val(c.id) })).filter((x) => x.v);
      const target = val(`t-${d.id}`) || 3;
      if (!scores.length) {
        rows.push(`<tr><th scope="row">${d.name}</th><td colspan="4" class="t-muted">Няма отговори</td></tr>`);
        return;
      }
      const avg = scores.reduce((s, x) => s + x.v, 0) / scores.length;
      const low = scores.reduce((a, b) => (b.v < a.v ? b : a));
      const m = val(`m-${d.id}`), u = val(`u-${d.id}`);
      const pct = (x) => `${((x - 1) / 3) * 100}%`;
      rows.push(`<tr>
        <th scope="row">${d.name}<span class="dma-sub">${scores.length} от ${d.criteria.length} критерия</span></th>
        <td data-label="Профил"><div class="dma-bar" role="img" aria-label="Средно ${fmt(avg)}, цел ${target}"><span class="dma-bar__fill" style="width:${pct(avg)}"></span><span class="dma-bar__target" style="left:${pct(target)}"></span></div></td>
        <td class="t-num" data-label="Средно">${fmt(avg)}</td>
        <td data-label="Най-слаб критерий"><span class="${low.v < target ? "is-gap" : ""}">${low.v}</span> <span class="dma-sub">${low.c.name}</span></td>
        <td class="t-num" data-label="Управление / разпространение">${m ? m : "–"} / ${u ? u : "–"}</td>
      </tr>`);
      scores.forEach((x) => { if (x.v < target) gaps.push({ d, c: x.c, v: x.v, gap: target - x.v }); });
    });

    out.profile.innerHTML = rows.join("");
    out.empty.hidden = answered > 0;
    out.results.hidden = answered === 0;

    gaps.sort((a, b) => b.gap - a.gap || a.v - b.v);
    out.next.innerHTML = gaps.length
      ? gaps.slice(0, 6).map((g) => `<li>
          <p class="t-label t-label--accent">${g.d.name} · ниво ${g.v} → ${g.v + 1}</p>
          <p class="t-h4">${g.c.name}</p>
          <p class="t-small">Следващото ниво изглежда така: ${g.c.levels[g.v]}</p>
        </li>`).join("")
      : `<li><p class="t-body">Няма критерии под целевото ниво сред попълнените.</p></li>`;
  }

  form.addEventListener("change", (e) => {
    const el = e.target;
    if (!el.name) return;
    state[el.name] = el.value;
    save(state);
    render();
  });

  document.getElementById("dma-reset").addEventListener("click", () => {
    state = {};
    try { localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
    form.reset();
    render();
  });

  render();
})();
