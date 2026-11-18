/* ==========================================================================
   PORTFOLIO UI ENGINE (js/ui.js)
   Coordinates Navigation Rail, Curtain Menu, Right Slide-Out Case-Study Drawer,
   Custom Cursor, Preloader, Skills Interactions, IoT State Machine,
   Featured Mac Remote Stepper, Projects Track & List Views, and Email Copy.
   ========================================================================== */

import {
  I18N,
  TYPEWRITER_PHRASES,
  FEATURED_SCREENS,
  getActiveLang,
  t,
  initI18n,
  onLanguageChange
} from "./i18n.js?v=10";
import { getActiveTheme, getThemeSceneColors, initTheme } from "./theme.js?v=10";
import {
  EMAIL_ADDRESS,
  SOCIAL_LINKS,
  PROJECTS_DATA,
  getProjects,
  getProjectById
} from "./projects-data.js?v=10";
import { syncWithGitHubApi, updateGitHubStatusLabel } from "./github.js?v=10";
import { initPalette } from "./palette.js?v=10";

export { getActiveLang, getThemeSceneColors };

const SECTION_IDS = [
  "scene-hero",
  "scene-journey",
  "scene-skills",
  "scene-featured",
  "scene-iot",
  "scene-projects",
  "scene-contact"
];

let uiOptions = {};
let currentFilter = "all";
let currentViewMode = "stage"; // 'stage' | 'list'
let currentScreenIdx = 0;
let currentIotState = "idle";
let currentActiveSectionIdx = 0;

let activeDrawerSpec = null; // { type: 'detail', key } | { type: 'project', id }
let lastFocusedBeforeDrawer = null;
let lastFocusedBeforeCurtain = null;
let isCurtainOpen = false;
let toastTimer = null;

/* Typewriter State */
let twPhraseIdx = 0;
let twCharIdx = 0;
let twDeleting = false;
let twTimer = null;

/* --------------------------------------------------------------------------
   1. ICON & TOAST UTILITIES
   -------------------------------------------------------------------------- */
export function refreshLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

export function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const toastText = document.getElementById("toastText");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

export async function copyEmailToClipboard() {
  try {
    await navigator.clipboard.writeText(EMAIL_ADDRESS);
  } catch (_) {
    const temp = document.createElement("textarea");
    temp.value = EMAIL_ADDRESS;
    temp.setAttribute("readonly", "");
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }

  const copyBtnText = document.getElementById("copyEmailBtnText");
  if (copyBtnText) {
    copyBtnText.textContent = t("contact.copied");
    setTimeout(() => {
      copyBtnText.textContent = t("contact.copy");
    }, 2200);
  }

  showToast(t("toast.copied"));
}

/* --------------------------------------------------------------------------
   2. PRELOADER (<= 1.5s, Skippable)
   -------------------------------------------------------------------------- */
export function dismissPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader || preloader.classList.contains("is-done")) return;
  preloader.classList.add("is-done");
  preloader.setAttribute("aria-hidden", "true");
  window.__portfolioPreloaderDone = true;
}

function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const skipBtn = document.getElementById("preloaderSkipBtn");
  skipBtn?.addEventListener("click", () => dismissPreloader());

  preloader.addEventListener("click", (e) => {
    if (e.target === preloader) dismissPreloader();
  });

  // Guarantee dismissal within <= 1.35s even if external resources lag
  setTimeout(() => dismissPreloader(), 1350);
}

/* --------------------------------------------------------------------------
   3. SUBTLE CUSTOM CURSOR (Desktop Fine Pointer Only)
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const finePointer =
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!finePointer || reducedMotion) return;

  const dot = document.getElementById("customCursor");
  const ring = document.getElementById("customCursorRing");
  if (!dot || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let rafId = null;

  const renderCursor = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(renderCursor);
  };

  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!document.body.classList.contains("cursor-ready")) {
        ringX = mouseX;
        ringY = mouseY;
        document.body.classList.add("cursor-ready");
      }
      if (!rafId) rafId = requestAnimationFrame(renderCursor);

      const interactive = e.target?.closest?.(
        "a, button, [role='button'], .project-slab, .iot-state-node"
      );
      document.body.classList.toggle("cursor-hover", Boolean(interactive));
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-ready", "cursor-hover");
  });
}

/* --------------------------------------------------------------------------
   4. TYPEWRITER PHRASE CYCLER (Scene 01 — No Terminal Box)
   -------------------------------------------------------------------------- */
