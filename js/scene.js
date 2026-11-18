/* ==========================================================================
   3D WEBGL SCENE ENGINE (js/scene.js)
   Single transparent WebGLRenderer (alpha: true, DPR <= 2, visibility-paused),
   theme-reactive petrol/limestone + turquoise + amber lighting/fog/shaders,
   Scene 01 Hero 3D Portrait Monolith, Scene 04 Mac Remote Precision Stage,
   and 7-station spatial anchors for Phase 2 installations.
   ========================================================================== */

import * as THREE from "three";
import {
  CAMERA_STATIONS,
  HERO_INTRO_START_Z,
  HERO_INTRO_END_Z,
  createCameraRig
} from "./camera-path.js?v=11";
import { FEATURED_SCREENS, getActiveLang } from "./i18n.js?v=11";
import { getActiveTheme, getThemeSceneColors } from "./theme.js?v=11";

const MAC_SCREENSHOT_BASE =
  "https://raw.githubusercontent.com/ibrahimtemur/mac-remote-app/main/screenshots/";

/* --------------------------------------------------------------------------
   1. CSS & THEME COLOR EXTRACTION
   -------------------------------------------------------------------------- */
function readThemeScenePalette(theme = getActiveTheme(), overrideColors = null) {
  const fallback = getThemeSceneColors(theme);
  const rootStyle =
    typeof window !== "undefined" && typeof getComputedStyle === "function"
      ? getComputedStyle(document.documentElement)
      : null;

  const pickCss = (varName, fb) => {
    const val = rootStyle?.getPropertyValue(varName)?.trim();
    return val || fb;
  };

  return {
    bg: overrideColors?.bg || pickCss("--scene-bg", fallback.bg),
    fog: overrideColors?.fog || pickCss("--scene-fog", fallback.fog),
    ambient: overrideColors?.ambient || pickCss("--scene-ambient", fallback.ambient),
    lightPrimary:
      overrideColors?.lightPrimary ||
      pickCss("--scene-light-primary", fallback.lightPrimary),
    lightSecondary:
      overrideColors?.lightSecondary ||
      pickCss("--scene-light-secondary", fallback.lightSecondary),
    wire: overrideColors?.wire || pickCss("--scene-wire", fallback.wire),
    isLight: theme === "light"
  };
}

function applyWebglFallbackClass() {
  document.documentElement.classList.add("webgl-fallback");
  document.body?.classList.add("webgl-fallback");
}

function removeWebglFallbackClass() {
  document.documentElement.classList.remove("webgl-fallback");
  document.body?.classList.remove("webgl-fallback");
}

/* --------------------------------------------------------------------------
   2. REALISTIC CANVASTEXTURE PLACEHOLDERS (Zero Fake Numbers, Zero Black Boxes)
   -------------------------------------------------------------------------- */
function drawRoundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function composeMacDesktopTexture(sourceImgOrCanvas, lang = "tr", maxAnisotropy = 4) {
  const w = 1920;
  const h = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  ctx.scale(1280 / w, 800 / h);

  // Petrol-teal macOS wallpaper gradient (strictly matching palette)
  const wp = ctx.createLinearGradient(0, 0, w, h);
  wp.addColorStop(0, "#0A151A");
  wp.addColorStop(0.55, "#102329");
  wp.addColorStop(1, "#163038");
  ctx.fillStyle = wp;
  ctx.fillRect(0, 0, w, h);

  const glowA = ctx.createRadialGradient(420, 320, 40, 420, 320, 680);
  glowA.addColorStop(0, "rgba(60, 207, 192, 0.20)");
  glowA.addColorStop(1, "rgba(14, 27, 32, 0)");
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, w, h);

  const glowB = ctx.createRadialGradient(1520, 880, 30, 1520, 880, 620);
  glowB.addColorStop(0, "rgba(242, 166, 90, 0.16)");
  glowB.addColorStop(1, "rgba(14, 27, 32, 0)");
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, w, h);

  // macOS top menu bar
  ctx.fillStyle = "rgba(10, 20, 24, 0.88)";
  ctx.fillRect(0, 0, w, 40);
  ctx.fillStyle = "rgba(242, 245, 244, 0.12)";
  ctx.fillRect(0, 39, w, 1);

  ctx.fillStyle = "#F2F5F4";
  ctx.font = "700 18px Inter, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("Mac Remote", 62, 21);

  ctx.fillStyle = "#B8C7C9";
  ctx.font = "500 16px Inter, -apple-system, sans-serif";
  const menus =
    lang === "en"
      ? ["File", "Edit", "View", "Window", "Help"]
      : ["Dosya", "Düzen", "Görünüm", "Pencere", "Yardım"];
  menus.forEach((label, idx) => {
    ctx.fillText(label, 215 + idx * 92, 21);
  });

  // Subtle frosted desktop widgets behind centered mac_server window
  ctx.save();
  ctx.fillStyle = "rgba(16, 32, 38, 0.58)";
  ctx.strokeStyle = "rgba(242, 245, 244, 0.10)";
  ctx.lineWidth = 2;
  drawRoundedRectPath(ctx, 136, 152, 420, 310, 24);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(60, 207, 192, 0.25)";
  drawRoundedRectPath(ctx, 174, 214, 150, 16, 8);
  ctx.stroke();
  drawRoundedRectPath(ctx, 174, 254, 290, 16, 8);
  ctx.stroke();
  drawRoundedRectPath(ctx, 174, 294, 240, 16, 8);
  ctx.stroke();

  ctx.fillStyle = "rgba(16, 32, 38, 0.58)";
  ctx.strokeStyle = "rgba(242, 166, 90, 0.14)";
  drawRoundedRectPath(ctx, 1364, 240, 410, 240, 24);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Prominent center foreground window: real mac_server_tr/en.png at exact 740:1304 ratio
  const winH = 1004;
  const winW = Math.round(winH * (740 / 1304));
  const winX = Math.round((w - winW) * 0.5);
  const winY = 82;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = "#0E1B20";
  drawRoundedRectPath(ctx, winX, winY, winW, winH, 24);
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawRoundedRectPath(ctx, winX, winY, winW, winH, 24);
  ctx.clip();
  if (sourceImgOrCanvas) {
    ctx.drawImage(sourceImgOrCanvas, winX, winY, winW, winH);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(60, 207, 192, 0.48)";
  ctx.lineWidth = 2.5;
  drawRoundedRectPath(ctx, winX, winY, winW, winH, 24);
  ctx.stroke();

  // Bottom macOS Dock pill
  ctx.fillStyle = "rgba(19, 39, 44, 0.85)";
  ctx.strokeStyle = "rgba(242, 245, 244, 0.16)";
  ctx.lineWidth = 1.5;
  drawRoundedRectPath(ctx, 720, 1124, 480, 56, 22);
  ctx.fill();
  ctx.stroke();

  const dockColors = ["#3CCFC0", "#1B353C", "#F2A65A", "#23444D", "#3CCFC0", "#1B353C", "#F2A65A"];
  dockColors.forEach((col, i) => {
    ctx.fillStyle = col;
    drawRoundedRectPath(ctx, 766 + i * 58, 1134, 38, 38, 10);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function createDevicePlaceholderTexture(kind, lang = "tr") {
  const canvas = document.createElement("canvas");

  if (kind === "server") {
    canvas.width = 740;
    canvas.height = 1304;
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, 0, 1304);
    bg.addColorStop(0, "#102026");
    bg.addColorStop(1, "#0E1B20");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 740, 1304);

    // Header bar
    ctx.fillStyle = "#162D33";
    ctx.fillRect(0, 0, 740, 96);

    ctx.fillStyle = "#3CCFC0";
    ctx.beginPath();
    ctx.arc(54, 48, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#F2F5F4";
    ctx.font = "700 28px Inter, -apple-system, sans-serif";
    ctx.fillText("Mac Remote Server", 86, 57);

    // QR Pairing Frame Silhouette
    ctx.strokeStyle = "rgba(60, 207, 192, 0.4)";
    ctx.lineWidth = 3;
    drawRoundedRectPath(ctx, 140, 210, 460, 460, 28);
    ctx.stroke();

    ctx.fillStyle = "#162D33";
    drawRoundedRectPath(ctx, 175, 245, 390, 390, 20);
    ctx.fill();

    // Stylized geometric matrix pattern
    ctx.fillStyle = "rgba(242, 245, 244, 0.22)";
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if ((r + c) % 2 === 0 || (r < 2 && c < 2) || (r > 4 && c < 2) || (r < 2 && c > 4)) {
          ctx.fillRect(225 + c * 44, 295 + r * 44, 28, 28);
        }
      }
    }

    // PIN slots
    ctx.fillStyle = "#B8C7C9";
    ctx.font = "600 22px Inter, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(lang === "en" ? "LAN · WAN Pairing" : "LAN · WAN Eşleştirme", 370, 760);

    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = "#162D33";
      ctx.strokeStyle = "rgba(242, 166, 90, 0.45)";
      ctx.lineWidth = 2;
      drawRoundedRectPath(ctx, 156 + i * 114, 815, 86, 102, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F2A65A";
      ctx.beginPath();
      ctx.arc(199 + i * 114, 866, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Status lines
    ctx.fillStyle = "rgba(242, 245, 244, 0.1)";
    drawRoundedRectPath(ctx, 96, 995, 548, 72, 16);
    ctx.fill();
    drawRoundedRectPath(ctx, 96, 1095, 548, 72, 16);
    ctx.fill();

    return composeMacDesktopTexture(canvas, lang);
  }

  // Mobile placeholder (660 x 1434 -> exact 1320:2868 ratio)
  canvas.width = 660;
  canvas.height = 1434;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, 0, 1434);
  bg.addColorStop(0, "#0E1B20");
  bg.addColorStop(0.5, "#13272C");
  bg.addColorStop(1, "#0E1B20");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 660, 1434);

  // Top bar
  ctx.fillStyle = "#F2F5F4";
  ctx.font = "700 32px Inter, -apple-system, sans-serif";
  ctx.fillText("Mac Remote", 54, 140);

  ctx.fillStyle = "#3CCFC0";
  ctx.font = "600 20px Inter, -apple-system, sans-serif";
  ctx.fillText(
    kind === "mobile-trackpad"
      ? lang === "en"
        ? "Trackpad & Live Mirror"
        : "Trackpad & Canlı Ekran"
      : lang === "en"
      ? "Zeroconf / Bonjour"
      : "Zeroconf / Bonjour Keşfi",
    54,
    182
  );

  if (kind === "mobile-trackpad") {
    // Live screen preview region
    ctx.fillStyle = "#162D33";
    ctx.strokeStyle = "rgba(60, 207, 192, 0.35)";
    ctx.lineWidth = 2;
    drawRoundedRectPath(ctx, 46, 236, 568, 356, 26);
    ctx.fill();
    ctx.stroke();

    // Multi-touch trackpad area
    ctx.fillStyle = "#102026";
    ctx.strokeStyle = "rgba(242, 245, 244, 0.14)";
    drawRoundedRectPath(ctx, 46, 634, 568, 560, 32);
    ctx.fill();
    ctx.stroke();

    const padGlow = ctx.createRadialGradient(330, 914, 10, 330, 914, 210);
    padGlow.addColorStop(0, "rgba(60, 207, 192, 0.18)");
    padGlow.addColorStop(1, "rgba(60, 207, 192, 0)");
    ctx.fillStyle = padGlow;
    drawRoundedRectPath(ctx, 46, 634, 568, 560, 32);
    ctx.fill();

    // Bottom split buttons
    ctx.fillStyle = "#162D33";
    drawRoundedRectPath(ctx, 46, 1226, 274, 118, 22);
    ctx.fill();
    drawRoundedRectPath(ctx, 340, 1226, 274, 118, 22);
    ctx.fill();
  } else {
    // Discovery rows
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 0 ? "rgba(60, 207, 192, 0.12)" : "#162D33";
      ctx.strokeStyle = i === 0 ? "rgba(60, 207, 192, 0.45)" : "rgba(242, 245, 244, 0.1)";
      ctx.lineWidth = 2;
      drawRoundedRectPath(ctx, 46, 260 + i * 164, 568, 134, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = i === 0 ? "#3CCFC0" : "#7E9598";
      ctx.beginPath();
      ctx.arc(96, 327 + i * 164, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(242, 245, 244, 0.24)";
      drawRoundedRectPath(ctx, 132, 304 + i * 164, 260, 18, 9);
      ctx.fill();
      drawRoundedRectPath(ctx, 132, 338 + i * 164, 175, 14, 7);
      ctx.fill();
    }

    // Connect action capsule
    ctx.fillStyle = "#F2A65A";
    drawRoundedRectPath(ctx, 46, 1210, 568, 108, 54);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* --------------------------------------------------------------------------
   3. PROCEDURAL GEOMETRY HELPERS (Rounded Anodized Chassis)
   -------------------------------------------------------------------------- */
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width * 0.45, height * 0.45);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function createRoundedBorderPoints(width, height, radius, zOffset = 0, segmentsPerCorner = 10) {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw * 0.9, hh * 0.9);
  const pts = [];

  const corners = [
    { cx: hw - r, cy: hh - r, a0: 0, a1: Math.PI / 2 },
    { cx: -hw + r, cy: hh - r, a0: Math.PI / 2, a1: Math.PI },
    { cx: -hw + r, cy: -hh + r, a0: Math.PI, a1: Math.PI * 1.5 },
    { cx: hw - r, cy: -hh + r, a0: Math.PI * 1.5, a1: Math.PI * 2 }
  ];

  corners.forEach((c) => {
    for (let i = 0; i <= segmentsPerCorner; i++) {
      const t = i / segmentsPerCorner;
      const a = c.a0 + (c.a1 - c.a0) * t;
      pts.push(new THREE.Vector3(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r, zOffset));
    }
  });

  return pts;
}

/* --------------------------------------------------------------------------
   4. SCENE 01 — COMPACT BEVELED 3D </> SOFTWARE CODE EMBLEM
   Floating cleanly above hero display typography without occluding the name.
   -------------------------------------------------------------------------- */
function createCodeGlyphShapes() {
  const leftChevron = new THREE.Shape();
  leftChevron.moveTo(-0.26, 0.0);
  leftChevron.lineTo(0.2, 0.46);
  leftChevron.lineTo(0.31, 0.35);
  leftChevron.lineTo(-0.04, 0.0);
  leftChevron.lineTo(0.31, -0.35);
  leftChevron.lineTo(0.2, -0.46);
  leftChevron.closePath();

  const slash = new THREE.Shape();
  slash.moveTo(-0.26, -0.54);
  slash.lineTo(-0.09, -0.54);
  slash.lineTo(0.26, 0.54);
  slash.lineTo(0.09, 0.54);
  slash.closePath();

  const rightChevron = new THREE.Shape();
  rightChevron.moveTo(0.26, 0.0);
  rightChevron.lineTo(-0.2, -0.46);
  rightChevron.lineTo(-0.31, -0.35);
  rightChevron.lineTo(0.04, 0.0);
  rightChevron.lineTo(-0.31, 0.35);
  rightChevron.lineTo(-0.2, 0.46);
  rightChevron.closePath();

  return { leftChevron, slash, rightChevron };
}

function createHeroMonolith(initialPalette) {
  const group = new THREE.Group();
  group.name = "HeroCodeEmblem";

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
    uPrimaryColor: { value: new THREE.Color(initialPalette.lightPrimary) },
    uSecondaryColor: { value: new THREE.Color(initialPalette.lightSecondary) },
    uBgColor: { value: new THREE.Color(initialPalette.bg) },
    uThemeMix: { value: initialPalette.isLight ? 1.0 : 0.0 }
  };

  const emblemPivot = new THREE.Group();
  group.add(emblemPivot);

  const fadeEntries = [];
  const registerMat = (mat, baseOpacity) => {
    mat.transparent = true;
    mat.opacity = baseOpacity;
    fadeEntries.push({ mat, baseOpacity });
    return mat;
  };

  const extrudeSettings = {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.024,
    bevelSegments: 4
  };

  const { leftChevron, slash, rightChevron } = createCodeGlyphShapes();

  const bracketsMat = registerMat(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialPalette.lightPrimary),
      emissive: new THREE.Color(initialPalette.lightPrimary),
      emissiveIntensity: 0.32,
      metalness: 0.68,
      roughness: 0.24,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18
    }),
    0.96
  );
  const slashMat = registerMat(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialPalette.lightSecondary),
      emissive: new THREE.Color(initialPalette.lightSecondary),
      emissiveIntensity: 0.36,
      metalness: 0.68,
      roughness: 0.24,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18
    }),
    0.96
  );

  const bracketEdgeMat = registerMat(
    new THREE.LineBasicMaterial({ color: new THREE.Color(initialPalette.lightPrimary) }),
    0.72
  );
  const slashEdgeMat = registerMat(
    new THREE.LineBasicMaterial({ color: new THREE.Color(initialPalette.lightSecondary) }),
    0.75
  );

  function makeGlyphMesh(shape, mat, edgeMat, posX) {
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.translate(0, 0, -extrudeSettings.depth * 0.5);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(posX, 0, 0);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    emblemPivot.add(mesh);
    return mesh;
  }

  const leftGlyph = makeGlyphMesh(leftChevron, bracketsMat, bracketEdgeMat, -0.72);
  const slashGlyph = makeGlyphMesh(slash, slashMat, slashEdgeMat, 0.0);
  const rightGlyph = makeGlyphMesh(rightChevron, bracketsMat, bracketEdgeMat, 0.72);

  // Subtle slender orbital hairline halo framing the compact emblem
  const haloMat = registerMat(
    new THREE.MeshBasicMaterial({ color: new THREE.Color(initialPalette.wire) }),
    0.34
  );
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(1.36, 0.01, 12, 96), haloMat);
  haloRing.rotation.set(1.12, -0.22, 0.0);
  emblemPivot.add(haloRing);

  // Subtle compact code sparks around the emblem
  const sparkCount = 24;
  const sparkPositions = new Float32Array(sparkCount * 3);
  const sparkMix = new Float32Array(sparkCount);
  const sparkSizes = new Float32Array(sparkCount);
  const sparkPhases = new Float32Array(sparkCount);

  for (let i = 0; i < sparkCount; i++) {
    const theta = (i / sparkCount) * Math.PI * 2 + (i % 3) * 0.35;
    const rad = 1.25 + (i % 4) * 0.22;
    sparkPositions[i * 3] = Math.cos(theta) * rad;
    sparkPositions[i * 3 + 1] = ((i % 5) - 2) * 0.24;
    sparkPositions[i * 3 + 2] = Math.sin(theta) * (rad * 0.65);
    sparkMix[i] = i % 3 === 0 ? 1.0 : 0.0;
    sparkSizes[i] = 9.0 + (i % 3) * 3.0;
    sparkPhases[i] = i * 0.72;
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute("aMix", new THREE.BufferAttribute(sparkMix, 1));
  sparkGeo.setAttribute("aSize", new THREE.BufferAttribute(sparkSizes, 1));
  sparkGeo.setAttribute("aPhase", new THREE.BufferAttribute(sparkPhases, 1));

  const sparkMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uPrimaryColor: uniforms.uPrimaryColor,
      uSecondaryColor: uniforms.uSecondaryColor,
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uThemeMix: uniforms.uThemeMix,
      uVisibility: { value: 1.0 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: /* glsl */ `
      attribute float aMix;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vMix;
      void main() {
        vMix = aMix;
        vec3 p = position;
        p.y += sin(uTime * 0.8 + aPhase) * 0.06;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp((aSize * uPixelRatio) / max(1.0, -mv.z * 0.55), 2.0, 16.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform float uThemeMix;
      uniform float uVisibility;
      varying float vMix;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float soft = smoothstep(0.5, 0.05, d);
        if (soft < 0.01 || uVisibility < 0.01) discard;
        vec3 col = mix(uPrimaryColor, uSecondaryColor, vMix);
        float alpha = soft * mix(0.76, 0.58, uThemeMix) * uVisibility;
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `
  });

  emblemPivot.add(new THREE.Points(sparkGeo, sparkMat));

  return {
    group,
    uniforms,
    sparkMat,
    setPointer(nx, ny, hover = 0) {
      uniforms.uPointer.value.set(nx, ny);
      uniforms.uHover.value = hover;
    },
    update(time, dt, pointerTarget, viewportWidth, _viewportHeight, scrollT = 0, isLegal = false) {
      const isMobile = viewportWidth < 768;
      const isLegalCompact = isLegal && viewportWidth < 1080;
      const heroVis = isLegal
        ? isLegalCompact
          ? THREE.MathUtils.smoothstep(0.22 - scrollT, 0.0, 0.14)
          : 1.0 - THREE.MathUtils.smoothstep(scrollT, 0.35, 0.95) * 0.55
        : THREE.MathUtils.smoothstep(0.12 - scrollT, 0.0, 0.055);
      group.visible = heroVis > 0.005;
      if (!group.visible) return;

      uniforms.uTime.value = time;
      sparkMat.uniforms.uVisibility.value = heroVis;

      // Compact scale perched cleanly ABOVE "İBRAHİM TEMUR" or in Legal header corner
      const targetScale = isLegalCompact
        ? isMobile
          ? 0.22
          : 0.32
        : isMobile
        ? 0.3
        : viewportWidth < 1100
        ? 0.4
        : 0.46;
      const targetPosX = isLegal
        ? viewportWidth >= 1080
          ? 2.25 + pointerTarget.x * 0.1
          : isMobile
          ? 0.62
          : 1.15
        : isMobile
        ? 0.0
        : pointerTarget.x * 0.1;
      const targetPosY = isLegal
        ? viewportWidth >= 1080
          ? 1.05 + pointerTarget.y * 0.06
          : isMobile
          ? 1.72
          : 1.55
        : isMobile
        ? 0.92
        : 1.24 + pointerTarget.y * 0.06;

      group.scale.setScalar(
        THREE.MathUtils.lerp(group.scale.x, targetScale, Math.min(1, dt * 6))
      );
      group.position.x = THREE.MathUtils.lerp(
        group.position.x,
        targetPosX,
        Math.min(1, dt * 5)
      );
      group.position.y = THREE.MathUtils.lerp(
        group.position.y,
        targetPosY,
        Math.min(1, dt * 5)
      );

      const tiltX = isMobile ? -0.04 : -0.06 - pointerTarget.y * 0.14;
      const tiltY = isMobile
        ? Math.sin(time * 0.6) * 0.16
        : Math.sin(time * 0.55) * 0.14 + pointerTarget.x * 0.28;
      emblemPivot.rotation.x = THREE.MathUtils.lerp(
        emblemPivot.rotation.x,
        tiltX,
        Math.min(1, dt * 5)
      );
      emblemPivot.rotation.y = THREE.MathUtils.lerp(
        emblemPivot.rotation.y,
        tiltY,
        Math.min(1, dt * 5)
      );

      fadeEntries.forEach((entry) => {
        entry.mat.opacity = entry.baseOpacity * heroVis;
      });

      const breathe = Math.sin(time * 1.4) * 0.035;
      leftGlyph.position.x = -0.72 - breathe;
      rightGlyph.position.x = 0.72 + breathe;
      slashGlyph.position.y = Math.sin(time * 1.1) * 0.03;
      haloRing.rotation.z += dt * 0.18;
    },
    syncTheme(lerpedColors, themeMix) {
      uniforms.uPrimaryColor.value.copy(lerpedColors.primary);
      uniforms.uSecondaryColor.value.copy(lerpedColors.secondary);
      uniforms.uBgColor.value.copy(lerpedColors.bg);
      uniforms.uThemeMix.value = themeMix;

      bracketsMat.color.copy(lerpedColors.primary);
      bracketsMat.emissive.copy(lerpedColors.primary);
      slashMat.color.copy(lerpedColors.secondary);
      slashMat.emissive.copy(lerpedColors.secondary);
      bracketEdgeMat.color.copy(lerpedColors.primary);
      slashEdgeMat.color.copy(lerpedColors.secondary);
      haloMat.color.copy(lerpedColors.wire);
    }
  };
}

