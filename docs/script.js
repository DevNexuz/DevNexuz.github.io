/* =========================================================
   Nexuzsite — script.js v0.2
   Funciones:
   - Toggle de tema (dark/light) con persistencia
   - Respeta prefers-color-scheme si no hay preferencia guardada
   - Reacciona a cambios del sistema si no hay preferencia guardada
   - Accesible (aria-pressed / labels)
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "nexuz.theme"; // "dark" | "light"
  const html = document.documentElement;

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  };

  const clearSavedTheme = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const getSystemTheme = () => {
    const prefersLight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  };

  /**
   * Apply theme by setting data-theme explicitly.
   * This is friendlier for debugging and future theme expansion.
   */
  const applyTheme = (theme) => {
    const normalized = theme === "light" ? "light" : "dark";
    html.setAttribute("data-theme", normalized);
    return normalized;
  };

  const resolveInitialTheme = () => {
    const saved = getSavedTheme();
    if (saved === "light" || saved === "dark") return saved;
    return getSystemTheme(); // default = system; system default is dark if not light
  };

  const updateToggleUI = (btn, theme) => {
    const isLight = theme === "light";

    // When current theme is light, offer switching to dark, and vice versa.
    const nextLabel = isLight ? "Modo oscuro" : "Modo claro";

    btn.textContent = nextLabel;

    // aria-pressed should reflect the ON state. Here, we treat "light" as ON.
    btn.setAttribute("aria-pressed", String(isLight));
    btn.setAttribute("aria-label", `Cambiar tema: ${nextLabel}`);

    // Optional styling hook
    btn.dataset.theme = theme;
  };

  const initThemeToggle = () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    const hasSavedPreference = () => {
      const saved = getSavedTheme();
      return saved === "light" || saved === "dark";
    };

    // Initial theme
    let theme = resolveInitialTheme();
    theme = applyTheme(theme);
    updateToggleUI(btn, theme);

    // Click handler
    btn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";

      const applied = applyTheme(next);
      saveTheme(applied);
      updateToggleUI(btn, applied);
    });

    // If user has NOT saved a preference, follow system changes live
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: light)");

      const onSystemChange = () => {
        if (hasSavedPreference()) return; // user preference wins
        const sysTheme = getSystemTheme();
        const applied = applyTheme(sysTheme);
        updateToggleUI(btn, applied);
      };

      // addEventListener is modern; addListener is fallback
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", onSystemChange);
      } else if (typeof mq.addListener === "function") {
        mq.addListener(onSystemChange);
      }
    }

    // Optional dev shortcut:
    // If you ever want a "reset to system" flow later, you can call clearSavedTheme()
    // from a hidden debug button or a console command.
    btn.dataset.resetHint = "Use clearSavedTheme() in code if needed";
  };

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