function tickTypewriter() {
  const textEl = document.getElementById("typewriterText");
  if (!textEl) return;

  const lang = getActiveLang();
  const phrases = TYPEWRITER_PHRASES[lang] || TYPEWRITER_PHRASES.tr;
  const currentPhrase = phrases[twPhraseIdx % phrases.length];

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    textEl.textContent = currentPhrase;
    return;
  }

  if (!twDeleting) {
    twCharIdx++;
    textEl.textContent = currentPhrase.slice(0, twCharIdx);
    if (twCharIdx >= currentPhrase.length) {
      twDeleting = true;
      twTimer = setTimeout(tickTypewriter, 2100);
      return;
    }
    twTimer = setTimeout(tickTypewriter, 42);
  } else {
    twCharIdx--;
    textEl.textContent = currentPhrase.slice(0, twCharIdx);
    if (twCharIdx <= 0) {
      twDeleting = false;
      twPhraseIdx = (twPhraseIdx + 1) % phrases.length;
      twTimer = setTimeout(tickTypewriter, 320);
      return;
    }
    twTimer = setTimeout(tickTypewriter, 22);
  }
}

export function resetTypewriter() {
  if (twTimer) clearTimeout(twTimer);
  twPhraseIdx = 0;
  twCharIdx = 0;
  twDeleting = false;
  tickTypewriter();
}

/* --------------------------------------------------------------------------
   5. NAVIGATION, SECTION RAIL & BRAND COMPACTION
   -------------------------------------------------------------------------- */
export function navigateToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  if (typeof uiOptions.onNavigateSection === "function") {
    uiOptions.onNavigateSection(sectionId, target);
    return;
  }

  if (uiOptions.lenis && typeof uiOptions.lenis.scrollTo === "function") {
    uiOptions.lenis.scrollTo(target, { duration: 1.0 });
    return;
  }

  const reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function setActiveSection(indexOrId) {
  let idx = 0;
  if (typeof indexOrId === "number") {
    idx = Math.max(0, Math.min(indexOrId, SECTION_IDS.length - 1));
  } else if (typeof indexOrId === "string") {
    const found = SECTION_IDS.indexOf(indexOrId);
    idx = found >= 0 ? found : 0;
  }

  currentActiveSectionIdx = idx;
  const rail = document.getElementById("sectionRail");
  const mobileCounter = document.getElementById("railMobileActive");

  if (rail) {
    rail.querySelectorAll(".rail-step").forEach((btn, bIdx) => {
      const active = bIdx === idx;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-current", active ? "step" : "false");
    });

    // Expand category filters in rail when Scene 06 (index 5) is active
    rail.classList.toggle("is-projects-active", idx === 5);
  }

  if (mobileCounter) {
    const num = String(idx + 1).padStart(2, "0");
    mobileCounter.textContent = `${num} / 07`;
  }
}

export function setScrollProgress(progress) {
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  const rail = document.getElementById("sectionRail");
  if (rail) {
    rail.style.setProperty("--rail-progress", clamped.toFixed(4));
  }
}