/* --------------------------------------------------------------------------
   5. SCENE 04 — MAC REMOTE PRECISION HARDWARE SLABS & FLOWING LIGHT BRIDGE
   -------------------------------------------------------------------------- */
function createPrecisionDeviceSlab({
  screenWidth,
  screenHeight,
  bezelPadX,
  bezelPadY,
  bodyDepth,
  cornerRadius,
  screenCornerRadius,
  initialTexture,
  initialPalette,
  isServer = false,
  isIcon = false
}) {
  const slabGroup = new THREE.Group();

  const bodyW = screenWidth + bezelPadX * 2;
  const bodyH = screenHeight + bezelPadY * 2;

  // Extruded anodized aluminum / precision glass chassis
  const bodyShape = createRoundedRectShape(bodyW, bodyH, cornerRadius);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: bodyDepth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 4,
    curveSegments: 18
  });
  bodyGeo.translate(0, 0, -bodyDepth * 0.5);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initialPalette.isLight ? "#D2CEC4" : "#1D2E34"),
    metalness: 0.82,
    roughness: 0.26,
    clearcoat: 0.45,
    clearcoatRoughness: 0.22,
    transparent: true,
    opacity: 1.0
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  slabGroup.add(bodyMesh);

  // Subtle dark glass bezel backing right behind the active display
  const bezelShape = createRoundedRectShape(
    screenWidth + 0.04,
    screenHeight + 0.04,
    screenCornerRadius + 0.02
  );
  const bezelGeo = new THREE.ShapeGeometry(bezelShape, 18);
  const bezelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0A1317"),
    metalness: 0.2,
    roughness: 0.35,
    transparent: true,
    opacity: 1.0
  });
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.position.z = bodyDepth * 0.5 + 0.016;
  slabGroup.add(bezelMesh);

  // Precision chamfer hairline outline around the front edge
  const rimPts = createRoundedBorderPoints(
    bodyW + 0.01,
    bodyH + 0.01,
    cornerRadius + 0.01,
    bodyDepth * 0.5 + 0.017,
    10
  );
  const rimGeo = new THREE.BufferGeometry().setFromPoints(rimPts);
  const rimMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(initialPalette.lightPrimary),
    transparent: true,
    opacity: 0.45
  });
  const rimLoop = new THREE.LineLoop(rimGeo, rimMat);
  slabGroup.add(rimLoop);

  const detailMats = [];
  // Subtle device detail (top earpiece pill on phone or centered webcam dot on MacBook bezel)
  if (!isIcon && !isServer) {
    const pillGeo = new THREE.PlaneGeometry(0.26, 0.036);
    const pillMat = new THREE.MeshBasicMaterial({
      color: 0x162d33,
      transparent: true,
      opacity: 0.85
    });
    detailMats.push({ mat: pillMat, baseOpacity: 0.85 });
    const pill = new THREE.Mesh(pillGeo, pillMat);
    pill.position.set(0, bodyH * 0.5 - bezelPadY * 0.42, bodyDepth * 0.5 + 0.021);
    slabGroup.add(pill);
  } else if (isServer) {
    const camMat = new THREE.MeshBasicMaterial({
      color: 0x1c3138,
      transparent: true,
      opacity: 0.9
    });
    detailMats.push({ mat: camMat, baseOpacity: 0.9 });
    const camDot = new THREE.Mesh(new THREE.CircleGeometry(0.022, 16), camMat);
    camDot.position.set(0, bodyH * 0.5 - bezelPadY * 0.48, bodyDepth * 0.5 + 0.021);
    slabGroup.add(camDot);
  }

  // Active Screen Plane with Anti-Aliased World-Proportional Rounded SDF Shader
  const screenUniforms = {
    uTexA: { value: initialTexture },
    uTexB: { value: initialTexture },
    uMix: { value: 0.0 },
    uFocus: { value: 1.0 },
    uSize: { value: new THREE.Vector2(screenWidth, screenHeight) },
    uCornerRadius: { value: screenCornerRadius },
    uPrimaryColor: { value: new THREE.Color(initialPalette.lightPrimary) },
    uSecondaryColor: { value: new THREE.Color(initialPalette.lightSecondary) },
    uTime: { value: 0.0 },
    uOpacity: { value: 1.0 }
  };

  const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight, 1, 1);
  const screenMat = new THREE.ShaderMaterial({
    uniforms: screenUniforms,
    transparent: true,
    depthWrite: true,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vViewNormal;
      varying vec3 vViewDir;

      void main() {
        vUv = uv;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform float uMix;
      uniform float uFocus;
      uniform vec2 uSize;
      uniform float uCornerRadius;
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform float uTime;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vViewNormal;
      varying vec3 vViewDir;

      float sdRoundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }

      void main() {
        // Compute SDF in proportional world units so corners are circular on tall screens
        vec2 p = (vUv - 0.5) * uSize;
        float dist = sdRoundedBox(p, uSize * 0.5, uCornerRadius);
        float aa = max(fwidth(dist), 0.0025);
        float mask = 1.0 - smoothstep(-aa, aa, dist);
        if (mask < 0.005) discard;

        vec3 colA = texture2D(uTexA, vUv).rgb;
        vec3 colB = texture2D(uTexB, vUv).rgb;
        vec3 screenCol = mix(colA, colB, clamp(uMix, 0.0, 1.0));

        // Subtle depth focus dim when secondary slab steps back
        screenCol *= mix(0.76, 1.02, clamp(uFocus, 0.0, 1.0));

        // Subtle anti-reflective glass sheen + thin Fresnel rim
        vec3 N = normalize(vViewNormal);
        vec3 V = normalize(vViewDir);
        float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.4);
        float sheenBand = smoothstep(0.32, 0.0, abs((vUv.x * 0.6 + vUv.y * 0.4) - (0.45 + sin(uTime * 0.35) * 0.06)));
        vec3 accentMix = mix(uPrimaryColor, uSecondaryColor, vUv.x);

        screenCol += vec3(0.035) * sheenBand * clamp(uFocus, 0.25, 1.0);
        screenCol += accentMix * (fresnel * 0.16 * clamp(uFocus, 0.3, 1.0));

        gl_FragColor = vec4(screenCol, mask * uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  });

  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = bodyDepth * 0.5 + 0.019;
  slabGroup.add(screenMesh);

  let crossfadeActive = false;
  let currentTex = initialTexture;

  return {
    group: slabGroup,
    bodyMat,
    bezelMat,
    rimMat,
    uniforms: screenUniforms,
    addDetailMat(mat, baseOpacity = 1.0) {
      detailMats.push({ mat, baseOpacity });
      return mat;
    },
    setOpacity(op) {
      const a = Math.max(0, Math.min(1, op));
      screenUniforms.uOpacity.value = a;
      bodyMat.opacity = a;
      bezelMat.opacity = a;
      rimMat.opacity = 0.45 * a;
      detailMats.forEach((d) => {
        d.mat.opacity = d.baseOpacity * a;
      });
    },
    setTexture(nextTex, instant = false) {
      if (!nextTex || nextTex === currentTex) return;
      if (instant) {
        screenUniforms.uTexA.value = nextTex;
        screenUniforms.uTexB.value = nextTex;
        screenUniforms.uMix.value = 0.0;
        currentTex = nextTex;
        crossfadeActive = false;
        return;
      }
      screenUniforms.uTexA.value = currentTex;
      screenUniforms.uTexB.value = nextTex;
      screenUniforms.uMix.value = 0.0;
      currentTex = nextTex;
      crossfadeActive = true;
    },
    tick(time, dt) {
      screenUniforms.uTime.value = time;
      if (crossfadeActive) {
        screenUniforms.uMix.value = Math.min(1.0, screenUniforms.uMix.value + dt * 4.5);
        if (screenUniforms.uMix.value >= 1.0) {
          screenUniforms.uTexA.value = currentTex;
          screenUniforms.uMix.value = 0.0;
          crossfadeActive = false;
        }
      }
    }
  };
}

