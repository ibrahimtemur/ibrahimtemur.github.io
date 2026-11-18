/* ==========================================================================
   COMMAND PALETTE (Ctrl / Cmd + K)
   Quick search across all 7 scenes, projects, and portfolio actions.
   ========================================================================== */

import { PROJECTS_DATA } from "./projects-data.js?v=6";
import { getActiveLang, t, applyLanguage } from "./i18n.js?v=6";
import { getActiveTheme, toggleTheme } from "./theme.js?v=6";

let paletteActions = {};
let isPaletteOpen = false;
let selectedIdx = 0;
let filteredItems = [];
let lastFocusedBeforePalette = null;

function getSceneEntries() {
  const scenes = [
    { id: "scene-hero", num: "01", key: "scene.01" },
    { id: "scene-journey", num: "02", key: "scene.02" },
    { id: "scene-skills", num: "03", key: "scene.03" },
    { id: "scene-featured", num: "04", key: "scene.04" },
    { id: "scene-iot", num: "05", key: "scene.05" },
    { id: "scene-projects", num: "06", key: "scene.06" },
    { id: "scene-contact", num: "07", key: "scene.07" }
  ];

  return scenes.map((s) => ({
    group: t("palette.group.scenes"),
    id: `scene-${s.id}`,
    title: `${s.num} — ${t(s.key)}`,
    hint: `#${s.id}`,
    icon: "compass",
    run: () => {
      if (typeof paletteActions.navigateToSection === "function") {
        paletteActions.navigateToSection(s.id);
      } else {
        document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }));
}

function getProjectEntries() {
  const lang = getActiveLang();
  return PROJECTS_DATA.map((proj) => ({
    group: t("palette.group.projects"),
    id: `proj-${proj.id}`,
    title: proj.title[lang] || proj.title.tr,
    hint: proj.categoryBadge[lang] || proj.categoryBadge.tr,
    icon: "folder-git-2",
    keywords: `${proj.tech.join(" ")} ${proj.id}`,
    run: () => {
      if (typeof paletteActions.openProjectDrawer === "function") {
        paletteActions.openProjectDrawer(proj.id);
      }
    }
  }));
}

function getActionEntries() {
  const lang = getActiveLang();
  const theme = getActiveTheme();

  return [
    {
      group: t("palette.group.actions"),
      id: "action-lang",
      title: lang === "tr" ? "Switch Language → English (EN)" : "Dili Değiştir → Türkçe (TR)",
      hint: "TR / EN",
      icon: "languages",
      run: () => applyLanguage(lang === "tr" ? "en" : "tr")
    },
    {
      group: t("palette.group.actions"),
      id: "action-theme",
      title:
        theme === "dark"
          ? lang === "tr"
            ? "Açık Temaya Geç (Light)"
            : "Switch to Light Theme"
          : lang === "tr"
          ? "Koyu Temaya Geç (Dark)"
          : "Switch to Dark Theme",
      hint: theme === "dark" ? "Light" : "Dark",
      icon: theme === "dark" ? "sun" : "moon",
      run: () => toggleTheme()
    },
    {
      group: t("palette.group.actions"),
      id: "action-copy-email",
      title: `${t("contact.copy")} — ibrahimtemur847@gmail.com`,
      hint: "Email",
      icon: "copy",
      run: () => {
        if (typeof paletteActions.copyEmail === "function") {
          paletteActions.copyEmail();
        }
      }
    },
    {
      group: t("palette.group.actions"),
      id: "action-curtain",
      title: t("menu.open"),
      hint: "Menu",
      icon: "menu",
      run: () => {
        if (typeof paletteActions.openCurtainMenu === "function") {
          paletteActions.openCurtainMenu();
        }
      }
    },
    {
      group: t("palette.group.actions"),
      id: "action-copyright",
      title: t("footer.rights"),
      hint: "copyright.html",
      icon: "shield-check",
      run: () => {
        window.location.href = "copyright.html";
      }
    }
  ];
}

function buildPaletteList(query = "") {
  const listEl = document.getElementById("paletteList");
  if (!listEl) return;

  const q = query.trim().toLowerCase();
  const all = [...getSceneEntries(), ...getProjectEntries(), ...getActionEntries()];
  filteredItems = q
    ? all.filter((item) => {
        const hay = `${item.title} ${item.hint} ${item.keywords || ""}`.toLowerCase();
        return hay.includes(q);
      })
    : all;

  if (selectedIdx >= filteredItems.length) {
    selectedIdx = Math.max(0, filteredItems.length - 1);
  }

  listEl.innerHTML = "";

  if (filteredItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "cmd-palette-empty";
    empty.textContent = t("palette.empty");
    listEl.appendChild(empty);
    return;
  }

  let lastGroup = "";
  filteredItems.forEach((item, idx) => {
    if (item.group !== lastGroup) {
      lastGroup = item.group;
      const groupHead = document.createElement("div");
      groupHead.className = "cmd-palette-group-title";
      groupHead.textContent = lastGroup;
      listEl.appendChild(groupHead);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cmd-palette-item${idx === selectedIdx ? " is-selected" : ""}`;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", String(idx === selectedIdx));
    btn.dataset.paletteIdx = String(idx);

    const main = document.createElement("span");
    main.className = "cmd-palette-item-main";

    const iconEl = document.createElement("i");
    iconEl.setAttribute("data-lucide", item.icon);
    iconEl.style.width = "16px";
    iconEl.style.height = "16px";

    const titleEl = document.createElement("span");
    titleEl.className = "cmd-palette-item-title";
    titleEl.textContent = item.title;

    main.appendChild(iconEl);
    main.appendChild(titleEl);

    const hintEl = document.createElement("span");
    hintEl.className = "cmd-palette-item-hint";
    hintEl.textContent = item.hint;

    btn.appendChild(main);
    btn.appendChild(hintEl);

    btn.addEventListener("click", () => executePaletteItem(idx));
    btn.addEventListener("mouseenter", () => {
      selectedIdx = idx;
      syncSelectedClass();
    });

    listEl.appendChild(btn);
  });

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function syncSelectedClass() {
  const items = document.querySelectorAll("#paletteList .cmd-palette-item");
  items.forEach((el, idx) => {
    const selected = idx === selectedIdx;
    el.classList.toggle("is-selected", selected);
    el.setAttribute("aria-selected", String(selected));
    if (selected) {
      el.scrollIntoView({ block: "nearest" });
    }
  });
}

function executePaletteItem(idx) {
  const item = filteredItems[idx];
  if (!item) return;
  closePalette();
  item.run();
}

/**
 * Opens the command palette modal and focuses its search input.
 */
export function openPalette() {
  const backdrop = document.getElementById("commandPaletteBackdrop");
  const input = document.getElementById("paletteSearchInput");
  if (!backdrop) return;

  lastFocusedBeforePalette = document.activeElement;
  isPaletteOpen = true;
  selectedIdx = 0;

  if (input) input.value = "";
  buildPaletteList("");

  backdrop.classList.add("is-open");
  backdrop.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => {
    input?.focus();
  });
}

/**
 * Closes the command palette modal and restores prior focus.
 */
export function closePalette() {
  const backdrop = document.getElementById("commandPaletteBackdrop");
  if (!backdrop || !isPaletteOpen) return;

  isPaletteOpen = false;
  backdrop.classList.remove("is-open");
  backdrop.setAttribute("aria-hidden", "true");

  if (lastFocusedBeforePalette && typeof lastFocusedBeforePalette.focus === "function") {
    lastFocusedBeforePalette.focus();
    lastFocusedBeforePalette = null;
  }
}

/**
 * Toggles the command palette open/closed.
 */
export function togglePalette() {
  if (isPaletteOpen) {
    closePalette();
  } else {
    openPalette();
  }
}

/**
 * Initializes Command Palette keyboard shortcuts, search filtering, and triggers.
 */
export function initPalette(actions = {}) {
  paletteActions = actions || {};

  const triggerBtn = document.getElementById("paletteTriggerBtn");
  const backdrop = document.getElementById("commandPaletteBackdrop");
  const input = document.getElementById("paletteSearchInput");

  triggerBtn?.addEventListener("click", () => togglePalette());

  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) closePalette();
  });

  input?.addEventListener("input", () => {
    selectedIdx = 0;
    buildPaletteList(input.value);
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredItems.length > 0) {
        selectedIdx = (selectedIdx + 1) % filteredItems.length;
        syncSelectedClass();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredItems.length > 0) {
        selectedIdx = (selectedIdx - 1 + filteredItems.length) % filteredItems.length;
        syncSelectedClass();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      executePaletteItem(selectedIdx);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      togglePalette();
    } else if (e.key === "Escape" && isPaletteOpen) {
      e.preventDefault();
      closePalette();
    }
  });
}