function initScrollObservers() {
  const brandCorner = document.getElementById("brandCorner");

  const updateScroll = () => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    brandCorner?.classList.toggle("is-compact", scrollTop > 72);
  };

  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  document.querySelectorAll(".rail-step").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-section-target");
      if (targetId) navigateToSection(targetId);
    });
  });

  document.querySelectorAll('a[href^="#scene-"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      const targetId = href ? href.slice(1) : "";
      if (targetId && document.getElementById(targetId)) {
        e.preventDefault();
        navigateToSection(targetId);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. SCENE 03 — SKILLS INTERACTION (Project Relation Highlight)
   -------------------------------------------------------------------------- */
function initSkillsInteractions() {
  const hintEl = document.getElementById("skillsRelationHint");
  const tokens = document.querySelectorAll(".skill-token[data-related-project]");

  const resetHint = () => {
    if (!hintEl) return;
    hintEl.textContent = t("skills.hint.idle");
    tokens.forEach((tEl) => tEl.classList.remove("is-highlighted"));
  };

  tokens.forEach((btn) => {
    const projId = btn.getAttribute("data-related-project");
    const showRelation = () => {
      const proj = getProjectById(projId);
      const lang = getActiveLang();
      tokens.forEach((tEl) => {
        tEl.classList.toggle(
          "is-highlighted",
          tEl.getAttribute("data-related-project") === projId
        );
      });
      if (hintEl && proj) {
        const title = proj.title[lang] || proj.title.tr;
        hintEl.innerHTML = `${t("skills.hint.related")} <strong>${title}</strong>`;
      }
    };

    btn.addEventListener("mouseenter", showRelation);
    btn.addEventListener("focus", showRelation);
    btn.addEventListener("mouseleave", resetHint);
    btn.addEventListener("blur", resetHint);
    btn.addEventListener("click", () => {
      if (projId && getProjectById(projId)) {
        openProjectDrawer(projId);
      } else {
        openDetailDrawer("skills");
      }
    });
  });

  onLanguageChange(() => resetHint());
}

/* --------------------------------------------------------------------------
   7. SCENE 04 — FEATURED MAC REMOTE STEPPER & PREVIEW TOGGLE
   -------------------------------------------------------------------------- */
export function updateFeaturedScreen(idx) {
  const lang = getActiveLang();
  const screens = FEATURED_SCREENS[lang] || FEATURED_SCREENS.tr;
  currentScreenIdx = Math.max(0, Math.min(Number(idx) || 0, screens.length - 1));
  const item = screens[currentScreenIdx];

  const imgEl = document.getElementById("featuredPreviewImg");
  const capEl = document.getElementById("featuredPreviewCaption");

  if (imgEl && item) {
    imgEl.style.opacity = "0.4";
    setTimeout(() => {
      imgEl.src = item.src;
      imgEl.style.opacity = "1";
    }, 100);
  }

  if (capEl && item) {
    capEl.textContent = item.caption;
  }

  document.querySelectorAll(".featured-step-btn").forEach((btn) => {
    const bIdx = Number(btn.getAttribute("data-screen-idx"));
    const isActive = bIdx === currentScreenIdx;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  if (typeof uiOptions.onFeaturedScreenChange === "function") {
    uiOptions.onFeaturedScreenChange(currentScreenIdx, item);
  }

  window.dispatchEvent(
    new CustomEvent("portfolio:featured-screen", {
      detail: { index: currentScreenIdx, screen: item }
    })
  );
}

export function getCurrentScreenIdx() {
  return currentScreenIdx;
}

function initFeaturedSection() {
  document.querySelectorAll(".featured-step-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-screen-idx") || "0");
      updateFeaturedScreen(idx);
    });
  });

  const stageWindow = document.getElementById("featuredStageWindow");
  const toggleBtn = document.getElementById("featuredPreviewToggle");
  if (stageWindow && toggleBtn) {
    const syncToggleLabel = () => {
      const shown = stageWindow.classList.contains("is-preview-visible");
      const labelSpan = toggleBtn.querySelector("span");
      if (labelSpan) {
        labelSpan.textContent = shown
          ? t("featured.preview.stage")
          : t("featured.preview.show");
      }
      toggleBtn.setAttribute("aria-pressed", String(shown));
    };

    toggleBtn.addEventListener("click", () => {
      stageWindow.classList.toggle("is-preview-visible");
      syncToggleLabel();
    });

    onLanguageChange(syncToggleLabel);
    syncToggleLabel();
  }

  updateFeaturedScreen(0);
}

/* --------------------------------------------------------------------------
   8. SCENE 05 — IOT STATE MACHINE (IDLE -> HEATING -> BREWING -> DONE)
   -------------------------------------------------------------------------- */
export function setIotState(stateKey) {
  const valid = ["idle", "heating", "brewing", "done"];
  currentIotState = valid.includes(stateKey) ? stateKey : "idle";

  document.querySelectorAll(".iot-state-node").forEach((node) => {
    const active = node.getAttribute("data-iot-state") === currentIotState;
    node.classList.toggle("is-active", active);
    node.setAttribute("aria-pressed", String(active));
  });

  const pcbWin = document.getElementById("iotPcbWindow");
  if (pcbWin) {
    pcbWin.setAttribute("data-iot-active-state", currentIotState);
  }

  if (typeof uiOptions.onIotStateChange === "function") {
    uiOptions.onIotStateChange(currentIotState);
  }

  window.dispatchEvent(
    new CustomEvent("portfolio:iot-state", { detail: { state: currentIotState } })
  );
}

function initIotSection() {
  document.querySelectorAll(".iot-state-node").forEach((node) => {
    node.addEventListener("click", () => {
      const state = node.getAttribute("data-iot-state") || "idle";
      setIotState(state);
    });
  });

  setIotState("idle");
}

/* --------------------------------------------------------------------------
   9. SCENE 06 — PROJECTS PATH & LIST VIEWS + FILTER SYNC
   -------------------------------------------------------------------------- */
export function getProjectFilter() {
  return currentFilter;
}

export function setProjectFilter(filter) {
  currentFilter = filter || "all";

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    const active = btn.getAttribute("data-filter") === currentFilter;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  document.querySelectorAll(".rail-filter-btn").forEach((btn) => {
    const active = btn.getAttribute("data-filter") === currentFilter;
    btn.classList.toggle("is-active", active);
  });

  renderProjects();
}