function createFlowingLightBridge(initialPalette) {
  const bridgeGroup = new THREE.Group();

  // Cylinder parameterized along Y (-0.5..0.5) mapped to quadratic Bezier in vertex shader
  const radialSegs = 14;
  const lengthSegs = 64;
  const geo = new THREE.CylinderGeometry(1, 1, 1, radialSegs, lengthSegs, true);

  const uniforms = {
    uStartPos: { value: new THREE.Vector3(-0.3, 0.0, 0.5) },
    uEndPos: { value: new THREE.Vector3(0.8, 0.1, -0.4) },
    uRadius: { value: 0.028 },
    uTime: { value: 0.0 },
    uIntensity: { value: 1.0 },
    uPrimaryColor: { value: new THREE.Color(initialPalette.lightPrimary) },
    uSecondaryColor: { value: new THREE.Color(initialPalette.lightSecondary) }
  };

  const makeBridgeShader = (radiusScale, alphaScale) =>
    new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        uRadius: { value: uniforms.uRadius.value * radiusScale },
        uAlphaScale: { value: alphaScale }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform vec3 uStartPos;
        uniform vec3 uEndPos;
        uniform float uRadius;
        uniform float uTime;

        varying float vT;
        varying vec3 vNormalDir;
        varying vec3 vViewDir;

        void main() {
          float t = clamp(position.y + 0.5, 0.0, 1.0);
          vT = t;

          vec3 p0 = uStartPos;
          vec3 p2 = uEndPos;
          vec3 mid = mix(p0, p2, 0.5);
          vec3 p1 = mid + vec3(0.0, 0.42 + sin(uTime * 0.9) * 0.05, 0.52);

          float invT = 1.0 - t;
          vec3 curvePos = invT * invT * p0 + 2.0 * invT * t * p1 + t * t * p2;
          vec3 tangent = normalize(2.0 * invT * (p1 - p0) + 2.0 * t * (p2 - p1) + vec3(0.0001));

          vec3 upRef = abs(tangent.y) > 0.9 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
          vec3 side = normalize(cross(tangent, upRef));
          vec3 binormal = normalize(cross(side, tangent));

          // Cylinder radial circle lies on XZ plane of original geometry
          vec3 radialDir = normalize(side * position.x + binormal * position.z);
          float pulseWidth = 1.0 + 0.25 * sin(t * 14.0 - uTime * 3.8);
          vec3 finalPos = curvePos + radialDir * (uRadius * pulseWidth);

          vec4 mvPos = modelViewMatrix * vec4(finalPos, 1.0);
          vNormalDir = normalize(normalMatrix * radialDir);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uAlphaScale;
        uniform vec3 uPrimaryColor;
        uniform vec3 uSecondaryColor;

        varying float vT;
        varying vec3 vNormalDir;
        varying vec3 vViewDir;

        void main() {
          float endsMask = smoothstep(0.0, 0.08, vT) * smoothstep(1.0, 0.92, vT);

          // Primary forward packet + return acknowledge pulse
          float pulseA = pow(0.5 + 0.5 * sin((vT * 2.8 - uTime * 1.35) * 6.28318), 4.0);
          float pulseB = pow(0.5 + 0.5 * sin((vT * 1.9 + uTime * 0.85) * 6.28318), 5.0);

          vec3 gradCol = mix(uPrimaryColor, uSecondaryColor, vT);
          float core = pow(clamp(abs(dot(normalize(vNormalDir), normalize(vViewDir))), 0.0, 1.0), 0.65);

          float energy = (0.45 + pulseA * 0.65 + pulseB * 0.35) * core * endsMask * uIntensity;
          gl_FragColor = vec4(gradCol * (1.0 + pulseA * 0.32), clamp(energy * uAlphaScale, 0.0, 0.95));
          #include <colorspace_fragment>
        }
      `
    });

  const coreMat = makeBridgeShader(1.0, 0.95);
  const haloMat = makeBridgeShader(2.45, 0.28);

  bridgeGroup.add(new THREE.Mesh(geo, coreMat));
  bridgeGroup.add(new THREE.Mesh(geo, haloMat));

  // Packet particles gliding smoothly along the bridge curve
  const packetCount = 14;
  const packetGeo = new THREE.BufferGeometry();
  const packetPos = new Float32Array(packetCount * 3);
  const packetPhases = new Float32Array(packetCount);
  for (let i = 0; i < packetCount; i++) {
    packetPhases[i] = i / packetCount;
  }
  packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPos, 3));
  packetGeo.setAttribute("aPhase", new THREE.BufferAttribute(packetPhases, 1));

  const packetMat = new THREE.ShaderMaterial({
    uniforms: {
      uPrimaryColor: uniforms.uPrimaryColor,
      uSecondaryColor: uniforms.uSecondaryColor,
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uIntensity: uniforms.uIntensity
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: /* glsl */ `
      attribute float aPhase;
      uniform float uPixelRatio;
      varying float vMix;
      void main() {
        vMix = aPhase;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp((13.0 * uPixelRatio) / max(1.0, -mv.z * 0.45), 3.0, 18.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform float uIntensity;
      varying float vMix;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * 0.85 * uIntensity;
        if (a < 0.01) discard;
        vec3 col = mix(uPrimaryColor, uSecondaryColor, vMix);
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
      }
    `
  });

  const packets = new THREE.Points(packetGeo, packetMat);
  bridgeGroup.add(packets);

  const tmpMid = new THREE.Vector3();
  const tmpP1 = new THREE.Vector3();

  return {
    group: bridgeGroup,
    setPixelRatio(dpr) {
      packetMat.uniforms.uPixelRatio.value = dpr;
    },
    update(time, startPos, endPos, intensity) {
      uniforms.uStartPos.value.copy(startPos);
      uniforms.uEndPos.value.copy(endPos);
      uniforms.uTime.value = time;
      uniforms.uIntensity.value = intensity;

      [coreMat, haloMat].forEach((m) => {
        m.uniforms.uStartPos.value.copy(startPos);
        m.uniforms.uEndPos.value.copy(endPos);
        m.uniforms.uTime.value = time;
        m.uniforms.uIntensity.value = intensity;
      });
      packetMat.uniforms.uIntensity.value = intensity;

      tmpMid.addVectors(startPos, endPos).multiplyScalar(0.5);
      tmpP1.set(tmpMid.x, tmpMid.y + 0.42 + Math.sin(time * 0.9) * 0.05, tmpMid.z + 0.52);

      const posAttr = packetGeo.attributes.position;
      const phaseAttr = packetGeo.attributes.aPhase;
      for (let i = 0; i < packetCount; i++) {
        const t = ((time * 0.34 + i / packetCount) % 1 + 1) % 1;
        const inv = 1 - t;
        const x = inv * inv * startPos.x + 2 * inv * t * tmpP1.x + t * t * endPos.x;
        const y = inv * inv * startPos.y + 2 * inv * t * tmpP1.y + t * t * endPos.y;
        const z = inv * inv * startPos.z + 2 * inv * t * tmpP1.z + t * t * endPos.z;
        posAttr.setXYZ(i, x, y, z);
        phaseAttr.setX(i, t);
      }
      posAttr.needsUpdate = true;
      phaseAttr.needsUpdate = true;
    },
    syncTheme(lerpedColors) {
      uniforms.uPrimaryColor.value.copy(lerpedColors.primary);
      uniforms.uSecondaryColor.value.copy(lerpedColors.secondary);
      [coreMat, haloMat, packetMat].forEach((m) => {
        m.uniforms.uPrimaryColor.value.copy(lerpedColors.primary);
        m.uniforms.uSecondaryColor.value.copy(lerpedColors.secondary);
      });
    }
  };
}

function createMacRemoteStage(initialPalette, maxAnisotropy) {
  const group = new THREE.Group();
  group.name = "MacRemoteStage";
  group.visible = false;

  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin("anonymous");

  const textureCache = new Map();
  const placeholders = {
    mobileDiscovery: {
      tr: createDevicePlaceholderTexture("mobile-discovery", "tr"),
      en: createDevicePlaceholderTexture("mobile-discovery", "en")
    },
    mobileTrackpad: {
      tr: createDevicePlaceholderTexture("mobile-trackpad", "tr"),
      en: createDevicePlaceholderTexture("mobile-trackpad", "en")
    },
    server: {
      tr: createDevicePlaceholderTexture("server", "tr"),
      en: createDevicePlaceholderTexture("server", "en")
    }
  };

  let activeLang = getActiveLang();
  let activeStep = 0;
  let continuousProgress = 0;

  function loadCachedTexture(url, fallbackTex, onReady) {
    if (textureCache.has(url)) {
      const entry = textureCache.get(url);
      if (entry.loaded) {
        onReady(entry.texture);
      } else {
        entry.callbacks.push(onReady);
        onReady(fallbackTex);
      }
      return;
    }

    const entry = { loaded: false, texture: fallbackTex, callbacks: [onReady] };
    textureCache.set(url, entry);
    onReady(fallbackTex);

    textureLoader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, maxAnisotropy);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        entry.loaded = true;
        entry.texture = tex;
        entry.callbacks.forEach((cb) => cb(tex));
        entry.callbacks = [];
      },
      undefined,
      () => {
        /* keep realistic CanvasTexture placeholder if offline/blocked */
      }
    );
  }

  // 1. Mobile Client Slab (1320 : 2868 -> exact 1.84 x 4.0 units)
  const mobileSlab = createPrecisionDeviceSlab({
    screenWidth: 1.84,
    screenHeight: 4.0,
    bezelPadX: 0.08,
    bezelPadY: 0.11,
    bodyDepth: 0.085,
    cornerRadius: 0.24,
    screenCornerRadius: 0.18,
    initialTexture: placeholders.mobileDiscovery[activeLang],
    initialPalette,
    isServer: false
  });
  group.add(mobileSlab.group);

  // 2. macOS PyQt6 Server inside Landscape 16:10 MacBook Pro Display (1920 : 1200)
  const serverSlab = createPrecisionDeviceSlab({
    screenWidth: 3.84,
    screenHeight: 2.4,
    bezelPadX: 0.11,
    bezelPadY: 0.13,
    bodyDepth: 0.075,
    cornerRadius: 0.12,
    screenCornerRadius: 0.05,
    initialTexture: placeholders.server[activeLang],
    initialPalette,
    isServer: true
  });

  // Attach sculptural MacBook Pro unibody keyboard deck, cylindrical hinge barrel & keys
  const macLowerAssembly = new THREE.Group();
  macLowerAssembly.position.set(0, -1.32, 0.02);
  macLowerAssembly.rotation.x = 0.08;

  const macDeck = new THREE.Mesh(
    new THREE.BoxGeometry(4.18, 0.085, 2.08),
    serverSlab.bodyMat
  );
  macDeck.position.set(0, -0.04, 1.02);
  macLowerAssembly.add(macDeck);

  // Subtle metallic front thumb notch & hairline trim around base deck
  const macNotch = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.036, 0.06),
    serverSlab.bezelMat
  );
  macNotch.position.set(0, -0.015, 2.04);
  macLowerAssembly.add(macNotch);

  const macHinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 3.28, 16),
    serverSlab.bezelMat
  );
  macHinge.rotation.z = Math.PI * 0.5;
  macHinge.position.set(0, 0.005, -0.01);
  macLowerAssembly.add(macHinge);

  // Procedural MacBook keyboard texture so the laptop deck reads unmistakably from 3D angles
  const kbCanvas = document.createElement("canvas");
  kbCanvas.width = 512;
  kbCanvas.height = 192;
  const kbCtx = kbCanvas.getContext("2d");
  kbCtx.fillStyle = "#0B1519";
  kbCtx.fillRect(0, 0, 512, 192);
  kbCtx.fillStyle = "#172C33";
  for (let row = 0; row < 5; row++) {
    const cols = row === 4 ? 8 : 14;
    const rowY = 14 + row * 34;
    for (let col = 0; col < cols; col++) {
      let kx = 14 + col * 34.5;
      let kw = 28;
      if (row === 4 && col === 3) {
        kw = 178;
      } else if (row === 4 && col > 3) {
        kx += 144;
      }
      if (kx + kw <= 500) {
        drawRoundedRectPath(kbCtx, kx, rowY, kw, 26, 4);
        kbCtx.fill();
      }
    }
  }
  const kbTex = new THREE.CanvasTexture(kbCanvas);
  kbTex.colorSpace = THREE.SRGBColorSpace;
  const macKbMat = serverSlab.addDetailMat(
    new THREE.MeshBasicMaterial({
      map: kbTex,
      transparent: true,
      opacity: 1.0
    }),
    1.0
  );
  const macKeyboard = new THREE.Mesh(new THREE.PlaneGeometry(3.48, 0.96), macKbMat);
  macKeyboard.rotation.x = -Math.PI * 0.5;
  macKeyboard.position.set(0, 0.006, 0.58);
  macLowerAssembly.add(macKeyboard);

  const macTrackpad = new THREE.Mesh(
    new THREE.PlaneGeometry(1.36, 0.64),
    serverSlab.bezelMat
  );
  macTrackpad.rotation.x = -Math.PI * 0.5;
  macTrackpad.position.set(0, 0.006, 1.54);
  macLowerAssembly.add(macTrackpad);

  const tpRimPts = [
    new THREE.Vector3(-0.68, 0.008, 1.22),
    new THREE.Vector3(0.68, 0.008, 1.22),
    new THREE.Vector3(0.68, 0.008, 1.86),
    new THREE.Vector3(-0.68, 0.008, 1.86)
  ];
  const tpRimLine = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(tpRimPts),
    serverSlab.rimMat
  );
  macLowerAssembly.add(tpRimLine);

  serverSlab.group.add(macLowerAssembly);
  group.add(serverSlab.group);

  // 3. Procedural Flowing Turquoise -> Amber Light Bridge
  const lightBridge = createFlowingLightBridge(initialPalette);
  group.add(lightBridge.group);

  // Subtle architectural base floor ring under the showcase
  const basePts = [];
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    basePts.push(new THREE.Vector3(Math.cos(a) * 3.15, -2.25, Math.sin(a) * 1.85));
  }
  const baseRingGeo = new THREE.BufferGeometry().setFromPoints(basePts);
  const baseRingMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(initialPalette.wire),
    transparent: true,
    opacity: 0.42
  });
  const baseRing = new THREE.LineLoop(baseRingGeo, baseRingMat);
  group.add(baseRing);

  const compositeMacCache = new Map();

  function syncTexturesForState(instant = false) {
    const langKey = activeLang === "en" ? "en" : "tr";
    const screens = FEATURED_SCREENS[langKey] || FEATURED_SCREENS.tr;

    const mobileIdx = activeStep === 0 ? 0 : 1;
    const mobileFallback =
      mobileIdx === 0
        ? placeholders.mobileDiscovery[langKey]
        : placeholders.mobileTrackpad[langKey];

    const mobileUrl = screens[mobileIdx]?.src || `${MAC_SCREENSHOT_BASE}${langKey}${mobileIdx + 1}.png`;
    const serverUrl = screens[2]?.src || `${MAC_SCREENSHOT_BASE}mac_server_${langKey}.png`;

    loadCachedTexture(mobileUrl, mobileFallback, (tex) => {
      mobileSlab.setTexture(tex, instant);
    });
    loadCachedTexture(serverUrl, placeholders.server[langKey], (tex) => {
      if (tex === placeholders.server[langKey]) {
        serverSlab.setTexture(tex, instant);
        return;
      }
      const cacheKey = `${serverUrl}::${langKey}`;
      let composite = compositeMacCache.get(cacheKey);
      if (!composite && tex?.image) {
        composite = composeMacDesktopTexture(tex.image, langKey, maxAnisotropy);
        compositeMacCache.set(cacheKey, composite);
      }
      serverSlab.setTexture(composite || placeholders.server[langKey], instant);
    });

    // Preload alternate step & alternate language silently for instant switching
    const otherMobileIdx = mobileIdx === 0 ? 1 : 0;
    const otherUrl = screens[otherMobileIdx]?.src;
    if (otherUrl) {
      loadCachedTexture(otherUrl, placeholders.mobileTrackpad[langKey], () => {});
    }
    const otherLang = langKey === "tr" ? "en" : "tr";
    const otherScreens = FEATURED_SCREENS[otherLang];
    if (otherScreens) {
      otherScreens.forEach((s) => loadCachedTexture(s.src, placeholders.server[otherLang], () => {}));
    }
  }

  syncTexturesForState(true);

  const STEP_POSES = [
    // Step 0: Discovery & Connection -> tr1/en1 foreground + active light bridge + Landscape MacBook
    {
      mobilePos: new THREE.Vector3(-2.02, -0.04, 0.72),
      mobileRot: new THREE.Euler(0.02, 0.22, 0.0),
      mobileScale: 0.86,
      mobileFocus: 1.0,
      serverPos: new THREE.Vector3(1.52, 0.14, -0.42),
      serverRot: new THREE.Euler(-0.02, -0.22, 0.0),
      serverScale: 0.88,
      serverFocus: 0.86,
      bridgeIntensity: 1.0
    },
    // Step 1: Trackpad & Live Screen -> tr2/en2 glides to center stage
    {
      mobilePos: new THREE.Vector3(-1.14, -0.02, 1.12),
      mobileRot: new THREE.Euler(0.03, 0.06, 0.0),
      mobileScale: 0.94,
      mobileFocus: 1.0,
      serverPos: new THREE.Vector3(1.92, 0.16, -0.68),
      serverRot: new THREE.Euler(-0.02, -0.28, 0.0),
      serverScale: 0.82,
      serverFocus: 0.76,
      bridgeIntensity: 0.92
    },
    // Step 2: macOS Server Control Panel -> Landscape MacBook steps forward
    {
      mobilePos: new THREE.Vector3(-2.36, -0.08, -0.58),
      mobileRot: new THREE.Euler(0.02, 0.28, 0.0),
      mobileScale: 0.76,
      mobileFocus: 0.74,
      serverPos: new THREE.Vector3(0.95, 0.12, 0.92),
      serverRot: new THREE.Euler(0.02, -0.08, 0.0),
      serverScale: 0.96,
      serverFocus: 1.0,
      bridgeIntensity: 0.96
    }
  ];

  // Start immediately at Step 0 pose
  mobileSlab.group.position.copy(STEP_POSES[0].mobilePos);
  mobileSlab.group.rotation.copy(STEP_POSES[0].mobileRot);
  serverSlab.group.position.copy(STEP_POSES[0].serverPos);
  serverSlab.group.rotation.copy(STEP_POSES[0].serverRot);

  const tmpStart = new THREE.Vector3();
  const tmpEnd = new THREE.Vector3();
  const darkBodyColor = new THREE.Color("#1D2E34");
  const lightBodyColor = new THREE.Color("#D2CEC4");
  let lerpedBridgeIntensity = 1.0;

  return {
    group,
    setStep(idx) {
      const next = Math.max(0, Math.min(2, Number(idx) || 0));
      if (next !== activeStep) {
        activeStep = next;
        syncTexturesForState(false);
      }
    },
    setProgress(p) {
      continuousProgress = Math.max(0, Math.min(1, Number(p) || 0));
    },
    setLanguage(lang) {
      const nextLang = lang === "en" ? "en" : "tr";
      if (nextLang !== activeLang) {
        activeLang = nextLang;
        syncTexturesForState(false);
      }
    },
    getCameraStepOffset(outCamOffset, outLookOffset, viewportWidth = 1440) {
      if (viewportWidth < 821) {
        outCamOffset.set(0, 0, 0);
        outLookOffset.set(0, 0, 0);
        return;
      }
      // Subtle step-driven camera parallax around Station 04
      if (activeStep === 0) {
        outCamOffset.set(-0.2, 0.05, 0.15);
        outLookOffset.set(0.05, 0.0, 0.0);
      } else if (activeStep === 1) {
        outCamOffset.set(0.22, -0.04, -0.22);
        outLookOffset.set(0.18, 0.0, 0.0);
      } else {
        outCamOffset.set(0.55, 0.06, -0.12);
        outLookOffset.set(0.42, 0.02, 0.0);
      }
    },
    update(time, dt, pointerTarget, viewportWidth, scrollT = 0) {
      const distT = Math.abs(scrollT - 0.5);
      const vis = THREE.MathUtils.smoothstep(0.095 - distT, 0.0, 0.045);
      group.visible = vis > 0.005;
      if (!group.visible) return;

      const pose = STEP_POSES[activeStep];
      const lerpAlpha = Math.min(1, dt * 5.2);

      // Responsive staging: fit neatly in right 68% on desktop, lower open window on mobile
      const isStackedLayout = viewportWidth < 821;
      const isCompactMobile = viewportWidth < 600;
      const targetGroupScale = isCompactMobile
        ? 0.25
        : isStackedLayout
        ? 0.42
        : viewportWidth < 1040
        ? 0.56
        : viewportWidth < 1280
        ? 0.72
        : 0.84;
      const targetGroupX = isCompactMobile ? -2.55 : isStackedLayout ? -2.38 : 0.0;
      const targetGroupY = isCompactMobile ? -1.6 : isStackedLayout ? -1.45 : 0.0;
      const xSpread = isCompactMobile ? 0.72 : 1.0;

      group.scale.setScalar(
        THREE.MathUtils.lerp(group.scale.x, targetGroupScale, lerpAlpha)
      );
      group.position.x = THREE.MathUtils.lerp(
        group.position.x,
        CAMERA_STATIONS[3].anchor[0] + targetGroupX,
        lerpAlpha
      );
      group.position.y = THREE.MathUtils.lerp(
        group.position.y,
        CAMERA_STATIONS[3].anchor[1] + targetGroupY,
        lerpAlpha
      );
      group.position.z = THREE.MathUtils.lerp(
        group.position.z,
        CAMERA_STATIONS[3].anchor[2] - (1 - vis) * 3.5,
        lerpAlpha
      );

      // Smooth mobile slab choreography + gentle hover float
      const floatA = Math.sin(time * 1.1) * 0.045;
      const floatB = Math.cos(time * 0.95) * 0.045;

      mobileSlab.group.position.x = THREE.MathUtils.lerp(
        mobileSlab.group.position.x,
        pose.mobilePos.x * xSpread + pointerTarget.x * 0.08,
        lerpAlpha
      );
      mobileSlab.group.position.y = THREE.MathUtils.lerp(
        mobileSlab.group.position.y,
        pose.mobilePos.y + floatA,
        lerpAlpha
      );
      mobileSlab.group.position.z = THREE.MathUtils.lerp(
        mobileSlab.group.position.z,
        pose.mobilePos.z,
        lerpAlpha
      );
      mobileSlab.group.rotation.x = THREE.MathUtils.lerp(
        mobileSlab.group.rotation.x,
        pose.mobileRot.x - pointerTarget.y * 0.05,
        lerpAlpha
      );
      mobileSlab.group.rotation.y = THREE.MathUtils.lerp(
        mobileSlab.group.rotation.y,
        pose.mobileRot.y + pointerTarget.x * 0.08,
        lerpAlpha
      );
      mobileSlab.group.scale.setScalar(
        THREE.MathUtils.lerp(mobileSlab.group.scale.x, pose.mobileScale, lerpAlpha)
      );
      mobileSlab.uniforms.uFocus.value = THREE.MathUtils.lerp(
        mobileSlab.uniforms.uFocus.value,
        pose.mobileFocus,
        lerpAlpha
      );

      // Smooth landscape MacBook slab choreography
      serverSlab.group.position.x = THREE.MathUtils.lerp(
        serverSlab.group.position.x,
        pose.serverPos.x * xSpread + pointerTarget.x * 0.05,
        lerpAlpha
      );
      serverSlab.group.position.y = THREE.MathUtils.lerp(
        serverSlab.group.position.y,
        pose.serverPos.y + floatB,
        lerpAlpha
      );
      serverSlab.group.position.z = THREE.MathUtils.lerp(
        serverSlab.group.position.z,
        pose.serverPos.z,
        lerpAlpha
      );
      serverSlab.group.rotation.x = THREE.MathUtils.lerp(
        serverSlab.group.rotation.x,
        pose.serverRot.x - pointerTarget.y * 0.04,
        lerpAlpha
      );
      serverSlab.group.rotation.y = THREE.MathUtils.lerp(
        serverSlab.group.rotation.y,
        pose.serverRot.y + pointerTarget.x * 0.06,
        lerpAlpha
      );
      serverSlab.group.scale.setScalar(
        THREE.MathUtils.lerp(serverSlab.group.scale.x, pose.serverScale, lerpAlpha)
      );
      serverSlab.uniforms.uFocus.value = THREE.MathUtils.lerp(
        serverSlab.uniforms.uFocus.value,
        pose.serverFocus,
        lerpAlpha
      );

      mobileSlab.setOpacity(vis);
      serverSlab.setOpacity(vis);
      baseRingMat.opacity = 0.42 * vis;

      mobileSlab.tick(time, dt);
      serverSlab.tick(time, dt);

      // Bridge endpoints stay locked to the inner edges of mobile & MacBook slabs
      tmpStart.set(
        mobileSlab.group.position.x + 0.9 * mobileSlab.group.scale.x,
        mobileSlab.group.position.y - 0.06,
        mobileSlab.group.position.z + 0.04
      );
      tmpEnd.set(
        serverSlab.group.position.x - 1.92 * serverSlab.group.scale.x,
        serverSlab.group.position.y - 0.04,
        serverSlab.group.position.z + 0.05
      );
      lerpedBridgeIntensity = THREE.MathUtils.lerp(
        lerpedBridgeIntensity,
        pose.bridgeIntensity,
        lerpAlpha
      );
      lightBridge.update(time, tmpStart, tmpEnd, lerpedBridgeIntensity * vis);

      baseRing.rotation.y = time * 0.05;
    },
    syncTheme(lerpedColors, themeMix) {
      [mobileSlab, serverSlab].forEach((slab) => {
        slab.bodyMat.color.lerpColors(darkBodyColor, lightBodyColor, themeMix);
        slab.rimMat.color.copy(lerpedColors.primary);
        slab.uniforms.uPrimaryColor.value.copy(lerpedColors.primary);
        slab.uniforms.uSecondaryColor.value.copy(lerpedColors.secondary);
      });

      baseRingMat.color.copy(lerpedColors.wire);
      lightBridge.syncTheme(lerpedColors);
    },
    setPixelRatio(dpr) {
      lightBridge.setPixelRatio(dpr);
    }
  };
}

/* --------------------------------------------------------------------------
   6. ATMOSPHERIC DEPTH FIELD & STATION 02/03/05/06/07 ANCHORS (PHASE 2 HOOKS)
   -------------------------------------------------------------------------- */
function createCorridorAtmosphere(initialPalette) {
  const count = 460;
  const positions = new Float32Array(count * 3);
  const mixes = new Float32Array(count);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  // Deterministic pseudo-random distribution along the 7-station spline corridor
  const hash = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  for (let i = 0; i < count; i++) {
    const r1 = hash(i * 3 + 1);
    const r2 = hash(i * 3 + 2);
    const r3 = hash(i * 3 + 3);
    const r4 = hash(i * 3 + 4);

    positions[i * 3] = (r1 - 0.5) * 26.0;
    positions[i * 3 + 1] = (r2 - 0.5) * 14.0;
    positions[i * 3 + 2] = 4.0 - r3 * 130.0;

    mixes[i] = r4;
    sizes[i] = 6.0 + r1 * 12.0;
    phases[i] = r2 * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aMix", new THREE.BufferAttribute(mixes, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uPrimaryColor: { value: new THREE.Color(initialPalette.lightPrimary) },
    uSecondaryColor: { value: new THREE.Color(initialPalette.lightSecondary) },
    uWireColor: { value: new THREE.Color(initialPalette.wire) },
    uThemeMix: { value: initialPalette.isLight ? 1.0 : 0.0 }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute float aMix;
      attribute float aSize;
      attribute float aPhase;

      uniform float uTime;
      uniform float uPixelRatio;

      varying float vMix;
      varying float vDepthAlpha;

      void main() {
        vMix = aMix;
        vec3 p = position;
        p.y += sin(uTime * 0.28 + aPhase) * 0.18;
        p.x += cos(uTime * 0.22 + aPhase * 1.4) * 0.14;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = -mv.z;
        gl_PointSize = clamp((aSize * uPixelRatio) / max(1.5, dist * 0.35), 1.5, 14.0);
        vDepthAlpha = smoothstep(2.0, 7.0, dist) * smoothstep(38.0, 12.0, dist);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform vec3 uWireColor;
      uniform float uThemeMix;

      varying float vMix;
      varying float vDepthAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        float soft = smoothstep(0.5, 0.05, d);
        if (soft < 0.01 || vDepthAlpha < 0.01) discard;

        vec3 col = vMix < 0.45
          ? uPrimaryColor
          : vMix < 0.72
          ? uSecondaryColor
          : uWireColor;

        float alpha = soft * vDepthAlpha * mix(0.48, 0.34, uThemeMix);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `
  });

  const points = new THREE.Points(geo, mat);

  return {
    points,
    update(time) {
      uniforms.uTime.value = time;
    },
    syncTheme(lerpedColors, themeMix) {
      uniforms.uPrimaryColor.value.copy(lerpedColors.primary);
      uniforms.uSecondaryColor.value.copy(lerpedColors.secondary);
      uniforms.uWireColor.value.copy(lerpedColors.wire);
      uniforms.uThemeMix.value = themeMix;
    }
  };
}

