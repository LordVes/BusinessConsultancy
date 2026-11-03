(() => {
  const root = document.documentElement;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };

  // Theme toggle: light/dark, defaulting to the system setting.
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.getAttribute("data-theme") || (prefersDark.matches ? "dark" : "light");
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("msp-theme", next);
    });
  });

  // Language toggle: both languages are in the page; this only switches which one shows.
  const setLang = (lang) => {
    root.setAttribute("data-lang", lang);
    root.lang = lang;
    document.title = root.getAttribute(`data-title-${lang}`) || document.title;
    document.querySelectorAll("[data-set-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    store.set("msp-lang", lang);
    document.dispatchEvent(new CustomEvent("msp:lang", { detail: lang }));
  };
  document.querySelectorAll("[data-set-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.setLang)));
  setLang(root.getAttribute("data-lang") === "en" ? "en" : "bg");

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

  // Copy-to-clipboard buttons.
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.copy);
      if (!target) return;
      const label = btn.innerHTML;
      const done = () => { btn.textContent = root.dataset.lang === "en" ? "Copied" : "Копирано"; setTimeout(() => { btn.innerHTML = label; }, 1800); };
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

  // Print buttons.
  document.querySelectorAll("[data-print]").forEach((b) => b.addEventListener("click", () => window.print()));

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