export function setProjectViewMode(mode) {
  currentViewMode = mode === "list" ? "list" : "stage";

  document.querySelectorAll(".view-mode-btn").forEach((btn) => {
    const active = btn.getAttribute("data-view-mode") === currentViewMode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  renderProjects();
}

function buildStatsMarkup(proj) {
  if (proj.stars === null) {
    return proj.language
      ? `<span class="project-stats"><span>${proj.language}</span></span>`
      : `<span class="project-stats"><span>Production</span></span>`;
  }
  const parts = [`<span>★ ${proj.stars}</span>`];
  if (proj.forks) parts.push(`<span>⑂ ${proj.forks}</span>`);
  if (proj.language) parts.push(`<span>${proj.language}</span>`);
  return `<span class="project-stats">${parts.join("")}</span>`;
}

export function renderProjects() {
  const container = document.getElementById("projectsContainer");
  const hoverBar = document.getElementById("projectsHoverBar");
  if (!container) return;

  const lang = getActiveLang();
  const list = getProjects(currentFilter);

  if (hoverBar) {
    hoverBar.textContent = t("projects.hover.idle");
  }

  if (currentViewMode === "list") {
    container.className = "projects-list-view";
    container.innerHTML = list
      .map((proj, i) => {
        const num = String(i + 1).padStart(2, "0");
        const title = proj.title[lang] || proj.title.tr;
        const badge = proj.categoryBadge[lang] || proj.categoryBadge.tr;
        const techShort = proj.tech.slice(0, 4).join(" · ");

        return `
          <article class="project-list-row" data-project-id="${proj.id}">
            <span class="project-index">${num}</span>
            <div>
              <span class="project-category-label">${badge}</span>
              <h3 class="project-list-title">${title}</h3>
            </div>
            <div class="project-list-tech">${techShort} · ${buildStatsMarkup(proj)}</div>
            <button type="button" class="project-open-btn" data-open-project="${proj.id}">
              <span>${t("projects.inspect")}</span>
              <i data-lucide="arrow-right" style="width:15px;height:15px;"></i>
            </button>
          </article>
        `;
      })
      .join("");
  } else {
    container.className = "projects-track";
    container.innerHTML = list
      .map((proj, i) => {
        const num = String(i + 1).padStart(2, "0");
        const title = proj.title[lang] || proj.title.tr;
        const desc = proj.description[lang] || proj.description.tr;
        const badge = proj.categoryBadge[lang] || proj.categoryBadge.tr;
        const techLine = proj.tech.join(" · ");
        const extLinks = proj.links
          .slice(0, 2)
          .map((lnk) => {
            const label = lang === "en" ? lnk.labelEn : lnk.labelTr;
            return `<a href="${lnk.url}" target="_blank" rel="noopener noreferrer" class="project-ext-link">${label} ↗</a>`;
          })
          .join("");

        return `
          <article class="project-slab" data-project-id="${proj.id}">
            <div>
              <div class="project-slab-top">
                <span class="project-index">${num}</span>
                ${buildStatsMarkup(proj)}
              </div>
              <span class="project-category-label">${badge}</span>
              <h3 class="project-slab-title">${title}</h3>
              <p class="project-slab-desc">${desc}</p>
              <p class="project-tech-inline">${techLine}</p>
            </div>
            <div class="project-slab-actions">
              <button type="button" class="project-open-btn" data-open-project="${proj.id}">
                <span>${t("projects.inspect")}</span>
                <i data-lucide="arrow-right" style="width:15px;height:15px;"></i>
              </button>
              <div class="project-ext-links">${extLinks}</div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  container.querySelectorAll("[data-open-project]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-open-project");
      if (id) openProjectDrawer(id);
    });
  });

  container.querySelectorAll("[data-project-id]").forEach((cardEl) => {
    const id = cardEl.getAttribute("data-project-id");
    const onFocusOrHover = () => {
      const proj = getProjectById(id);
      if (!proj) return;
      if (hoverBar) {
        const title = proj.title[lang] || proj.title.tr;
        hoverBar.innerHTML = `<strong>${title}</strong> — ${proj.tech.slice(0, 4).join(" · ")}`;
      }
      if (typeof uiOptions.onProjectHover === "function") {
        uiOptions.onProjectHover(proj);
      }
      window.dispatchEvent(new CustomEvent("portfolio:project-hover", { detail: { project: proj } }));
    };

    cardEl.addEventListener("mouseenter", onFocusOrHover);
    cardEl.addEventListener("focusin", onFocusOrHover);
  });

  refreshLucideIcons();
}

function initProjectsTrackDrag() {
  const container = document.getElementById("projectsContainer");
  if (!container) return;

  let isDown = false;
  let startX = 0;
  let scrollLeftStart = 0;
  let dragged = false;

  container.addEventListener("mousedown", (e) => {
    if (currentViewMode !== "stage") return;
    if (e.target.closest("a, button")) return;
    isDown = true;
    dragged = false;
    startX = e.pageX - container.offsetLeft;
    scrollLeftStart = container.scrollLeft;
    container.classList.add("is-dragging");
  });

  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    container.classList.remove("is-dragging");
    if (dragged) {
      setTimeout(() => {
        dragged = false;
      }, 0);
    }
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDown || currentViewMode !== "stage") return;
    const x = e.pageX - container.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 4) dragged = true;
    container.scrollLeft = scrollLeftStart - walk * 1.15;
  });
}

/* --------------------------------------------------------------------------
   10. FULL-SCREEN CURTAIN MENU
   -------------------------------------------------------------------------- */
export function openCurtainMenu() {
  const menu = document.getElementById("curtainMenu");
  const triggerBtn = document.getElementById("curtainMenuBtn");
  if (!menu) return;

  lastFocusedBeforeCurtain = document.activeElement;
  isCurtainOpen = true;
  menu.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
  triggerBtn?.setAttribute("aria-expanded", "true");
  document.getElementById("curtainCloseBtn")?.focus();
}

export function closeCurtainMenu() {
  const menu = document.getElementById("curtainMenu");
  const triggerBtn = document.getElementById("curtainMenuBtn");
  if (!menu || !isCurtainOpen) return;

  isCurtainOpen = false;
  menu.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  triggerBtn?.setAttribute("aria-expanded", "false");

  if (lastFocusedBeforeCurtain && typeof lastFocusedBeforeCurtain.focus === "function") {
    lastFocusedBeforeCurtain.focus();
    lastFocusedBeforeCurtain = null;
  }
}

export function toggleCurtainMenu() {
  if (isCurtainOpen) {
    closeCurtainMenu();
  } else {
    openCurtainMenu();
  }
}

function initCurtainMenu() {
  const menu = document.getElementById("curtainMenu");
  const triggerBtn = document.getElementById("curtainMenuBtn");
  const closeBtn = document.getElementById("curtainCloseBtn");

  triggerBtn?.addEventListener("click", () => toggleCurtainMenu());
  closeBtn?.addEventListener("click", () => closeCurtainMenu());

  menu?.querySelectorAll("[data-curtain-target]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-curtain-target");
      closeCurtainMenu();
      if (targetId) {
        setTimeout(() => navigateToSection(targetId), 120);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isCurtainOpen) {
      closeCurtainMenu();
    }
  });
}

/* --------------------------------------------------------------------------
   11. RIGHT SLIDE-OVER DETAIL & CASE-STUDY DRAWER (Focus Trap + Esc + Backdrop)
   -------------------------------------------------------------------------- */
function renderSocialLinkButtons() {
  return SOCIAL_LINKS.map((s) => {
    return `
      <a href="${s.url}" ${s.id === "email" ? "" : 'target="_blank" rel="noopener noreferrer"'} class="drawer-link-btn">
        <span>${s.name}</span>
        <span style="color:var(--text-muted);font-weight:500;">${s.handle}</span>
      </a>
    `;
  }).join("");
}

function buildDetailDrawerMarkup(key) {
  const lang = getActiveLang();

  if (key === "about") {
    return {
      kicker: t("about.eyebrow"),
      html: `
        <h2 class="drawer-title">${t("about.title")}</h2>
        <p class="drawer-subtitle">${t("about.subtitle")}</p>

        <div class="drawer-stats-row">
          <div class="drawer-stat-item"><span>3+</span><span class="muted">${t("hero.metric.stores")}</span></div>
          <div class="drawer-stat-item"><span>4</span><span class="muted">${t("hero.metric.domains")}</span></div>
          <div class="drawer-stat-item"><span>GDG</span><span class="muted">${t("hero.metric.community")}</span></div>
        </div>

        <section class="drawer-section-block">
          <h3 class="drawer-block-title">${t("about.card1.title")}</h3>
          <p class="drawer-prose">${t("about.card1.text")}</p>
        </section>

        <section class="drawer-section-block">
          <h3 class="drawer-block-title">${t("about.card2.title")}</h3>
          <p class="drawer-prose">${t("about.card2.text")}</p>
        </section>

        <section class="drawer-section-block">
          <h3 class="drawer-block-title">${t("about.card3.title")}</h3>
          <p class="drawer-prose">${t("about.card3.text")}</p>
        </section>

        <section class="drawer-section-block">
          <h3 class="drawer-block-title">${t("about.card4.title")}</h3>
          <p class="drawer-prose">${t("about.card4.text")}</p>
        </section>
      `
    };
  }

  if (key === "skills") {
    const cats = [
      {
        title: t("skills.cat1.title"),
        desc: t("skills.cat1.desc"),
        items: ["Dart", "Java", "C", "C++", "Python", "JavaScript (ES6+)", "TypeScript", "C#", "Swift", "Kotlin", "HTML5 & CSS3", "SQL"]
      },
      {
        title: t("skills.cat2.title"),
        desc: t("skills.cat2.desc"),
        items: ["Flutter (iOS, Android, Desktop)", "React 19 & Vite", "ASP.NET Core MVC (.NET)", "Entity Framework Core", "SwiftUI", "Jetpack Compose (M3)", "PyQt6", "Node.js & Express", "Tailwind CSS", "Java Swing", "Tampermonkey Userscripts"]
      },
      {
        title: t("skills.cat3.title"),
        desc: t("skills.cat3.desc"),
        items: ["Docker", "Microsoft SQL Server", "MySQL", "PostgreSQL (Neon Serverless)", "WebSockets (Asyncio)", "Zeroconf / Bonjour (mDNS)", "Git & GitHub Actions", "Vercel & Oracle Cloud VPS"]
      },
      {
        title: t("skills.cat4.title"),
        desc: t("skills.cat4.desc"),
        items: ["ESP32", "ESP8266 (NodeMCU)", "Arduino C/C++", t("skills.iot.coffee"), t("skills.iot.adc"), t("skills.iot.relay")]
      }
    ];

    return {
      kicker: t("skills.eyebrow"),
      html: `
        <h2 class="drawer-title">${t("skills.title")}</h2>
        <p class="drawer-subtitle">${t("skills.subtitle")}</p>
        ${cats
          .map(
            (c) => `
          <section class="drawer-section-block">
            <h3 class="drawer-block-title">${c.title}</h3>
            <p class="drawer-prose">${c.desc}</p>
            <div class="drawer-tag-list">
              ${c.items.map((item) => `<span class="drawer-tag">${item}</span>`).join("")}
            </div>
          </section>
        `
          )
          .join("")}
      `
    };
  }

  if (key === "featured") {
    const screen = (FEATURED_SCREENS[lang] || FEATURED_SCREENS.tr)[currentScreenIdx];
    return {
      kicker: t("featured.eyebrow"),
      html: `
        <h2 class="drawer-title">Mac Remote & Desktop Remote</h2>
        <p class="drawer-subtitle">${t("featured.card.tagline")}</p>

        <div class="drawer-stats-row">
          <div class="drawer-stat-item"><span>v1.5.0</span><span class="muted">macOS | iOS | Android</span></div>
          <div class="drawer-stat-item"><span>800p–2200p</span></div>
          <div class="drawer-stat-item"><span class="muted">${t("featured.badge.notarized")}</span></div>
        </div>

        <section class="drawer-section-block">
          <p class="drawer-prose">${t("featured.card.desc")}</p>
          <ul class="drawer-highlights-list">
            <li><i data-lucide="mouse-pointer-click" style="width:18px;height:18px;"></i><span>${t("featured.hl1")}</span></li>
            <li><i data-lucide="monitor-play" style="width:18px;height:18px;"></i><span>${t("featured.hl2")}</span></li>
            <li><i data-lucide="wifi" style="width:18px;height:18px;"></i><span>${t("featured.hl3")}</span></li>
            <li><i data-lucide="shield-check" style="width:18px;height:18px;"></i><span>${t("featured.hl4")}</span></li>
          </ul>
        </section>

        ${
          screen
            ? `<section class="drawer-section-block">
                 <img src="${screen.src}" alt="Mac Remote Screenshot" class="drawer-gallery-img" loading="lazy" />
                 <p class="drawer-prose">${screen.caption}</p>
               </section>`
            : ""
        }

        <section class="drawer-section-block">
          <div class="drawer-links-list">
            <a href="https://play.google.com/store/apps/details?id=com.ibrahimtemur.macremote" target="_blank" rel="noopener noreferrer" class="drawer-link-btn is-primary">
              <span>${t("featured.btn.play.main")}</span>
            </a>
            <a href="https://apps.apple.com/tr/app/desktop-remote/id6812348430?l=tr" target="_blank" rel="noopener noreferrer" class="drawer-link-btn is-primary">
              <span>${t("featured.btn.ios.main")}</span>
            </a>
            <a href="https://github.com/ibrahimtemur/mac-remote-app/releases/latest" target="_blank" rel="noopener noreferrer" class="drawer-link-btn">
              <span>${t("featured.btn.dmg.main")}</span>
            </a>
            <a href="https://github.com/ibrahimtemur/mac-remote-app" target="_blank" rel="noopener noreferrer" class="drawer-link-btn">
              <span>${t("featured.btn.repo")}</span>
            </a>
            <a href="https://apps.apple.com/us/developer/ibrahim-temur/id6812348432" target="_blank" rel="noopener noreferrer" class="drawer-link-btn">
              <span>${t("featured.badge.appstore_dev")}</span>
            </a>
            <a href="https://play.google.com/store/apps/developer?id=%C4%B0brahim+Temur" target="_blank" rel="noopener noreferrer" class="drawer-link-btn">
              <span>${t("featured.badge.play_dev")}</span>
            </a>
          </div>
        </section>
      `
    };
  }

  if (key === "iot") {
    const iotProj = getProjectById("iot-coffee-controller");
    const desc = iotProj ? iotProj.description[lang] || iotProj.description.tr : t("iot.subtitle");
    return {
      kicker: t("skills.cat4.title"),
      html: `
        <h2 class="drawer-title">${t("iot.title")}</h2>
        <p class="drawer-subtitle">${desc}</p>

        <div class="drawer-stats-row">
          <div class="drawer-stat-item"><span>ESP32 / ESP8266</span></div>
          <div class="drawer-stat-item"><span>64x</span><span class="muted">ADC</span></div>
          <div class="drawer-stat-item"><span>Arduino C/C++</span></div>
        </div>

        <section class="drawer-section-block">
          <h3 class="drawer-block-title">IDLE → HEATING → BREWING → DONE</h3>
          <ul class="drawer-highlights-list">
            <li><i data-lucide="cpu" style="width:18px;height:18px;"></i><span><strong>IDLE:</strong> ${t("iot.state.idle")}</span></li>
            <li><i data-lucide="activity" style="width:18px;height:18px;"></i><span><strong>HEATING:</strong> ${t("iot.state.heating")}</span></li>
            <li><i data-lucide="power" style="width:18px;height:18px;"></i><span><strong>BREWING:</strong> ${t("iot.state.brewing")}</span></li>
            <li><i data-lucide="check-circle-2" style="width:18px;height:18px;"></i><span><strong>DONE:</strong> ${t("iot.state.done")}</span></li>
          </ul>
        </section>

        <section class="drawer-section-block">
          <div class="drawer-tag-list">
            ${(iotProj?.tech || []).map((tag) => `<span class="drawer-tag">${tag}</span>`).join("")}
          </div>
          <div class="drawer-links-list" style="margin-top:0.5rem;">
            <a href="https://github.com/ibrahimtemur" target="_blank" rel="noopener noreferrer" class="drawer-link-btn">
              <span>GitHub (@ibrahimtemur) ↗</span>
            </a>
          </div>
        </section>
      `
    };
  }

  // Default: 'contact'
  return {
    kicker: t("contact.eyebrow"),
    html: `
      <h2 class="drawer-title">${t("contact.title")}</h2>
      <p class="drawer-subtitle">${t("contact.subtitle")}</p>

      <section class="drawer-section-block">
        <h3 class="drawer-block-title">${EMAIL_ADDRESS}</h3>
        <div class="drawer-links-list">
          <button type="button" class="drawer-link-btn is-primary" id="drawerCopyEmailBtn">
            <i data-lucide="copy" style="width:16px;height:16px;"></i>
            <span>${t("contact.copy")}</span>
          </button>
          <a href="mailto:${EMAIL_ADDRESS}" class="drawer-link-btn">
            <i data-lucide="mail" style="width:16px;height:16px;"></i>
            <span>${t("contact.send")}</span>
          </a>
        </div>
      </section>

      <section class="drawer-section-block">
        <div class="drawer-links-list">${renderSocialLinkButtons()}</div>
      </section>
    `
  };
}

function buildProjectDrawerMarkup(projectId) {
  const proj = getProjectById(projectId);
  if (!proj) return buildDetailDrawerMarkup("about");

  const lang = getActiveLang();
  const title = proj.title[lang] || proj.title.tr;
  const badge = proj.categoryBadge[lang] || proj.categoryBadge.tr;
  const desc = proj.description[lang] || proj.description.tr;

  const statsItems = [];
  if (proj.stars !== null) {
    statsItems.push(`<div class="drawer-stat-item"><span>★ ${proj.stars}</span><span class="muted">Stars</span></div>`);
  }
  if (proj.forks !== null && proj.forks > 0) {
    statsItems.push(`<div class="drawer-stat-item"><span>⑂ ${proj.forks}</span><span class="muted">Forks</span></div>`);
  }
  if (proj.language) {
    statsItems.push(`<div class="drawer-stat-item"><span>${proj.language}</span></div>`);
  }

  const linksMarkup = proj.links
    .map((lnk) => {
      const label = lang === "en" ? lnk.labelEn : lnk.labelTr;
      const cls = lnk.type === "live" ? "drawer-link-btn is-primary" : "drawer-link-btn";
      return `<a href="${lnk.url}" target="_blank" rel="noopener noreferrer" class="${cls}"><span>${label} ↗</span></a>`;
    })
    .join("");

  return {
    kicker: badge,
    html: `
      <h2 class="drawer-title">${title}</h2>
      <p class="drawer-subtitle">${desc}</p>

      ${statsItems.length ? `<div class="drawer-stats-row">${statsItems.join("")}</div>` : ""}

      <section class="drawer-section-block">
        <div class="drawer-tag-list">
          ${proj.tech.map((techName) => `<span class="drawer-tag">${techName}</span>`).join("")}
        </div>
      </section>

      <section class="drawer-section-block">
        <div class="drawer-links-list">${linksMarkup}</div>
      </section>
    `
  };
}

function renderActiveDrawer() {
  const kickerEl = document.getElementById("drawerKicker");
  const bodyEl = document.getElementById("drawerBody");
  if (!bodyEl || !activeDrawerSpec) return;

  const data =
    activeDrawerSpec.type === "project"
      ? buildProjectDrawerMarkup(activeDrawerSpec.id)
      : buildDetailDrawerMarkup(activeDrawerSpec.key);

  if (kickerEl) kickerEl.textContent = data.kicker;
  bodyEl.innerHTML = data.html;

  document.getElementById("drawerCopyEmailBtn")?.addEventListener("click", () => {
    copyEmailToClipboard();
  });

  refreshLucideIcons();
}

function presentDrawer() {
  const drawer = document.getElementById("slideDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  if (!drawer || !backdrop) return;

  if (!drawer.classList.contains("is-open")) {
    lastFocusedBeforeDrawer = document.activeElement;
  }

  renderActiveDrawer();
  backdrop.classList.add("is-open");
  backdrop.setAttribute("aria-hidden", "false");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => {
    document.getElementById("drawerCloseBtn")?.focus();
  });
}

/**
 * Opens the right slide-over drawer with a named detail view
 * ('about' | 'skills' | 'featured' | 'iot' | 'contact').
 */
export function openDetailDrawer(sectionKey = "about") {
  activeDrawerSpec = { type: "detail", key: sectionKey };
  presentDrawer();
}

/**
 * Opens the right slide-over drawer with a project case study from PROJECTS_DATA.
 */
export function openProjectDrawer(projectId) {
  activeDrawerSpec = { type: "project", id: projectId };
  presentDrawer();
}

/**
 * Convenience wrapper opening the Contact detail drawer.
 */
export function openContactDrawer() {
  openDetailDrawer("contact");
}

/**
 * Closes the slide-over drawer and restores trigger focus.
 */
export function closeDrawer() {
  const drawer = document.getElementById("slideDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  if (!drawer || !drawer.classList.contains("is-open")) return;

  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  backdrop?.classList.remove("is-open");
  backdrop?.setAttribute("aria-hidden", "true");
  activeDrawerSpec = null;

  if (lastFocusedBeforeDrawer && typeof lastFocusedBeforeDrawer.focus === "function") {
    lastFocusedBeforeDrawer.focus();
    lastFocusedBeforeDrawer = null;
  }
}

function initDrawer() {
  const drawer = document.getElementById("slideDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const closeBtn = document.getElementById("drawerCloseBtn");

  closeBtn?.addEventListener("click", () => closeDrawer());
  backdrop?.addEventListener("click", () => closeDrawer());

  document.addEventListener("keydown", (e) => {
    if (!drawer || !drawer.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeDrawer();
      return;
    }

    // Focus Trap inside Slide Drawer
    if (e.key === "Tab") {
      const focusable = drawer.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  document.querySelectorAll("[data-open-detail]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const key = trigger.getAttribute("data-open-detail");
      if (key) openDetailDrawer(key);
    });
  });
}

/* --------------------------------------------------------------------------
   12. MASTER UI INITIALIZATION (Entrypoint for Phase 1B main.js)
   -------------------------------------------------------------------------- */
export function initUI(options = {}) {
  uiOptions = options || {};

  // Mark runtime ready for fallback preloader timer in index.html
  window.__portfolioReady = true;

  initPreloader();
  initTheme();
  initI18n();
  initCustomCursor();
  initScrollObservers();
  initSkillsInteractions();
  initFeaturedSection();
  initIotSection();
  initProjectsTrackDrag();
  initCurtainMenu();
  initDrawer();

  // Filter tabs (Scene 06 + Section Rail)
  document.querySelectorAll(".filter-btn, .rail-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter") || "all";
      setProjectFilter(filter);
    });
  });

  // View mode switch ([Sahne | Liste])
  document.querySelectorAll(".view-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-view-mode") || "stage";
      setProjectViewMode(mode);
    });
  });

  // Email Copy Buttons (Giant Email + Copy CTA)
  document.getElementById("copyEmailBtn")?.addEventListener("click", copyEmailToClipboard);
  document.getElementById("giantEmailCopyBtn")?.addEventListener("click", copyEmailToClipboard);

  // Command Palette
  initPalette({
    navigateToSection,
    openProjectDrawer,
    copyEmail: copyEmailToClipboard,
    openCurtainMenu
  });

  // React cleanly when language switches
  onLanguageChange(() => {
    updateGitHubStatusLabel();
    updateFeaturedScreen(currentScreenIdx);
    renderProjects();
    resetTypewriter();
    if (activeDrawerSpec) {
      renderActiveDrawer();
    }
  });

  // Initial render & typewriter start
  renderProjects();
  resetTypewriter();
  setActiveSection(0);
  refreshLucideIcons();

  // Live GitHub API repository sync
  syncWithGitHubApi(() => {
    renderProjects();
    if (activeDrawerSpec?.type === "project") {
      renderActiveDrawer();
    }
  });

  return {
    setActiveSection,
    setScrollProgress,
    openDetailDrawer,
    openProjectDrawer,
    openContactDrawer,
    updateFeaturedScreen,
    setIotState,
    dismissPreloader
  };
}
