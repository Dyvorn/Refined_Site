/**
 * VYRN — Autonomous Agent Swarm Startup Sequence
 * A tactile toolbox drops in and spills 5 stylized character agents
 * (with hats, headphones, tracking eyes, and a waving Progress Pride Flag)
 * that build the VYRN interface in 1:1 DOM alignment and bleed watercolor ink
 * through the "VYRN" letterforms before handing off to the live page.
 */
(function initSwarmBootModule() {
  'use strict';

  window.__vyrnSwarmInit = true;

  const TOTAL_DURATION_MS = 5100;
  const FAILSAFE_TIMEOUT_MS = 8200;

  // Prototyping draft poses: elements spawn off-position / off-scale and get nudged & resized into exact DOM lock
  const PROTO_SPECS = {
    eyebrow: { dx: 24, dy: -16, scale: 0.85, rot: 0, start: 0.17, end: 0.41 },
    title: { dx: -36, dy: 24, scale: 0.74, rot: -0.022, start: 0.22, end: 0.56 },
    tagline: { dx: 28, dy: 14, scale: 0.76, rot: 0, start: 0.34, end: 0.57 },
    pills: [
      { dx: -48, dy: -24, scale: 0.72, rot: -0.16, start: 0.30, end: 0.56 },
      { dx: 46, dy: 28, scale: 1.18, rot: 0.15, start: 0.36, end: 0.61 },
      { dx: -40, dy: 30, scale: 0.78, rot: 0.11, start: 0.42, end: 0.65 },
    ],
    ctas: [
      { dx: -34, dy: 18, scale: 0.84, rot: 0, start: 0.44, end: 0.66 },
      { dx: 40, dy: -12, scale: 0.84, rot: 0, start: 0.46, end: 0.68 },
    ],
  };

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

  // Multi-step prototyping motion: initial slide, tactile adjustment wave, spring lock at 1.0
  const layoutEase = (t) => {
    const x = clamp(t, 0, 1);
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const wave = Math.sin(x * Math.PI * 2.2) * (1 - x) * (1 - x) * 0.16;
    const back = easeOutBack(clamp((x - 0.14) / 0.86, 0, 1)) * 0.55 + easeInOutCubic(x) * 0.45;
    const raw = clamp(back + wave, -0.16, 1.045);
    const lockBlend = smoothstep(0.91, 1, x);
    return raw * (1 - lockBlend) + lockBlend;
  };

  function computePose(spec, p, dampX = 1, dampY = 1) {
    if (!spec) {
      return { dx: 0, dy: 0, scale: 1, rot: 0, settled: true, moving: false, progress: 1, settleFlash: 0 };
    }
    const rawT = (p - spec.start) / Math.max(0.01, spec.end - spec.start);
    const k = layoutEase(rawT);
    return {
      dx: lerp(spec.dx * dampX, 0, k),
      dy: lerp(spec.dy * dampY, 0, k),
      scale: lerp(spec.scale, 1, k),
      rot: lerp(spec.rot, 0, k),
      settled: rawT >= 1,
      moving: rawT > 0.02 && rawT < 1,
      progress: clamp(rawT, 0, 1),
      settleFlash: rawT >= 0.95 && rawT <= 1.18 ? Math.sin(((rawT - 0.95) / 0.23) * Math.PI) : 0,
    };
  }

  function applyPoseToRect(rect, pose) {
    if (!rect || !pose) return rect;
    const w = rect.width * pose.scale;
    const h = rect.height * pose.scale;
    const cx = rect.cx + pose.dx;
    const cy = rect.cy + pose.dy;
    return {
      left: cx - w * 0.5,
      top: cy - h * 0.5,
      right: cx + w * 0.5,
      bottom: cy + h * 0.5,
      width: w,
      height: h,
      cx,
      cy,
      radius: (rect.radius || 0) * pose.scale,
      scale: pose.scale,
      rot: pose.rot,
      dx: pose.dx,
      dy: pose.dy,
      settled: pose.settled,
      moving: pose.moving,
      settleFlash: pose.settleFlash,
    };
  }

  function transformPoint(pt, cx, cy, pose) {
    if (!pt || !pose) return pt;
    const lx = (pt.x - cx) * pose.scale;
    const ly = (pt.y - cy) * pose.scale;
    const cos = Math.cos(pose.rot);
    const sin = Math.sin(pose.rot);
    return {
      x: cx + pose.dx + lx * cos - ly * sin,
      y: cy + pose.dy + lx * sin + ly * cos,
    };
  }

  function inverseTransformPoint(pt, cx, cy, pose) {
    if (!pt || !pose) return pt;
    const s = Math.max(0.05, pose.scale);
    const dx = pt.x - (cx + pose.dx);
    const dy = pt.y - (cy + pose.dy);
    const cos = Math.cos(-pose.rot);
    const sin = Math.sin(-pose.rot);
    return {
      x: cx + (dx * cos - dy * sin) / s,
      y: cy + (dx * sin + dy * cos) / s,
    };
  }

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

  function drawPixelBadge(ctx, cx, cy, text, accentColor, alpha) {
    if (alpha <= 0.02 || !text) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    const padX = 5;
    const h = 15;
    const w = Math.ceil(ctx.measureText(text).width) + padX * 2;
    const left = cx - w * 0.5;
    const top = cy - h * 0.5;

    ctx.fillStyle = 'rgba(9, 11, 14, 0.9)';
    traceRoundedRect(ctx, left, top, w, h, 3.5);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = alpha * 0.68;
    ctx.lineWidth = 0.85;
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.globalAlpha = alpha * 0.96;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + 0.5);
    ctx.restore();
  }

  function drawDimensionLine(ctx, x1, y1, x2, y2, label, color, alpha, badgeOffsetX = 0, badgeOffsetY = 0) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    if (alpha <= 0.02 || dist < 6) return;

    const ux = (x2 - x1) / dist;
    const uy = (y2 - y1) / dist;
    const nx = -uy;
    const ny = ux;
    const cap = 4;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 0.95;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    // End perpendicular caps
    ctx.moveTo(x1 - nx * cap, y1 - ny * cap);
    ctx.lineTo(x1 + nx * cap, y1 + ny * cap);
    ctx.moveTo(x2 - nx * cap, y2 - ny * cap);
    ctx.lineTo(x2 + nx * cap, y2 + ny * cap);
    ctx.stroke();

    // Subtle inward caliper arrowheads when long enough
    if (dist >= 22) {
      const aLen = 4.2;
      const aHalf = 2.2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + ux * aLen + nx * aHalf, y1 + uy * aLen + ny * aHalf);
      ctx.lineTo(x1 + ux * aLen - nx * aHalf, y1 + uy * aLen - ny * aHalf);
      ctx.closePath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - ux * aLen + nx * aHalf, y2 - uy * aLen + ny * aHalf);
      ctx.lineTo(x2 - ux * aLen - nx * aHalf, y2 - uy * aLen - ny * aHalf);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    const text = label || `${Math.round(dist)}px`;
    drawPixelBadge(ctx, (x1 + x2) * 0.5 + badgeOffsetX, (y1 + y2) * 0.5 + badgeOffsetY, text, color, alpha);
  }

  function drawTransformBox(ctx, cx, cy, w, h, rot, color, alpha, handleAlpha, tagText) {
    if (alpha <= 0.01 || w < 4 || h < 4) return;
    const hw = w * 0.5;
    const hh = h * 0.5;

    ctx.save();
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);

    // Dashed Figma-style bounding frame
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(-hw, -hh, w, h);
    ctx.setLineDash([]);

    // 8 Resize / Transform Handles (corners + midpoints)
    if (handleAlpha > 0.02) {
      const hs = 4.5;
      const half = hs * 0.5;
      const pts = [
        [-hw, -hh], [0, -hh], [hw, -hh],
        [-hw, 0], [hw, 0],
        [-hw, hh], [0, hh], [hw, hh],
      ];
      ctx.globalAlpha = handleAlpha;
      ctx.lineWidth = 1.05;
      pts.forEach(([px, py]) => {
        ctx.fillStyle = '#090b0e';
        ctx.fillRect(px - half, py - half, hs, hs);
        ctx.strokeStyle = color;
        ctx.strokeRect(px - half, py - half, hs, hs);
      });
    }

    if (tagText) {
      ctx.font = '600 9.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      const tw = Math.ceil(ctx.measureText(tagText).width) + 8;
      const bx = -hw;
      const by = -hh - 17;
      ctx.globalAlpha = alpha * 0.95;
      ctx.fillStyle = 'rgba(9, 11, 14, 0.9)';
      traceRoundedRect(ctx, bx, by, tw, 14, 3);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, bx + 4, by + 7.5);
    }

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
    let snappedKeys = new Set();

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
          right: r.right,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
          cx: r.left + r.width * 0.5,
          cy: r.top + r.height * 0.5,
          radius,
        };
      };

      const navEl = document.getElementById('nav-pill');
      const brandEl = navEl ? navEl.querySelector('.brand-signature') : null;
      const brandTextEl = brandEl ? brandEl.querySelector('.brand-monogram') : null;
      const brandDotEls = brandEl ? Array.from(brandEl.querySelectorAll('.brand-dots .color-dot')) : [];
      const navLinks = navEl ? Array.from(navEl.querySelectorAll('.nav-item')) : [];
      const discordBtn = navEl ? navEl.querySelector('.nav-btn--discord') : null;
      const bmacBtn = navEl ? navEl.querySelector('.nav-btn--bmac') : null;

      const containerEl = document.querySelector('.hero-section .container');
      const eyebrowEl = document.querySelector('.hero-eyebrow');
      const eyebrowDotEls = eyebrowEl ? Array.from(eyebrowEl.querySelectorAll('.color-dot')) : [];
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
        return { ...r, top: r.top + yOffset, bottom: (r.bottom || r.top + r.height) + yOffset, cy: r.cy + yOffset };
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
      const brandStyle = brandTextEl ? window.getComputedStyle(brandTextEl) : null;

      const resolveDotGlow = (dotEl, fallback) => {
        if (!dotEl) return fallback;
        if (dotEl.classList.contains('dot-pink')) return 'pink';
        if (dotEl.classList.contains('dot-cyan')) return 'cyan';
        if (dotEl.classList.contains('dot-amber')) return 'amber';
        return fallback;
      };

      const measurePill = (el, color, glowKey) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return null;

        const cs = window.getComputedStyle(el);
        let tilt = 0;
        if (cs.transform && cs.transform !== 'none') {
          try {
            const m = new DOMMatrix(cs.transform);
            tilt = Math.atan2(m.b, m.a);
          } catch (e) {}
        }

        const w = el.offsetWidth || r.width;
        const h = el.offsetHeight || r.height;
        const cx = r.left + r.width * 0.5;
        const cy = r.top + r.height * 0.5;
        const cosT = Math.cos(-tilt);
        const sinT = Math.sin(-tilt);
        const toLocal = (vx, vy) => ({
          x: (vx - cx) * cosT - (vy - cy) * sinT,
          y: (vx - cx) * sinT + (vy - cy) * cosT,
        });

        const dotEl = el.querySelector('.glass-pill-dot');
        let dot = { x: -w * 0.5 + 18, y: 0, r: 3.5 };
        if (dotEl) {
          const dr = dotEl.getBoundingClientRect();
          if (dr.width > 0) {
            const localDot = toLocal(dr.left + dr.width * 0.5, dr.top + dr.height * 0.5);
            dot = { x: localDot.x, y: localDot.y, r: Math.max(2.5, dr.width * 0.5) };
          }
        }

        const textEl = el.querySelector('.glass-pill-text');
        const rawText = (textEl ? textEl.textContent : el.textContent || '').trim();
        let label = rawText;
        let text = { x: dot.x + 16, y: 0, font: '600 13px Inter, sans-serif', letterSpacing: '0.1em' };
        if (textEl) {
          const trEl = textEl.getBoundingClientRect();
          const tcs = window.getComputedStyle(textEl);
          if (tcs.textTransform === 'uppercase') label = rawText.toUpperCase();
          const localText = toLocal(trEl.left + trEl.width * 0.5, trEl.top + trEl.height * 0.5);
          text = {
            x: localText.x,
            y: localText.y,
            font: `${tcs.fontWeight || '600'} ${tcs.fontSize || '13px'} ${tcs.fontFamily || 'Inter, sans-serif'}`,
            letterSpacing: tcs.letterSpacing || '0.1em',
          };
        }

        const radius = parseFloat(cs.borderRadius) || h * 0.5;
        const rect = shiftRect({
          left: cx - w * 0.5,
          top: cy - h * 0.5,
          width: w,
          height: h,
          cx,
          cy,
          radius,
        });

        return { rect, label, color, glowKey, tilt, dot, text };
      };

      const containerRect = toRect(containerEl, 0);
      if (containerRect && containerEl) {
        const cStyle = window.getComputedStyle(containerEl);
        containerRect.padLeft = parseFloat(cStyle.paddingLeft) || 0;
        containerRect.padRight = parseFloat(cStyle.paddingRight) || 0;
      }

      targets = {
        nav: toRect(navEl, 0) || { left: 0, top: 0, right: vw, bottom: 64, width: vw, height: 64, cx: vw * 0.5, cy: 32, radius: 0 },
        container: containerRect,
        brand: toRect(brandEl, 8),
        brandText: toRect(brandTextEl, 4),
        brandFont: brandStyle ? {
          font: `${brandStyle.fontWeight || '800'} ${brandStyle.fontSize || '15px'} ${brandStyle.fontFamily || 'Syne, sans-serif'}`,
          letterSpacing: brandStyle.letterSpacing || 'normal',
        } : null,
        brandDots: brandDotEls.map((d, i) => ({
          rect: toRect(d, 99),
          glowKey: resolveDotGlow(d, ['pink', 'cyan', 'amber'][i] || 'cyan'),
        })).filter((d) => d.rect),
        navLinks: navLinks.map((el) => toRect(el, 999)).filter(Boolean),
        navActions: [toRect(discordBtn, 999), toRect(bmacBtn, 999)].filter(Boolean),
        eyebrow: shiftRect(toRect(eyebrowEl, 999)),
        eyebrowDots: eyebrowDotEls.map((d, i) => ({
          rect: shiftRect(toRect(d, 99)),
          glowKey: resolveDotGlow(d, ['pink', 'cyan', 'amber'][i] || 'cyan'),
        })).filter((d) => d.rect),
        title: titleRect,
        titleFont: {
          weight: titleStyle ? titleStyle.fontWeight : '800',
          size: titleStyle ? parseFloat(titleStyle.fontSize) || Math.min(260, vw * 0.2) : Math.min(260, vw * 0.2),
          family: titleStyle ? titleStyle.fontFamily : 'Syne, sans-serif',
          letterSpacing: titleStyle ? titleStyle.letterSpacing : '-0.055em',
        },
        pills: [
          measurePill(pillAudioEl, PALETTE.pink, 'pink'),
          measurePill(pillVideoEl, PALETTE.cyan, 'cyan'),
          measurePill(pillCodeEl, PALETTE.amber, 'amber'),
        ].filter(Boolean),
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
      const pad = 28;
      const gw = w + pad * 2;
      const gh = h + pad * 2;
      const glyphDpr = Math.min(dpr || 1, 1.8);

      // 1. Exact Syne-800 glyph alpha mask (padded so tall/wide tips never clip)
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = gw;
      maskCanvas.height = gh;
      const mctx = maskCanvas.getContext('2d');
      if (!mctx) return;

      mctx.clearRect(0, 0, gw, gh);
      mctx.font = `${tf.weight} ${tf.size}px ${tf.family}`;
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      if ('letterSpacing' in mctx && tf.letterSpacing && tf.letterSpacing !== 'normal') {
        mctx.letterSpacing = tf.letterSpacing;
      }
      mctx.fillStyle = '#ffffff';
      mctx.fillText('VYRN', pad + w * 0.5, pad + h * 0.5);

      // 2. High-DPI multi-spectral watercolor gradient fill masked cleanly to "VYRN"
      const fillCanvas = document.createElement('canvas');
      fillCanvas.width = Math.max(1, Math.round(gw * glyphDpr));
      fillCanvas.height = Math.max(1, Math.round(gh * glyphDpr));
      const fctx = fillCanvas.getContext('2d');
      if (fctx) {
        fctx.save();
        fctx.scale(glyphDpr, glyphDpr);
        fctx.font = `${tf.weight} ${tf.size}px ${tf.family}`;
        fctx.textAlign = 'center';
        fctx.textBaseline = 'middle';
        if ('letterSpacing' in fctx && tf.letterSpacing && tf.letterSpacing !== 'normal') {
          fctx.letterSpacing = tf.letterSpacing;
        }
        fctx.fillStyle = '#ffffff';
        fctx.fillText('VYRN', pad + w * 0.5, pad + h * 0.5);
        fctx.globalCompositeOperation = 'source-in';
        const grad = fctx.createLinearGradient(pad, pad, pad + w, pad + h * 0.85);
        grad.addColorStop(0, '#ff2a5f');
        grad.addColorStop(0.24, '#ff5c8a');
        grad.addColorStop(0.46, '#00e5ff');
        grad.addColorStop(0.62, '#f8fafc');
        grad.addColorStop(0.82, '#fbbf24');
        grad.addColorStop(1, '#ff2a5f');
        fctx.fillStyle = grad;
        fctx.fillRect(0, 0, gw, gh);
        fctx.restore();
      }

      // 3. Dedicated high-DPI offscreen canvas for organic ink-bleed compositing
      const inkCanvas = document.createElement('canvas');
      inkCanvas.width = Math.max(1, Math.round(gw * glyphDpr));
      inkCanvas.height = Math.max(1, Math.round(gh * glyphDpr));
      const inkCtx = inkCanvas.getContext('2d');

      // 4. Sample glyph contour edges + interior ink-bleed anchor seeds across padded canvas
      const step = vw <= 640 ? 5 : Math.max(5, Math.round(w / 112));
      const img = mctx.getImageData(0, 0, gw, gh).data;
      const isOpaque = (px, py) => {
        if (px < 0 || py < 0 || px >= gw || py >= gh) return false;
        return img[(py * gw + px) * 4 + 3] > 120;
      };

      const edges = [];
      const interiorPts = [];
      const accentColors = [PALETTE.cyan, PALETTE.pink, PALETTE.amber, PALETTE.white];
      for (let py = step; py < gh - step; py += step) {
        for (let px = step; px < gw - step; px += step) {
          if (!isOpaque(px, py)) continue;
          const onBoundary =
            !isOpaque(px - step, py) ||
            !isOpaque(px + step, py) ||
            !isOpaque(px, py - step) ||
            !isOpaque(px, py + step);
          const normX = clamp((px - pad) / w, 0, 1);
          if (onBoundary) {
            const colorIdx = (Math.floor(normX * 4) + (py % 2)) % accentColors.length;
            edges.push({
              lx: px,
              ly: py,
              x: tr.left - pad + px,
              y: tr.top - pad + py,
              normX,
              color: accentColors[colorIdx],
              glowKey: normX < 0.3 ? 'pink' : normX < 0.62 ? 'cyan' : normX < 0.85 ? 'amber' : 'white',
            });
          } else {
            interiorPts.push({ lx: px, ly: py, normX });
          }
        }
      }

      edges.sort((a, b) => a.normX - b.normX || a.ly - b.ly);

      // Build wireframe triangulation struts along contour
      const maxLinkDist = step * 2.55;
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

      // Pick ~24 organic ink-bleed seed drops ordered left-to-right across V-Y-R-N strokes
      const inkSeeds = [];
      const seedPool = interiorPts.length >= 24 ? interiorPts : edges;
      if (seedPool.length > 0) {
        const sortedPool = [...seedPool].sort((a, b) => a.normX - b.normX || a.ly - b.ly);
        const seedCount = Math.min(24, sortedPool.length);
        for (let i = 0; i < seedCount; i++) {
          const idx = Math.floor((i / seedCount) * sortedPool.length);
          const pt = sortedPool[idx];
          const baseRadius = Math.max(54, Math.min(152, h * (0.42 + (i % 4) * 0.09)));
          const lobes = [
            { dx: 0, dy: 0, rScale: 1.0 },
            { dx: Math.cos(i * 1.9) * baseRadius * 0.34, dy: Math.sin(i * 1.9) * baseRadius * 0.28, rScale: 0.78 },
            { dx: Math.cos(i * 3.1 + 1.4) * baseRadius * 0.38, dy: Math.sin(i * 3.1 + 1.4) * baseRadius * 0.32, rScale: 0.72 },
            { dx: Math.cos(i * 4.7 + 2.8) * baseRadius * 0.26, dy: Math.sin(i * 4.7 + 2.8) * baseRadius * 0.34, rScale: 0.65 },
          ];
          inkSeeds.push({
            lx: pt.lx,
            ly: pt.ly,
            x: tr.left - pad + pt.lx,
            y: tr.top - pad + pt.ly,
            triggerP: 0.32 + (pt.normX * 0.26) + ((i % 3) * 0.012),
            bloom: 0,
            maxRadius: baseRadius,
            lobes,
          });
        }
      }

      glyphData = {
        w,
        h,
        pad,
        gw,
        gh,
        glyphDpr,
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
      snappedKeys.clear();
    }

    function computeFrameLayout(p) {
      const sx = clamp(vw / 1100, 0.36, 1);
      const sy = clamp(vh / 800, 0.52, 1);

      const eyebrowPose = computePose(PROTO_SPECS.eyebrow, p, sx, sy);
      const titlePose = computePose(PROTO_SPECS.title, p, sx, sy);
      const taglinePose = computePose(PROTO_SPECS.tagline, p, sx, sy);
      const pillPoses = targets.pills.map((_, i) => computePose(PROTO_SPECS.pills[i % PROTO_SPECS.pills.length], p, sx, sy));
      const ctaPoses = targets.ctas.map((_, i) => computePose(PROTO_SPECS.ctas[i % PROTO_SPECS.ctas.length], p, sx, sy));

      return {
        eyebrowPose,
        eyebrowRect: applyPoseToRect(targets.eyebrow, eyebrowPose),
        titlePose,
        titleRect: applyPoseToRect(targets.title, titlePose),
        taglinePose,
        taglineRect: applyPoseToRect(targets.tagline, taglinePose),
        pillPoses,
        pillRects: targets.pills.map((pill, i) => applyPoseToRect(pill.rect, pillPoses[i])),
        ctaPoses,
        ctaRects: targets.ctas.map((cta, i) => applyPoseToRect(cta.rect, ctaPoses[i])),
      };
    }

    function emitSnapSparks(p, layout) {
      if (p < 0.25 || p > 0.78) return;
      const trySnap = (key, rect, color, pose) => {
        if (!rect || !pose || !pose.settled || snappedKeys.has(key)) return;
        snappedKeys.add(key);
        spawnSpark(rect.cx, rect.cy, color, 5);
      };
      trySnap('eyebrow', layout.eyebrowRect, PALETTE.amber, layout.eyebrowPose);
      trySnap('title', layout.titleRect, PALETTE.cyan, layout.titlePose);
      trySnap('tagline', layout.taglineRect, PALETTE.blue, layout.taglinePose);
      layout.pillRects.forEach((r, i) => trySnap(`pill-${i}`, r, targets.pills[i].color, layout.pillPoses[i]));
      layout.ctaRects.forEach((r, i) => trySnap(`cta-${i}`, r, targets.ctas[i].solid ? PALETTE.white : PALETTE.cyan, layout.ctaPoses[i]));
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

    function updateAgentTargets(p, elapsedSec, layout) {
      if (!targets || !layout) return;
      const tr = targets.title;
      const titleR = layout.titleRect || tr;
      const tPose = layout.titlePose;
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

        // Phase 3: Synchronized guard formation with all 5 bots tracking the verification scan line
        if (p >= 0.74) {
          const formT = easeOutCubic(smoothstep(0.74, 0.80, p));
          const spreadAngle = lerp(-Math.PI * 0.82, -Math.PI * 0.18, idx / Math.max(1, agents.length - 1));
          const arcRx = Math.min(vw * 0.40, tr.width * 0.56 + 60);
          const arcRy = Math.min(vh * 0.28, tr.height * 0.85 + 75);
          const idleSway = Math.sin(elapsedSec * 2.4 + idx * 1.1) * 8;
          ag.targetX = tr.cx + Math.cos(spreadAngle) * arcRx;
          ag.targetY = tr.cy + Math.sin(spreadAngle) * arcRy + idleSway;

          const scanT = clamp((p - 0.74) / 0.14, 0, 1);
          const scanY = lerp(0, vh, easeInOutCubic(scanT));
          ag.gazeTarget = formT > 0.25 ? { x: tr.cx + (idx - 2) * 38, y: scanY } : null;
          return;
        }
        ag.gazeTarget = null;

        // Phase 1 & 2: Specialized prototyping, resizing, dragging & final stroke finish
        switch (ag.id) {
          case 'architect': {
            if (p < 0.34) {
              const tNav = smoothstep(0.15, 0.33, p);
              const sweepX = lerp(nav.left + 36, nav.left + nav.width - 36, tNav);
              ag.targetX = sweepX;
              ag.targetY = nav.cy + Math.sin(elapsedSec * 6.5) * 10 + 46;
              ag.laserTarget = { x: sweepX, y: nav.cy };
            } else if (p < 0.54) {
              // Grabs top-right transform handle of "VYRN" to scale it cleanly up into 100% DOM lock
              const cornerPt = transformPoint({ x: tr.left + tr.width, y: tr.top }, tr.cx, tr.cy, tPose);
              ag.targetX = cornerPt.x + 36;
              ag.targetY = cornerPt.y - 34;
              ag.laserTarget = cornerPt;
            } else if (p < 0.71 && glyphData && glyphData.edges.length > 0) {
              const half = Math.floor(glyphData.edges.length * 0.5);
              const buildT = smoothstep(0.53, 0.70, p);
              const edgeIdx = clamp(half + Math.floor(buildT * (glyphData.edges.length - 1 - half)), half, glyphData.edges.length - 1);
              const edgePt = transformPoint(glyphData.edges[edgeIdx], tr.cx, tr.cy, tPose);
              ag.targetX = edgePt.x + 34 + Math.sin(elapsedSec * 4.8) * 16;
              ag.targetY = edgePt.y - 52 + Math.cos(elapsedSec * 4.2) * 12;
              ag.laserTarget = edgePt;
            } else if (layout.pillRects[1] || layout.pillRects[0]) {
              const slot = layout.pillRects[1] ? 1 : 0;
              const pill = targets.pills[slot];
              const pose = layout.pillPoses[slot];
              const basePt = pointOnRoundedRect(pill.rect, (elapsedSec * 0.9) % 1);
              const pt = transformPoint(basePt, pill.rect.cx, pill.rect.cy, { ...pose, rot: pill.tilt + pose.rot });
              ag.targetX = pt.x + 40;
              ag.targetY = pt.y - 34;
              ag.laserTarget = pt;
            }
            break;
          }
          case 'synth': {
            if (p < 0.36 && layout.eyebrowRect) {
              const ebR = layout.eyebrowRect;
              const pt = pointOnRoundedRect(ebR, smoothstep(0.16, 0.35, p));
              ag.targetX = pt.x - 36;
              ag.targetY = pt.y - 30;
              ag.laserTarget = pt;
            } else if (p < 0.67 && glyphData && glyphData.edges.length > 0) {
              // Guides left strokes ("V-Y") while "VYRN" stretches into center lock
              const half = Math.max(1, Math.floor(glyphData.edges.length * 0.52));
              const buildT = smoothstep(0.35, 0.66, p);
              const edgeIdx = Math.min(half - 1, Math.floor(buildT * half));
              const edgePt = transformPoint(glyphData.edges[edgeIdx], tr.cx, tr.cy, tPose);
              ag.targetX = edgePt.x - 32 + Math.sin(elapsedSec * 5.2) * 18;
              ag.targetY = edgePt.y - 50 + Math.cos(elapsedSec * 4.5) * 14;
              ag.laserTarget = edgePt;
            } else if (layout.pillRects[2]) {
              const pill = targets.pills[2];
              const pose = layout.pillPoses[2];
              const basePt = pointOnRoundedRect(pill.rect, (elapsedSec * 1.1) % 1);
              const pt = transformPoint(basePt, pill.rect.cx, pill.rect.cy, { ...pose, rot: pill.tilt + pose.rot });
              ag.targetX = pt.x + 36;
              ag.targetY = pt.y + 36;
              ag.laserTarget = pt;
            }
            break;
          }
          case 'shader': {
            // Progress Pride Flag artist — floods V-Y-R-N with live watercolor bleed while it scales into place
            if (p < 0.30) {
              const a = elapsedSec * 2.4;
              ag.targetX = titleR.cx + Math.cos(a) * Math.min(vw * 0.28, titleR.width * 0.36);
              ag.targetY = titleR.cy - 44 + Math.sin(a) * 30;
              ag.laserTarget = { x: titleR.cx + Math.cos(a + 0.5) * 56, y: titleR.cy };
            } else if (p < 0.72 && glyphData && glyphData.inkSeeds.length > 0) {
              const bleedT = smoothstep(0.30, 0.70, p);
              const seedIdx = Math.min(glyphData.inkSeeds.length - 1, Math.floor(bleedT * glyphData.inkSeeds.length));
              const seedPt = transformPoint(glyphData.inkSeeds[seedIdx], tr.cx, tr.cy, tPose);
              ag.targetX = seedPt.x - 22 + Math.cos(elapsedSec * 5.5) * 14;
              ag.targetY = seedPt.y + 60 + Math.sin(elapsedSec * 4.8) * 14;
              ag.laserTarget = seedPt;
            } else if (layout.pillRects[0]) {
              const pill = targets.pills[0];
              const pose = layout.pillPoses[0];
              const basePt = pointOnRoundedRect(pill.rect, (elapsedSec * 1.15) % 1);
              const pt = transformPoint(basePt, pill.rect.cx, pill.rect.cy, { ...pose, rot: pill.tilt + pose.rot });
              ag.targetX = pt.x - 42;
              ag.targetY = pt.y - 30;
              ag.laserTarget = pt;
            }
            break;
          }
          case 'motion': {
            // Layout & Transform specialist — slides, scales & levels AUDIO -> VIDEO -> CODE pills into lock
            if (pills.length > 0) {
              const slot = p < 0.45 ? 0 : p < 0.59 ? 1 : Math.min(2, pills.length - 1);
              const pill = pills[slot] || pills[0];
              const pose = layout.pillPoses[slot] || layout.pillPoses[0];
              const basePt = pointOnRoundedRect(pill.rect, (elapsedSec * 1.25) % 1);
              const pt = transformPoint(basePt, pill.rect.cx, pill.rect.cy, { ...pose, rot: pill.tilt + pose.rot });
              ag.targetX = pt.x + (slot === 2 ? 38 : -40);
              ag.targetY = pt.y + (slot === 1 ? -34 : 32);
              ag.laserTarget = pt;
            } else {
              ag.targetX = titleR.cx + Math.cos(elapsedSec * 2.2) * 170;
              ag.targetY = titleR.cy + Math.sin(elapsedSec * 2.2) * 95;
            }
            break;
          }
          case 'compiler': {
            if (p < 0.36 && targets.navActions.length > 0) {
              const act = targets.navActions[Math.floor(elapsedSec * 2.5) % targets.navActions.length];
              const pt = pointOnRoundedRect(act, (elapsedSec * 1.35) % 1);
              ag.targetX = pt.x - 28;
              ag.targetY = pt.y + 42;
              ag.laserTarget = pt;
            } else if (p < 0.54 && layout.taglineRect) {
              // Stretches & aligns tagline wireframe horizontally to exact width
              const tgR = layout.taglineRect;
              const tTag = smoothstep(0.35, 0.53, p);
              const lx = lerp(tgR.left, tgR.left + tgR.width, tTag);
              ag.targetX = lx;
              ag.targetY = tgR.top - 30;
              ag.laserTarget = { x: lx, y: tgR.cy };
            } else if (layout.ctaRects.length > 0) {
              // Pushes the two CTA pills horizontally along the spacing caliper until gap settles
              const idxCta = p > 0.62 && layout.ctaRects[1] ? 1 : 0;
              const ctaR = layout.ctaRects[idxCta];
              const pt = pointOnRoundedRect(ctaR, (elapsedSec * 1.3) % 1);
              ag.targetX = pt.x + (idxCta === 1 ? 30 : -30);
              ag.targetY = pt.y + 38;
              ag.laserTarget = pt;
            }
            break;
          }
        }
      });
    }

    function stepPhysics(p, dt, layout) {
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

        // Eyes track active laser weld target, synchronized scan gaze, or velocity vector
        let desiredLook = ag.lookAngle;
        const eyeFocus = ag.laserTarget || ag.gazeTarget;
        if (eyeFocus) {
          desiredLook = Math.atan2(eyeFocus.y - ag.y, eyeFocus.x - ag.x);
        } else if (ag.vx * ag.vx + ag.vy * ag.vy > 40) {
          desiredLook = Math.atan2(ag.vy, ag.vx);
        }
        let lookDiff = desiredLook - ag.lookAngle;
        while (lookDiff > Math.PI) lookDiff -= Math.PI * 2;
        while (lookDiff < -Math.PI) lookDiff += Math.PI * 2;
        ag.lookAngle += lookDiff * Math.min(1, dt * 14);

        ag.trail.push({ x: ag.x, y: ag.y });
        if (ag.trail.length > 20) ag.trail.shift();

        if (ag.laserTarget && Math.random() < dt * 13) {
          const sparkColor = ag.id === 'shader'
            ? PRIDE_STRIPES[Math.floor(Math.random() * PRIDE_STRIPES.length)]
            : ag.color;
          spawnSpark(ag.laserTarget.x, ag.laserTarget.y, sparkColor, 1);
        }
      });

      // Ignite inkSeeds dynamically when SHADER's brush nears them (mapped through live titlePose) or on timeline trigger
      if (glyphData && glyphData.inkSeeds) {
        const shaderBot = agents.find((a) => a.id === 'shader');
        const shaderBrush = shaderBot && shaderBot.laserTarget ? shaderBot.laserTarget : null;
        const tPose = layout ? layout.titlePose : null;
        const tr = targets ? targets.title : null;
        glyphData.inkSeeds.forEach((seed) => {
          const seedPt = tPose && tr ? transformPoint(seed, tr.cx, tr.cy, tPose) : seed;
          const brushNear = shaderBrush && Math.hypot(shaderBrush.x - seedPt.x, shaderBrush.y - seedPt.y) < 96;
          if (brushNear || p >= seed.triggerP) {
            seed.bloom = Math.min(1, seed.bloom + dt * 4.2);
          }
        });
      }

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

      // Precision cyan landing sonar ring on toolbox impact
      if (p >= 0.045 && p <= 0.21) {
        const ringT = clamp((p - 0.045) / 0.165, 0, 1);
        const ringAlpha = (1 - easeOutCubic(ringT)) * 0.55 * alpha;
        if (ringAlpha > 0.01) {
          const rx = bw * (0.45 + easeOutCubic(ringT) * 1.45);
          const ry = 10 + easeOutCubic(ringT) * 32;
          ctx.save();
          ctx.strokeStyle = `rgba(0, 240, 255, ${ringAlpha.toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(tb.x, tb.y + bodyTop + bh + 4, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.save();
      ctx.translate(tb.x, boxY);
      ctx.rotate(rattle);
      ctx.scale(scaleX, scaleY);
      ctx.globalAlpha = alpha;

      // Soft interior volumetric cone + glow beam when lid unlatches
      if (openFrac > 0.08) {
        drawGlow(0, -bh * 0.32, 74, 'cyan', 0.5 * openFrac);
        drawGlow(-20, -bh * 0.28, 50, 'pink', 0.38 * openFrac);
        drawGlow(20, -bh * 0.28, 50, 'amber', 0.34 * openFrac);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const beamGrad = ctx.createLinearGradient(0, bodyTop, 0, bodyTop - bh * 1.9);
        beamGrad.addColorStop(0, `rgba(0, 240, 255, ${(0.28 * openFrac).toFixed(3)})`);
        beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-bw * 0.42, bodyTop + 2);
        ctx.lineTo(bw * 0.42, bodyTop + 2);
        ctx.lineTo(bw * 0.88, bodyTop - bh * 1.85);
        ctx.lineTo(-bw * 0.88, bodyTop - bh * 1.85);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
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

    function drawLayoutAnnotations(p, layout, protoAlpha) {
      if (protoAlpha <= 0.01 || !targets || !layout) return;

      const nav = targets.nav;
      const tr = targets.title;
      const titleR = layout.titleRect || tr;
      const container = targets.container;

      ctx.save();

      // 1. Vertical Center Alignment Axis (flares briefly whenever any block snaps into 0px lock)
      const snapPulse = Math.max(
        layout.titlePose.settleFlash,
        layout.eyebrowPose.settleFlash,
        layout.taglinePose.settleFlash,
        ...layout.pillPoses.map((x) => x.settleFlash),
        ...layout.ctaPoses.map((x) => x.settleFlash)
      );
      const axisYTop = nav ? nav.top + nav.height : 0;
      const axisYBot = Math.min(vh - 24, (layout.ctaRects[0] ? layout.ctaRects[0].bottom : titleR.bottom) + 64);

      ctx.strokeStyle = snapPulse > 0.1
        ? `rgba(255, 255, 255, ${(0.22 * protoAlpha + 0.48 * snapPulse).toFixed(3)})`
        : `rgba(0, 240, 255, ${(0.14 * protoAlpha).toFixed(3)})`;
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tr.cx, axisYTop);
      ctx.lineTo(tr.cx, axisYBot);
      ctx.stroke();
      ctx.setLineDash([]);

      if (snapPulse > 0.18) {
        drawPixelBadge(ctx, tr.cx, axisYBot + 10, 'SNAP 0px', PALETTE.cyan, protoAlpha * snapPulse);
      }

      // 2. Outer Container Margin Rails & Real Viewport Margin / Padding Calipers
      if (container && container.width > 40) {
        const cLeft = container.left;
        const cRight = container.left + container.width;
        const padL = container.padLeft || 0;
        const padR = container.padRight || 0;
        const innerLeft = cLeft + padL;
        const innerRight = cRight - padR;

        ctx.strokeStyle = `rgba(0, 240, 255, ${(0.18 * protoAlpha).toFixed(3)})`;
        ctx.lineWidth = 0.85;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(innerLeft, axisYTop);
        ctx.lineTo(innerLeft, axisYBot);
        ctx.moveTo(innerRight, axisYTop);
        ctx.lineTo(innerRight, axisYBot);
        ctx.stroke();
        ctx.setLineDash([]);

        const marginY = axisYTop + 26;
        if (innerLeft >= 56 && vw >= 640) {
          const leftLabel = cLeft >= 32 ? `mx ${Math.round(innerLeft)}px` : `px ${Math.round(padL)}px`;
          const rightLabel = (vw - cRight) >= 32 ? `mx ${Math.round(vw - innerRight)}px` : `px ${Math.round(padR)}px`;
          drawDimensionLine(ctx, 4, marginY, innerLeft, marginY, leftLabel, PALETTE.cyan, protoAlpha * 0.72);
          drawDimensionLine(ctx, innerRight, marginY, vw - 4, marginY, rightLabel, PALETTE.cyan, protoAlpha * 0.72);
        }

        // Top nav height indicator along right inner margin rail
        if (nav && nav.height >= 24 && vw >= 640 && innerRight + 26 < vw) {
          drawDimensionLine(ctx, innerRight + 14, nav.top + 2, innerRight + 14, nav.top + nav.height - 2, `${Math.round(nav.height)}px`, PALETTE.blue, protoAlpha * 0.74, 22, 0);
        }
      }

      // 3. Live Height & Spanning Width Calipers on Moving/Scaling "VYRN" Frame
      if (titleR.left >= 64 && vw >= 560) {
        const hX = Math.max(18, titleR.left - 22);
        drawDimensionLine(ctx, hX, titleR.top, hX, titleR.bottom, `${Math.round(titleR.height)}px`, PALETTE.cyan, protoAlpha * 0.85, -20, 0);
      }
      const spanY = Math.min(titleR.top - 20, layout.eyebrowRect ? layout.eyebrowRect.top - 18 : titleR.top - 20);
      if (spanY > axisYTop + 20) {
        ctx.strokeStyle = `rgba(0, 240, 255, ${(0.28 * protoAlpha).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(titleR.left, titleR.top - 2);
        ctx.lineTo(titleR.left, spanY - 3);
        ctx.moveTo(titleR.right, titleR.top - 2);
        ctx.lineTo(titleR.right, spanY - 3);
        ctx.stroke();
        ctx.setLineDash([]);
        drawDimensionLine(ctx, titleR.left, spanY, titleR.right, spanY, `W ${Math.round(titleR.width)}px`, PALETTE.cyan, protoAlpha * 0.8);
      }

      // 4. Live Vertical Spacing Gap Calipers (Eyebrow -> Title -> Tagline -> CTAs)
      if (layout.eyebrowRect) {
        const ebR = layout.eyebrowRect;
        const gapEyebrow = titleR.top - ebR.bottom;
        if (gapEyebrow >= 14) {
          const gx = tr.cx + (vw >= 640 ? 64 : 36);
          drawDimensionLine(ctx, gx, ebR.bottom, gx, titleR.top, `${Math.round(gapEyebrow)}px`, PALETTE.amber, protoAlpha * 0.8, 22, 0);
        }
      }

      if (layout.taglineRect) {
        const tgR = layout.taglineRect;
        const gapTitleTag = tgR.top - titleR.bottom;
        if (gapTitleTag >= 14) {
          const gx = tr.cx - (vw >= 640 ? 72 : 42);
          drawDimensionLine(ctx, gx, titleR.bottom, gx, tgR.top, `${Math.round(gapTitleTag)}px`, PALETTE.blue, protoAlpha * 0.78, -22, 0);
        }

        if (layout.ctaRects.length > 0) {
          const ctaTop = Math.min(...layout.ctaRects.map((c) => c.top));
          const gapTagCta = ctaTop - tgR.bottom;
          if (gapTagCta >= 14) {
            drawDimensionLine(ctx, tr.cx, tgR.bottom, tr.cx, ctaTop, `${Math.round(gapTagCta)}px`, PALETTE.blue, protoAlpha * 0.76, 22, 0);
          }
        }
      }

      // 5. Below-CTA Live Gap Caliper (updates as COMPILER pushes buttons inward to lock)
      if (layout.ctaRects.length >= 2) {
        const c0 = layout.ctaRects[0];
        const c1 = layout.ctaRects[1];
        if (Math.abs(c0.cy - c1.cy) < 22 && c1.left > c0.right - 2) {
          const dimY = Math.max(c0.bottom, c1.bottom) + 18;
          ctx.strokeStyle = `rgba(0, 240, 255, ${(0.32 * protoAlpha).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(c0.right, c0.bottom + 2);
          ctx.lineTo(c0.right, dimY + 3);
          ctx.moveTo(c1.left, c1.bottom + 2);
          ctx.lineTo(c1.left, dimY + 3);
          ctx.stroke();
          ctx.setLineDash([]);

          const gapPx = Math.max(0, Math.round(c1.left - c0.right));
          drawDimensionLine(ctx, c0.right, dimY, c1.left, dimY, `gap ${gapPx}px`, PALETTE.cyan, protoAlpha * 0.88, 0, gapPx < 48 ? 14 : 0);
        }
      }

      ctx.restore();
    }

    function drawBlueprintGrid(p, wireframeAlpha, layout) {
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
      ctx.restore();

      // Corner crop marks & live margin/pixel calipers drawn unclipped
      const protoAlpha = smoothstep(0.14, 0.24, p) * (1 - smoothstep(0.67, 0.78, p));
      const guideAlpha = smoothstep(0.16, 0.34, p) * wireframeAlpha * 0.42;
      if (guideAlpha > 0.01 && layout && layout.titleRect) {
        const tr = layout.titleRect;
        const m = 12;
        const len = 14;
        const l = tr.left - m;
        const r = tr.left + tr.width + m;
        const t = tr.top - m;
        const b = tr.top + tr.height + m;

        ctx.save();
        ctx.strokeStyle = `rgba(0, 240, 255, ${guideAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(l, t + len); ctx.lineTo(l, t); ctx.lineTo(l + len, t);
        ctx.moveTo(r - len, t); ctx.lineTo(r, t); ctx.lineTo(r, t + len);
        ctx.moveTo(l, b - len); ctx.lineTo(l, b); ctx.lineTo(l + len, b);
        ctx.moveTo(r - len, b); ctx.lineTo(r, b); ctx.lineTo(r, b - len);
        ctx.moveTo(tr.cx, t - 5); ctx.lineTo(tr.cx, t + 4);
        ctx.moveTo(tr.cx, b - 4); ctx.lineTo(tr.cx, b + 5);
        ctx.moveTo(l - 5, tr.cy); ctx.lineTo(l + 4, tr.cy);
        ctx.moveTo(r - 4, tr.cy); ctx.lineTo(r + 5, tr.cy);
        ctx.stroke();
        ctx.restore();
      }

      drawLayoutAnnotations(p, layout, protoAlpha);
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
        const bt = targets.brandText || b;
        drawCornerBrackets(ctx, b, 6, PALETTE.white, 0.5 * alpha * navProg);
        if (navProg > 0.35) {
          const textA = 0.85 * alpha * smoothstep(0.35, 0.6, navProg);
          ctx.save();
          ctx.font = targets.brandFont ? targets.brandFont.font : '800 15px Syne, sans-serif';
          if ('letterSpacing' in ctx && targets.brandFont && targets.brandFont.letterSpacing !== 'normal') {
            ctx.letterSpacing = targets.brandFont.letterSpacing;
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${textA.toFixed(3)})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('VYRN', bt.cx, bt.cy);
          ctx.restore();

          if (targets.brandDots && targets.brandDots.length) {
            targets.brandDots.forEach((dot) => {
              drawGlow(dot.rect.cx, dot.rect.cy, Math.max(8, dot.rect.width * 2.2), dot.glowKey, textA);
            });
          }
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

    function drawOrganicInkFill(p, wireframeAlpha, titlePose) {
      if (!glyphData || !glyphData.inkCtx || !glowSprites.inkStamp) return;
      const inkStart = 0.30;
      if (p <= inkStart) return;

      const tr = targets.title;
      const pad = glyphData.pad || 0;
      const gw = glyphData.gw || glyphData.w;
      const gh = glyphData.gh || glyphData.h;
      const gdpr = glyphData.glyphDpr || 1;
      const ictx = glyphData.inkCtx;
      const stamp = glowSprites.inkStamp;

      ictx.save();
      ictx.setTransform(1, 0, 0, 1, 0, 0);
      ictx.clearRect(0, 0, glyphData.inkCanvas.width, glyphData.inkCanvas.height);
      ictx.scale(gdpr, gdpr);
      ictx.globalCompositeOperation = 'source-over';

      // 1. Dynamic organic ink blooms driven by SHADER's brush sweeps
      let anyDrawn = false;
      glyphData.inkSeeds.forEach((seed) => {
        if (seed.bloom <= 0.01) return;
        anyDrawn = true;
        const localT = clamp(seed.bloom, 0, 1);
        const radius = seed.maxRadius * easeOutCubic(localT);
        ictx.globalAlpha = smoothstep(0, 0.22, localT);

        seed.lobes.forEach((lobe) => {
          const r = radius * lobe.rScale;
          const cx = seed.lx + lobe.dx * localT;
          const cy = seed.ly + lobe.dy * localT;
          ictx.drawImage(stamp, cx - r, cy - r, r * 2, r * 2);
        });
      });

      // 2. Live painterly bleed directly beneath SHADER & SYNTH beam contact points (untransformed back to local inkCanvas)
      agents.forEach((ag) => {
        if ((ag.id === 'shader' || ag.id === 'synth' || ag.id === 'architect') && ag.laserTarget && p >= 0.30 && p <= 0.74) {
          const localPt = titlePose ? inverseTransformPoint(ag.laserTarget, tr.cx, tr.cy, titlePose) : ag.laserTarget;
          const lx = localPt.x - (tr.left - pad);
          const ly = localPt.y - (tr.top - pad);
          if (lx >= -40 && lx <= gw + 40 && ly >= -40 && ly <= gh + 40) {
            anyDrawn = true;
            const brushR = Math.max(46, glyphData.h * 0.34);
            ictx.globalAlpha = ag.id === 'shader' ? 0.94 : 0.72;
            ictx.drawImage(stamp, lx - brushR, ly - brushR, brushR * 2, brushR * 2);
          }
        }
      });

      // 3. Ensure full rich saturation before verification handoff
      const fullFillBlend = smoothstep(0.66, 0.75, p);
      if (fullFillBlend > 0.01) {
        anyDrawn = true;
        ictx.globalAlpha = fullFillBlend;
        ictx.fillStyle = '#ffffff';
        ictx.fillRect(0, 0, gw, gh);
      }

      if (!anyDrawn) {
        ictx.restore();
        return;
      }

      // Clip organic wet ink silhouette cleanly to padded high-DPI Syne-800 "VYRN" fill
      ictx.setTransform(1, 0, 0, 1, 0, 0);
      ictx.globalAlpha = 1;
      ictx.globalCompositeOperation = 'source-in';
      ictx.drawImage(glyphData.fillCanvas, 0, 0);
      ictx.restore();

      ctx.save();
      if (titlePose) {
        ctx.translate(tr.cx + titlePose.dx, tr.cy + titlePose.dy);
        ctx.rotate(titlePose.rot);
        ctx.scale(titlePose.scale, titlePose.scale);
        ctx.globalAlpha = clamp(smoothstep(0.30, 0.72, p) * 1.15, 0, 0.98) * wireframeAlpha;
        ctx.drawImage(glyphData.inkCanvas, (tr.left - pad) - tr.cx, (tr.top - pad) - tr.cy, gw, gh);
      } else {
        ctx.globalAlpha = clamp(smoothstep(0.30, 0.72, p) * 1.15, 0, 0.98) * wireframeAlpha;
        ctx.drawImage(glyphData.inkCanvas, tr.left - pad, tr.top - pad, gw, gh);
      }
      ctx.restore();
    }

    function drawConstructedHero(p, wireframeAlpha, layout) {
      const tr = targets.title;
      const titlePose = layout ? layout.titlePose : { dx: 0, dy: 0, scale: 1, rot: 0, settled: true, settleFlash: 0 };
      const titleR = (layout && layout.titleRect) || tr;
      const protoAlpha = smoothstep(0.16, 0.26, p) * (1 - smoothstep(0.66, 0.76, p));

      // Soft tri-color backlight glow behind live moving/scaling VYRN
      const haloP = smoothstep(0.24, 0.62, p) * wireframeAlpha;
      if (haloP > 0.01) {
        drawGlow(titleR.cx - titleR.width * 0.22, titleR.cy, titleR.width * 0.36, 'pink', 0.24 * haloP);
        drawGlow(titleR.cx, titleR.cy, titleR.width * 0.4, 'cyan', 0.22 * haloP);
        drawGlow(titleR.cx + titleR.width * 0.22, titleR.cy, titleR.width * 0.34, 'amber', 0.18 * haloP);
      }

      // Eyebrow capsule (nudged cleanly into center lock)
      if (targets.eyebrow) {
        const ebP = smoothstep(0.17, 0.36, p);
        if (ebP > 0.01 && wireframeAlpha > 0.01) {
          const ebPose = (layout && layout.eyebrowPose) || { dx: 0, dy: 0, scale: 1 };
          const ebR = (layout && layout.eyebrowRect) || targets.eyebrow;
          drawCornerBrackets(ctx, {
            left: ebR.left - 8,
            top: ebR.top - 4,
            width: ebR.width + 16,
            height: ebR.height + 8,
          }, 7, PALETTE.amber, 0.65 * ebP * wireframeAlpha);

          if (targets.eyebrowDots && targets.eyebrowDots.length) {
            targets.eyebrowDots.forEach((dot, i) => {
              const dotAppear = smoothstep(0.2 + i * 0.15, 0.55 + i * 0.15, ebP);
              if (dotAppear > 0) {
                const pt = transformPoint({ x: dot.rect.cx, y: dot.rect.cy }, targets.eyebrow.cx, targets.eyebrow.cy, ebPose);
                drawGlow(pt.x, pt.y, Math.max(10, dot.rect.width * 1.8), dot.glowKey, 0.85 * dotAppear * wireframeAlpha);
              }
            });
          } else {
            const dotColors = ['pink', 'cyan', 'amber'];
            dotColors.forEach((dk, i) => {
              const dotAppear = smoothstep(0.2 + i * 0.15, 0.55 + i * 0.15, ebP);
              if (dotAppear > 0) {
                drawGlow(ebR.left + 4 + i * 13 * ebPose.scale, ebR.cy, 12, dk, 0.85 * dotAppear * wireframeAlpha);
              }
            });
          }
        }
      }

      // Prototyping transform bounding box & live spec tag around "VYRN"
      if (protoAlpha > 0.02 && p >= 0.21) {
        const boxIn = smoothstep(0.21, 0.29, p);
        const scalePct = Math.round(titlePose.scale * 100);
        const tag = titlePose.settled
          ? `${Math.round(titleR.width)}×${Math.round(titleR.height)}px • LOCKED`
          : `${Math.round(titleR.width)}×${Math.round(titleR.height)}px • ${scalePct}%`;
        drawTransformBox(
          ctx,
          titleR.cx,
          titleR.cy,
          titleR.width + 16,
          titleR.height + 12,
          titlePose.rot,
          titlePose.settleFlash > 0.1 ? PALETTE.white : PALETTE.cyan,
          protoAlpha * boxIn * (0.48 + 0.42 * titlePose.settleFlash),
          protoAlpha * boxIn * 0.92,
          tag
        );
      }

      // Organic watercolor ink-bleed fill inside moving/scaling "VYRN"
      if (wireframeAlpha > 0.01) {
        drawOrganicInkFill(p, wireframeAlpha, titlePose);
      }

      // Wireframe contour mesh across V-Y-R-N (follows live titlePose transform)
      if (glyphData && wireframeAlpha > 0.01) {
        const meshP = smoothstep(0.22, 0.64, p);
        const fillP = smoothstep(0.45, 0.78, p);

        if (meshP > 0.02) {
          const edgeCount = glyphData.edges.length;
          const activeNormLimit = meshP * 1.15;

          ctx.save();
          ctx.translate(tr.cx + titlePose.dx, tr.cy + titlePose.dy);
          ctx.rotate(titlePose.rot);
          ctx.scale(titlePose.scale, titlePose.scale);
          ctx.translate(-tr.cx, -tr.cy);

          ctx.globalCompositeOperation = 'lighter';
          ctx.lineWidth = 1 / Math.max(0.4, titlePose.scale);
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

      // Floating Liquid Glass Pills (prototype wireframes scaled/dragged by MOTION into final glass lock)
      targets.pills.forEach((pill, idx) => {
        const pillStart = 0.26 + idx * 0.05;
        const pillP = smoothstep(pillStart, pillStart + 0.24, p);
        if (pillP <= 0.01 || wireframeAlpha <= 0.01) return;

        const rOrig = pill.rect;
        const pose = (layout && layout.pillPoses[idx]) || { dx: 0, dy: 0, scale: 1, rot: 0, settled: true, settleFlash: 0 };
        const rLive = (layout && layout.pillRects[idx]) || rOrig;
        const finalMix = smoothstep(0.65, 1.0, pose.progress);

        ctx.save();
        ctx.translate(rOrig.cx + pose.dx, rOrig.cy + pose.dy);
        ctx.rotate(pill.tilt + pose.rot);
        ctx.scale(pose.scale, pose.scale);
        ctx.translate(-rOrig.cx, -rOrig.cy);

        const glassA = smoothstep(0.45, 1, pillP) * (0.28 + 0.44 * finalMix) * wireframeAlpha;
        if (glassA > 0.01) {
          ctx.fillStyle = `rgba(18, 22, 30, ${glassA.toFixed(3)})`;
          traceRoundedRect(ctx, rOrig.left, rOrig.top, rOrig.width, rOrig.height, rOrig.radius);
          ctx.fill();
        }

        // Diagonal specular glass glint sweep clipped to pill contour upon settle
        if (pillP > 0.48 && pillP < 0.98) {
          const glintT = (pillP - 0.48) / 0.50;
          const glintA = Math.sin(glintT * Math.PI) * 0.34 * wireframeAlpha;
          if (glintA > 0.01) {
            ctx.save();
            traceRoundedRect(ctx, rOrig.left, rOrig.top, rOrig.width, rOrig.height, rOrig.radius);
            ctx.clip();
            const sx = lerp(rOrig.left - 34, rOrig.left + rOrig.width + 34, easeInOutCubic(glintT));
            const sGrad = ctx.createLinearGradient(sx - 18, rOrig.top, sx + 18, rOrig.top + rOrig.height);
            sGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            sGrad.addColorStop(0.5, `rgba(255, 255, 255, ${glintA.toFixed(3)})`);
            sGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = sGrad;
            ctx.fillRect(rOrig.left - 2, rOrig.top - 2, rOrig.width + 4, rOrig.height + 4);
            ctx.restore();
          }
        }

        const perim = 2 * (rOrig.width + rOrig.height);
        ctx.strokeStyle = pose.settleFlash > 0.1 ? PALETTE.white : pill.color;
        ctx.globalAlpha = (0.72 + 0.25 * finalMix) * pillP * wireframeAlpha;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([perim * easeOutCubic(pillP), perim]);
        traceRoundedRect(ctx, rOrig.left, rOrig.top, rOrig.width, rOrig.height, rOrig.radius);
        ctx.stroke();
        ctx.setLineDash([]);

        if (pillP > 0.28) {
          const innerA = smoothstep(0.28, 0.72, pillP) * wireframeAlpha;
          const dotX = rOrig.cx + (pill.dot ? pill.dot.x : (-rOrig.width * 0.5 + 18));
          const dotY = rOrig.cy + (pill.dot ? pill.dot.y : 0);
          const dotR = pill.dot ? pill.dot.r : 3.5;

          drawGlow(dotX, dotY, dotR * 3.6, pill.glowKey, 0.9 * innerA);
          ctx.fillStyle = pill.color;
          ctx.globalAlpha = innerA;
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = pill.text ? pill.text.font : '600 13px Inter, sans-serif';
          if ('letterSpacing' in ctx && pill.text && pill.text.letterSpacing && pill.text.letterSpacing !== 'normal') {
            ctx.letterSpacing = pill.text.letterSpacing;
          }
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          const textX = rOrig.cx + (pill.text ? pill.text.x : 10);
          const textY = rOrig.cy + (pill.text ? pill.text.y : 0);
          ctx.fillText(pill.label, textX, textY);
        }

        ctx.restore();

        // Figma prototyping handle box & live delta readout while sliding into place
        if (protoAlpha > 0.02 && (!pose.settled || pose.settleFlash > 0.04)) {
          const boxAlpha = protoAlpha * pillP * (pose.settled ? pose.settleFlash : 0.78);
          const pillTag = pose.settled
            ? 'LOCKED 0px'
            : `dx:${pose.dx >= 0 ? '+' : ''}${Math.round(pose.dx)} ${Math.round(pose.scale * 100)}%`;
          drawTransformBox(ctx, rLive.cx, rLive.cy, rLive.width + 6, rLive.height + 6, pill.tilt + pose.rot, pill.color, boxAlpha, boxAlpha, pillTag);
        }
      });

      // Tagline skeleton lines (stretches horizontally into centered DOM width)
      if (targets.tagline) {
        const tagP = smoothstep(0.32, 0.56, p);
        if (tagP > 0.01 && wireframeAlpha > 0.01) {
          const tg = (layout && layout.taglineRect) || targets.tagline;
          const tgPose = (layout && layout.taglinePose) || { scale: 1, settled: true, settleFlash: 0 };
          const barW = Math.min(tg.width * 0.86, 480) * easeOutCubic(tagP);

          if (protoAlpha > 0.02 && (!tgPose.settled || tgPose.settleFlash > 0.05)) {
            drawTransformBox(ctx, tg.cx, tg.cy, tg.width + 12, tg.height + 8, 0, PALETTE.blue, protoAlpha * 0.55, protoAlpha * 0.7, `W:${Math.round(tg.width)}px`);
          }

          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.32 * tagP * wireframeAlpha).toFixed(3)})`;
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

      // CTA Pill Frames (drawn as prototype blocks then pushed smoothly together to exact DOM gap)
      targets.ctas.forEach((cta, idx) => {
        const ctaP = smoothstep(0.40 + idx * 0.04, 0.62 + idx * 0.04, p);
        if (ctaP <= 0.01 || wireframeAlpha <= 0.01) return;
        const r = (layout && layout.ctaRects[idx]) || cta.rect;
        const cPose = (layout && layout.ctaPoses[idx]) || { settled: true, settleFlash: 0, progress: 1 };
        const finalMix = smoothstep(0.55, 1.0, cPose.progress);
        const perim = 2 * (r.width + r.height);

        ctx.save();
        if (cta.solid) {
          ctx.fillStyle = `rgba(255, 255, 255, ${((0.05 + 0.11 * finalMix) * smoothstep(0.35, 1, ctaP) * wireframeAlpha).toFixed(3)})`;
          traceRoundedRect(ctx, r.left, r.top, r.width, r.height, r.radius);
          ctx.fill();
        }
        ctx.strokeStyle = cPose.settleFlash > 0.12 ? PALETTE.cyan : (cta.solid ? PALETTE.white : PALETTE.cyan);
        ctx.globalAlpha = 0.84 * ctaP * wireframeAlpha;
        ctx.lineWidth = 1.35;
        ctx.setLineDash([perim * easeOutCubic(ctaP), perim]);
        traceRoundedRect(ctx, r.left, r.top, r.width, r.height, r.radius);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        if (protoAlpha > 0.02 && (!cPose.settled || cPose.settleFlash > 0.05)) {
          const boxA = protoAlpha * ctaP * (cPose.settled ? cPose.settleFlash : 0.65);
          drawTransformBox(ctx, r.cx, r.cy, r.width + 6, r.height + 6, 0, PALETTE.cyan, boxA, boxA, `${Math.round(r.width)}×${Math.round(r.height)}px`);
        }
      });

      // Verification Scan Beam (Phase 3 — sharp dual-layer laser sweep)
      if (p >= 0.74 && p <= 0.88) {
        const scanT = (p - 0.74) / 0.14;
        const scanY = lerp(0, vh, easeInOutCubic(scanT));
        const scanAlpha = Math.sin(scanT * Math.PI) * 0.78;
        ctx.save();
        const grad = ctx.createLinearGradient(0, scanY - 52, 0, scanY + 10);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        grad.addColorStop(0.68, `rgba(0, 240, 255, ${(scanAlpha * 0.22).toFixed(3)})`);
        grad.addColorStop(0.84, `rgba(0, 240, 255, ${(scanAlpha * 0.65).toFixed(3)})`);
        grad.addColorStop(0.92, `rgba(255, 255, 255, ${(scanAlpha * 0.92).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 52, vw, 62);

        // Razor-sharp horizontal wave front
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255, 255, 255, ${(scanAlpha * 0.88).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(vw, scanY);
        ctx.stroke();
        ctx.restore();
      }
    }

    function drawBotChassis(bodyW, bodyH, topFill, bottomFill, strokeColor, radius) {
      const grad = ctx.createLinearGradient(0, -bodyH * 0.5, 0, bodyH * 0.5);
      grad.addColorStop(0, topFill);
      grad.addColorStop(1, bottomFill);
      ctx.fillStyle = grad;
      traceRoundedRect(ctx, -bodyW * 0.5, -bodyH * 0.5, bodyW, bodyH, radius);
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Subtle top rim specular bevel for glossy micro-contrast
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.5 + radius * 0.65, -bodyH * 0.5 + 1.5);
      ctx.lineTo(bodyW * 0.5 - radius * 0.65, -bodyH * 0.5 + 1.5);
      ctx.stroke();
    }

    function drawSingleAgentCharacter(ag, agentAlpha) {
      const blink = ag.blinkTimer < 0 ? Math.sin(((-ag.blinkTimer) / 0.14) * Math.PI) : 0;
      const bodyW = 28;
      const bodyH = 22;
      const scale = vw <= 480 ? 1.12 : 1.38;

      ctx.save();
      ctx.translate(ag.x, ag.y);
      ctx.rotate(ag.tilt);
      ctx.scale(scale, scale);
      ctx.globalAlpha = agentAlpha;

      // Articulated micro tool-emitter nozzle aimed at active target
      if (ag.laserTarget && Math.hypot(ag.laserTarget.x - ag.x, ag.laserTarget.y - ag.y) < 360) {
        const nozzleAngle = Math.atan2(ag.laserTarget.y - ag.y, ag.laserTarget.x - ag.x) - ag.tilt;
        ctx.save();
        ctx.rotate(nozzleAngle);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = ag.color;
        ctx.lineWidth = 1.1;
        traceRoundedRect(ctx, bodyW * 0.42, -1.9, 8.5, 3.8, 1.8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bodyW * 0.42 + 8.5, 0, 1.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Layered plasma hover thruster plume under bot
      if (ag.thrustersActive) {
        const flicker = Math.sin(ag.flagPhase * 2.2) * 2.5;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = ag.color;
        ctx.globalAlpha = 0.44 * agentAlpha;
        ctx.beginPath();
        ctx.moveTo(-6.2, bodyH * 0.5);
        ctx.quadraticCurveTo(0, bodyH * 0.5 + 11 + flicker, 6.2, bodyH * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.72 * agentAlpha;
        ctx.beginPath();
        ctx.moveTo(-2.8, bodyH * 0.5);
        ctx.quadraticCurveTo(0, bodyH * 0.5 + 6 + flicker * 0.5, 2.8, bodyH * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = agentAlpha;
      }

      if (ag.id === 'shader') {
        // SHADER: Sleek artist bot carrying a large animated LGBTQIA+ Progress Pride Flag + beret
        drawProgressPrideFlag(ctx, 10, -28, 42, 26, ag.flagPhase);
        drawBotChassis(bodyW, bodyH, '#1d2436', '#0e121c', PALETTE.pink, 10);
        drawTrackingEyes(ctx, -6, -1, 6, -1, ag.lookAngle - ag.tilt, blink, 4.3);

        // Sleek magenta artist beret tilted on top
        ctx.save();
        ctx.translate(-2, -bodyH * 0.5 - 1);
        ctx.rotate(-0.18);
        ctx.fillStyle = '#ff3b69';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 0.85;
        ctx.stroke();
        // Top highlight arc on beret crown
        ctx.strokeStyle = 'rgba(255, 220, 232, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, -1.6, 8, 2.2, 0, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        ctx.fillStyle = '#ff3b69';
        ctx.fillRect(-1.5, -7, 3, 4);
        ctx.restore();
      } else if (ag.id === 'architect') {
        // ARCHITECT: Cyan builder bot with expressive eyes + Yellow Construction Hard Hat
        drawBotChassis(bodyW, bodyH, '#152235', '#0b111c', PALETTE.cyan, 9);
        drawTrackingEyes(ctx, -6, 0, 6, 0, ag.lookAngle - ag.tilt, blink, 4.2);

        // Yellow Hard Hat
        ctx.save();
        ctx.translate(0, -bodyH * 0.5 + 1);
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(0, 0, 13, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Dome specular arc
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 10.2, Math.PI * 1.15, Math.PI * 1.48);
        ctx.stroke();
        // Hard hat brim
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 0.9;
        traceRoundedRect(ctx, -16, -2, 32, 4.5, 2.2);
        ctx.fill();
        ctx.stroke();
        // Center crest ridge
        ctx.fillStyle = '#fde047';
        traceRoundedRect(ctx, -2.5, -13.5, 5, 11.5, 2.5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (ag.id === 'synth') {
        // SYNTH: Big-eyed amber audio bot wearing chunky Studio Headphones
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -1, 17, Math.PI * 1.05, -Math.PI * 0.05);
        ctx.stroke();

        drawBotChassis(bodyW, bodyH, '#251e12', '#120e08', PALETTE.amber, 10);

        // Padded headphone earcups + subtle metallic accent ring
        ctx.fillStyle = PALETTE.amber;
        traceRoundedRect(ctx, -bodyW * 0.5 - 5.5, -7, 6, 14, 3);
        ctx.fill();
        traceRoundedRect(ctx, bodyW * 0.5 - 0.5, -7, 6, 14, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-bodyW * 0.5 - 3.5, -4, 1.4, 8);
        ctx.fillRect(bodyW * 0.5 + 2.1, -4, 1.4, 8);

        drawTrackingEyes(ctx, -6.5, -0.5, 6.5, -0.5, ag.lookAngle - ag.tilt, blink, 4.9);

        // Mini pulsing EQ bars along synth console chin
        ctx.fillStyle = PALETTE.amber;
        for (let b = 0; b < 4; b++) {
          const barH = 1.6 + Math.abs(Math.sin(ag.flagPhase * (2.6 + b * 0.85) + b * 1.1)) * 2.6;
          ctx.fillRect(-5.3 + b * 3.1, 9.4 - barH, 1.7, barH);
        }
      } else if (ag.id === 'motion') {
        // MOTION: Lime kinetic bot wearing a Dapper Top Hat + glowing hatband
        drawBotChassis(bodyW, bodyH, '#192717', '#0d140c', PALETTE.lime, 9);
        drawTrackingEyes(ctx, -6, 0, 6, 0, ag.lookAngle - ag.tilt, blink, 4.2);

        // Orbiting easing keyframe diamond beside top hat
        ctx.save();
        ctx.translate(15.5, -bodyH * 0.5 - 9 + Math.sin(ag.flagPhase * 1.9) * 2.4);
        ctx.rotate(Math.PI * 0.25 + Math.sin(ag.flagPhase * 1.4) * 0.18);
        ctx.fillStyle = 'rgba(132, 204, 22, 0.28)';
        ctx.strokeStyle = PALETTE.lime;
        ctx.lineWidth = 1.1;
        ctx.fillRect(-3.2, -3.2, 6.4, 6.4);
        ctx.strokeRect(-3.2, -3.2, 6.4, 6.4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-0.9, -0.9, 1.8, 1.8);
        ctx.restore();

        // Dapper Top Hat
        ctx.save();
        ctx.translate(0, -bodyH * 0.5 + 1);
        ctx.fillStyle = '#181c24';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.9;
        traceRoundedRect(ctx, -9.5, -16, 19, 15, 2.5);
        ctx.fill();
        ctx.stroke();
        // Subtle silk crown sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fillRect(-7.2, -14.5, 3, 9);
        // Glowing lime ribbon band
        ctx.fillStyle = PALETTE.lime;
        ctx.fillRect(-9.2, -5.5, 18.4, 3);
        // Hat brim
        ctx.fillStyle = '#1e2430';
        traceRoundedRect(ctx, -16, -2.5, 32, 4, 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        // COMPILER: Blue inspector bot with wide curious eyes & Spinning Propeller Cap
        drawBotChassis(bodyW, bodyH, '#16233a', '#0c1220', PALETTE.blue, 10);
        drawTrackingEyes(ctx, -6, 0, 6, 0, ag.lookAngle - ag.tilt, blink, 4.6);

        // Colorful beanie dome
        ctx.save();
        ctx.translate(0, -bodyH * 0.5 + 1);
        ctx.fillStyle = PALETTE.blue;
        ctx.beginPath();
        ctx.arc(0, 0, 12, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = PALETTE.pink;
        ctx.beginPath();
        ctx.arc(0, 0, 12, Math.PI, Math.PI * 1.45);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        // Cap visor bill
        ctx.fillStyle = PALETTE.amber;
        traceRoundedRect(ctx, 2, -2, 13, 3.8, 2);
        ctx.fill();

        // Spinning propeller shaft + motion blur disc + blades
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-1.2, -16, 2.4, 5);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
        ctx.beginPath();
        ctx.ellipse(0, -16, 15.5, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();
        const bladeW = 4 + Math.abs(Math.cos(ag.propellerAngle)) * 12;
        ctx.fillStyle = PALETTE.cyan;
        traceRoundedRect(ctx, -bladeW, -17.5, bladeW * 2, 3, 1.5);
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
      const layout = computeFrameLayout(progress);
      emitSnapSparks(progress, layout);
      updateAgentTargets(progress, elapsedSec, layout);
      stepPhysics(progress, dt, layout);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);

      if (backdropAlpha > 0.004) {
        ctx.fillStyle = `rgba(9, 11, 14, ${backdropAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, vw, vh);
      }

      drawBlueprintGrid(progress, wireframeAlpha, layout);
      drawConstructedNav(progress, wireframeAlpha);
      drawConstructedHero(progress, wireframeAlpha, layout);
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

      try {
        window.sessionStorage.setItem('vyrn_swarm_played', '1');
      } catch (e) {}

      if (!window.location.hash && window.scrollY > 0) {
        window.scrollTo(0, 0);
      }

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

    window.addEventListener('pageshow', (event) => {
      if (event.persisted || !document.documentElement.classList.contains('swarm-booting')) {
        controller.stop();
      }
    });
  });
})();
