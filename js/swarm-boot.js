/**
 * VYRN — Autonomous Agent Swarm Startup Sequence
 * Choreographs a real-time multi-agent swarm constructing the VYRN interface
 * in 1:1 spatial alignment with the live DOM before cross-dissolving seamlessly
 * into the interactive page.
 */
(function initSwarmBootModule() {
  'use strict';

  window.__vyrnSwarmInit = true;

  const TOTAL_DURATION_MS = 3850;
  const SKIP_DISSOLVE_MS = 280;
  const FAILSAFE_TIMEOUT_MS = 6500;

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
    { id: 'architect', label: 'ARCHITECT', color: PALETTE.cyan, glowKey: 'cyan', angleBias: -2.2 },
    { id: 'synth', label: 'SYNTH', color: PALETTE.amber, glowKey: 'amber', angleBias: -0.9 },
    { id: 'shader', label: 'SHADER', color: PALETTE.pink, glowKey: 'pink', angleBias: 0.4 },
    { id: 'motion', label: 'MOTION', color: PALETTE.lime, glowKey: 'lime', angleBias: 1.7 },
    { id: 'compiler', label: 'COMPILER', color: PALETTE.blue, glowKey: 'blue', angleBias: 2.8 },
  ];

  const LOG_MILESTONES = [
    { t: 0.02, tag: 'ORCHESTRATOR', color: PALETTE.white, text: 'spawned 5 specialist agents + 22 micro-drones' },
    { t: 0.14, tag: 'ARCHITECT', color: PALETTE.cyan, text: 'mapped responsive grid & glass-nav-pill' },
    { t: 0.30, tag: 'SYNTH', color: PALETTE.amber, text: 'sampled Syne-800 glyph lattice for "VYRN"' },
    { t: 0.48, tag: 'SHADER', color: PALETTE.pink, text: 'bound WebGL fluid pigment & specular rim' },
    { t: 0.65, tag: 'MOTION', color: PALETTE.lime, text: 'locked capsule springs (AUDIO / VIDEO / CODE)' },
    { t: 0.80, tag: 'COMPILER', color: PALETTE.blue, text: 'build verified · handing off to live DOM' },
  ];

  const PHASE_STATUS = [
    { t: 0.0, text: 'SWARM // DISPATCHING AGENTS' },
    { t: 0.14, text: 'SWARM // SCAFFOLDING LAYOUT' },
    { t: 0.34, text: 'SWARM // TRACING GLYPH MESH' },
    { t: 0.56, text: 'SWARM // BINDING SHADERS & GLASS' },
    { t: 0.76, text: 'SWARM // VERIFYING 60FPS PIPELINE' },
    { t: 0.88, text: 'BUILD READY // LAUNCHING' },
  ];

  /* --- Math & Easing Helpers --- */
  const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
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
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block; position: fixed; visibility: hidden;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  /* --- Pre-rendered Additive Glow Sprite Cache (Zero shadowBlur overhead) --- */
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
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.95)`);
      grad.addColorStop(0.24, `rgba(${r}, ${g}, ${b}, 0.48)`);
      grad.addColorStop(0.58, `rgba(${r}, ${g}, ${b}, 0.12)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      gctx.fillStyle = grad;
      gctx.fillRect(0, 0, size, size);
      cache[key] = c;
    });
    return cache;
  }

  /* --- Rounded Rect Perimeter Point Helper --- */
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
    // Top-left
    ctx.moveTo(x, y + l); ctx.lineTo(x, y); ctx.lineTo(x + l, y);
    // Top-right
    ctx.moveTo(x + w - l, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + l);
    // Bottom-right
    ctx.moveTo(x + w, y + h - l); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - l, y + h);
    // Bottom-left
    ctx.moveTo(x + l, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - l);
    ctx.stroke();
    ctx.restore();
  }

  /* --- Main Swarm Controller --- */
  function createSwarmController() {
    const overlay = document.getElementById('swarm-startup');
    const canvas = document.getElementById('swarm-canvas');
    const skipBtn = document.getElementById('swarm-skip-btn');
    const statusLabel = document.getElementById('swarm-status-label');
    const statusPct = document.getElementById('swarm-status-pct');
    const progressFill = document.getElementById('swarm-progress-fill');
    const logFeed = document.getElementById('swarm-log-feed');
    const replayBtn = document.getElementById('swarm-replay-btn');

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
    let isSkipping = false;
    let skipStartTime = 0;
    let clockStartedAt = null;
    let lastTickTime = 0;
    let lastRenderedPct = -1;
    let lastStatusText = '';
    let triggeredLogs = new Set();

    let targets = null;
    let glyphData = null;
    let agents = [];
    let microDrones = [];
    let ripples = [];
    let sparks = [];
    let lastRippleAt = -10;

    function addLogLine(item) {
      if (!logFeed) return;
      const line = document.createElement('div');
      line.className = 'swarm-log-line';

      const tag = document.createElement('span');
      tag.className = 'swarm-log-tag';
      tag.style.color = item.color;
      tag.textContent = `[${item.tag}]`;

      const msg = document.createElement('span');
      msg.className = 'swarm-log-msg';
      msg.textContent = ` ${item.text}`;

      line.appendChild(tag);
      line.appendChild(msg);
      logFeed.appendChild(line);

      // Keep only the latest 3 visible lines
      while (logFeed.children.length > 3) {
        logFeed.firstElementChild.remove();
      }
    }

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

      // If browser reloaded mid-scroll, project hero targets into viewport center cleanly
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
        orchestrator: {
          x: vw * 0.5,
          y: Math.max(96, Math.min(titleRect.top - 48, vh * 0.22)),
        },
      };
    }

    function buildGlyphData() {
      if (!targets || !targets.title) return;
      const tr = targets.title;
      const tf = targets.titleFont;

      const w = Math.max(120, Math.round(tr.width));
      const h = Math.max(60, Math.round(tr.height));

      // 1. Offscreen mask canvas for exact Syne-800 glyph geometry
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

      // 2. Pre-rendered multi-spectral gradient fill masked to VYRN
      const fillCanvas = document.createElement('canvas');
      fillCanvas.width = w;
      fillCanvas.height = h;
      const fctx = fillCanvas.getContext('2d');
      if (fctx) {
        fctx.drawImage(maskCanvas, 0, 0);
        fctx.globalCompositeOperation = 'source-in';
        const grad = fctx.createLinearGradient(0, 0, w, h * 0.9);
        grad.addColorStop(0, '#ff2a5f');
        grad.addColorStop(0.28, '#00f0ff');
        grad.addColorStop(0.52, '#f8fafc');
        grad.addColorStop(0.76, '#f59e0b');
        grad.addColorStop(1, '#ff3b69');
        fctx.fillStyle = grad;
        fctx.fillRect(0, 0, w, h);
      }

      // 3. Extract contour edge vertices & nearest-neighbor wireframe links
      const step = vw <= 640 ? 5 : Math.max(5, Math.round(w / 110));
      const img = mctx.getImageData(0, 0, w, h).data;
      const isOpaque = (px, py) => {
        if (px < 0 || py < 0 || px >= w || py >= h) return false;
        return img[(py * w + px) * 4 + 3] > 120;
      };

      const edges = [];
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
          }
        }
      }

      // Sort edge points left-to-right so wireframe build sweeps cleanly across V-Y-R-N
      edges.sort((a, b) => a.normX - b.normX || a.ly - b.ly);

      // Build lightweight wireframe links between neighboring contour points
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

      glyphData = {
        w,
        h,
        fillCanvas,
        edges,
        links,
      };
    }

    function initSwarmEntities() {
      const cx = vw * 0.5;
      const cy = vh * 0.48;

      agents = AGENT_SPECS.map((spec, idx) => {
        const angle = spec.angleBias;
        return {
          ...spec,
          index: idx,
          x: cx + Math.cos(angle) * 14,
          y: cy + Math.sin(angle) * 14,
          vx: Math.cos(angle) * 260,
          vy: Math.sin(angle) * 260,
          heading: angle,
          trail: [],
          targetX: cx,
          targetY: cy,
          laserTarget: null,
        };
      });

      microDrones = Array.from({ length: 22 }, (_, i) => ({
        index: i,
        progress: (i / 22) % 1,
        speed: 0.55 + (i % 5) * 0.14,
        arcOffset: ((i % 2 === 0 ? 1 : -1) * (36 + (i % 4) * 24)),
        color: AGENT_SPECS[i % AGENT_SPECS.length].color,
        glowKey: AGENT_SPECS[i % AGENT_SPECS.length].glowKey,
        agentIdx: i % AGENT_SPECS.length,
      }));

      ripples = [];
      sparks = [];
      lastRippleAt = -10;
      triggeredLogs = new Set();
      if (logFeed) logFeed.innerHTML = '';
    }

    function spawnRipple(x, y, maxRadius, color) {
      ripples.push({ x, y, radius: 8, maxRadius, color, life: 1 });
    }

    function spawnSpark(x, y, color, count = 2) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 28 + Math.random() * 85;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          color,
          life: 1,
          decay: 2.2 + Math.random() * 1.4,
        });
      }
    }

    function updateAgentTargets(p, elapsedSec) {
      if (!targets) return;
      const o = targets.orchestrator;
      const tr = targets.title;
      const nav = targets.nav;
      const pills = targets.pills;

      agents.forEach((ag, idx) => {
        ag.laserTarget = null;

        // Phase 0: Radial burst from Orchestrator hub
        if (p < 0.13) {
          const spreadR = Math.min(vw, vh) * (0.16 + 0.08 * easeOutCubic(p / 0.13));
          const a = ag.angleBias + elapsedSec * 1.2;
          ag.targetX = o.x + Math.cos(a) * spreadR;
          ag.targetY = o.y + Math.sin(a) * spreadR * 0.72;
          return;
        }

        // Phase 4: Scatter outward smoothly past screen edges on materialization
        if (p >= 0.87) {
          const scatter = (p - 0.87) / 0.13;
          const outAngle = Math.atan2(ag.y - tr.cy, ag.x - tr.cx);
          const dist = Math.max(vw, vh) * (0.65 + scatter * 0.55);
          ag.targetX = tr.cx + Math.cos(outAngle) * dist;
          ag.targetY = tr.cy + Math.sin(outAngle) * dist;
          return;
        }

        // Phase 3: Formation orbit & verification pass
        if (p >= 0.74) {
          const orbitAngle = (idx / agents.length) * Math.PI * 2 + elapsedSec * 1.1;
          const rx = Math.min(vw * 0.36, tr.width * 0.55 + 64);
          const ry = Math.min(vh * 0.28, tr.height * 0.8 + 52);
          ag.targetX = tr.cx + Math.cos(orbitAngle) * rx;
          ag.targetY = tr.cy + Math.sin(orbitAngle) * ry;
          return;
        }

        // Phase 1 & 2: Specialized parallel UI construction
        switch (ag.id) {
          case 'architect': {
            if (p < 0.38) {
              const tNav = smoothstep(0.13, 0.36, p);
              const sweepX = lerp(nav.left + 32, nav.left + nav.width - 32, tNav);
              ag.targetX = sweepX;
              ag.targetY = nav.cy + Math.sin(elapsedSec * 7) * 14 + 28;
              ag.laserTarget = { x: sweepX, y: nav.cy };
            } else {
              // Trace VIDEO pill or upper wireframe edge
              const videoPill = pills[1] || pills[0];
              if (videoPill) {
                const pt = pointOnRoundedRect(videoPill.rect, (elapsedSec * 0.9) % 1);
                ag.targetX = pt.x + 28;
                ag.targetY = pt.y - 24;
                ag.laserTarget = pt;
              } else {
                ag.targetX = tr.left + tr.width * 0.65;
                ag.targetY = tr.top - 32;
              }
            }
            break;
          }
          case 'synth': {
            if (p < 0.32 && targets.eyebrow) {
              const pt = pointOnRoundedRect(targets.eyebrow, smoothstep(0.13, 0.3, p));
              ag.targetX = pt.x - 24;
              ag.targetY = pt.y - 22;
              ag.laserTarget = pt;
            } else if (p < 0.68 && glyphData && glyphData.edges.length > 0) {
              const buildT = smoothstep(0.28, 0.66, p);
              const edgeIdx = Math.min(glyphData.edges.length - 1, Math.floor(buildT * glyphData.edges.length));
              const edgePt = glyphData.edges[edgeIdx];
              ag.targetX = edgePt.x - 26 + Math.sin(elapsedSec * 6) * 22;
              ag.targetY = edgePt.y - 42 + Math.cos(elapsedSec * 5) * 18;
              ag.laserTarget = edgePt;
            } else if (pills[2]) {
              const pt = pointOnRoundedRect(pills[2].rect, (elapsedSec * 1.1) % 1);
              ag.targetX = pt.x + 26;
              ag.targetY = pt.y + 26;
              ag.laserTarget = pt;
            }
            break;
          }
          case 'shader': {
            if (p < 0.32) {
              const a = elapsedSec * 2.4;
              ag.targetX = tr.cx + Math.cos(a) * (tr.width * 0.35);
              ag.targetY = tr.cy + Math.sin(a) * (tr.height * 0.45);
            } else if (p < 0.68) {
              const waveT = smoothstep(0.32, 0.68, p);
              const lx = lerp(tr.left, tr.left + tr.width, waveT);
              const ly = tr.cy + Math.sin(waveT * Math.PI * 5) * (tr.height * 0.32);
              ag.targetX = lx + Math.cos(elapsedSec * 5) * 24;
              ag.targetY = tr.top + tr.height + 34 + Math.sin(elapsedSec * 6) * 14;
              ag.laserTarget = { x: lx, y: ly };
            } else if (pills[0]) {
              const pt = pointOnRoundedRect(pills[0].rect, (elapsedSec * 1.15) % 1);
              ag.targetX = pt.x - 26;
              ag.targetY = pt.y - 22;
              ag.laserTarget = pt;
            }
            break;
          }
          case 'motion': {
            if (p < 0.56 && pills[0]) {
              const pill = pills[p < 0.4 ? 0 : 1] || pills[0];
              const pt = pointOnRoundedRect(pill.rect, (elapsedSec * 1.2) % 1);
              ag.targetX = pt.x - 30;
              ag.targetY = pt.y + 24;
              ag.laserTarget = pt;
            } else if (pills[2]) {
              const pt = pointOnRoundedRect(pills[2].rect, (elapsedSec * 1.2) % 1);
              ag.targetX = pt.x + 24;
              ag.targetY = pt.y + 28;
              ag.laserTarget = pt;
            } else {
              ag.targetX = tr.cx + Math.cos(elapsedSec * 2.5) * 160;
              ag.targetY = tr.cy + Math.sin(elapsedSec * 2.5) * 90;
            }
            break;
          }
          case 'compiler': {
            if (p < 0.38 && targets.navActions.length > 0) {
              const act = targets.navActions[Math.floor(elapsedSec * 3) % targets.navActions.length];
              const pt = pointOnRoundedRect(act, (elapsedSec * 1.4) % 1);
              ag.targetX = pt.x - 20;
              ag.targetY = pt.y + 34;
              ag.laserTarget = pt;
            } else if (p < 0.62 && targets.tagline) {
              const tTag = smoothstep(0.4, 0.6, p);
              const lx = lerp(targets.tagline.left, targets.tagline.left + targets.tagline.width, tTag);
              ag.targetX = lx;
              ag.targetY = targets.tagline.top - 22;
              ag.laserTarget = { x: lx, y: targets.tagline.cy };
            } else if (targets.ctas.length > 0) {
              const cta = targets.ctas[p > 0.68 && targets.ctas[1] ? 1 : 0];
              const pt = pointOnRoundedRect(cta.rect, (elapsedSec * 1.3) % 1);
              ag.targetX = pt.x + 18;
              ag.targetY = pt.y + 30;
              ag.laserTarget = pt;
            }
            break;
          }
        }
      });
    }

    function stepPhysics(dt) {
      const stiffness = 26;
      const damping = 8.4;

      agents.forEach((ag) => {
        const ax = (ag.targetX - ag.x) * stiffness - ag.vx * damping;
        const ay = (ag.targetY - ag.y) * stiffness - ag.vy * damping;
        ag.vx += ax * dt;
        ag.vy += ay * dt;
        ag.x += ag.vx * dt;
        ag.y += ag.vy * dt;

        const speedSq = ag.vx * ag.vx + ag.vy * ag.vy;
        if (speedSq > 25) {
          const desiredAngle = Math.atan2(ag.vy, ag.vx);
          let diff = desiredAngle - ag.heading;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          ag.heading += diff * Math.min(1, dt * 14);
        }

        ag.trail.push({ x: ag.x, y: ag.y });
        if (ag.trail.length > 16) ag.trail.shift();

        if (ag.laserTarget && Math.random() < dt * 14) {
          spawnSpark(ag.laserTarget.x, ag.laserTarget.y, ag.color, 1);
        }
      });

      microDrones.forEach((d) => {
        d.progress = (d.progress + d.speed * dt) % 1;
      });

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * Math.min(1, dt * 4.5) + 40 * dt;
        r.life -= dt * 0.85;
        if (r.life <= 0) ripples.splice(i, 1);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
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

    function drawBlueprintGrid(p, wireframeAlpha) {
      if (wireframeAlpha <= 0.01) return;
      const gridAlpha = smoothstep(0.0, 0.14, p) * wireframeAlpha * 0.08;
      if (gridAlpha <= 0.002) return;

      const step = vw <= 640 ? 44 : 56;
      const cx = targets.title.cx;
      const cy = targets.title.cy;
      const maxR = Math.hypot(vw, vh) * 0.58 * easeOutCubic(clamp(p / 0.24, 0, 1));

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

      // Architectural hero bounding guides & dimension ticks
      const guideAlpha = smoothstep(0.12, 0.28, p) * wireframeAlpha * 0.22;
      if (guideAlpha > 0.01) {
        const tr = targets.title;
        ctx.strokeStyle = `rgba(0, 240, 255, ${guideAlpha.toFixed(3)})`;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        // Horizontal cap & baseline lines
        ctx.moveTo(0, tr.top); ctx.lineTo(vw, tr.top);
        ctx.moveTo(0, tr.top + tr.height); ctx.lineTo(vw, tr.top + tr.height);
        // Vertical stage rails
        ctx.moveTo(tr.left, 0); ctx.lineTo(tr.left, vh);
        ctx.moveTo(tr.left + tr.width, 0); ctx.lineTo(tr.left + tr.width, vh);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillStyle = `rgba(0, 240, 255, ${(guideAlpha * 1.8).toFixed(3)})`;
        ctx.fillText(`STAGE // ${Math.round(tr.width)}×${Math.round(tr.height)}`, tr.left + 6, Math.max(20, tr.top - 8));
      }

      ctx.restore();
    }

    function drawConstructedNav(p, wireframeAlpha) {
      const navProg = smoothstep(0.12, 0.36, p);
      if (navProg <= 0.01 || wireframeAlpha <= 0.01) return;

      const nav = targets.nav;
      const alpha = wireframeAlpha;

      ctx.save();
      // Nav bottom hairline sweep
      const lineW = nav.width * easeInOutCubic(navProg);
      ctx.strokeStyle = `rgba(0, 240, 255, ${(0.42 * alpha).toFixed(3)})`;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(nav.cx - lineW * 0.5, nav.top + nav.height);
      ctx.lineTo(nav.cx + lineW * 0.5, nav.top + nav.height);
      ctx.stroke();

      // Nav glass backdrop fill
      const fillA = smoothstep(0.24, 0.42, p) * 0.6 * alpha;
      if (fillA > 0.01) {
        ctx.fillStyle = `rgba(9, 11, 14, ${fillA.toFixed(3)})`;
        ctx.fillRect(nav.left, nav.top, nav.width, nav.height);
      }

      // Brand monogram wireframe
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

      // Nav link capsules
      targets.navLinks.forEach((linkRect, idx) => {
        const itemP = smoothstep(0.25 + idx * 0.07, 0.72 + idx * 0.06, navProg);
        if (itemP <= 0.01) return;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.32 * alpha * itemP).toFixed(3)})`;
        ctx.lineWidth = 1;
        traceRoundedRect(ctx, linkRect.left, linkRect.top, linkRect.width, linkRect.height, 999);
        ctx.stroke();
      });

      // Utility action capsules
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

    function drawConstructedHero(p, wireframeAlpha, elapsedSec) {
      const tr = targets.title;

      // Ambient tri-color halo behind VYRN
      const haloP = smoothstep(0.18, 0.55, p) * wireframeAlpha;
      if (haloP > 0.01) {
        drawGlow(tr.cx - tr.width * 0.22, tr.cy, tr.width * 0.38, 'pink', 0.26 * haloP);
        drawGlow(tr.cx, tr.cy, tr.width * 0.42, 'cyan', 0.24 * haloP);
        drawGlow(tr.cx + tr.width * 0.22, tr.cy, tr.width * 0.36, 'amber', 0.2 * haloP);
      }

      // Eyebrow capsule
      if (targets.eyebrow) {
        const ebP = smoothstep(0.16, 0.34, p);
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

      // Giant VYRN Wireframe Mesh + Spectral Shader Fill
      if (glyphData && wireframeAlpha > 0.01) {
        const meshP = smoothstep(0.24, 0.64, p);
        const fillP = smoothstep(0.42, 0.76, p);

        // 1. Progressive spectral watercolor fill clipped cleanly to VYRN glyphs
        if (fillP > 0.01) {
          ctx.save();
          const revealW = glyphData.w * easeInOutCubic(fillP);
          ctx.beginPath();
          ctx.rect(tr.left, tr.top, revealW, glyphData.h);
          ctx.clip();
          ctx.globalAlpha = clamp(fillP * 1.1, 0, 0.95) * wireframeAlpha;
          ctx.drawImage(glyphData.fillCanvas, tr.left, tr.top, tr.width, tr.height);
          ctx.restore();
        }

        // 2. Wireframe triangulation struts connecting edge vertices
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

          // 3. Glowing contour vertices along V-Y-R-N edges
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
        const pillStart = 0.42 + idx * 0.07;
        const pillP = smoothstep(pillStart, pillStart + 0.22, p);
        if (pillP <= 0.01 || wireframeAlpha <= 0.01) return;

        const r = pill.rect;
        ctx.save();
        ctx.translate(r.cx, r.cy);
        ctx.rotate(pill.tilt * (1 - smoothstep(0.75, 0.9, p)));
        ctx.translate(-r.cx, -r.cy);

        // Glass interior fill
        const glassA = smoothstep(0.45, 1, pillP) * 0.72 * wireframeAlpha;
        if (glassA > 0.01) {
          ctx.fillStyle = `rgba(18, 22, 30, ${glassA.toFixed(3)})`;
          traceRoundedRect(ctx, r.left, r.top, r.width, r.height, r.radius);
          ctx.fill();
        }

        // Animated capsule perimeter trace
        const perim = 2 * (r.width + r.height);
        ctx.strokeStyle = pill.color;
        ctx.globalAlpha = 0.85 * pillP * wireframeAlpha;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([perim * easeOutCubic(pillP), perim]);
        traceRoundedRect(ctx, r.left, r.top, r.width, r.height, r.radius);
        ctx.stroke();
        ctx.setLineDash([]);

        // Colored discipline dot + crisp text
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
        const tagP = smoothstep(0.48, 0.68, p);
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
        const ctaP = smoothstep(0.56 + idx * 0.06, 0.76 + idx * 0.06, p);
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

      // Photonic Verification Scan Beam (Phase 3)
      if (p >= 0.71 && p <= 0.86) {
        const scanT = (p - 0.71) / 0.15;
        const scanY = lerp(0, vh, easeInOutCubic(scanT));
        const scanAlpha = Math.sin(scanT * Math.PI) * 0.75;
        const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 6);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        grad.addColorStop(0.85, `rgba(0, 240, 255, ${(scanAlpha * 0.35).toFixed(3)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${(scanAlpha * 0.9).toFixed(3)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 40, vw, 46);
      }

      void elapsedSec;
    }

    function drawOrchestratorAndLinks(p, elapsedSec, agentAlpha) {
      if (agentAlpha <= 0.01 || !targets) return;
      const o = targets.orchestrator;
      const ox = o.x + Math.sin(elapsedSec * 1.4) * 8;
      const oy = o.y + Math.cos(elapsedSec * 1.8) * 5;

      // Subtle periodic sonar ripple (<= 1.2/sec, smooth non-flashing)
      if (p < 0.82 && elapsedSec - lastRippleAt > 0.95) {
        lastRippleAt = elapsedSec;
        spawnRipple(ox, oy, Math.min(vw, vh) * 0.32, PALETTE.cyan);
      }

      // Draw expanding ripples
      ripples.forEach((r) => {
        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = clamp(r.life * 0.25 * agentAlpha, 0, 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Curved Bezier telemetry links from Orchestrator to each Specialist Agent
      ctx.save();
      agents.forEach((ag, idx) => {
        const mx = (ox + ag.x) * 0.5 + Math.sin(elapsedSec * 2 + idx) * 28;
        const my = (oy + ag.y) * 0.5 - 32;

        ctx.strokeStyle = ag.color;
        ctx.globalAlpha = 0.2 * agentAlpha;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.quadraticCurveTo(mx, my, ag.x, ag.y);
        ctx.stroke();
      });

      // Agent-to-agent proximity mesh filaments
      for (let i = 0; i < agents.length; i++) {
        for (let j = i + 1; j < agents.length; j++) {
          const a = agents[i];
          const b = agents[j];
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          if (dist < 280) {
            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = (1 - dist / 280) * 0.16 * agentAlpha;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Swarm Micro-Drones racing along Bezier splines
      microDrones.forEach((d) => {
        const ag = agents[d.agentIdx];
        const mx = (ox + ag.x) * 0.5 + d.arcOffset;
        const my = (oy + ag.y) * 0.5 - Math.abs(d.arcOffset) * 0.6;
        const t = d.progress;
        const inv = 1 - t;
        const dx = inv * inv * ox + 2 * inv * t * mx + t * t * ag.x;
        const dy = inv * inv * oy + 2 * inv * t * my + t * t * ag.y;

        drawGlow(dx, dy, 8, d.glowKey, 0.75 * agentAlpha);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.85 * agentAlpha;
        ctx.fillRect(dx - 1.2, dy - 1.2, 2.4, 2.4);
      });

      // Orchestrator central dual-reticle core
      const hubScale = smoothstep(0.0, 0.1, p) * agentAlpha;
      if (hubScale > 0.01) {
        drawGlow(ox, oy, 30, 'white', 0.45 * hubScale);
        drawGlow(ox, oy, 42, 'cyan', 0.35 * hubScale);

        ctx.globalAlpha = 0.7 * hubScale;
        ctx.strokeStyle = PALETTE.white;
        ctx.lineWidth = 1.2;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(elapsedSec * 1.4);
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(-elapsedSec * 2.1);
        ctx.strokeStyle = PALETTE.cyan;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.setLineDash([]);
        ctx.fillStyle = PALETTE.white;
        ctx.beginPath();
        ctx.arc(ox, oy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawAgentsAndSparks(agentAlpha) {
      if (agentAlpha <= 0.01) return;

      // Impact sparks
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      sparks.forEach((s) => {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = clamp(s.life * agentAlpha, 0, 1);
        ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
      });
      ctx.restore();

      // Specialist Agents
      agents.forEach((ag) => {
        // Active construction laser beam
        if (ag.laserTarget && agentAlpha > 0.15) {
          const dist = Math.hypot(ag.laserTarget.x - ag.x, ag.laserTarget.y - ag.y);
          if (dist < 340) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = ag.color;
            ctx.globalAlpha = 0.55 * agentAlpha;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(ag.x, ag.y);
            ctx.lineTo(ag.laserTarget.x, ag.laserTarget.y);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = 0.75 * agentAlpha;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(ag.x, ag.y);
            ctx.lineTo(ag.laserTarget.x, ag.laserTarget.y);
            ctx.stroke();
            ctx.restore();

            drawGlow(ag.laserTarget.x, ag.laserTarget.y, 14, ag.glowKey, 0.8 * agentAlpha);
          }
        }

        // Tapered ribbon trail
        if (ag.trail.length > 2) {
          ctx.save();
          ctx.lineCap = 'round';
          for (let i = 1; i < ag.trail.length; i++) {
            const t = i / ag.trail.length;
            ctx.strokeStyle = ag.color;
            ctx.globalAlpha = t * t * 0.68 * agentAlpha;
            ctx.lineWidth = t * 3.2;
            ctx.beginPath();
            ctx.moveTo(ag.trail[i - 1].x, ag.trail[i - 1].y);
            ctx.lineTo(ag.trail[i].x, ag.trail[i].y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Agent drone glow & directional delta cursor
        drawGlow(ag.x, ag.y, 20, ag.glowKey, 0.85 * agentAlpha);

        ctx.save();
        ctx.translate(ag.x, ag.y);
        ctx.rotate(ag.heading);
        ctx.globalAlpha = agentAlpha;

        ctx.fillStyle = ag.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(-6, 5.2);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-6, -5.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Compact floating monospace agent tag (hidden on ultra-narrow screens to stay tidy)
        if (vw > 460) {
          ctx.save();
          ctx.font = '600 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
          const textW = ctx.measureText(ag.label).width;
          const padX = 6;
          const pillW = textW + padX * 2;
          const pillH = 16;
          const lx = clamp(ag.x + 12, 8, vw - pillW - 8);
          const ly = clamp(ag.y - 18, 8, vh - pillH - 64);

          ctx.globalAlpha = 0.86 * agentAlpha;
          ctx.fillStyle = 'rgba(11, 14, 20, 0.85)';
          traceRoundedRect(ctx, lx, ly, pillW, pillH, 999);
          ctx.fill();
          ctx.strokeStyle = ag.color;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillText(ag.label, lx + padX, ly + pillH * 0.5 + 0.5);
          ctx.restore();
        }
      });
    }

    function updateHud(p) {
      const pct = Math.min(100, Math.round(p * 100));
      if (pct !== lastRenderedPct) {
        lastRenderedPct = pct;
        if (statusPct) statusPct.textContent = `${String(pct).padStart(2, '0')}%`;
        if (progressFill) progressFill.style.transform = `scaleX(${(pct / 100).toFixed(3)})`;
      }

      let activeStatus = PHASE_STATUS[0].text;
      for (let i = 0; i < PHASE_STATUS.length; i++) {
        if (p >= PHASE_STATUS[i].t) activeStatus = PHASE_STATUS[i].text;
      }
      if (activeStatus !== lastStatusText && statusLabel) {
        lastStatusText = activeStatus;
        statusLabel.textContent = activeStatus;
      }

      LOG_MILESTONES.forEach((m, idx) => {
        if (p >= m.t && !triggeredLogs.has(idx)) {
          triggeredLogs.add(idx);
          addLogLine(m);
        }
      });
    }

    async function hideOverlay() {
      isRunning = false;
      cancelAnimationFrame(rafId);
      clearTimeout(failsafeTimer);
      window.removeEventListener('keydown', onKeyDown);
      overlay.removeEventListener('wheel', blockScroll);
      overlay.removeEventListener('touchmove', blockScroll);

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
      document.documentElement.classList.remove('swarm-booting', 'swarm-replaying');
    }

    function skip() {
      if (!isRunning || isSkipping) return;
      isSkipping = true;
      skipStartTime = performance.now();
      updateHud(1);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape' && isRunning) {
        e.preventDefault();
        skip();
      }
    }

    function blockScroll(e) {
      if (isRunning && !isSkipping) {
        e.preventDefault();
      }
    }

    function renderFrame(timestamp) {
      if (!isRunning) return;

      // Wait for first visible frame so background-tab loads play from 0%
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

      let progress;
      let backdropAlpha = 1;
      let wireframeAlpha = 1;
      let agentAlpha = 1;

      if (isSkipping) {
        overlay.classList.add('is-hud-fading');
        const skipElapsed = timestamp - skipStartTime;
        const skipT = clamp(skipElapsed / SKIP_DISSOLVE_MS, 0, 1);
        progress = 0.88 + skipT * 0.12;
        backdropAlpha = 1 - easeInOutCubic(skipT);
        wireframeAlpha = 1 - easeInOutCubic(skipT);
        agentAlpha = 1 - easeInOutCubic(skipT);
        if (skipT >= 1) {
          hideOverlay();
          return;
        }
      } else {
        const elapsedMs = timestamp - clockStartedAt;
        progress = clamp(elapsedMs / TOTAL_DURATION_MS, 0, 1);

        if (progress >= 0.85) {
          overlay.classList.add('is-hud-fading');
        }

        // Seamless cross-dissolve into live DOM at Phase 3 -> 4
        const dissolveT = smoothstep(0.76, 0.94, progress);
        backdropAlpha = 1 - dissolveT;
        wireframeAlpha = 1 - smoothstep(0.79, 0.96, progress);
        agentAlpha = 1 - smoothstep(0.89, 1.0, progress);

        if (progress >= 1) {
          updateHud(1);
          hideOverlay();
          return;
        }
      }

      const elapsedSec = (timestamp - clockStartedAt) / 1000;
      updateAgentTargets(progress, elapsedSec);
      stepPhysics(dt);
      updateHud(progress);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);

      // Opaque obsidian canvas backdrop that fades directly into the live DOM
      if (backdropAlpha > 0.004) {
        ctx.fillStyle = `rgba(9, 11, 14, ${backdropAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, vw, vh);
      }

      drawBlueprintGrid(progress, wireframeAlpha);
      drawConstructedNav(progress, wireframeAlpha);
      drawConstructedHero(progress, wireframeAlpha, elapsedSec);
      drawOrchestratorAndLinks(progress, elapsedSec, agentAlpha);
      drawAgentsAndSparks(agentAlpha);

      ctx.restore();

      rafId = requestAnimationFrame(renderFrame);
    }

    async function start({ isReplay = false } = {}) {
      if (isRunning) return;

      cancelAnimationFrame(rafId);
      clearTimeout(failsafeTimer);

      isRunning = true;
      isSkipping = false;
      clockStartedAt = null;
      lastRenderedPct = -1;
      lastStatusText = '';

      overlay.removeAttribute('data-closing');
      overlay.classList.remove('is-hud-fading');
      if (isReplay) {
        overlay.classList.remove('is-canvas-ready');
      }
      overlay.hidden = false;
      overlay.style.pointerEvents = '';

      if (isReplay) {
        document.documentElement.classList.add('swarm-replaying');
      }
      document.documentElement.classList.add('swarm-booting');

      // Ensure Syne 800 font is ready before sampling glyph lattice (capped at 180ms wait)
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

      // Re-sample once if fonts finish resolving slightly after initial start
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (isRunning && !isSkipping) {
            measureTargets();
            buildGlyphData();
          }
        });
      }

      window.addEventListener('keydown', onKeyDown);
      overlay.addEventListener('wheel', blockScroll, { passive: false });
      overlay.addEventListener('touchmove', blockScroll, { passive: false });

      failsafeTimer = setTimeout(() => {
        if (isRunning && !document.hidden) {
          hideOverlay();
        }
      }, FAILSAFE_TIMEOUT_MS);

      rafId = requestAnimationFrame(renderFrame);
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', skip);
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        requestAnimationFrame(() => start({ isReplay: true }));
      });
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

    window.vyrnReplaySwarm = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      requestAnimationFrame(() => start({ isReplay: true }));
    };

    return { start, skip };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const controller = createSwarmController();
    if (!controller) {
      document.documentElement.classList.remove('swarm-booting');
      return;
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.documentElement.classList.contains('swarm-booting') && !prefersReducedMotion) {
      controller.start({ isReplay: false });
    } else {
      document.documentElement.classList.remove('swarm-booting');
      const overlay = document.getElementById('swarm-startup');
      if (overlay) overlay.hidden = true;
    }
  });
})();
