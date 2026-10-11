(() => {
  const root = document.documentElement;

  // Theme toggle: light/dark, defaulting to the system setting.
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.getAttribute("data-theme") || (prefersDark.matches ? "dark" : "light");
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("msp-theme", next); } catch (e) { /* storage unavailable */ }
    });
  });

  // Mobile navigation.
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");
  if (navToggle && navList) {
    const setOpen = (open) => {
      navList.dataset.open = String(open);
      navToggle.setAttribute("aria-expanded", String(open));
    };
    navToggle.addEventListener("click", () => setOpen(navList.dataset.open !== "true"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    navList.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  }

  // Methods filter.
  const chips = document.querySelectorAll(".chip[data-filter]");
  const methods = document.querySelectorAll(".method[data-area]");
  const status = document.getElementById("filter-status");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const value = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      let shown = 0;
      methods.forEach((m) => {
        const match = value === "all" || m.dataset.area === value;
        m.hidden = !match;
        if (match) shown++;
      });
      if (status) {
        status.textContent = value === "all"
          ? `Показани са всички ${shown} метода.`
          : `${shown === 1 ? "Показан е 1 метод" : `Показани са ${shown} метода`} в посока „${chip.textContent.trim()}“.`;
      }
    });
  });

  // Copy-to-clipboard buttons.
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.copy);
      if (!target) return;
      const label = btn.textContent;
      const done = () => { btn.textContent = "Копирано"; setTimeout(() => { btn.textContent = label; }, 1800); };
      const fallback = () => {
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(target.textContent.trim()).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  // Contact form: client-side validation only. No backend is connected yet.
  const form = document.getElementById("contact-form");
  if (form) {
    const notice = document.getElementById("form-notice");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstInvalid = null;
      form.querySelectorAll("[required]").forEach((field) => {
        const wrapper = field.closest(".field");
        wrapper.querySelector(".field__error")?.remove();
        if (field.dataset.hint === undefined) field.dataset.hint = field.getAttribute("aria-describedby") || "";
        const hint = field.dataset.hint;
        const valid = field.value.trim() !== "" && field.checkValidity();
        field.setAttribute("aria-invalid", String(!valid));
        if (!valid) {
          const msg = document.createElement("span");
          msg.className = "field__error";
          msg.id = `${field.id}-error`;
          msg.textContent = field.type === "email" && field.value.trim()
            ? "Въведете имейл във формат име@домейн.bg."
            : "Попълнете това поле.";
          field.setAttribute("aria-describedby", `${hint} ${msg.id}`.trim());
          wrapper.appendChild(msg);
          firstInvalid = firstInvalid || field;
        } else if (hint) {
          field.setAttribute("aria-describedby", hint);
        } else {
          field.removeAttribute("aria-describedby");
        }
      });
      if (firstInvalid) { firstInvalid.focus(); notice.hidden = true; return; }
      notice.textContent = "Формата все още не е свързана със сървър и съобщението не е изпратено. Моля, копирайте текста и го изпратете на имейла вляво.";
      notice.hidden = false;
    });
  }

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
