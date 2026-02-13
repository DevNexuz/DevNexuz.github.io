/* =========================================================
   Nexuzsite — script.js v0.1
   Funciones:
   - Toggle de tema (dark/light) con persistencia
   - Respeta prefers-color-scheme si no hay preferencia guardada
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

  const systemPrefersLight = () => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  };

  /**
   * Set theme:
   * - "dark": remove data-theme or set explicitly to keep semantics simple
   * - "light": set data-theme="light"
   */
  const applyTheme = (theme) => {
    const isLight = theme === "light";
    if (isLight) html.setAttribute("data-theme", "light");
    else html.removeAttribute("data-theme");

    // Keep browser UI consistent with theme
    // (color-scheme is also handled in CSS via html[data-theme="light"])
    return isLight ? "light" : "dark";
  };

  const resolveInitialTheme = () => {
    const saved = getSavedTheme();
    if (saved === "light" || saved === "dark") return saved;

    // No saved preference: respect system *if it prefers light*, otherwise default dark
    return systemPrefersLight() ? "light" : "dark";
  };

  const updateToggleUI = (btn, theme) => {
    const isLight = theme === "light";

    // Editable copy:
    // When current theme is dark, label offers switching to light, and vice versa.
    const label = isLight ? "Modo oscuro" : "Modo claro";

    btn.textContent = label;
    btn.setAttribute("aria-pressed", String(isLight)); // pressed=true means light is active
    btn.setAttribute("aria-label", `Cambiar tema: ${label}`);

    // Optional: data attribute for styling hooks later
    btn.dataset.theme = isLight ? "light" : "dark";
  };

  const initThemeToggle = () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    // Initial theme
    let theme = resolveInitialTheme();
    theme = applyTheme(theme);
    updateToggleUI(btn, theme);

    // Click handler
    btn.addEventListener("click", () => {
      const currentlyLight = html.getAttribute("data-theme") === "light";
      const nextTheme = currentlyLight ? "dark" : "light";

      const applied = applyTheme(nextTheme);
      saveTheme(applied);
      updateToggleUI(btn, applied);
    });
  };

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