/* --------------------------------------------------------------------------
   7. MASTER SCENE CONTROLLER EXPORT (HERO + MAC REMOTE + ATMOSPHERE)
   -------------------------------------------------------------------------- */
function createFallbackController() {
  applyWebglFallbackClass();
  return {
    isWebGL: false,
    setScrollProgress() {},
    setIntroProgress() {},
    setFeaturedStep() {},
    setFeaturedProgress() {},
    setTheme() {},
    setLanguage() {},
    setIotState() {},
    pulseProjectHover() {},
    getStationGroup() {
      return null;
    },
    dispose() {}
  };
}

export function initLegalScene() {
  return initPortfolioScene({ mode: "legal" });
}

export function initPortfolioScene(options = {}) {
  const isLegalMode = options?.mode === "legal";
  const canvas = document.getElementById("webgl-canvas");
  const urlParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const forceFallback = urlParams?.get("fallback") === "1";
  const forceReducedMotion = urlParams?.get("reduced") === "1";
  const motionScale = forceReducedMotion ? 0.35 : 1.0;

  if (!canvas || forceFallback) {
    return createFallbackController();
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (_) {
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    } catch (__) {
      return createFallbackController();
    }
  }

  if (!renderer || !renderer.getContext()) {
    return createFallbackController();
  }

  removeWebglFallbackClass();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy?.() || 4;
  const initialPalette = readThemeScenePalette(getActiveTheme());

  const scene = new THREE.Scene();
  scene.background = null; // Keep canvas transparent over CSS backdrop and Hero back typography
  scene.fog = new THREE.FogExp2(initialPalette.fog, 0.016);

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / Math.max(1, window.innerHeight),
    0.1,
    180
  );
  camera.position.set(0, 0.16, HERO_INTRO_START_Z);

  const cameraRig = createCameraRig();

  // Theme-synchronized color state for smooth frame-by-frame lerping
  const targetColors = {
    bg: new THREE.Color(initialPalette.bg),
    fog: new THREE.Color(initialPalette.fog),
    ambient: new THREE.Color(initialPalette.ambient),
    primary: new THREE.Color(initialPalette.lightPrimary),
    secondary: new THREE.Color(initialPalette.lightSecondary),
    wire: new THREE.Color(initialPalette.wire)
  };
  const lerpedColors = {
    bg: targetColors.bg.clone(),
    fog: targetColors.fog.clone(),
    ambient: targetColors.ambient.clone(),
    primary: targetColors.primary.clone(),
    secondary: targetColors.secondary.clone(),
    wire: targetColors.wire.clone()
  };
  let targetThemeMix = initialPalette.isLight ? 1.0 : 0.0;
  let currentThemeMix = targetThemeMix;

  // Lighting Setup (Petrol/Limestone Ambient + Turquoise Key + Amber Rim)
  const hemiLight = new THREE.HemisphereLight(
    new THREE.Color(initialPalette.lightPrimary),
    new THREE.Color(initialPalette.ambient),
    0.85
  );
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xf6f8f7, 1.35);
  keyLight.position.set(4.5, 6.5, 7.0);
  scene.add(keyLight);

  const primaryAccentLight = new THREE.PointLight(
    new THREE.Color(initialPalette.lightPrimary),
    2.2,
    24,
    1.5
  );
  primaryAccentLight.position.set(-3.0, 2.2, 3.0);
  scene.add(primaryAccentLight);

  const secondaryAccentLight = new THREE.PointLight(
    new THREE.Color(initialPalette.lightSecondary),
    1.9,
    24,
    1.5
  );
  secondaryAccentLight.position.set(3.2, -1.6, 2.5);
  scene.add(secondaryAccentLight);

  // Build Stations
  const stationGroups = new Map();

  // Station 01 — Compact Beveled </> Software Emblem
  const heroMonolith = createHeroMonolith(initialPalette);
  heroMonolith.group.position.set(
    CAMERA_STATIONS[0].anchor[0],
    CAMERA_STATIONS[0].anchor[1],
    CAMERA_STATIONS[0].anchor[2]
  );
  scene.add(heroMonolith.group);
  stationGroups.set("scene-hero", heroMonolith.group);

  // Station 04 — Mac Remote Pinned 3D Stage (Portfolio only)
  const macRemoteStage = isLegalMode
    ? null
    : createMacRemoteStage(initialPalette, maxAnisotropy);
  if (macRemoteStage) {
    macRemoteStage.group.position.set(
      CAMERA_STATIONS[3].anchor[0],
      CAMERA_STATIONS[3].anchor[1],
      CAMERA_STATIONS[3].anchor[2]
    );
    scene.add(macRemoteStage.group);
    stationGroups.set("scene-featured", macRemoteStage.group);
  }

  // Corridor Atmospheric Depth Particles
  const atmosphere = createCorridorAtmosphere(initialPalette);
  scene.add(atmosphere.points);

  // Motion & Scroll State
  let targetScrollT = 0;
  let currentScrollT = 0;
  let introProgress = 0; // 0 -> 1 glides camera Z from 9.5 -> 6.2
  let pointerRawX = 0;
  let pointerRawY = 0;
  const pointerSmoothed = new THREE.Vector2(0, 0);

  const sampledPos = new THREE.Vector3();
  const sampledLook = new THREE.Vector3();
  const stepCamOffset = new THREE.Vector3();
  const stepLookOffset = new THREE.Vector3();
  const currentStepCamOffset = new THREE.Vector3();
  const currentStepLookOffset = new THREE.Vector3();
  const finalLookTarget = new THREE.Vector3();

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let rafId = null;
  let isDisposed = false;
  let elapsed = 0;
  let lastNow = performance.now();

  function onPointerMove(e) {
    if (viewportWidth < 768) return;
    pointerRawX = (e.clientX / Math.max(1, viewportWidth)) * 2 - 1;
    pointerRawY = -((e.clientY / Math.max(1, viewportHeight)) * 2 - 1);
  }

  function onResize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(nextDpr);
    renderer.setSize(viewportWidth, viewportHeight, false);
    camera.aspect = viewportWidth / Math.max(1, viewportHeight);
    camera.updateProjectionMatrix();
    heroMonolith.sparkMat.uniforms.uPixelRatio.value = nextDpr;
    if (macRemoteStage) macRemoteStage.setPixelRatio(nextDpr);
    atmosphere.points.material.uniforms.uPixelRatio.value = nextDpr;
  }

  function onVisibilityChange() {
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (!isDisposed && rafId === null) {
      lastNow = performance.now();
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  function onThemeEvent(e) {
    const detailTheme = e?.detail?.theme || getActiveTheme();
    const detailColors = e?.detail?.colors || null;
    updateTargetPalette(detailTheme, detailColors);
  }

  function onContextLost(e) {
    e.preventDefault();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    applyWebglFallbackClass();
  }

  function updateTargetPalette(theme, overrideColors = null) {
    const pal = readThemeScenePalette(theme, overrideColors);
    targetColors.bg.set(pal.bg);
    targetColors.fog.set(pal.fog);
    targetColors.ambient.set(pal.ambient);
    targetColors.primary.set(pal.lightPrimary);
    targetColors.secondary.set(pal.lightSecondary);
    targetColors.wire.set(pal.wire);
    targetThemeMix = pal.isLight ? 1.0 : 0.0;
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("portfolio:themechange", onThemeEvent);
  canvas.addEventListener("webglcontextlost", onContextLost);

  function renderFrame(now) {
    if (isDisposed || document.hidden) {
      rafId = null;
      return;
    }

    const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    elapsed += dt * motionScale;

    // Smooth pointer & scroll interpolation
    const ptrAlpha = Math.min(1, dt * 5.0);
    pointerSmoothed.x = THREE.MathUtils.lerp(pointerSmoothed.x, pointerRawX, ptrAlpha);
    pointerSmoothed.y = THREE.MathUtils.lerp(pointerSmoothed.y, pointerRawY, ptrAlpha);

    currentScrollT = THREE.MathUtils.lerp(
      currentScrollT,
      targetScrollT,
      Math.min(1, dt * 7.0)
    );

    // Theme color lerping (fog, lights, wireframe, custom shaders)
    const colorAlpha = Math.min(1, dt * 5.0);
    lerpedColors.bg.lerp(targetColors.bg, colorAlpha);
    lerpedColors.fog.lerp(targetColors.fog, colorAlpha);
    lerpedColors.ambient.lerp(targetColors.ambient, colorAlpha);
    lerpedColors.primary.lerp(targetColors.primary, colorAlpha);
    lerpedColors.secondary.lerp(targetColors.secondary, colorAlpha);
    lerpedColors.wire.lerp(targetColors.wire, colorAlpha);
    currentThemeMix = THREE.MathUtils.lerp(currentThemeMix, targetThemeMix, colorAlpha);

    scene.fog.color.copy(lerpedColors.fog);
    hemiLight.color.copy(lerpedColors.primary);
    hemiLight.groundColor.copy(lerpedColors.ambient);
    primaryAccentLight.color.copy(lerpedColors.primary);
    secondaryAccentLight.color.copy(lerpedColors.secondary);

    if (isLegalMode) {
      camera.position.set(
        pointerSmoothed.x * 0.14,
        0.16 + pointerSmoothed.y * 0.08 - currentScrollT * 0.35,
        6.2 - currentScrollT * 2.4
      );
      finalLookTarget.set(0, 0.08 - currentScrollT * 0.55, 0);
      camera.lookAt(finalLookTarget);
    } else {
      // Sample 7-station spline camera + apply Hero intro glide & Station 04 step focus
      cameraRig.sampleAt(currentScrollT, sampledPos, sampledLook);

      const heroWeight = Math.max(0, 1 - currentScrollT * 6.0);
      const easedIntro = 1 - Math.pow(1 - Math.max(0, Math.min(1, introProgress)), 3);
      const introZOffset = (HERO_INTRO_START_Z - HERO_INTRO_END_Z) * (1 - easedIntro) * heroWeight;

      const featuredDist = Math.abs(currentScrollT - 0.5);
      const featuredWeight = THREE.MathUtils.smoothstep(0.14 - featuredDist, 0.0, 0.14);
      if (macRemoteStage) {
        macRemoteStage.getCameraStepOffset(stepCamOffset, stepLookOffset, viewportWidth);
      }
      currentStepCamOffset.lerp(stepCamOffset, Math.min(1, dt * 4.5));
      currentStepLookOffset.lerp(stepLookOffset, Math.min(1, dt * 4.5));

      camera.position.set(
        sampledPos.x + currentStepCamOffset.x * featuredWeight + pointerSmoothed.x * 0.14,
        sampledPos.y + currentStepCamOffset.y * featuredWeight + pointerSmoothed.y * 0.08,
        sampledPos.z + introZOffset + currentStepCamOffset.z * featuredWeight
      );

      finalLookTarget.set(
        sampledLook.x + currentStepLookOffset.x * featuredWeight,
        sampledLook.y + currentStepLookOffset.y * featuredWeight,
        sampledLook.z + currentStepLookOffset.z * featuredWeight
      );
      camera.lookAt(finalLookTarget);
    }

    // Keep accent lights tracking gracefully around active camera region
    primaryAccentLight.position.set(camera.position.x - 3.2, camera.position.y + 2.2, camera.position.z - 2.5);
    secondaryAccentLight.position.set(camera.position.x + 3.4, camera.position.y - 1.6, camera.position.z - 2.8);

    // Update Active Stations & Subtle Corridor Atmosphere
    heroMonolith.setPointer(pointerSmoothed.x, pointerSmoothed.y, Math.min(1, Math.hypot(pointerSmoothed.x, pointerSmoothed.y)));
    heroMonolith.update(elapsed, dt, pointerSmoothed, viewportWidth, viewportHeight, currentScrollT, isLegalMode);
    heroMonolith.syncTheme(lerpedColors, currentThemeMix);

    if (macRemoteStage) {
      macRemoteStage.update(elapsed, dt, pointerSmoothed, viewportWidth, currentScrollT);
      macRemoteStage.syncTheme(lerpedColors, currentThemeMix);
    }

    atmosphere.update(elapsed);
    atmosphere.syncTheme(lerpedColors, currentThemeMix);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(renderFrame);
  }

  rafId = requestAnimationFrame(renderFrame);

  return {
    isWebGL: true,
    setScrollProgress(t) {
      targetScrollT = Math.max(0, Math.min(1, Number(t) || 0));
    },
    setIntroProgress(p) {
      introProgress = Math.max(0, Math.min(1, Number(p) || 0));
    },
    setFeaturedStep(idx) {
      if (macRemoteStage) macRemoteStage.setStep(idx);
    },
    setFeaturedProgress(p) {
      if (macRemoteStage) macRemoteStage.setProgress(p);
    },
    setTheme(theme, colors = null) {
      updateTargetPalette(theme, colors);
    },
    setLanguage(lang) {
      if (macRemoteStage) macRemoteStage.setLanguage(lang);
    },
    setIotState() {},
    pulseProjectHover() {},
    getStationGroup(sectionId) {
      return stationGroups.get(sectionId) || null;
    },
    dispose() {
      isDisposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("portfolio:themechange", onThemeEvent);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      renderer.dispose();
    }
  };
}
