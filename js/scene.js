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
} from "./camera-path.js";
import { FEATURED_SCREENS, getActiveLang } from "./i18n.js";
import { getActiveTheme, getThemeSceneColors } from "./theme.js";

const MAC_SCREENSHOT_BASE =
  "https://raw.githubusercontent.com/ibrahimtemur/mac-remote-app/main/screenshots/";

const MAC_LOGO_URL = `${MAC_SCREENSHOT_BASE}logo.png`;

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

function createAvatarFallbackTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, "#102026");
  grad.addColorStop(0.55, "#162D33");
  grad.addColorStop(1, "#1B353C");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const glow = ctx.createRadialGradient(256, 220, 20, 256, 256, 230);
  glow.addColorStop(0, "rgba(60, 207, 192, 0.28)");
  glow.addColorStop(0.65, "rgba(242, 166, 90, 0.14)");
  glow.addColorStop(1, "rgba(14, 27, 32, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = "rgba(60, 207, 192, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 256, 128, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#F2F5F4";
  ctx.font = "700 72px Inter, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("İT", 256, 258);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createDevicePlaceholderTexture(kind, lang = "tr") {
  const canvas = document.createElement("canvas");

  if (kind === "icon") {
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, 512, 512);
    bg.addColorStop(0, "#102026");
    bg.addColorStop(1, "#183840");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 512);

    const halo = ctx.createRadialGradient(256, 256, 24, 256, 256, 230);
    halo.addColorStop(0, "rgba(60, 207, 192, 0.34)");
    halo.addColorStop(0.6, "rgba(242, 166, 90, 0.18)");
    halo.addColorStop(1, "rgba(14, 27, 32, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = "#3CCFC0";
    ctx.lineWidth = 14;
    drawRoundedRectPath(ctx, 108, 124, 296, 212, 28);
    ctx.stroke();

    ctx.strokeStyle = "#F2A65A";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(192, 384);
    ctx.lineTo(320, 384);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

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

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
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
   4. SCENE 01 — HERO 3D PORTRAIT MONOLITH (Custom GLSL Shader + Torus Rings)
   -------------------------------------------------------------------------- */
function createHeroMonolith(initialPalette, maxAnisotropy) {
  const group = new THREE.Group();
  group.name = "HeroMonolith";

  const fallbackTex = createAvatarFallbackTexture();
  const uniforms = {
    uMap: { value: fallbackTex },
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
    uPrimaryColor: { value: new THREE.Color(initialPalette.lightPrimary) },
    uSecondaryColor: { value: new THREE.Color(initialPalette.lightSecondary) },
    uBgColor: { value: new THREE.Color(initialPalette.bg) },
    uThemeMix: { value: initialPalette.isLight ? 1.0 : 0.0 },
    uOpacity: { value: 1.0 }
  };

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    "avatar.jpg?v=2",
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, maxAnisotropy);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      uniforms.uMap.value = tex;
      fallbackTex.dispose();
    },
    undefined,
    () => {
      /* keep crisp fallback texture on load error */
    }
  );

  // High-segment 48x48 portrait plane for tactile micro-surface wave
  const panelGeo = new THREE.PlaneGeometry(2.36, 2.36, 48, 48);
  const panelMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: true,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uHover;

      varying vec2 vUv;
      varying vec3 vViewNormal;
      varying vec3 vViewDir;
      varying float vRipple;

      void main() {
        vUv = uv;
        vec3 pos = position;

        vec2 p = uv - 0.5;
        vec2 pointerCenter = uPointer * 0.35;
        float distPtr = length(p - pointerCenter);

        float waveA = sin(p.x * 4.8 + uTime * 1.1) * cos(p.y * 4.4 - uTime * 0.85);
        float waveB = sin(distPtr * 10.0 - uTime * 2.1) * exp(-distPtr * 3.4);
        float disp = waveA * 0.024 + waveB * (0.022 + uHover * 0.014);

        // Taper displacement softly near corners so bezel alignment stays clean
        float edgeMask = smoothstep(0.55, 0.15, max(abs(p.x), abs(p.y)));
        pos.z += disp * edgeMask;

        // Analytical partial derivatives for smooth specular / Fresnel normal
        float dWaveX = cos(p.x * 4.8 + uTime * 1.1) * 4.8 * cos(p.y * 4.4 - uTime * 0.85) * 0.024;
        float dWaveY = -sin(p.x * 4.8 + uTime * 1.1) * sin(p.y * 4.4 - uTime * 0.85) * 4.4 * 0.024;
        vec3 localNormal = normalize(vec3(-dWaveX * edgeMask, -dWaveY * edgeMask, 1.0));

        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        vViewNormal = normalize(normalMatrix * localNormal);
        vViewDir = normalize(-mvPos.xyz);
        vRipple = waveB;

        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform vec3 uBgColor;
      uniform float uThemeMix;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vViewNormal;
      varying vec3 vViewDir;
      varying float vRipple;

      float sdRoundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }

      void main() {
        vec2 centered = vUv - 0.5;
        float dist = sdRoundedBox(centered, vec2(0.5), 0.145);
        float aa = max(fwidth(dist), 0.0025);
        float alphaMask = 1.0 - smoothstep(-aa, aa, dist);
        if (alphaMask < 0.004) discard;

        // Pointer-responsive parallax & subtle edge refraction
        float rimZone = smoothstep(-0.14, 0.0, dist);
        vec2 refractDir = normalize(centered + vec2(0.0001));
        vec2 parallaxUv = centered * 0.94 + 0.5;
        parallaxUv -= uPointer * 0.018;
        parallaxUv += refractDir * (rimZone * 0.012 + vRipple * 0.006);
        parallaxUv = clamp(parallaxUv, vec2(0.005), vec2(0.995));

        vec3 portrait = texture2D(uMap, parallaxUv).rgb;

        // Gentle studio vignette & theme contrast balance
        float radialVig = smoothstep(0.76, 0.24, length(centered));
        vec3 darkTone = mix(uBgColor * 0.65, portrait, 0.84 + radialVig * 0.16);
        vec3 lightTone = mix(portrait * 0.94, portrait, radialVig);
        vec3 baseCol = mix(darkTone, lightTone, uThemeMix);

        // View-dependent Fresnel + thin turquoise -> amber hairline rim
        vec3 N = normalize(vViewNormal);
        vec3 V = normalize(vViewDir);
        float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.9);

        float gradMix = clamp(vUv.x * 0.65 + (1.0 - vUv.y) * 0.35 + sin(uTime * 0.45) * 0.08, 0.0, 1.0);
        vec3 rimGradient = mix(uPrimaryColor, uSecondaryColor, gradMix);

        float edgeLine = exp(-abs(dist + 0.004) * 125.0);
        float rimBoost = mix(0.28, 0.22, uThemeMix);
        vec3 finalCol = baseCol + rimGradient * (fresnel * rimBoost + edgeLine * 0.40);

        // Subtle glass sheen across upper-left angle
        float sheen = pow(max(0.0, dot(N, normalize(vec3(-0.35, 0.55, 0.75)))), 14.0);
        finalCol += mix(vec3(0.06), vec3(0.04), uThemeMix) * sheen;

        gl_FragColor = vec4(finalCol, alphaMask * uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  });

  const panelMesh = new THREE.Mesh(panelGeo, panelMat);
  panelMesh.position.z = 0.04;
  group.add(panelMesh);

  // Subtle architectural backing plate behind the floating portrait
  const backGeo = new THREE.PlaneGeometry(2.42, 2.42);
  const backMat = new THREE.ShaderMaterial({
    uniforms: {
      uPrimaryColor: uniforms.uPrimaryColor,
      uSecondaryColor: uniforms.uSecondaryColor,
      uBgColor: uniforms.uBgColor,
      uThemeMix: uniforms.uThemeMix
    },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform vec3 uBgColor;
      uniform float uThemeMix;
      varying vec2 vUv;
      float sdRoundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }
      void main() {
        float d = sdRoundedBox(vUv - 0.5, vec2(0.5), 0.145);
        float alpha = (1.0 - smoothstep(-0.01, 0.01, d)) * mix(0.45, 0.22, uThemeMix);
        vec3 col = mix(uBgColor, mix(uPrimaryColor, uSecondaryColor, vUv.x), 0.12);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.z = -0.05;
  group.add(backMesh);

  // Slender Geometric Rings (TorusGeometry thickness 0.012 + precision LineLoop)
  const ringMatPrimary = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialPalette.lightPrimary),
    emissive: new THREE.Color(initialPalette.lightPrimary),
    emissiveIntensity: 0.28,
    metalness: 0.75,
    roughness: 0.25,
    transparent: true,
    opacity: 0.65
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.012, 16, 128), ringMatPrimary);
  ring1.position.z = -0.48;
  ring1.rotation.set(0.22, -0.18, 0.12);
  group.add(ring1);

  const ringMatSecondary = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialPalette.lightSecondary),
    emissive: new THREE.Color(initialPalette.lightSecondary),
    emissiveIntensity: 0.24,
    metalness: 0.72,
    roughness: 0.28,
    transparent: true,
    opacity: 0.52
  });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.94, 0.012, 16, 128), ringMatSecondary);
  ring2.position.z = -0.62;
  ring2.rotation.set(-0.24, 0.2, -0.2);
  group.add(ring2);

  // Outer precision wireframe hairline loop
  const loopPoints = [];
  const loopSegs = 128;
  for (let i = 0; i < loopSegs; i++) {
    const a = (i / loopSegs) * Math.PI * 2;
    loopPoints.push(new THREE.Vector3(Math.cos(a) * 2.26, Math.sin(a) * 2.26, -0.18));
  }
  const outerLoopGeo = new THREE.BufferGeometry().setFromPoints(loopPoints);
  const outerLoopMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(initialPalette.wire),
    transparent: true,
    opacity: 0.48
  });
  const outerLoop = new THREE.LineLoop(outerLoopGeo, outerLoopMat);
  outerLoop.rotation.set(0.18, 0.22, 0);
  group.add(outerLoop);

  // Hero Atmospheric Orbital Sparks (soft circular shader points)
  const sparkCount = 68;
  const sparkPositions = new Float32Array(sparkCount * 3);
  const sparkMix = new Float32Array(sparkCount);
  const sparkSizes = new Float32Array(sparkCount);
  const sparkPhases = new Float32Array(sparkCount);

  for (let i = 0; i < sparkCount; i++) {
    const theta = (i / sparkCount) * Math.PI * 2 + (i % 5) * 0.27;
    const radius = 1.55 + (i % 7) * 0.22;
    const y = ((i % 11) - 5) * 0.28;
    const z = ((i % 9) - 4) * 0.22 - 0.15;
    sparkPositions[i * 3] = Math.cos(theta) * radius;
    sparkPositions[i * 3 + 1] = Math.sin(theta) * (radius * 0.72) + y * 0.25;
    sparkPositions[i * 3 + 2] = z;
    sparkMix[i] = i % 3 === 0 ? 1.0 : 0.0;
    sparkSizes[i] = 10 + (i % 5) * 4;
    sparkPhases[i] = i * 0.618;
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
      uThemeMix: uniforms.uThemeMix
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
      varying float vAlpha;

      void main() {
        vMix = aMix;
        vec3 p = position;
        p.x += sin(uTime * 0.45 + aPhase) * 0.09;
        p.y += cos(uTime * 0.38 + aPhase * 1.3) * 0.11;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp((aSize * uPixelRatio) / max(1.0, -mv.z * 0.55), 2.0, 20.0);
        vAlpha = 0.45 + 0.35 * sin(uTime * 0.9 + aPhase);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform float uThemeMix;

      varying float vMix;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        float soft = smoothstep(0.5, 0.05, d);
        if (soft < 0.01) discard;
        vec3 col = mix(uPrimaryColor, uSecondaryColor, vMix);
        float alpha = soft * vAlpha * mix(0.75, 0.55, uThemeMix);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `
  });

  const sparks = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparks);

  return {
    group,
    uniforms,
    panelMesh,
    ring1,
    ring2,
    outerLoop,
    ringMatPrimary,
    ringMatSecondary,
    outerLoopMat,
    sparkMat,
    setPointer(nx, ny, hover = 0) {
      uniforms.uPointer.value.set(nx, ny);
      uniforms.uHover.value = hover;
    },
    update(time, dt, pointerTarget, viewportWidth, viewportHeight) {
      uniforms.uTime.value = time;

      // Responsive layout: scale down and center cleanly on mobile (< 768px)
      const isMobile = viewportWidth < 768;
      const aspect = viewportWidth / Math.max(1, viewportHeight);
      const targetScale = isMobile
        ? THREE.MathUtils.clamp(aspect * 0.76, 0.36, 0.48)
        : viewportWidth < 1100
        ? 0.82
        : 0.94;
      const targetPosX = isMobile ? 0.0 : pointerTarget.x * 0.14;
      const targetPosY = isMobile ? 0.02 : 0.08 + pointerTarget.y * 0.08;

      group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, Math.min(1, dt * 6)));
      group.position.x = THREE.MathUtils.lerp(group.position.x, targetPosX, Math.min(1, dt * 5));
      group.position.y = THREE.MathUtils.lerp(group.position.y, targetPosY, Math.min(1, dt * 5));

      const tiltX = isMobile ? 0.0 : -pointerTarget.y * 0.12;
      const tiltY = isMobile ? Math.sin(time * 0.4) * 0.06 : pointerTarget.x * 0.18;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, tiltX, Math.min(1, dt * 5));
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, tiltY, Math.min(1, dt * 5));

      // Gentle float & precision orbital drift
      panelMesh.position.y = Math.sin(time * 0.9) * 0.035;
      backMesh.position.y = panelMesh.position.y;

      ring1.rotation.z += dt * 0.16;
      ring1.rotation.x = 0.22 + Math.sin(time * 0.35) * 0.07;
      ring1.rotation.y = -0.18 + Math.cos(time * 0.28) * 0.07;
      ring2.rotation.z -= dt * 0.12;
      ring2.rotation.x = -0.24 + Math.cos(time * 0.3) * 0.07;
      ring2.rotation.y = 0.2 + Math.sin(time * 0.24) * 0.07;
      outerLoop.rotation.z += dt * 0.04;
    },
    syncTheme(lerpedColors, themeMix) {
      uniforms.uPrimaryColor.value.copy(lerpedColors.primary);
      uniforms.uSecondaryColor.value.copy(lerpedColors.secondary);
      uniforms.uBgColor.value.copy(lerpedColors.bg);
      uniforms.uThemeMix.value = themeMix;

      ringMatPrimary.color.copy(lerpedColors.primary);
      ringMatPrimary.emissive.copy(lerpedColors.primary);
      ringMatSecondary.color.copy(lerpedColors.secondary);
      ringMatSecondary.emissive.copy(lerpedColors.secondary);
      outerLoopMat.color.copy(lerpedColors.wire);
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
    clearcoatRoughness: 0.22
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
    roughness: 0.35
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

  // Subtle device detail (top earpiece pill on phone or subtle header bar on server)
  if (!isIcon && !isServer) {
    const pillGeo = new THREE.PlaneGeometry(0.26, 0.036);
    const pillMat = new THREE.MeshBasicMaterial({
      color: 0x162d33,
      transparent: true,
      opacity: 0.85
    });
    const pill = new THREE.Mesh(pillGeo, pillMat);
    pill.position.set(0, bodyH * 0.5 - bezelPadY * 0.42, bodyDepth * 0.5 + 0.021);
    slabGroup.add(pill);
  } else if (isServer) {
    const dotColors = [0xf2a65a, 0x7e9598, 0x3ccfc0];
    dotColors.forEach((hex, idx) => {
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.024, 16),
        new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.8 })
      );
      dot.position.set(
        -screenWidth * 0.5 + 0.1 + idx * 0.075,
        bodyH * 0.5 - bezelPadY * 0.5,
        bodyDepth * 0.5 + 0.021
      );
      slabGroup.add(dot);
    });
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
    uTime: { value: 0.0 }
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

        gl_FragColor = vec4(screenCol, mask);
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
    rimMat,
    uniforms: screenUniforms,
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
    },
    icon: createDevicePlaceholderTexture("icon", "tr")
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

  // 2. macOS PyQt6 Server Slab (740 : 1304 -> exact 2.27 x 4.0 units)
  const serverSlab = createPrecisionDeviceSlab({
    screenWidth: 2.27,
    screenHeight: 4.0,
    bezelPadX: 0.09,
    bezelPadY: 0.14,
    bodyDepth: 0.075,
    cornerRadius: 0.16,
    screenCornerRadius: 0.1,
    initialTexture: placeholders.server[activeLang],
    initialPalette,
    isServer: true
  });
  group.add(serverSlab.group);

  // 3. App Icon Floating Slab (512 x 512 -> 1:1 ratio)
  const iconSlab = createPrecisionDeviceSlab({
    screenWidth: 0.72,
    screenHeight: 0.72,
    bezelPadX: 0.04,
    bezelPadY: 0.04,
    bodyDepth: 0.045,
    cornerRadius: 0.18,
    screenCornerRadius: 0.15,
    initialTexture: placeholders.icon,
    initialPalette,
    isIcon: true
  });
  group.add(iconSlab.group);

  // 4. Procedural Flowing Turquoise -> Amber Light Bridge
  const lightBridge = createFlowingLightBridge(initialPalette);
  group.add(lightBridge.group);

  // Subtle architectural base floor ring under the showcase
  const basePts = [];
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    basePts.push(new THREE.Vector3(Math.cos(a) * 2.75, -2.25, Math.sin(a) * 1.75));
  }
  const baseRingGeo = new THREE.BufferGeometry().setFromPoints(basePts);
  const baseRingMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(initialPalette.wire),
    transparent: true,
    opacity: 0.42
  });
  const baseRing = new THREE.LineLoop(baseRingGeo, baseRingMat);
  group.add(baseRing);

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
      serverSlab.setTexture(tex, instant);
    });
    loadCachedTexture(MAC_LOGO_URL, placeholders.icon, (tex) => {
      iconSlab.setTexture(tex, true);
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
    // Step 0: Discovery & Connection -> tr1/en1 foreground + active light bridge
    {
      mobilePos: new THREE.Vector3(-1.52, 0.0, 0.86),
      mobileRot: new THREE.Euler(0.02, 0.22, 0.0),
      mobileScale: 0.94,
      mobileFocus: 1.0,
      serverPos: new THREE.Vector3(1.86, 0.06, -0.64),
      serverRot: new THREE.Euler(-0.02, -0.26, 0.0),
      serverScale: 0.86,
      serverFocus: 0.78,
      iconPos: new THREE.Vector3(0.14, 1.56, 0.65),
      bridgeIntensity: 1.0
    },
    // Step 1: Trackpad & Live Screen -> tr2/en2 glides to center stage
    {
      mobilePos: new THREE.Vector3(-0.56, -0.02, 1.24),
      mobileRot: new THREE.Euler(0.03, 0.05, 0.0),
      mobileScale: 1.0,
      mobileFocus: 1.0,
      serverPos: new THREE.Vector3(2.22, 0.1, -0.94),
      serverRot: new THREE.Euler(-0.02, -0.34, 0.0),
      serverScale: 0.8,
      serverFocus: 0.68,
      iconPos: new THREE.Vector3(0.95, 1.56, 0.45),
      bridgeIntensity: 0.9
    },
    // Step 2: macOS Server Control Panel -> mac_server_tr/en takes center foreground
    {
      mobilePos: new THREE.Vector3(-1.98, -0.06, -0.76),
      mobileRot: new THREE.Euler(0.02, 0.3, 0.0),
      mobileScale: 0.82,
      mobileFocus: 0.7,
      serverPos: new THREE.Vector3(1.04, 0.04, 1.16),
      serverRot: new THREE.Euler(0.02, -0.08, 0.0),
      serverScale: 1.0,
      serverFocus: 1.0,
      iconPos: new THREE.Vector3(-0.62, 1.54, 0.58),
      bridgeIntensity: 0.95
    }
  ];

  // Start immediately at Step 0 pose
  mobileSlab.group.position.copy(STEP_POSES[0].mobilePos);
  mobileSlab.group.rotation.copy(STEP_POSES[0].mobileRot);
  serverSlab.group.position.copy(STEP_POSES[0].serverPos);
  serverSlab.group.rotation.copy(STEP_POSES[0].serverRot);
  iconSlab.group.position.copy(STEP_POSES[0].iconPos);

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
    update(time, dt, pointerTarget, viewportWidth) {
      const pose = STEP_POSES[activeStep];
      const lerpAlpha = Math.min(1, dt * 5.2);

      // Responsive staging: fit neatly in right 66% on desktop, center cleanly on mobile/tablet (<821px)
      const isStackedLayout = viewportWidth < 821;
      const targetGroupScale =
        viewportWidth < 600
          ? 0.35
          : isStackedLayout
          ? 0.54
          : viewportWidth < 1200
          ? 0.78
          : 0.92;
      const targetGroupX = isStackedLayout ? -1.9 : 0.0;
      const targetGroupY = isStackedLayout ? -1.1 : 0.0;

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

      // Smooth mobile slab choreography + gentle hover float
      const floatA = Math.sin(time * 1.1) * 0.045;
      const floatB = Math.cos(time * 0.95) * 0.045;

      mobileSlab.group.position.x = THREE.MathUtils.lerp(
        mobileSlab.group.position.x,
        pose.mobilePos.x + pointerTarget.x * 0.08,
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

      // Smooth server slab choreography
      serverSlab.group.position.x = THREE.MathUtils.lerp(
        serverSlab.group.position.x,
        pose.serverPos.x + pointerTarget.x * 0.05,
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

      // App Icon floating badge
      iconSlab.group.position.x = THREE.MathUtils.lerp(
        iconSlab.group.position.x,
        pose.iconPos.x,
        lerpAlpha
      );
      iconSlab.group.position.y = THREE.MathUtils.lerp(
        iconSlab.group.position.y,
        pose.iconPos.y + Math.sin(time * 1.45) * 0.07,
        lerpAlpha
      );
      iconSlab.group.position.z = THREE.MathUtils.lerp(
        iconSlab.group.position.z,
        pose.iconPos.z,
        lerpAlpha
      );
      iconSlab.group.rotation.y = Math.sin(time * 0.8 + continuousProgress * 1.5) * 0.22;
      iconSlab.group.rotation.x = Math.cos(time * 0.7) * 0.06;

      mobileSlab.tick(time, dt);
      serverSlab.tick(time, dt);
      iconSlab.tick(time, dt);

      // Bridge endpoints stay locked to the inner edges of mobile & server slabs
      tmpStart.set(
        mobileSlab.group.position.x + 0.92 * mobileSlab.group.scale.x,
        mobileSlab.group.position.y - 0.1,
        mobileSlab.group.position.z + 0.04
      );
      tmpEnd.set(
        serverSlab.group.position.x - 1.12 * serverSlab.group.scale.x,
        serverSlab.group.position.y + 0.06,
        serverSlab.group.position.z + 0.04
      );
      lerpedBridgeIntensity = THREE.MathUtils.lerp(
        lerpedBridgeIntensity,
        pose.bridgeIntensity,
        lerpAlpha
      );
      lightBridge.update(time, tmpStart, tmpEnd, lerpedBridgeIntensity);

      baseRing.rotation.y = time * 0.05;
    },
    syncTheme(lerpedColors, themeMix) {
      [mobileSlab, serverSlab, iconSlab].forEach((slab) => {
        slab.bodyMat.color.lerpColors(darkBodyColor, lightBodyColor, themeMix);
        slab.rimMat.color.copy(lerpedColors.primary);
        slab.uniforms.uPrimaryColor.value.copy(lerpedColors.primary);
        slab.uniforms.uSecondaryColor.value.copy(lerpedColors.secondary);
      });

      baseRingMat.color.copy(lerpedColors.wire);
      lightBridge.syncTheme(lerpedColors);
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

function createPlaceholderStationMarker(station, initialPalette) {
  const group = new THREE.Group();
  group.name = `StationAnchor_${station.id}`;
  group.position.set(station.anchor[0], station.anchor[1], station.anchor[2]);

  // Subtle architectural locator hairline rings so stations 02/03/05/06/07 feel grounded in Phase 1
  const pts = [];
  const segs = 72;
  const r = station.index === 4 ? 1.55 : 1.85;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * (r * 0.42), 0));
  }
  const ringGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const ringMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(initialPalette.wire),
    transparent: true,
    opacity: 0.32
  });
  const ring = new THREE.LineLoop(ringGeo, ringMat);
  ring.rotation.set(0.32, station.index % 2 === 0 ? 0.24 : -0.24, 0);
  group.add(ring);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.012, 12, 72),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        station.index % 2 === 0 ? initialPalette.lightPrimary : initialPalette.lightSecondary
      ),
      transparent: true,
      opacity: 0.28
    })
  );
  innerRing.rotation.set(-0.25, 0.35, 0);
  group.add(innerRing);

  return {
    group,
    ringMat,
    innerMat: innerRing.material,
    isWarm: station.index % 2 !== 0,
    update(time, cameraZ = 0) {
      const dist = Math.abs(cameraZ - group.position.z);
      const vis = THREE.MathUtils.smoothstep(22.0 - dist, 0.0, 12.0);
      group.visible = vis > 0.01;
      if (!group.visible) return;
      ringMat.opacity = 0.34 * vis;
      innerRing.material.opacity = 0.28 * vis;
      ring.rotation.z = time * 0.06;
      innerRing.rotation.y = time * 0.12;
    },
    syncTheme(lerpedColors) {
      ringMat.color.copy(lerpedColors.wire);
      innerMatColor(innerRing.material, lerpedColors, this.isWarm);
    }
  };
}

function innerMatColor(mat, lerpedColors, isWarm) {
  mat.color.copy(isWarm ? lerpedColors.secondary : lerpedColors.primary);
}

/* --------------------------------------------------------------------------
   7. MASTER SCENE CONTROLLER EXPORT
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

export function initPortfolioScene() {
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

  // Station 01 — Hero Monolith
  const heroMonolith = createHeroMonolith(initialPalette, maxAnisotropy);
  heroMonolith.group.position.set(
    CAMERA_STATIONS[0].anchor[0],
    CAMERA_STATIONS[0].anchor[1],
    CAMERA_STATIONS[0].anchor[2]
  );
  scene.add(heroMonolith.group);
  stationGroups.set("scene-hero", heroMonolith.group);

  // Station 04 — Mac Remote Pinned 3D Stage
  const macRemoteStage = createMacRemoteStage(initialPalette, maxAnisotropy);
  macRemoteStage.group.position.set(
    CAMERA_STATIONS[3].anchor[0],
    CAMERA_STATIONS[3].anchor[1],
    CAMERA_STATIONS[3].anchor[2]
  );
  scene.add(macRemoteStage.group);
  stationGroups.set("scene-featured", macRemoteStage.group);

  // Placeholder Anchor Groups for Stations 02, 03, 05, 06, 07 (filled in Phase 2)
  const placeholderStations = [];
  [1, 2, 4, 5, 6].forEach((idx) => {
    const st = CAMERA_STATIONS[idx];
    const marker = createPlaceholderStationMarker(st, initialPalette);
    scene.add(marker.group);
    stationGroups.set(st.id, marker.group);
    placeholderStations.push(marker);
  });

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

    // Sample 7-station spline camera + apply Hero intro glide & Station 04 step focus
    cameraRig.sampleAt(currentScrollT, sampledPos, sampledLook);

    // Intro zoom glide affects camera Z smoothly near Hero (scrollT ~ 0)
    const heroWeight = Math.max(0, 1 - currentScrollT * 6.0);
    const easedIntro = 1 - Math.pow(1 - Math.max(0, Math.min(1, introProgress)), 3);
    const introZOffset = (HERO_INTRO_START_Z - HERO_INTRO_END_Z) * (1 - easedIntro) * heroWeight;

    // Station 04 step offset fades smoothly as camera enters/exits Station 04 (t = 0.5)
    const featuredDist = Math.abs(currentScrollT - 0.5);
    const featuredWeight = THREE.MathUtils.smoothstep(0.14 - featuredDist, 0.0, 0.14);
    macRemoteStage.getCameraStepOffset(stepCamOffset, stepLookOffset, viewportWidth);
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

    // Keep accent lights tracking gracefully around active camera region
    primaryAccentLight.position.set(camera.position.x - 3.2, camera.position.y + 2.2, camera.position.z - 2.5);
    secondaryAccentLight.position.set(camera.position.x + 3.4, camera.position.y - 1.6, camera.position.z - 2.8);

    // Update Stations & Atmospheric Field
    heroMonolith.setPointer(pointerSmoothed.x, pointerSmoothed.y, Math.min(1, Math.hypot(pointerSmoothed.x, pointerSmoothed.y)));
    heroMonolith.update(elapsed, dt, pointerSmoothed, viewportWidth, viewportHeight);
    heroMonolith.syncTheme(lerpedColors, currentThemeMix);

    macRemoteStage.update(elapsed, dt, pointerSmoothed, viewportWidth);
    macRemoteStage.syncTheme(lerpedColors, currentThemeMix);

    placeholderStations.forEach((st) => {
      st.update(elapsed, camera.position.z);
      st.syncTheme(lerpedColors);
    });

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
      macRemoteStage.setStep(idx);
    },
    setFeaturedProgress(p) {
      macRemoteStage.setProgress(p);
    },
    setTheme(theme, colors = null) {
      updateTargetPalette(theme, colors);
    },
    setLanguage(lang) {
      macRemoteStage.setLanguage(lang);
    },
    setIotState() {
      /* Phase 2 will drive Station 05 PCB relay & LED state visuals here */
    },
    pulseProjectHover() {
      /* Phase 2 will pulse Station 06 project orbit ring here */
    },
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
