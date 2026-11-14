/**
 * VYRN — Autonomous Agent Swarm Startup Sequence
 * A tactile toolbox drops in and spills 5 large stylized cursor agents
 * (with hats, headphones, tracking eyes, and a waving Progress Pride Flag)
 * that build the VYRN interface in 1:1 DOM alignment and bleed watercolor ink
 * through the "VYRN" letterforms before handing off to the live page.
 */
(function initSwarmBootModule() {
  'use strict';

  window.__vyrnSwarmInit = true;

  const TOTAL_DURATION_MS = 3950;
  const FAILSAFE_TIMEOUT_MS = 6800;

  const PALETTE = {
    bg: '#090b0e',
    cyan: '#00f0ff',
    pink: '#ff3b69',
    amber: '#f59e0b',
    lime: '#a3e635',
    blue: '#38bdf8',
    white: '#ffffff',
  };

  const AGENT_SPECS = [
    {
      id: 'architect',
      label: 'ARCHITECT',
      color: PALETTE.cyan,
      glowKey: 'cyan',
      spillVx: -210,
      spillVy: -360,
      spillDelay: 0.075,
    },
    {
      id: 'synth',
      label: 'SYNTH',
      color: PALETTE.amber,
      glowKey: 'amber',
      spillVx: -95,
      spillVy: -430,
      spillDelay: 0.095,
    },
    {
      id: 'shader',
      label: 'SHADER',
      color: PALETTE.pink,
      glowKey: 'pink',
      spillVx: 15,
      spillVy: -460,
      spillDelay: 0.115,
    },
    {
      id: 'motion',
      label: 'MOTION',
      color: PALETTE.lime,
      glowKey: 'lime',
      spillVx: 120,
      spillVy: -400,
      spillDelay: 0.135,
    },
    {
      id: 'compiler',
      label: 'COMPILER',
      color: PALETTE.blue,
      glowKey: 'blue',
      spillVx: 225,
      spillVy: -350,
      spillDelay: 0.155,
    },
  ];

  const PRIDE_STRIPES = [
    '#e40303', // Red
    '#ff8c00', // Orange
    '#ffed00', // Yellow
    '#008026', // Green
    '#004dff', // Blue
    '#750787', // Violet
  ];

  /* --- Math & Easing Helpers --- */
  const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeOutBack = (t) => {
    const x = clamp(t, 0, 1);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };
  const easeInOutCubic = (t) => {
    const x = clamp(t, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  /* --- Discrete Display Exit Support Probe (Chrome/Safari/Edge vs Firefox) --- */
  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS || !CSS.supports || !CSS.supports('transition-behavior', 'allow-discrete') || !document.body) {
      supportsDisplayTransition = false;
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block; position: fixed; visibility: hidden; pointer-events: none;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  /* --- Pre-rendered Additive Glow Sprites & Soft Watercolor Ink Brush Stamp --- */
  function createGlowSprites() {
    const colors = {
      cyan: [0, 240, 255],
      pink: [255, 59, 105],
      amber: [245, 158, 11],
      lime: [163, 230, 53],
      blue: [56, 189, 248],
      white: [255, 255, 255],
    };
    const cache = {};
    const size = 64;
    const half = size / 2;

    Object.entries(colors).forEach(([key, [r, g, b]]) => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const gctx = c.getContext('2d');
      if (!gctx) return;

      const grad = gctx.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
      grad.addColorStop(0.28, `rgba(${r}, ${g}, ${b}, 0.42)`);
      grad.addColorStop(0.62, `rgba(${r}, ${g}, ${b}, 0.1)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      gctx.fillStyle = grad;
      gctx.fillRect(0, 0, size, size);
      cache[key] = c;
    });

    // Organic feathered ink bleed stamp for watercolor glyph mask reveal
    const inkStamp = document.createElement('canvas');
    inkStamp.width = 96;
    inkStamp.height = 96;
    const ictx = inkStamp.getContext('2d');
    if (ictx) {
      const ig = ictx.createRadialGradient(48, 48, 8, 48, 48, 48);
      ig.addColorStop(0, 'rgba(255, 255, 255, 1)');
      ig.addColorStop(0.58, 'rgba(255, 255, 255, 0.96)');
      ig.addColorStop(0.82, 'rgba(255, 255, 255, 0.55)');
      ig.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ictx.fillStyle = ig;
      ictx.fillRect(0, 0, 96, 96);
    }
    cache.inkStamp = inkStamp;

    return cache;
  }

  /* --- Rounded Rect Geometry Helpers --- */
  function pointOnRoundedRect(rect, progress) {
    const x = rect.left;
    const y = rect.top;
    const w = rect.width;
    const h = rect.height;
    const r = Math.min(rect.radius || 12, w * 0.5, h * 0.5);
    const p = ((progress % 1) + 1) % 1;

    const straightW = Math.max(1, w - 2 * r);
    const straightH = Math.max(1, h - 2 * r);
    const arcLen = Math.PI * r * 0.5;
    const total = 2 * (straightW + straightH) + 4 * arcLen;
    let d = p * total;

    if (d <= straightW) return { x: x + r + d, y };
    d -= straightW;
    if (d <= arcLen) {
      const a = -Math.PI / 2 + (d / arcLen) * (Math.PI / 2);
      return { x: x + w - r + Math.cos(a) * r, y: y + r + Math.sin(a) * r };
    }
    d -= arcLen;
    if (d <= straightH) return { x: x + w, y: y + r + d };
    d -= straightH;
    if (d <= arcLen) {
      const a = (d / arcLen) * (Math.PI / 2);
      return { x: x + w - r + Math.cos(a) * r, y: y + h - r + Math.sin(a) * r };
    }
    d -= arcLen;
    if (d <= straightW) return { x: x + w - r - d, y: y + h };
    d -= straightW;
    if (d <= arcLen) {
      const a = Math.PI / 2 + (d / arcLen) * (Math.PI / 2);
      return { x: x + r + Math.cos(a) * r, y: y + h - r + Math.sin(a) * r };
    }
    d -= arcLen;
    if (d <= straightH) return { x, y: y + h - r - d };
    d -= straightH;
    const a = Math.PI + (d / Math.max(1, arcLen)) * (Math.PI / 2);
    return { x: x + r + Math.cos(a) * r, y: y + r + Math.sin(a) * r };
  }

  function traceRoundedRect(ctx, x, y, w, h, radius) {
    const r = Math.min(radius, w * 0.5, h * 0.5);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  }

  function drawCornerBrackets(ctx, rect, len, color, alpha) {
    if (alpha <= 0.01) return;
    const { left: x, top: y, width: w, height: h } = rect;
    const l = Math.min(len, w * 0.3, h * 0.4);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(x, y + l); ctx.lineTo(x, y); ctx.lineTo(x + l, y);
    ctx.moveTo(x + w - l, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + l);
    ctx.moveTo(x + w, y + h - l); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - l, y + h);
    ctx.moveTo(x + l, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - l);
    ctx.stroke();
    ctx.restore();
  }

  /* --- Expressive Character Drawing Helpers --- */
  function drawTrackingEyes(ctx, lx, ly, rx, ry, lookAngle, blinkAmount, radius = 4.2) {
    const pupilDx = Math.cos(lookAngle) * (radius * 0.36);
    const pupilDy = Math.sin(lookAngle) * (radius * 0.36);
    const eyeScaleY = clamp(1 - blinkAmount, 0.12, 1);

    [
      [lx, ly],
      [rx, ry],
    ].forEach(([ex, ey]) => {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.scale(1, eyeScaleY);

      // Glossy sclera with subtle brow shadow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 0.3, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Tracking iris/pupil
      if (eyeScaleY > 0.35) {
        ctx.fillStyle = '#090b0e';
        ctx.beginPath();
        ctx.arc(pupilDx, pupilDy, radius * 0.54, 0, Math.PI * 2);
        ctx.fill();

        // Catchlight sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pupilDx - radius * 0.18, pupilDy - radius * 0.22, radius * 0.21, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawProgressPrideFlag(ctx, x, y, w, h, wavePhase) {
    const waveY = (u) => Math.sin(wavePhase + u * 5.2) * (1.4 + u * 3.4);
    const segs = 12;

    const traceFlagCloth = () => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let i = 1; i <= segs; i++) {
        const u = i / segs;
        ctx.lineTo(x + u * w, y + waveY(u));
      }
      for (let i = segs; i >= 0; i--) {
        const u = i / segs;
        ctx.lineTo(x + u * w, y + h + waveY(u));
      }
      ctx.closePath();
    };

    ctx.save();
    // Sleek metallic flagpole mast
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x, y + h + 11);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y - 4, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Clip to smoothly rippling flag cloth silhouette
    traceFlagCloth();
    ctx.save();
    ctx.clip();

    // 1. Six rainbow stripes following the cloth wave
    const stripeH = h / PRIDE_STRIPES.length;
    for (let s = 0; s < PRIDE_STRIPES.length; s++) {
      ctx.fillStyle = PRIDE_STRIPES[s];
      ctx.beginPath();
      const topOff = s * stripeH;
      const botOff = (s + 1) * stripeH + 0.6;
      ctx.moveTo(x, y + topOff);
      for (let i = 1; i <= segs; i++) {
        const u = i / segs;
        ctx.lineTo(x + u * w, y + topOff + waveY(u));
      }
      for (let i = segs; i >= 0; i--) {
        const u = i / segs;
        ctx.lineTo(x + u * w, y + botOff + waveY(u));
      }
      ctx.closePath();
      ctx.fill();
    }

    // 2. Progress Pride hoist chevron (Black, Brown, Light Blue, Pink, White)
    const chevLayers = [
      { apex: w * 0.56, color: '#111317' },
      { apex: w * 0.47, color: '#613915' },
      { apex: w * 0.38, color: '#73d7ee' },
      { apex: w * 0.29, color: '#ffaec9' },
      { apex: w * 0.20, color: '#ffffff' },
    ];
    const midY = y + h * 0.5;
    chevLayers.forEach((layer) => {
      const u = clamp(layer.apex / w, 0, 1);
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(x - 1, y - 3);
      ctx.lineTo(x + layer.apex, midY + waveY(u));
      ctx.lineTo(x - 1, y + h + 3);
      ctx.closePath();
      ctx.fill();
    });

    // Dynamic cloth fold highlights matching wave slope
    for (let i = 0; i < segs; i++) {
      const u0 = i / segs;
      const u1 = (i + 1) / segs;
      const slope = waveY(u1) - waveY(u0);
      const foldAlpha = clamp(Math.abs(slope) * 0.085, 0, 0.22);
      if (foldAlpha > 0.01) {
        ctx.fillStyle = slope < 0 ? `rgba(255,255,255,${foldAlpha.toFixed(3)})` : `rgba(0,0,0,${(foldAlpha * 1.15).toFixed(3)})`;
        ctx.fillRect(x + u0 * w, y - 6, w / segs + 0.5, h + 12);
      }
    }

    ctx.restore();

    // Crisp rim outline on wavy flag cloth
    traceFlagCloth();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.restore();
  }

  /* --- Main Swarm Controller --- */
  function createSwarmController() {
    const overlay = document.getElementById('swarm-startup');
    const canvas = document.getElementById('swarm-canvas');

    if (!overlay || !canvas) return null;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      document.documentElement.classList.remove('swarm-booting');
      return null;
    }

    const glowSprites = createGlowSprites();

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let rafId = null;
    let failsafeTimer = null;
    let isRunning = false;
    let clockStartedAt = null;
    let lastTickTime = 0;

    let targets = null;
    let glyphData = null;
    let agents = [];
    let sparks = [];

    function measureTargets() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, vw <= 640 ? 1.5 : 2);

      canvas.width = Math.max(1, Math.floor(vw * dpr));
      canvas.height = Math.max(1, Math.floor(vh * dpr));

      const toRect = (el, radius = 14) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return null;
        return {
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          cx: r.left + r.width * 0.5,
          cy: r.top + r.height * 0.5,
          radius,
        };
      };

      const navEl = document.getElementById('nav-pill');
      const brandEl = navEl ? navEl.querySelector('.brand-signature') : null;
      const navLinks = navEl ? Array.from(navEl.querySelectorAll('.nav-item')) : [];
      const discordBtn = navEl ? navEl.querySelector('.nav-btn--discord') : null;
      const bmacBtn = navEl ? navEl.querySelector('.nav-btn--bmac') : null;

      const eyebrowEl = document.querySelector('.hero-eyebrow');
      const titleEl = document.querySelector('.hero-title-giant');
      const pillAudioEl = document.querySelector('.hero-glass-pill--audio');
      const pillVideoEl = document.querySelector('.hero-glass-pill--video');
      const pillCodeEl = document.querySelector('.hero-glass-pill--code');
      const taglineEl = document.querySelector('.hero-tagline');
      const ctaEls = Array.from(document.querySelectorAll('.hero-cta-group .pill-btn'));

      let titleRect = toRect(titleEl, 8);
      let yOffset = 0;

      if (titleRect && (titleRect.bottom < 40 || titleRect.top > vh - 40)) {
        yOffset = vh * 0.44 - titleRect.cy;
      }

      const shiftRect = (r) => {
        if (!r || yOffset === 0) return r;
        return { ...r, top: r.top + yOffset, cy: r.cy + yOffset };
      };

      titleRect = shiftRect(titleRect) || {
        left: vw * 0.15,
        top: vh * 0.3,
        width: vw * 0.7,
        height: Math.min(240, vw * 0.2),
        cx: vw * 0.5,
        cy: vh * 0.42,
        radius: 8,
      };

      const titleStyle = titleEl ? window.getComputedStyle(titleEl) : null;

      targets = {
        nav: toRect(navEl, 0) || { left: 0, top: 0, width: vw, height: 64, cx: vw * 0.5, cy: 32, radius: 0 },
        brand: toRect(brandEl, 8),
        navLinks: navLinks.map((el) => toRect(el, 999)).filter(Boolean),
        navActions: [toRect(discordBtn, 999), toRect(bmacBtn, 999)].filter(Boolean),
        eyebrow: shiftRect(toRect(eyebrowEl, 999)),
        title: titleRect,
        titleFont: {
          weight: titleStyle ? titleStyle.fontWeight : '800',
          size: titleStyle ? parseFloat(titleStyle.fontSize) || Math.min(260, vw * 0.2) : Math.min(260, vw * 0.2),
          family: titleStyle ? titleStyle.fontFamily : 'Syne, sans-serif',
          letterSpacing: titleStyle ? titleStyle.letterSpacing : '-0.055em',
        },
        pills: [
          { rect: shiftRect(toRect(pillAudioEl, 999)), label: 'AUDIO', color: PALETTE.pink, glowKey: 'pink', tilt: -0.03 },
          { rect: shiftRect(toRect(pillVideoEl, 999)), label: 'VIDEO', color: PALETTE.cyan, glowKey: 'cyan', tilt: 0.03 },
          { rect: shiftRect(toRect(pillCodeEl, 999)), label: 'CODE', color: PALETTE.amber, glowKey: 'amber', tilt: 0.02 },
        ].filter((p) => p.rect),
        tagline: shiftRect(toRect(taglineEl, 12)),
        ctas: ctaEls.map((el, idx) => ({
          rect: shiftRect(toRect(el, 999)),
          solid: idx === 0,
        })).filter((c) => c.rect),
        toolbox: {
          x: titleRect.cx,
          y: clamp(titleRect.cy + 14, 150, vh - 150),
        },
      };
    }

    function buildGlyphData() {
      if (!targets || !targets.title) return;
      const tr = targets.title;
      const tf = targets.titleFont;

      const w = Math.max(120, Math.round(tr.width));
      const h = Math.max(60, Math.round(tr.height));

      // 1. Exact Syne-800 glyph alpha mask
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = w;
      maskCanvas.height = h;
      const mctx = maskCanvas.getContext('2d');
      if (!mctx) return;

      mctx.clearRect(0, 0, w, h);
      mctx.font = `${tf.weight} ${tf.size}px ${tf.family}`;
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      if ('letterSpacing' in mctx && tf.letterSpacing && tf.letterSpacing !== 'normal') {
        mctx.letterSpacing = tf.letterSpacing;
      }
      mctx.fillStyle = '#ffffff';
      mctx.fillText('VYRN', w * 0.5, h * 0.5);

      // 2. Multi-spectral watercolor gradient fill masked cleanly to "VYRN"
      const fillCanvas = document.createElement('canvas');
      fillCanvas.width = w;
      fillCanvas.height = h;
      const fctx = fillCanvas.getContext('2d');
      if (fctx) {
        fctx.drawImage(maskCanvas, 0, 0);
        fctx.globalCompositeOperation = 'source-in';
        const grad = fctx.createLinearGradient(0, 0, w, h * 0.85);
        grad.addColorStop(0, '#ff2a5f');
        grad.addColorStop(0.24, '#ff5c8a');
        grad.addColorStop(0.46, '#00e5ff');
        grad.addColorStop(0.62, '#f8fafc');
        grad.addColorStop(0.82, '#fbbf24');
        grad.addColorStop(1, '#ff2a5f');
        fctx.fillStyle = grad;
        fctx.fillRect(0, 0, w, h);
      }

      // 3. Dedicated offscreen canvas for organic ink-bleed compositing
      const inkCanvas = document.createElement('canvas');
      inkCanvas.width = w;
      inkCanvas.height = h;
      const inkCtx = inkCanvas.getContext('2d');

      // 4. Sample glyph contour edges + interior ink-bleed anchor seeds
      const step = vw <= 640 ? 5 : Math.max(5, Math.round(w / 108));
      const img = mctx.getImageData(0, 0, w, h).data;
      const isOpaque = (px, py) => {
        if (px < 0 || py < 0 || px >= w || py >= h) return false;
        return img[(py * w + px) * 4 + 3] > 120;
      };

      const edges = [];
      const interiorPts = [];
      const accentColors = [PALETTE.cyan, PALETTE.pink, PALETTE.amber, PALETTE.white];
      for (let py = step; py < h - step; py += step) {
        for (let px = step; px < w - step; px += step) {
          if (!isOpaque(px, py)) continue;
          const onBoundary =
            !isOpaque(px - step, py) ||
            !isOpaque(px + step, py) ||
            !isOpaque(px, py - step) ||
            !isOpaque(px, py + step);
          if (onBoundary) {
            const normX = px / w;
            const colorIdx = (Math.floor(normX * 4) + (py % 2)) % accentColors.length;
            edges.push({
              lx: px,
              ly: py,
              x: tr.left + px,
              y: tr.top + py,
              normX,
              color: accentColors[colorIdx],
              glowKey: normX < 0.3 ? 'pink' : normX < 0.62 ? 'cyan' : normX < 0.85 ? 'amber' : 'white',
            });
          } else {
            interiorPts.push({ lx: px, ly: py, normX: px / w });
          }
        }
      }

      edges.sort((a, b) => a.normX - b.normX || a.ly - b.ly);

      // Build wireframe triangulation struts along contour
      const maxLinkDist = step * 2.45;
      const maxDistSq = maxLinkDist * maxLinkDist;
      const links = [];
      for (let i = 0; i < edges.length; i++) {
        let count = 0;
        for (let j = i + 1; j < edges.length && count < 3; j++) {
          const dx = edges[j].lx - edges[i].lx;
          if (dx > maxLinkDist) break;
          const dy = edges[j].ly - edges[i].ly;
          if (dx * dx + dy * dy <= maxDistSq) {
            links.push([i, j]);
            count++;
          }
        }
      }

      // Pick ~22 organic ink-bleed seed drops distributed across V-Y-R-N strokes
      const inkSeeds = [];
      const seedPool = interiorPts.length >= 24 ? interiorPts : edges;
      if (seedPool.length > 0) {
        const seedCount = Math.min(22, seedPool.length);
        for (let i = 0; i < seedCount; i++) {
          const idx = Math.floor((i / seedCount) * seedPool.length + ((i % 3) * 0.13)) % seedPool.length;
          const pt = seedPool[idx];
          const baseRadius = Math.max(54, Math.min(148, h * (0.45 + (i % 4) * 0.1)));
          const lobes = [
            { dx: 0, dy: 0, rScale: 1.0 },
            { dx: Math.cos(i * 1.9) * baseRadius * 0.34, dy: Math.sin(i * 1.9) * baseRadius * 0.28, rScale: 0.78 },
            { dx: Math.cos(i * 3.1 + 1.4) * baseRadius * 0.38, dy: Math.sin(i * 3.1 + 1.4) * baseRadius * 0.32, rScale: 0.72 },
            { dx: Math.cos(i * 4.7 + 2.8) * baseRadius * 0.26, dy: Math.sin(i * 4.7 + 2.8) * baseRadius * 0.34, rScale: 0.65 },
          ];
          inkSeeds.push({
            lx: pt.lx,
            ly: pt.ly,
            x: tr.left + pt.lx,
            y: tr.top + pt.ly,
            triggerP: 0.33 + (pt.normX * 0.19) + ((i % 3) * 0.015),
            maxRadius: baseRadius,
            lobes,
          });
        }
      }

      glyphData = {
        w,
        h,
        fillCanvas,
        inkCanvas,
        inkCtx,
        edges,
        links,
        inkSeeds,
      };
    }

    function initSwarmEntities() {
      const tb = targets ? targets.toolbox : { x: vw * 0.5, y: vh * 0.48 };

      agents = AGENT_SPECS.map((spec, idx) => ({
        ...spec,
        index: idx,
        x: tb.x + (idx - 2) * 8,
        y: tb.y - 6,
        vx: spec.spillVx,
        vy: spec.spillVy,
        tilt: 0,
        lookAngle: -Math.PI * 0.5,
        blinkTimer: 1.1 + idx * 0.55,
        trail: [],
        targetX: tb.x,
        targetY: tb.y - 80,
        laserTarget: null,
        spilled: false,
        thrustersActive: false,
        propellerAngle: idx * 0.7,
        flagPhase: idx * 1.2,
      }));

      sparks = [];
    }

    function spawnSpark(x, y, color, count = 2) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 35 + Math.random() * 95;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 35,
          color,
          life: 1,
          decay: 1.9 + Math.random() * 1.3,
        });
      }
    }

    function updateAgentTargets(p, elapsedSec) {
      if (!targets) return;
      const tr = targets.title;
      const nav = targets.nav;
      const pills = targets.pills;

      agents.forEach((ag, idx) => {
        ag.laserTarget = null;

        // Release each agent out of the open toolbox cleanly
        if (!ag.spilled && p >= ag.spillDelay) {
          ag.spilled = true;
          ag.x = targets.toolbox.x + (idx - 2) * 9;
          ag.y = targets.toolbox.y - 10;
          ag.vx = ag.spillVx;
          ag.vy = ag.spillVy;
          spawnSpark(ag.x, ag.y, ag.color, 4);
        }

        // Engage steering thrusters after parabolic tumble peak
        if (ag.spilled && !ag.thrustersActive && p >= ag.spillDelay + 0.095) {
          ag.thrustersActive = true;
        }

        // Phase 4: Cheerful outward exit sweep past viewport edges
        if (p >= 0.88) {
          const scatter = (p - 0.88) / 0.12;
          const outAngle = Math.atan2(ag.y - tr.cy, ag.x - tr.cx);
          const dist = Math.max(vw, vh) * (0.68 + scatter * 0.55);
          ag.targetX = tr.cx + Math.cos(outAngle) * dist;
          ag.targetY = tr.cy + Math.sin(outAngle) * dist;
          return;
        }

        // Phase 3: Victory orbit formation around the finished centerpiece
        if (p >= 0.76) {
          const orbitAngle = (idx / agents.length) * Math.PI * 2 + elapsedSec * 1.15;
          const rx = Math.min(vw * 0.36, tr.width * 0.54 + 68);
          const ry = Math.min(vh * 0.27, tr.height * 0.75 + 56);
          ag.targetX = tr.cx + Math.cos(orbitAngle) * rx;
          ag.targetY = tr.cy + Math.sin(orbitAngle) * ry;
          return;
        }

        // Phase 1 & 2: Specialized UI construction assignments
        switch (ag.id) {
          case 'architect': {
            if (p < 0.41) {
              const tNav = smoothstep(0.18, 0.40, p);
              const sweepX = lerp(nav.left + 36, nav.left + nav.width - 36, tNav);
              ag.targetX = sweepX;
              ag.targetY = nav.cy + Math.sin(elapsedSec * 6.5) * 12 + 42;
              ag.laserTarget = { x: sweepX, y: nav.cy };
            } else {
              const videoPill = pills[1] || pills[0];
              if (videoPill) {
                const pt = pointOnRoundedRect(videoPill.rect, (elapsedSec * 0.85) % 1);
                ag.targetX = pt.x + 36;
                ag.targetY = pt.y - 32;
                ag.laserTarget = pt;
              } else {
                ag.targetX = tr.left + tr.width * 0.68;
                ag.targetY = tr.top - 42;
              }
            }
            break;
          }
          case 'synth': {
            if (p < 0.34 && targets.eyebrow) {
              const pt = pointOnRoundedRect(targets.eyebrow, smoothstep(0.18, 0.33, p));
              ag.targetX = pt.x - 36;
              ag.targetY = pt.y - 28;
              ag.laserTarget = pt;
            } else if (p < 0.69 && glyphData && glyphData.edges.length > 0) {
              const buildT = smoothstep(0.30, 0.67, p);
              const edgeIdx = Math.min(glyphData.edges.length - 1, Math.floor(buildT * glyphData.edges.length));
              const edgePt = glyphData.edges[edgeIdx];
              ag.targetX = edgePt.x - 30 + Math.sin(elapsedSec * 5.2) * 26;
              ag.targetY = edgePt.y - 52 + Math.cos(elapsedSec * 4.5) * 18;
              ag.laserTarget = edgePt;
            } else if (pills[2]) {
              const pt = pointOnRoundedRect(pills[2].rect, (elapsedSec * 1.05) % 1);
              ag.targetX = pt.x + 34;
              ag.targetY = pt.y + 34;
              ag.laserTarget = pt;
            }
            break;
          }
          case 'shader': {
            // Progress Pride Flag artist — sweeps across VYRN planting watercolor ink blooms
            if (p < 0.36) {
              const a = elapsedSec * 2.1;
              ag.targetX = tr.cx + Math.cos(a) * Math.min(vw * 0.28, tr.width * 0.38);
              ag.targetY = tr.cy - 44 + Math.sin(a) * 34;
              ag.laserTarget = { x: tr.cx + Math.cos(a + 0.5) * 60, y: tr.cy };
            } else if (p < 0.70) {
              const bleedT = smoothstep(0.36, 0.68, p);
              const targetX = lerp(tr.left + 20, tr.left + tr.width - 20, bleedT);
              const targetY = tr.cy + Math.sin(bleedT * Math.PI * 4.5) * (tr.height * 0.28);
              ag.targetX = targetX - 24;
              ag.targetY = tr.top + tr.height + 46 + Math.sin(elapsedSec * 5) * 16;
              ag.laserTarget = { x: targetX, y: targetY };
            } else if (pills[0]) {
              const pt = pointOnRoundedRect(pills[0].rect, (elapsedSec * 1.1) % 1);
              ag.targetX = pt.x - 42;
              ag.targetY = pt.y - 30;
              ag.laserTarget = pt;
            }
            break;
          }
          case 'motion': {
            if (p < 0.58 && pills[0]) {
              const pill = pills[p < 0.42 ? 0 : 1] || pills[0];
              const pt = pointOnRoundedRect(pill.rect, (elapsedSec * 1.15) % 1);
              ag.targetX = pt.x - 40;
              ag.targetY = pt.y + 32;
              ag.laserTarget = pt;
            } else if (pills[2]) {
              const pt = pointOnRoundedRect(pills[2].rect, (elapsedSec * 1.15) % 1);
              ag.targetX = pt.x + 36;
              ag.targetY = pt.y + 34;
              ag.laserTarget = pt;
            } else {
              ag.targetX = tr.cx + Math.cos(elapsedSec * 2.2) * 170;
              ag.targetY = tr.cy + Math.sin(elapsedSec * 2.2) * 95;
            }
            break;
          }
          case 'compiler': {
            if (p < 0.42 && targets.navActions.length > 0) {
              const act = targets.navActions[Math.floor(elapsedSec * 2.5) % targets.navActions.length];
              const pt = pointOnRoundedRect(act, (elapsedSec * 1.3) % 1);
              ag.targetX = pt.x - 28;
              ag.targetY = pt.y + 42;
              ag.laserTarget = pt;
            } else if (p < 0.64 && targets.tagline) {
              const tTag = smoothstep(0.42, 0.62, p);
              const lx = lerp(targets.tagline.left, targets.tagline.left + targets.tagline.width, tTag);
              ag.targetX = lx;
              ag.targetY = targets.tagline.top - 30;
              ag.laserTarget = { x: lx, y: targets.tagline.cy };
            } else if (targets.ctas.length > 0) {
              const cta = targets.ctas[p > 0.69 && targets.ctas[1] ? 1 : 0];
              const pt = pointOnRoundedRect(cta.rect, (elapsedSec * 1.2) % 1);
              ag.targetX = pt.x + 24;
              ag.targetY = pt.y + 38;
              ag.laserTarget = pt;
            }
            break;
          }
        }
      });
    }

    function stepPhysics(p, dt) {
      const stiffness = 24;
      const damping = 8.0;
      const gravity = 1150;

      agents.forEach((ag) => {
        ag.propellerAngle += dt * 22;
        ag.flagPhase += dt * 9.5;
        ag.blinkTimer -= dt;
        if (ag.blinkTimer <= -0.14) {
          ag.blinkTimer = 1.6 + Math.random() * 2.2;
        }

        if (!ag.spilled) return;

        if (!ag.thrustersActive) {
          // Ballistic gravity arc right out of the toolbox
          ag.vy += gravity * dt;
          ag.x += ag.vx * dt;
          ag.y += ag.vy * dt;
        } else {
          // Spring-damped autonomous flight
          const ax = (ag.targetX - ag.x) * stiffness - ag.vx * damping;
          const ay = (ag.targetY - ag.y) * stiffness - ag.vy * damping;
          ag.vx += ax * dt;
          ag.vy += ay * dt;
          ag.x += ag.vx * dt;
          ag.y += ag.vy * dt;
        }

        // Subtle aerodynamic bank tilt matching horizontal velocity
        const desiredTilt = clamp(ag.vx * 0.0009, -0.34, 0.34);
        ag.tilt = lerp(ag.tilt, desiredTilt, Math.min(1, dt * 10));

        // Eyes track laser target if actively building, otherwise velocity direction
        let desiredLook = ag.lookAngle;
        if (ag.laserTarget) {
          desiredLook = Math.atan2(ag.laserTarget.y - ag.y, ag.laserTarget.x - ag.x);
        } else if (ag.vx * ag.vx + ag.vy * ag.vy > 40) {
          desiredLook = Math.atan2(ag.vy, ag.vx);
        }
        let lookDiff = desiredLook - ag.lookAngle;
        while (lookDiff > Math.PI) lookDiff -= Math.PI * 2;
        while (lookDiff < -Math.PI) lookDiff += Math.PI * 2;
        ag.lookAngle += lookDiff * Math.min(1, dt * 14);

        ag.trail.push({ x: ag.x, y: ag.y });
        if (ag.trail.length > 18) ag.trail.shift();

        if (ag.laserTarget && Math.random() < dt * 11) {
          spawnSpark(ag.laserTarget.x, ag.laserTarget.y, ag.color, 1);
        }
      });

      // Step welding sparks with soft gravity & air drag
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vy += 220 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.life -= s.decay * dt;
        if (s.life <= 0) sparks.splice(i, 1);
      }
    }

    function drawGlow(x, y, radius, glowKey, alpha) {
      const sprite = glowSprites[glowKey];
      if (!sprite || alpha <= 0.01) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();
    }

    function drawToolbox(p) {
      if (!targets || !targets.toolbox) return;
      // Visible from 0.00 -> 0.30 (drops in, unlatches, opens, agents spill out, shuts, tucks away)
      if (p > 0.31) return;

      const tb = targets.toolbox;
      const dropT = smoothstep(0.0, 0.075, p);
      const exitT = smoothstep(0.21, 0.295, p);
      const alpha = (1 - exitT) * smoothstep(0.0, 0.025, p);
      if (alpha <= 0.01) return;

      // Grounded landing squash + burst wobble when the swarm pops out
      const landFrac = clamp((p - 0.048) / 0.07, 0, 1);
      const squash = Math.sin(landFrac * Math.PI) * (1 - landFrac) * 0.13;
      const rattle = p > 0.075 && p < 0.18
        ? Math.sin((p - 0.075) * 145) * 0.05 * (1 - smoothstep(0.08, 0.18, p))
        : 0;

      const baseScale = lerp(0.58, 1, easeOutBack(dropT)) * lerp(1, 0.65, easeInOutCubic(exitT));
      const scaleX = baseScale * (1 + squash);
      const scaleY = baseScale * (1 - squash * 0.85);
      const boxY = tb.y - (1 - easeOutCubic(dropT)) * 64 + exitT * 26;

      // Lid opens cleanly from 0.055 -> 0.11, stays open for spill, closes at 0.19 -> 0.24
      const openFrac = smoothstep(0.055, 0.11, p) * (1 - smoothstep(0.19, 0.24, p));
      const lidAngle = -openFrac * 2.05; // ~-117 deg

      const bw = vw <= 640 ? 112 : 138;
      const bh = vw <= 640 ? 64 : 76;
      const lidH = 22;
      const bodyTop = -bh * 0.35;

      // Soft ambient ground shadow anchored below the resting kit
      const shadowScale = easeOutCubic(dropT) * (1 - exitT);
      if (shadowScale > 0.02) {
        ctx.save();
        ctx.translate(tb.x, tb.y + bodyTop + bh + 5);
        ctx.scale(shadowScale, shadowScale);
        ctx.fillStyle = `rgba(0, 0, 0, ${(0.42 * alpha).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, bw * 0.56, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(tb.x, boxY);
      ctx.rotate(rattle);
      ctx.scale(scaleX, scaleY);
      ctx.globalAlpha = alpha;

      // Soft interior emission glow when lid is open
      if (openFrac > 0.08) {
        drawGlow(0, -bh * 0.32, 68, 'cyan', 0.48 * openFrac);
        drawGlow(-18, -bh * 0.28, 46, 'pink', 0.36 * openFrac);
        drawGlow(18, -bh * 0.28, 46, 'amber', 0.3 * openFrac);
      }

      // 1. Toolbox lower body (sleek dark metallic steel + glass bevel)
      const bodyGrad = ctx.createLinearGradient(-bw * 0.5, bodyTop, bw * 0.5, bodyTop + bh);
      bodyGrad.addColorStop(0, '#222b3d');
      bodyGrad.addColorStop(0.5, '#131822');
      bodyGrad.addColorStop(1, '#0b0e15');
      ctx.fillStyle = bodyGrad;
      traceRoundedRect(ctx, -bw * 0.5, bodyTop, bw, bh, 12);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Tri-color VYRN discipline stripe across chest
      const stripeY = bodyTop + bh * 0.56;
      ctx.fillStyle = PALETTE.pink;
      ctx.fillRect(-bw * 0.44, stripeY, bw * 0.28, 3);
      ctx.fillStyle = PALETTE.cyan;
      ctx.fillRect(-bw * 0.14, stripeY, bw * 0.28, 3);
      ctx.fillStyle = PALETTE.amber;
      ctx.fillRect(bw * 0.16, stripeY, bw * 0.28, 3);

      // Toolbox label
      ctx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.74)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VYRN // KIT', 0, bodyTop + bh * 0.32);

      // 2. Hinged Lid (pivots around back-left hinge corner)
      const hingeX = -bw * 0.5 + 4;
      const hingeY = bodyTop + 2;
      ctx.save();
      ctx.translate(hingeX, hingeY);
      ctx.rotate(lidAngle);

      // Top carry handle on lid
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.76)';
      ctx.lineWidth = 3;
      traceRoundedRect(ctx, bw * 0.32, -lidH - 11, bw * 0.36, 12, 5);
      ctx.stroke();

      // Lid body
      const lidGrad = ctx.createLinearGradient(0, -lidH, 0, 2);
      lidGrad.addColorStop(0, '#2e3a50');
      lidGrad.addColorStop(1, '#161c28');
      ctx.fillStyle = lidGrad;
      traceRoundedRect(ctx, -4, -lidH, bw, lidH + 3, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Subtle upper lid specular sheen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, -lidH + 2.5);
      ctx.lineTo(bw - 12, -lidH + 2.5);
      ctx.stroke();

      // Glowing cyan latch clasp
      ctx.fillStyle = openFrac > 0.1 ? PALETTE.cyan : '#cbd5e1';
      traceRoundedRect(ctx, bw * 0.44, -4, bw * 0.12, 9, 3);
      ctx.fill();

      ctx.restore();
      ctx.restore();
    }

    function drawBlueprintGrid(p, wireframeAlpha) {
      if (wireframeAlpha <= 0.01) return;
      const gridAlpha = smoothstep(0.06, 0.20, p) * wireframeAlpha * 0.075;
      if (gridAlpha <= 0.002) return;

      const step = vw <= 640 ? 44 : 56;
      const cx = targets.title.cx;
      const cy = targets.title.cy;
      const maxR = Math.max(1, Math.hypot(vw, vh) * 0.58 * easeOutCubic(clamp(p / 0.28, 0, 1)));

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.clip();

      ctx.strokeStyle = `rgba(255, 255, 255, ${gridAlpha.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = (cx % step); x < vw; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, vh);
      }
      for (let y = (cy % step); y < vh; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(vw, y);
      }
      ctx.stroke();

      // Subtle localized corner crop marks around the centerpiece title
      const guideAlpha = smoothstep(0.16, 0.34, p) * wireframeAlpha * 0.36;
      if (guideAlpha > 0.01) {
        const tr = targets.title;
        const m = 12;
        const len = 14;
        const l = tr.left - m;
        const r = tr.left + tr.width + m;
        const t = tr.top - m;
        const b = tr.top + tr.height + m;

        ctx.strokeStyle = `rgba(0, 240, 255, ${guideAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        // Top-left & top-right
        ctx.moveTo(l, t + len); ctx.lineTo(l, t); ctx.lineTo(l + len, t);
        ctx.moveTo(r - len, t); ctx.lineTo(r, t); ctx.lineTo(r, t + len);
        // Bottom-left & bottom-right
        ctx.moveTo(l, b - len); ctx.lineTo(l, b); ctx.lineTo(l + len, b);
        ctx.moveTo(r - len, b); ctx.lineTo(r, b); ctx.lineTo(r, b - len);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawConstructedNav(p, wireframeAlpha) {
      const navProg = smoothstep(0.18, 0.41, p);
      if (navProg <= 0.01 || wireframeAlpha <= 0.01) return;

      const nav = targets.nav;
      const alpha = wireframeAlpha;

      ctx.save();
      const lineW = nav.width * easeInOutCubic(navProg);
      ctx.strokeStyle = `rgba(0, 240, 255, ${(0.42 * alpha).toFixed(3)})`;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(nav.cx - lineW * 0.5, nav.top + nav.height);
      ctx.lineTo(nav.cx + lineW * 0.5, nav.top + nav.height);
      ctx.stroke();

      const fillA = smoothstep(0.28, 0.46, p) * 0.6 * alpha;
      if (fillA > 0.01) {
        ctx.fillStyle = `rgba(9, 11, 14, ${fillA.toFixed(3)})`;
        ctx.fillRect(nav.left, nav.top, nav.width, nav.height);
      }

      if (targets.brand) {
        const b = targets.brand;
        drawCornerBrackets(ctx, b, 6, PALETTE.white, 0.5 * alpha * navProg);
        if (navProg > 0.35) {
          ctx.font = '800 15px Syne, sans-serif';
          ctx.fillStyle = `rgba(255, 255, 255, ${(0.85 * alpha * smoothstep(0.35, 0.6, navProg)).toFixed(3)})`;
          ctx.textBaseline = 'middle';
          ctx.fillText('VYRN', b.left + 4, b.cy);
        }
      }

      targets.navLinks.forEach((linkRect, idx) => {
        const itemP = smoothstep(0.25 + idx * 0.07, 0.72 + idx * 0.06, navProg);
        if (itemP <= 0.01) return;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.32 * alpha * itemP).toFixed(3)})`;
        ctx.lineWidth = 1;
        traceRoundedRect(ctx, linkRect.left, linkRect.top, linkRect.width, linkRect.height, 999);
        ctx.stroke();
      });

      targets.navActions.forEach((actRect, idx) => {
        const actP = smoothstep(0.45 + idx * 0.12, 0.95, navProg);
        if (actP <= 0.01) return;
        ctx.strokeStyle = idx === 0
          ? `rgba(255, 255, 255, ${(0.65 * alpha * actP).toFixed(3)})`
          : `rgba(0, 240, 255, ${(0.45 * alpha * actP).toFixed(3)})`;
        ctx.lineWidth = 1.25;
        traceRoundedRect(ctx, actRect.left, actRect.top, actRect.width, actRect.height, 999);
        ctx.stroke();
      });

      ctx.restore();
    }

    function drawOrganicInkFill(p, wireframeAlpha) {
      if (!glyphData || !glyphData.inkCtx || !glowSprites.inkStamp) return;
      const inkStart = 0.34;
      if (p <= inkStart) return;

      const tr = targets.title;
      const ictx = glyphData.inkCtx;
      const w = glyphData.w;
      const h = glyphData.h;
      const stamp = glowSprites.inkStamp;

      ictx.clearRect(0, 0, w, h);
      ictx.globalCompositeOperation = 'source-over';

      // 1. Expanding multi-lobed ink blooms anchored across V-Y-R-N strokes
      let anyDrawn = false;
      glyphData.inkSeeds.forEach((seed) => {
        if (p < seed.triggerP) return;
        anyDrawn = true;
        const localT = clamp((p - seed.triggerP) / 0.19, 0, 1);
        const radius = seed.maxRadius * easeOutCubic(localT);
        ictx.globalAlpha = smoothstep(0, 0.22, localT);

        seed.lobes.forEach((lobe) => {
          const r = radius * lobe.rScale;
          const cx = seed.lx + lobe.dx * localT;
          const cy = seed.ly + lobe.dy * localT;
          ictx.drawImage(stamp, cx - r, cy - r, r * 2, r * 2);
        });
      });

      // 2. Live brush bleed right under SHADER & SYNTH laser impact points
      agents.forEach((ag) => {
        if ((ag.id === 'shader' || ag.id === 'synth') && ag.laserTarget && p >= 0.35 && p <= 0.74) {
          const lx = ag.laserTarget.x - tr.left;
          const ly = ag.laserTarget.y - tr.top;
          if (lx >= -30 && lx <= w + 30 && ly >= -30 && ly <= h + 30) {
            anyDrawn = true;
            const brushR = Math.max(42, h * 0.34);
            ictx.globalAlpha = 0.9;
            ictx.drawImage(stamp, lx - brushR, ly - brushR, brushR * 2, brushR * 2);
          }
        }
      });

      // 3. Ensure full rich saturation before verification handoff
      const fullFillBlend = smoothstep(0.66, 0.76, p);
      if (fullFillBlend > 0.01) {
        anyDrawn = true;
        ictx.globalAlpha = fullFillBlend;
        ictx.fillStyle = '#ffffff';
        ictx.fillRect(0, 0, w, h);
      }

      if (!anyDrawn) return;

      // Clip organic wet ink silhouette cleanly to the multi-spectral Syne-800 "VYRN" fill
      ictx.globalAlpha = 1;
      ictx.globalCompositeOperation = 'source-in';
      ictx.drawImage(glyphData.fillCanvas, 0, 0);

      ctx.save();
      ctx.globalAlpha = clamp(smoothstep(0.35, 0.72, p) * 1.15, 0, 0.98) * wireframeAlpha;
      ctx.drawImage(glyphData.inkCanvas, tr.left, tr.top, tr.width, tr.height);
      ctx.restore();
    }

    function drawConstructedHero(p, wireframeAlpha) {
      const tr = targets.title;

      // Soft tri-color backlight glow behind VYRN
      const haloP = smoothstep(0.28, 0.62, p) * wireframeAlpha;
      if (haloP > 0.01) {
        drawGlow(tr.cx - tr.width * 0.22, tr.cy, tr.width * 0.36, 'pink', 0.24 * haloP);
        drawGlow(tr.cx, tr.cy, tr.width * 0.4, 'cyan', 0.22 * haloP);
        drawGlow(tr.cx + tr.width * 0.22, tr.cy, tr.width * 0.34, 'amber', 0.18 * haloP);
      }

      // Eyebrow capsule
      if (targets.eyebrow) {
        const ebP = smoothstep(0.20, 0.38, p);
        if (ebP > 0.01 && wireframeAlpha > 0.01) {
          const eb = targets.eyebrow;
          drawCornerBrackets(ctx, {
            left: eb.left - 8,
            top: eb.top - 4,
            width: eb.width + 16,
            height: eb.height + 8,
          }, 7, PALETTE.amber, 0.65 * ebP * wireframeAlpha);

          const dotColors = ['pink', 'cyan', 'amber'];
          dotColors.forEach((dk, i) => {
            const dotAppear = smoothstep(0.2 + i * 0.15, 0.55 + i * 0.15, ebP);
            if (dotAppear > 0) {
              drawGlow(eb.left + 4 + i * 13, eb.cy, 12, dk, 0.85 * dotAppear * wireframeAlpha);
            }
          });
        }
      }

      // Organic watercolor ink-bleed fill inside "VYRN"
      if (wireframeAlpha > 0.01) {
        drawOrganicInkFill(p, wireframeAlpha);
      }

      // Wireframe contour mesh across V-Y-R-N
      if (glyphData && wireframeAlpha > 0.01) {
        const meshP = smoothstep(0.28, 0.66, p);
        const fillP = smoothstep(0.45, 0.78, p);

        if (meshP > 0.02) {
          const edgeCount = glyphData.edges.length;
          const activeNormLimit = meshP * 1.15;

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(0, 240, 255, ${(0.34 * wireframeAlpha * (1 - fillP * 0.45)).toFixed(3)})`;
          ctx.beginPath();
          for (let i = 0; i < glyphData.links.length; i++) {
            const [aIdx, bIdx] = glyphData.links[i];
            const a = glyphData.edges[aIdx];
            const b = glyphData.edges[bIdx];
            if (a.normX > activeNormLimit) break;
            if (b.normX > activeNormLimit) continue;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
          }
          ctx.stroke();

          const vertexAlphaBase = wireframeAlpha * (1 - fillP * 0.35);
          for (let i = 0; i < edgeCount; i++) {
            const pt = glyphData.edges[i];
            if (pt.normX > activeNormLimit) break;
            const localPop = smoothstep(pt.normX - 0.14, pt.normX, activeNormLimit);
            const isWaveFront = pt.normX > activeNormLimit - 0.06;

            ctx.fillStyle = pt.color;
            ctx.globalAlpha = vertexAlphaBase * (isWaveFront ? 0.95 : 0.45 * localPop);
            const r = isWaveFront ? 2.2 : 1.3;
            ctx.fillRect(pt.x - r * 0.5, pt.y - r * 0.5, r, r);

            if (isWaveFront && i % 4 === 0) {
              ctx.drawImage(glowSprites[pt.glowKey], pt.x - 10, pt.y - 10, 20, 20);
            }
          }
          ctx.restore();
        }
      }

      // Floating Liquid Glass Pills (AUDIO, VIDEO, CODE)
      targets.pills.forEach((pill, idx) => {
        const pillStart = 0.44 + idx * 0.07;
        const pillP = smoothstep(pillStart, pillStart + 0.22, p);
        if (pillP <= 0.01 || wireframeAlpha <= 0.01) return;

        const r = pill.rect;
        ctx.save();
        ctx.translate(r.cx, r.cy);
        ctx.rotate(pill.tilt * (1 - smoothstep(0.78, 0.92, p)));
        ctx.translate(-r.cx, -r.cy);

        const glassA = smoothstep(0.45, 1, pillP) * 0.72 * wireframeAlpha;
        if (glassA > 0.01) {
          ctx.fillStyle = `rgba(18, 22, 30, ${glassA.toFixed(3)})`;
          traceRoundedRect(ctx, r.left, r.top, r.width, r.height, r.radius);
          ctx.fill();
        }

        const perim = 2 * (r.width + r.height);
        ctx.strokeStyle = pill.color;
        ctx.globalAlpha = 0.85 * pillP * wireframeAlpha;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([perim * easeOutCubic(pillP), perim]);
        traceRoundedRect(ctx, r.left, r.top, r.width, r.height, r.radius);
        ctx.stroke();
        ctx.setLineDash([]);

        if (pillP > 0.4) {
          const innerA = smoothstep(0.4, 0.85, pillP) * wireframeAlpha;
          const dotX = r.left + 20;
          drawGlow(dotX, r.cy, 13, pill.glowKey, 0.9 * innerA);
          ctx.fillStyle = pill.color;
          ctx.globalAlpha = innerA;
          ctx.beginPath();
          ctx.arc(dotX, r.cy, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillText(pill.label, dotX + 12, r.cy + 0.5);
        }

        ctx.restore();
      });

      // Tagline skeleton lines
      if (targets.tagline) {
        const tagP = smoothstep(0.50, 0.70, p);
        if (tagP > 0.01 && wireframeAlpha > 0.01) {
          const tg = targets.tagline;
          const barW = Math.min(tg.width * 0.85, 480) * easeOutCubic(tagP);
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.28 * tagP * wireframeAlpha).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tg.cx - barW * 0.5, tg.cy - 5);
          ctx.lineTo(tg.cx + barW * 0.5, tg.cy - 5);
          ctx.moveTo(tg.cx - barW * 0.34, tg.cy + 7);
          ctx.lineTo(tg.cx + barW * 0.34, tg.cy + 7);
          ctx.stroke();
          ctx.restore();
        }
      }

      // CTA Pill Frames
      targets.ctas.forEach((cta, idx) => {
        const ctaP = smoothstep(0.58 + idx * 0.06, 0.78 + idx * 0.06, p);
        if (ctaP <= 0.01 || wireframeAlpha <= 0.01) return;
        const r = cta.rect;
        const perim = 2 * (r.width + r.height);
        ctx.save();
        if (cta.solid) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(0.14 * smoothstep(0.5, 1, ctaP) * wireframeAlpha).toFixed(3)})`;
          traceRoundedRect(ctx, r.left, r.top, r.width, r.height, r.radius);
          ctx.fill();
        }
        ctx.strokeStyle = cta.solid ? PALETTE.white : PALETTE.cyan;
        ctx.globalAlpha = 0.82 * ctaP * wireframeAlpha;
        ctx.lineWidth = 1.35;
        ctx.setLineDash([perim * easeOutCubic(ctaP), perim]);
        traceRoundedRect(ctx, r.left, r.top, r.width, r.height, r.radius);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });

      // Verification Scan Beam (Phase 3)
      if (p >= 0.74 && p <= 0.88) {
        const scanT = (p - 0.74) / 0.14;
        const scanY = lerp(0, vh, easeInOutCubic(scanT));
        const scanAlpha = Math.sin(scanT * Math.PI) * 0.7;
        const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 6);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        grad.addColorStop(0.85, `rgba(0, 240, 255, ${(scanAlpha * 0.32).toFixed(3)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${(scanAlpha * 0.85).toFixed(3)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 40, vw, 46);
      }
    }

    function traceCursorPath() {
      ctx.beginPath();
      ctx.moveTo(-12, -26);
      ctx.lineTo(-16, 13);
      ctx.lineTo(-3, 7);
      ctx.lineTo(4, 24);
      ctx.lineTo(11, 21);
      ctx.lineTo(4, 4);
      ctx.lineTo(20, 1);
      ctx.closePath();
    }

    function drawCursorBody(accentColor, agentAlpha) {
      ctx.save();
      ctx.lineJoin = 'round';
      traceCursorPath();

      // Subtle outer role-colored rim halo
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4.6;
      ctx.globalAlpha = 0.42 * agentAlpha;
      ctx.stroke();

      // Sleek obsidian slate fill for maximum contrast with eyes & gear
      ctx.globalAlpha = agentAlpha;
      const bodyGrad = ctx.createLinearGradient(-12, -26, 16, 20);
      bodyGrad.addColorStop(0, '#222b3e');
      bodyGrad.addColorStop(0.55, '#111622');
      bodyGrad.addColorStop(1, '#090d14');
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Crisp desktop pointer border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Glossy diagonal shoulder highlight edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8.5, -20);
      ctx.lineTo(14.5, -0.5);
      ctx.stroke();
      ctx.restore();
    }

    function drawSingleAgentCharacter(ag, agentAlpha) {
      const blink = ag.blinkTimer < 0 ? Math.sin(((-ag.blinkTimer) / 0.14) * Math.PI) : 0;
      const scale = vw <= 480 ? 0.96 : 1.16;

      ctx.save();
      ctx.translate(ag.x, ag.y);
      ctx.rotate(ag.tilt);
      ctx.scale(scale, scale);
      ctx.globalAlpha = agentAlpha;

      // Tail-mounted layered plasma thruster plume when steering
      if (ag.thrustersActive) {
        const flicker = Math.sin(ag.flagPhase * 2.2) * 3;
        ctx.save();
        ctx.translate(7.5, 22);
        ctx.rotate(-0.39);
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = ag.color;
        ctx.globalAlpha = 0.48 * agentAlpha;
        ctx.beginPath();
        ctx.moveTo(-4.4, 0);
        ctx.quadraticCurveTo(0, 14 + flicker, 4.4, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.78 * agentAlpha;
        ctx.beginPath();
        ctx.moveTo(-2.1, 0);
        ctx.quadraticCurveTo(0, 7.5 + flicker * 0.5, 2.1, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = agentAlpha;
      }

      if (ag.id === 'shader') {
        // SHADER: Artist cursor carrying a large animated LGBTQIA+ Progress Pride Flag + beret
        drawProgressPrideFlag(ctx, 14, -34, 46, 28, ag.flagPhase);
        drawCursorBody(PALETTE.pink, agentAlpha);
        drawTrackingEyes(ctx, -5.5, -2.5, 4.5, -2.5, ag.lookAngle - ag.tilt, blink, 4.4);

        // Sleek magenta artist beret perched jauntily on the pointer tip
        ctx.save();
        ctx.translate(-10, -25);
        ctx.rotate(-0.24);
        ctx.fillStyle = '#ff3b69';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14.5, 5.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 220, 232, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, -1.6, 8.2, 2.2, 0, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        ctx.fillStyle = '#ff3b69';
        ctx.fillRect(-1.5, -7.2, 3, 4);
        ctx.restore();
      } else if (ag.id === 'architect') {
        // ARCHITECT: Cyan builder cursor wearing a Yellow Construction Hard Hat
        drawCursorBody(PALETTE.cyan, agentAlpha);
        drawTrackingEyes(ctx, -5.5, -2.5, 4.5, -2.5, ag.lookAngle - ag.tilt, blink, 4.4);

        ctx.save();
        ctx.translate(-10, -24);
        ctx.rotate(-0.18);
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(0, 0, 13.5, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(0, 0, 10.6, Math.PI * 1.15, Math.PI * 1.48);
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 0.9;
        traceRoundedRect(ctx, -16.5, -2, 33, 4.5, 2.2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        traceRoundedRect(ctx, -2.5, -14, 5, 12, 2.5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (ag.id === 'synth') {
        // SYNTH: Big-eyed audio cursor wearing chunky Studio Headphones
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-15.5, -2);
        ctx.bezierCurveTo(-25, -34, 0, -42, 14, -5);
        ctx.stroke();

        drawCursorBody(PALETTE.amber, agentAlpha);

        // Padded headphone earcups hugging the cursor flanks
        ctx.save();
        ctx.translate(-15.5, -1);
        ctx.rotate(0.1);
        ctx.fillStyle = PALETTE.amber;
        traceRoundedRect(ctx, -5, -7.5, 6.5, 15, 3.2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fillRect(-2.6, -4.2, 1.5, 8.4);
        ctx.restore();

        ctx.save();
        ctx.translate(14, -4.5);
        ctx.rotate(-0.84);
        ctx.fillStyle = PALETTE.amber;
        traceRoundedRect(ctx, -3, -7.5, 6.5, 15, 3.2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fillRect(-0.6, -4.2, 1.5, 8.4);
        ctx.restore();

        drawTrackingEyes(ctx, -5.8, -1, 5.0, -1, ag.lookAngle - ag.tilt, blink, 5.0);
      } else if (ag.id === 'motion') {
        // MOTION: Kinetic lime cursor wearing a Dapper Top Hat + glowing hatband
        drawCursorBody(PALETTE.lime, agentAlpha);
        drawTrackingEyes(ctx, -5.5, -2.5, 4.5, -2.5, ag.lookAngle - ag.tilt, blink, 4.4);

        ctx.save();
        ctx.translate(-10, -24);
        ctx.rotate(-0.16);
        ctx.fillStyle = '#181c24';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 0.95;
        traceRoundedRect(ctx, -9.5, -16, 19, 15, 2.5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.fillRect(-7.2, -14.5, 3, 9);
        ctx.fillStyle = PALETTE.lime;
        ctx.fillRect(-9.2, -5.5, 18.4, 3);
        ctx.fillStyle = '#1e2430';
        traceRoundedRect(ctx, -16, -2.5, 32, 4.2, 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        // COMPILER: Blue inspector cursor with wide curious eyes & Spinning Propeller Cap
        drawCursorBody(PALETTE.blue, agentAlpha);
        drawTrackingEyes(ctx, -5.5, -2.5, 4.5, -2.5, ag.lookAngle - ag.tilt, blink, 4.7);

        ctx.save();
        ctx.translate(-10, -24);
        ctx.rotate(-0.18);
        ctx.fillStyle = PALETTE.blue;
        ctx.beginPath();
        ctx.arc(0, 0, 12.5, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = PALETTE.pink;
        ctx.beginPath();
        ctx.arc(0, 0, 12.5, Math.PI, Math.PI * 1.45);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = PALETTE.amber;
        traceRoundedRect(ctx, 2, -2, 13.5, 3.8, 2);
        ctx.fill();

        // Spinning propeller shaft + motion blur disc + blades
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-1.2, -16.5, 2.4, 5);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, -16.5, 16, 2.7, 0, 0, Math.PI * 2);
        ctx.fill();
        const bladeW = 4.2 + Math.abs(Math.cos(ag.propellerAngle)) * 12.5;
        ctx.fillStyle = PALETTE.cyan;
        traceRoundedRect(ctx, -bladeW, -18, bladeW * 2, 3.1, 1.5);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    function drawAgentsAndSparks(agentAlpha) {
      if (agentAlpha <= 0.01) return;

      // Soft circular welding sparks with bright core
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      sparks.forEach((s) => {
        const lifeAlpha = clamp(s.life * agentAlpha, 0, 1);
        const radius = 1.1 + s.life * 1.5;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = lifeAlpha * 0.85;
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = lifeAlpha * 0.65;
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      agents.forEach((ag) => {
        if (!ag.spilled) return;

        // Active construction laser beam + pulsing weld ring onto target
        if (ag.laserTarget && agentAlpha > 0.15) {
          const dist = Math.hypot(ag.laserTarget.x - ag.x, ag.laserTarget.y - ag.y);
          if (dist < 360) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = ag.color;
            ctx.globalAlpha = 0.5 * agentAlpha;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(ag.x, ag.y);
            ctx.lineTo(ag.laserTarget.x, ag.laserTarget.y);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = 0.72 * agentAlpha;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(ag.x, ag.y);
            ctx.lineTo(ag.laserTarget.x, ag.laserTarget.y);
            ctx.stroke();

            const weldR = 4.5 + Math.sin(ag.flagPhase * 1.4) * 2.2;
            ctx.strokeStyle = ag.color;
            ctx.globalAlpha = 0.38 * agentAlpha;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ag.laserTarget.x, ag.laserTarget.y, weldR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            drawGlow(ag.laserTarget.x, ag.laserTarget.y, 15, ag.glowKey, 0.8 * agentAlpha);
          }
        }

        // Smooth quadratic tapered ribbon trail (rainbow shimmer for SHADER pride bot!)
        if (ag.trail.length > 2) {
          ctx.save();
          ctx.lineCap = 'round';
          for (let i = 1; i < ag.trail.length - 1; i++) {
            const t = i / (ag.trail.length - 1);
            const prev = i === 1
              ? ag.trail[0]
              : { x: (ag.trail[i - 1].x + ag.trail[i].x) * 0.5, y: (ag.trail[i - 1].y + ag.trail[i].y) * 0.5 };
            const ctrl = ag.trail[i];
            const next = i === ag.trail.length - 2
              ? ag.trail[i + 1]
              : { x: (ag.trail[i].x + ag.trail[i + 1].x) * 0.5, y: (ag.trail[i].y + ag.trail[i + 1].y) * 0.5 };

            ctx.strokeStyle = ag.id === 'shader'
              ? PRIDE_STRIPES[i % PRIDE_STRIPES.length]
              : ag.color;
            ctx.globalAlpha = t * t * 0.62 * agentAlpha;
            ctx.lineWidth = t * 4.0;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.quadraticCurveTo(ctrl.x, ctrl.y, next.x, next.y);
            ctx.stroke();
          }
          ctx.restore();
        }

        drawGlow(ag.x, ag.y, 32, ag.glowKey, 0.56 * agentAlpha);
        drawSingleAgentCharacter(ag, agentAlpha);
      });
    }

    async function hideOverlay() {
      isRunning = false;
      cancelAnimationFrame(rafId);
      clearTimeout(failsafeTimer);
      overlay.removeEventListener('wheel', blockScroll);
      overlay.removeEventListener('touchmove', blockScroll);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);
      overlay.style.pointerEvents = 'none';

      if (canTransitionDisplay()) {
        overlay.hidden = true;
      } else {
        overlay.setAttribute('data-closing', '');
      }

      const anims = overlay.getAnimations ? overlay.getAnimations() : [];
      if (anims.length > 0) {
        await Promise.race([
          Promise.allSettled(anims.map((a) => a.finished)),
          new Promise((resolve) => setTimeout(resolve, 900)),
        ]);
      }

      if (overlay.hasAttribute('data-closing')) {
        overlay.removeAttribute('data-closing');
        overlay.hidden = true;
      }
      overlay.style.pointerEvents = '';
      document.documentElement.classList.remove('swarm-booting');
    }

    function blockScroll(e) {
      if (isRunning) {
        e.preventDefault();
      }
    }

    function renderFrame(timestamp) {
      if (!isRunning) return;

      if (document.hidden) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      if (clockStartedAt === null) {
        clockStartedAt = timestamp;
        lastTickTime = timestamp;
        overlay.classList.add('is-canvas-ready');
      }

      const dt = Math.min(0.05, Math.max(0.001, (timestamp - lastTickTime) / 1000));
      lastTickTime = timestamp;

      const elapsedMs = timestamp - clockStartedAt;
      const progress = clamp(elapsedMs / TOTAL_DURATION_MS, 0, 1);

      const wireframeAlpha = 1 - smoothstep(0.72, 0.90, progress);
      const backdropAlpha = 1 - smoothstep(0.76, 0.94, progress);
      const agentAlpha = 1 - smoothstep(0.88, 1.0, progress);

      if (progress >= 1) {
        hideOverlay();
        return;
      }

      const elapsedSec = (timestamp - clockStartedAt) / 1000;
      updateAgentTargets(progress, elapsedSec);
      stepPhysics(progress, dt);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);

      if (backdropAlpha > 0.004) {
        ctx.fillStyle = `rgba(9, 11, 14, ${backdropAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, vw, vh);
      }

      drawBlueprintGrid(progress, wireframeAlpha);
      drawConstructedNav(progress, wireframeAlpha);
      drawConstructedHero(progress, wireframeAlpha);
      drawToolbox(progress);
      drawAgentsAndSparks(agentAlpha);

      ctx.restore();

      rafId = requestAnimationFrame(renderFrame);
    }

    async function start() {
      if (isRunning) return;

      cancelAnimationFrame(rafId);
      clearTimeout(failsafeTimer);

      isRunning = true;
      clockStartedAt = null;

      overlay.removeAttribute('data-closing');
      overlay.hidden = false;
      overlay.style.pointerEvents = '';
      document.documentElement.classList.add('swarm-booting');

      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 180)),
        ]);
      }

      if (!isRunning) return;

      measureTargets();
      buildGlyphData();
      initSwarmEntities();

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (isRunning) {
            measureTargets();
            buildGlyphData();
          }
        });
      }

      overlay.addEventListener('wheel', blockScroll, { passive: false });
      overlay.addEventListener('touchmove', blockScroll, { passive: false });

      failsafeTimer = setTimeout(() => {
        if (isRunning && !document.hidden) {
          hideOverlay();
        }
      }, FAILSAFE_TIMEOUT_MS);

      rafId = requestAnimationFrame(renderFrame);
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (!isRunning) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isRunning) {
          measureTargets();
          buildGlyphData();
        }
      }, 90);
    }, { passive: true });

    return { start, stop: hideOverlay };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const controller = createSwarmController();
    if (!controller) {
      document.documentElement.classList.remove('swarm-booting');
      return;
    }

    const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (motionQuery && typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', (e) => {
        if (e.matches) controller.stop();
      });
    }

    const prefersReducedMotion = Boolean(motionQuery && motionQuery.matches);
    if (document.documentElement.classList.contains('swarm-booting') && !prefersReducedMotion) {
      controller.start();
    } else {
      document.documentElement.classList.remove('swarm-booting');
      const overlay = document.getElementById('swarm-startup');
      if (overlay) overlay.hidden = true;
    }
  });
})();
