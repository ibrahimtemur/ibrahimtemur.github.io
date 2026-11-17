/* ==========================================================================
   THEME MANAGER (DARK / LIGHT) + VIEW TRANSITIONS + 3D SCENE COLOR SYNC
   ========================================================================== */

const STORAGE_THEME_KEY = "portfolio_theme";

const SCENE_PALETTES = {
  dark: {
    bg: "#0E1B20",
    fog: "#102026",
    ambient: "#13272C",
    lightPrimary: "#3CCFC0",
    lightSecondary: "#F2A65A",
    wire: "#23444D",
    textPrimary: "#F2F5F4",
    accentPrimary: "#3CCFC0",
    accentSecondary: "#F2A65A"
  },
  light: {
    bg: "#F5F1E8",
    fog: "#ECE6DA",
    ambient: "#DFD8C8",
    lightPrimary: "#0E8F86",
    lightSecondary: "#C9731E",
    wire: "#C7BFA9",
    textPrimary: "#0E1B20",
    accentPrimary: "#0E8F86",
    accentSecondary: "#C9731E"
  }
};

function detectInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch (_) {
    /* ignore storage errors */
  }
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

let activeTheme = detectInitialTheme();
const themeSubscribers = new Set();

/**
 * Returns active theme ('dark' | 'light').
 */
export function getActiveTheme() {
  return activeTheme;
}

/**
 * Returns palette hex values for Three.js WebGL scene synchronization.
 */
export function getThemeSceneColors(theme = activeTheme) {
  return { ...(SCENE_PALETTES[theme === "light" ? "light" : "dark"]) };
}

/**
 * Subscribes a listener to theme changes. Returns an unsubscribe function.
 */
export function onThemeChange(callback) {
  if (typeof callback === "function") {
    themeSubscribers.add(callback);
  }
  return () => themeSubscribers.delete(callback);
}

function commitThemeDom(theme) {
  activeTheme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", activeTheme);

  try {
    localStorage.setItem(STORAGE_THEME_KEY, activeTheme);
  } catch (_) {
    /* ignore storage errors */
  }

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    const nextIcon = activeTheme === "dark" ? "sun" : "moon";
    themeBtn.innerHTML = `<i data-lucide="${nextIcon}" id="themeIcon" style="width:16px;height:16px;"></i>`;
    themeBtn.setAttribute("aria-pressed", String(activeTheme === "light"));
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  const colors = getThemeSceneColors(activeTheme);
  themeSubscribers.forEach((cb) => {
    try {
      cb(activeTheme, colors);
    } catch (_) {
      /* isolate subscriber errors */
    }
  });

  window.dispatchEvent(
    new CustomEvent("portfolio:themechange", {
      detail: { theme: activeTheme, colors }
    })
  );
}

/**
 * Applies theme, optionally animated via View Transitions API circular clip.
 */
export function applyTheme(theme, originEvent = null) {
  const nextTheme = theme === "light" ? "light" : "dark";
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (
    originEvent &&
    !reducedMotion &&
    typeof document.startViewTransition === "function"
  ) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight - 36;

    if (typeof originEvent.clientX === "number" && originEvent.clientX > 0) {
      x = originEvent.clientX;
      y = originEvent.clientY;
    } else if (originEvent.currentTarget instanceof Element) {
      const rect = originEvent.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const root = document.documentElement;
    root.style.setProperty("--theme-x", `${Math.round(x)}px`);
    root.style.setProperty("--theme-y", `${Math.round(y)}px`);
    root.style.setProperty("--theme-r", `${Math.ceil(endRadius)}px`);

    document.startViewTransition(() => {
      commitThemeDom(nextTheme);
    });
    return nextTheme;
  }

  commitThemeDom(nextTheme);
  return nextTheme;
}

/**
 * Toggles between dark and light theme.
 */
export function toggleTheme(originEvent = null) {
  return applyTheme(activeTheme === "dark" ? "light" : "dark", originEvent);
}

/**
 * Initializes theme toggle controls and commits initial theme.
 */
export function initTheme() {
  commitThemeDom(activeTheme);

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", (e) => {
      toggleTheme(e);
    });
  }

  return activeTheme;
}
