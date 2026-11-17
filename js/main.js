/* ==========================================================================
   PORTFOLIO ORCHESTRATOR (js/main.js)
   Wires UI Engine, Preloader, Three.js 3D World, Lenis Smooth Scroll,
   GSAP ScrollTrigger Section Spline Mapping & Scene 04 Mac Remote Pinning.
   ========================================================================== */

import { CAMERA_STATIONS } from "./camera-path.js";
import { initPortfolioScene } from "./scene.js";
import { getActiveTheme } from "./theme.js";
import {
  initUI,
  dismissPreloader,
  setActiveSection,
  setScrollProgress,
  updateFeaturedScreen,
  getActiveLang
} from "./ui.js";

function getDocumentOffsetTop(el) {
  if (!el) return 0;
  let top = 0;
  let node = el;
  while (node) {
    top += node.offsetTop || 0;
    node = node.offsetParent;
  }
  return top;
}

function bootPortfolio() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hasGsap = Boolean(window.gsap);
  const hasScrollTrigger = Boolean(window.gsap && window.ScrollTrigger);
  const hasLenis = Boolean(window.Lenis);

  // 1. Initialize 3D WebGL Scene (or graceful fallback on reduced-motion / no WebGL)
  const sceneController = initPortfolioScene();

  // 2. Setup Lenis Smooth Scroll (Desktop & Touch, prevented inside scrollable overlays)
  let lenis = null;
  if (!prefersReducedMotion && hasLenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.35,
      prevent: (node) =>
        Boolean(
          node?.closest?.(
            "#slideDrawer, #curtainMenu, #commandPaletteBackdrop, .projects-track"
          )
        )
    });
  }

  if (hasScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    }
  } else if (lenis) {
    const rafLenis = (time) => {
      lenis.raf(time);
      requestAnimationFrame(rafLenis);
    };
    requestAnimationFrame(rafLenis);
  }

  // Track pinned Scene 04 ScrollTrigger state
  let featuredTrigger = null;
  let isScrollDrivenStep = false;
  let suppressScrollStepSync = false;
  let suppressTimer = null;
  let lastScrollDrivenStep = 0;

  function scrollToElement(targetEl) {
    if (!targetEl) return;
    if (
      (targetEl.id === "scene-featured" || targetEl.id === "featured") &&
      featuredTrigger
    ) {
      if (lenis && !prefersReducedMotion) {
        lenis.scrollTo(featuredTrigger.start, { duration: 1.05 });
      } else {
        window.scrollTo({
          top: featuredTrigger.start,
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });
      }
      return;
    }
    const spacer = targetEl.parentElement?.classList?.contains("pin-spacer")
      ? targetEl.parentElement
      : null;
    const dest = spacer || targetEl;

    if (lenis && !prefersReducedMotion) {
      lenis.scrollTo(dest, { duration: 1.05 });
    } else {
      dest.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    }
  }

  // 3. Initialize Phase 1A UI Engine
  initUI({
    lenis,
    onNavigateSection(_sectionId, target) {
      scrollToElement(target);
    },
    onFeaturedScreenChange(idx) {
      sceneController.setFeaturedStep(idx);

      if (!isScrollDrivenStep && featuredTrigger && featuredTrigger.isActive && lenis) {
        const span = Math.max(1, featuredTrigger.end - featuredTrigger.start);
        const stepCenterProgress = (Math.max(0, Math.min(2, idx)) + 0.5) / 3;
        const targetY = featuredTrigger.start + span * stepCenterProgress;

        lastScrollDrivenStep = idx;
        suppressScrollStepSync = true;
        if (suppressTimer) clearTimeout(suppressTimer);
        suppressTimer = setTimeout(() => {
          suppressScrollStepSync = false;
        }, 720);

        lenis.scrollTo(targetY, { duration: 0.62 });
      }
    },
    onIotStateChange(stateKey) {
      sceneController.setIotState(stateKey);
    },
    onProjectHover(proj) {
      sceneController.pulseProjectHover(proj);
    }
  });

  // Sync initial language & theme into 3D world
  sceneController.setLanguage(getActiveLang());
  sceneController.setTheme(getActiveTheme());

  // 4. Preloader (<= 1.5s, Skippable via button or Esc) + Hero Camera Glide (z: 9.5 -> 6.2)
  const onPreloaderEsc = (e) => {
    if (e.key === "Escape") {
      dismissPreloader();
      window.removeEventListener("keydown", onPreloaderEsc);
    }
  };
  window.addEventListener("keydown", onPreloaderEsc);

  if (prefersReducedMotion || !sceneController.isWebGL) {
    sceneController.setIntroProgress(1);
    dismissPreloader();
  } else {
    const introState = { p: 0 };
    if (hasGsap) {
      window.gsap.to(introState, {
        p: 1,
        duration: 1.35,
        ease: "power3.out",
        onUpdate: () => sceneController.setIntroProgress(introState.p)
      });
    } else {
      const startTime = performance.now();
      const stepIntro = (now) => {
        const t = Math.min(1, (now - startTime) / 1350);
        sceneController.setIntroProgress(t);
        if (t < 1) requestAnimationFrame(stepIntro);
      };
      requestAnimationFrame(stepIntro);
    }

    setTimeout(() => {
      dismissPreloader();
      window.removeEventListener("keydown", onPreloaderEsc);
    }, 680);
  }

  // 5. Scene 04 (Mac Remote) GSAP ScrollTrigger Pinning (Desktop >= 961px, no reduced-motion)
  const featuredSection =
    document.getElementById("scene-featured") || document.getElementById("featured");

  if (!prefersReducedMotion && hasScrollTrigger && featuredSection) {
    const mm = window.gsap.matchMedia();

    mm.add("(min-width: 961px)", () => {
      featuredTrigger = window.ScrollTrigger.create({
        trigger: featuredSection,
        start: "top top",
        end: "+=175%",
        pin: true,
        pinSpacing: true,
        scrub: 0.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          sceneController.setFeaturedProgress(self.progress);
          if (suppressScrollStepSync) return;

          const nextStep =
            self.progress < 0.333 ? 0 : self.progress < 0.666 ? 1 : 2;
          if (nextStep !== lastScrollDrivenStep) {
            lastScrollDrivenStep = nextStep;
            isScrollDrivenStep = true;
            updateFeaturedScreen(nextStep);
            isScrollDrivenStep = false;
          }
        }
      });

      return () => {
        if (featuredTrigger) {
          featuredTrigger.kill();
          featuredTrigger = null;
        }
      };
    });
  }

  // 6. Section-Aware Scroll -> 3D Camera Spline & Left Rail Sync
  const stationElements = CAMERA_STATIONS.map((s) => document.getElementById(s.id));

  function updateCameraAndRailFromScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const rawProgress = Math.max(0, Math.min(1, scrollY / maxScroll));
    setScrollProgress(rawProgress);

    const bounds = stationElements.map((el, i) => {
      if (i === 3 && featuredTrigger) {
        return { start: featuredTrigger.start, end: featuredTrigger.end };
      }
      const anchorEl = el?.parentElement?.classList?.contains("pin-spacer")
        ? el.parentElement
        : el;
      const top = getDocumentOffsetTop(anchorEl);
      return { start: top, end: top };
    });

    const count = bounds.length;
    let splineT = 0;

    if (scrollY <= bounds[0].start) {
      splineT = 0;
    } else if (scrollY >= bounds[count - 1].start || rawProgress >= 0.999) {
      splineT = 1;
    } else {
      for (let i = 0; i < count; i++) {
        const cur = bounds[i];
        if (scrollY >= cur.start && scrollY <= cur.end) {
          splineT = i / (count - 1);
          break;
        }
        if (i < count - 1) {
          const next = bounds[i + 1];
          if (scrollY > cur.end && scrollY < next.start) {
            const span = Math.max(1, next.start - cur.end);
            const frac = (scrollY - cur.end) / span;
            splineT = (i + frac) / (count - 1);
            break;
          }
        }
      }
    }

    sceneController.setScrollProgress(splineT);

    // Sync active section rail precisely even through pinned stretches
    const probeY = scrollY + window.innerHeight * 0.38;
    let activeIdx = 0;
    for (let i = 0; i < bounds.length; i++) {
      if (probeY >= bounds[i].start) {
        activeIdx = i;
      }
    }
    setActiveSection(activeIdx);
  }

  window.addEventListener("scroll", updateCameraAndRailFromScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (hasScrollTrigger) window.ScrollTrigger.refresh();
    updateCameraAndRailFromScroll();
  });

  if (hasScrollTrigger) {
    window.ScrollTrigger.addEventListener("refresh", updateCameraAndRailFromScroll);
    window.ScrollTrigger.refresh();
  }
  updateCameraAndRailFromScroll();

  // 7. Reactive Bilingual & Theme Events for 3D World
  window.addEventListener("portfolio:langchange", (e) => {
    sceneController.setLanguage(e?.detail?.lang || getActiveLang());
  });

  window.addEventListener("portfolio:themechange", (e) => {
    sceneController.setTheme(
      e?.detail?.theme || getActiveTheme(),
      e?.detail?.colors || null
    );
  });

  window.addEventListener("portfolio:iot-state", (e) => {
    if (e?.detail?.state) sceneController.setIotState(e.detail.state);
  });

  window.addEventListener("portfolio:project-hover", (e) => {
    if (e?.detail?.project) sceneController.pulseProjectHover(e.detail.project);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootPortfolio, { once: true });
} else {
  bootPortfolio();
}
