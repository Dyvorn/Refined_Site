/**
 * VYRN — Studio Client-Side Logic
 * Features:
 * - Viewport scroll progress indicator
 * - Floating glass nav & mobile drawer toggle
 * - Dynamic YouTube API latest video integration (Default: 5t1xed1vlO4)
 * - Privacy-enhanced video embed trigger
 * - Modular data-driven project card renderer
 * - Minimalist back-to-top trigger
 */

/**
 * Fallback Projects Data (Used if config.js is missing or CONFIG.PROJECTS is empty)
 * Strictly populated with uppercase placeholder tokens.
 */
const DEFAULT_PROJECTS = [
  {
    title: "[PROJECT TITLE 01]",
    category: "AUDIO",
    discipline: "audio",
    year: "[2026]",
    description: "[Brief one-sentence description or summary of the audio production project.]",
    link: "#"
  },
  {
    title: "[PROJECT TITLE 02]",
    category: "VIDEO",
    discipline: "video",
    year: "[2026]",
    description: "[Brief one-sentence description or summary of the video production or tutorial project.]",
    link: "#"
  },
  {
    title: "[PROJECT TITLE 03]",
    category: "CODE",
    discipline: "code",
    year: "[2026]",
    description: "[Brief one-sentence description or summary of the creative software or script tool.]",
    link: "#"
  },
  {
    title: "[PROJECT TITLE 04]",
    category: "DIY // ENGINEERING",
    discipline: "all",
    year: "[2026]",
    description: "[Brief one-sentence description or summary of the physical build / hardware engineering project.]",
    link: "#"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initUnifiedScroll();
  initMobileNav();
  initVideoPlayer();
  fetchLatestYouTubeVideo();
  initProjectsLiquidGlass();
  initHeroWatercolorText();
  initHeroRefractionStage();
});

/**
 * 1. Unified requestAnimationFrame-Throttled Scroll Controller
 * Eliminates layout thrashing, forced synchronous reflows, and scroll stutter:
 * - Viewport reading progress indicator
 * - Floating glass nav pill scrolled state
 * - Back-to-top trigger visibility
 */
function initUnifiedScroll() {
  const progressBar = document.getElementById('scroll-progress');
  const navPill = document.getElementById('nav-pill');
  const backToTopBtn = document.getElementById('back-to-top');

  let isScrolled = false;
  let ticking = false;

  const updateScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    // A. Reading progress bar
    if (progressBar && scrollHeight > 0) {
      const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      progressBar.style.width = `${progress}%`;
    }

    // B. Header scrolled state (smooth class toggle, zero synchronous reflow)
    if (navPill) {
      const scrolled = scrollTop > 40;
      if (scrolled !== isScrolled) {
        isScrolled = scrolled;
        navPill.classList.toggle('is-scrolled', isScrolled);
      }
    }

    // C. Back to top button visibility
    if (backToTopBtn) {
      if (scrollTop > 300) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * 3. Floating Glass Nav Mobile Toggle
 */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const panel = document.getElementById('mobile-nav-panel');
  if (!menuBtn || !panel) return;

  const closeMenu = () => {
    menuBtn.classList.remove('is-active');
    menuBtn.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
  };

  const toggleMenu = () => {
    const isOpen = panel.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      menuBtn.classList.add('is-active');
      menuBtn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
    }
  };

  menuBtn.addEventListener('click', toggleMenu);

  // Close when clicking links inside panel
  const mobileLinks = panel.querySelectorAll('.mobile-nav-item, a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close when clicking outside of nav
  document.addEventListener('click', (e) => {
    const pill = document.getElementById('nav-pill');
    if (pill && !pill.contains(e.target) && panel.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/**
 * 4. Fast Privacy-Enhanced Video Embed Trigger
 */
function initVideoPlayer() {
  const videoWrapper = document.getElementById('video-wrapper');
  const videoTrigger = document.getElementById('video-trigger');

  if (!videoWrapper || !videoTrigger) return;

  const embedVideo = () => {
    const videoId = videoWrapper.getAttribute('data-video-id') || '5t1xed1vlO4';
    
    videoWrapper.innerHTML = `
      <iframe 
        src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0" 
        title="YouTube Video Player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen
        style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; border: none; border-radius: inherit;"
      ></iframe>
    `;
  };

  videoTrigger.addEventListener('click', embedVideo);
}

/**
 * Helper: Animate numeric counter values smoothly
 */
function animateValue(obj, start, end, duration, suffix = '') {
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // Smooth ease-out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeProgress * (end - start) + start);
    obj.textContent = current.toLocaleString() + (progress >= 1 ? suffix : '');
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

/**
 * 5. Fetch Latest YouTube Video & Live Stats via API (with zero quota waste & rock-solid fallback)
 */
async function fetchLatestYouTubeVideo() {
  const subCountEl = document.getElementById('sub-count');
  const videoWrapper = document.getElementById('video-wrapper');
  const videoPoster = document.getElementById('video-poster');
  const videoTitle = document.getElementById('video-title');
  const videoLink = document.getElementById('video-yt-link');

  const triggerFallback = () => {
    if (subCountEl) {
      animateValue(subCountEl, 0, 51, 1600, '+');
    }
  };

  if (typeof CONFIG === 'undefined' || !CONFIG.YOUTUBE_API_KEY || !CONFIG.YOUTUBE_CHANNEL_ID) {
    triggerFallback();
    return;
  }

  const { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = CONFIG;

  try {
    // 1. Fetch channel statistics & uploads playlist (1 quota unit)
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails,snippet&id=${encodeURIComponent(YOUTUBE_CHANNEL_ID)}&key=${encodeURIComponent(YOUTUBE_API_KEY)}`;
    const channelRes = await fetch(channelUrl);
    
    if (!channelRes.ok) {
      triggerFallback();
      return;
    }

    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
      triggerFallback();
      return;
    }

    const channelInfo = channelData.items[0];
    const subs = parseInt(channelInfo.statistics?.subscriberCount, 10);
    if (!isNaN(subs) && subCountEl) {
      animateValue(subCountEl, 0, subs, 1800);
    }

    const uploadsPlaylistId = channelInfo.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) return;

    // 2. Fetch the single latest upload from the uploads playlist (1 quota unit vs 100 for search)
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=1&key=${encodeURIComponent(YOUTUBE_API_KEY)}`;
    const playlistRes = await fetch(playlistUrl);

    if (!playlistRes.ok) return;

    const playlistData = await playlistRes.json();
    if (playlistData.items && playlistData.items.length > 0) {
      const item = playlistData.items[0].snippet;
      const videoId = item.resourceId?.videoId;
      const title = item.title;
      const thumbs = item.thumbnails;
      const thumbUrl = (thumbs.maxres && thumbs.maxres.url) || 
                       (thumbs.standard && thumbs.standard.url) || 
                       (thumbs.high && thumbs.high.url) || 
                       (thumbs.medium && thumbs.medium.url);

      if (videoId && videoWrapper) videoWrapper.setAttribute('data-video-id', videoId);
      if (videoPoster && thumbUrl) videoPoster.src = thumbUrl;
      if (videoTitle && title) videoTitle.textContent = title;
      if (videoId && videoLink) videoLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    }
  } catch (err) {
    // Graceful fallback for local development or offline preview
    triggerFallback();
  }
}

/**
 * 6. Dynamic Project Cards Rendering (from config.js or DEFAULT_PROJECTS)
 */
/**
 * 6. Interactive WebGL Liquid Glass Block ("Nothing's here yet")
 * Renders an organic liquid glass distortion shader over an offscreen procedural multi-spectral texture.
 * Interactively ripples and refracts based on cursor movement with smooth physical inertia.
 */
function initProjectsLiquidGlass() {
  const block = document.getElementById('projects-empty-block');
  const canvas = document.getElementById('projects-gl-canvas');
  const fragShaderEl = document.getElementById('fragShader');

  if (!block || !canvas || !fragShaderEl) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL not supported, falling back to CSS glass.');
    return;
  }

  // 1. Sizing: Match block dimensions with mobile-optimized DPR cap
  const setCanvasSize = () => {
    const rect = block.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    const dpr = isMobile ? 0.85 : Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  };
  setCanvasSize();

  // 2. Vertex & Fragment Shader Compilation
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;
  const fsSource = fragShaderEl.textContent;

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // 3. Quad Buffer Setup
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  // 4. Uniform Locations
  const uniforms = {
    resolution: gl.getUniformLocation(program, 'iResolution'),
    time: gl.getUniformLocation(program, 'iTime'),
    mouse: gl.getUniformLocation(program, 'iMouse'),
    mouseVel: gl.getUniformLocation(program, 'iMouseVel'),
    texture: gl.getUniformLocation(program, 'iChannel0'),
    isMobile: gl.getUniformLocation(program, 'uIsMobile'),
  };

  // 5. Procedural High-Dynamic-Range Texture Generation (Pink, Cyan, Amber spectral lighting)
  const createTextureCanvas = () => {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 512;
    const ctx = texCanvas.getContext('2d');
    if (!ctx) return texCanvas;

    // Deep obsidian background
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
    bgGrad.addColorStop(0, '#06080c');
    bgGrad.addColorStop(0.5, '#0b0f16');
    bgGrad.addColorStop(1, '#080a0e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Glow Orb 1: Discipline Cyan (#00f0ff)
    const cyanGlow = ctx.createRadialGradient(256, 256, 10, 256, 256, 220);
    cyanGlow.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    cyanGlow.addColorStop(0.5, 'rgba(0, 240, 255, 0.15)');
    cyanGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = cyanGlow;
    ctx.fillRect(0, 0, 512, 512);

    // Glow Orb 2: Discipline Pink (#ff3b69)
    const pinkGlow = ctx.createRadialGradient(140, 140, 10, 140, 140, 190);
    pinkGlow.addColorStop(0, 'rgba(255, 59, 105, 0.4)');
    pinkGlow.addColorStop(0.6, 'rgba(255, 59, 105, 0.1)');
    pinkGlow.addColorStop(1, 'rgba(255, 59, 105, 0)');
    ctx.fillStyle = pinkGlow;
    ctx.fillRect(0, 0, 512, 512);

    // Glow Orb 3: Discipline Amber (#f59e0b)
    const amberGlow = ctx.createRadialGradient(380, 360, 10, 380, 360, 200);
    amberGlow.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    amberGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.1)');
    amberGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = amberGlow;
    ctx.fillRect(0, 0, 512, 512);

    // Specular diagonal light ray
    const ray = ctx.createLinearGradient(0, 100, 512, 412);
    ray.addColorStop(0, 'transparent');
    ray.addColorStop(0.45, 'rgba(255, 255, 255, 0.08)');
    ray.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
    ray.addColorStop(0.55, 'rgba(255, 255, 255, 0.08)');
    ray.addColorStop(1, 'transparent');
    ctx.fillStyle = ray;
    ctx.fillRect(0, 0, 512, 512);

    return texCanvas;
  };

  const texture = gl.createTexture();
  const texCanvas = createTextureCanvas();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // 6. Smooth Viscous Mouse & Fluid Velocity Tracking
  let targetMouse = [canvas.width * 0.5, canvas.height * 0.5];
  let currentMouse = [canvas.width * 0.5, canvas.height * 0.5];
  let lastRawMouse = [canvas.width * 0.5, canvas.height * 0.5];
  let targetMouseVel = [0.0, 0.0];
  let currentMouseVel = [0.0, 0.0];
  let isHovered = false;

  const updateMouse = (clientX, clientY) => {
    const rect = block.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mx = (clientX - rect.left) * dpr;
    const my = (rect.height - (clientY - rect.top)) * dpr;

    // Calculate normalized velocity impulse
    const vx = (mx - lastRawMouse[0]) / Math.max(canvas.width, 1);
    const vy = (my - lastRawMouse[1]) / Math.max(canvas.height, 1);
    targetMouseVel[0] = Math.max(-1.8, Math.min(1.8, vx * 4.5));
    targetMouseVel[1] = Math.max(-1.8, Math.min(1.8, vy * 4.5));

    lastRawMouse[0] = mx;
    lastRawMouse[1] = my;
    targetMouse = [mx, my];
    isHovered = true;
  };

  block.addEventListener('mousemove', (e) => {
    updateMouse(e.clientX, e.clientY);
  });

  block.addEventListener('mouseleave', () => {
    isHovered = false;
    targetMouseVel = [0.0, 0.0];
  });

  // Touch support
  block.addEventListener('touchmove', (e) => {
    if (!e.touches.length) return;
    const touch = e.touches[0];
    updateMouse(touch.clientX, touch.clientY);
  }, { passive: true });

  block.addEventListener('touchend', () => {
    isHovered = false;
    targetMouseVel = [0.0, 0.0];
  }, { passive: true });

  // 7. Render Loop with Lazy Visibility Initialization (Zero overhead while above the fold)
  let isVisible = false;
  let animFrameId = null;
  const startTime = performance.now();

  const render = () => {
    if (!isVisible || document.hidden) return;

    const currentTime = (performance.now() - startTime) / 1000;

    // Smooth inertia interpolation toward cursor
    const lerpFactor = isHovered ? 0.09 : 0.03;
    currentMouse[0] += (targetMouse[0] - currentMouse[0]) * lerpFactor;
    currentMouse[1] += (targetMouse[1] - currentMouse[1]) * lerpFactor;

    // Velocity momentum damping and smoothing
    currentMouseVel[0] += (targetMouseVel[0] - currentMouseVel[0]) * 0.18;
    currentMouseVel[1] += (targetMouseVel[1] - currentMouseVel[1]) * 0.18;
    targetMouseVel[0] *= 0.88;
    targetMouseVel[1] *= 0.88;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const isMobileDevice = window.innerWidth <= 768 || ('ontouchstart' in window);
    gl.uniform1f(uniforms.isMobile, isMobileDevice ? 1.0 : 0.0);
    gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
    gl.uniform1f(uniforms.time, currentTime);
    gl.uniform4f(uniforms.mouse, currentMouse[0], currentMouse[1], 0, 0);
    gl.uniform2f(uniforms.mouseVel, currentMouseVel[0], currentMouseVel[1]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animFrameId = requestAnimationFrame(render);
  };

  // 8. IntersectionObserver to only render when scrolled near projects block
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !document.hidden) {
        cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animFrameId);
      }
    });
  }, { threshold: 0.05 });
  observer.observe(block);

  // Pause render loop when page or screen is hidden/locked
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrameId);
    } else if (isVisible) {
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(render);
    }
  });

  // 9. Resize Handling
  const handleResize = () => {
    setCanvasSize();
    if (!isHovered) {
      targetMouse = [canvas.width * 0.5, canvas.height * 0.5];
      currentMouse = [canvas.width * 0.5, canvas.height * 0.5];
      lastRawMouse = [canvas.width * 0.5, canvas.height * 0.5];
    }
  };
  window.addEventListener('resize', handleResize, { passive: true });
}

/**
 * 7. Hero Section: Autonomous Looping Watercolor Text Fill on "VYRN"
 * Renders an organic fluid watercolor stream inside the giant letterforms.
 * Runs autonomously on a continuous loop with zero mouse interference.
 */
function initHeroWatercolorText() {
  const stage = document.getElementById('hero-stage');
  const canvas = document.getElementById('hero-vyrn-canvas');
  const textElem = stage ? stage.querySelector('.hero-title-giant') : null;
  const fragShaderElem = document.getElementById('heroFragShader');

  if (!canvas || !textElem || !fragShaderElem) return;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance'
  });
  if (!gl) return;

  // 1. Shaders Setup
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;
  const fsSource = fragShaderElem.textContent;

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Hero Shader error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Hero Program link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // 2. Full-Screen Quad Buffer
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  // 3. Uniform Locations
  const uniforms = {
    resolution: gl.getUniformLocation(program, 'iResolution'),
    time: gl.getUniformLocation(program, 'iTime'),
    textMask: gl.getUniformLocation(program, 'uTextMask'),
    isMobile: gl.getUniformLocation(program, 'uIsMobile'),
  };

  // 4. Offscreen Text Mask Texture
  const maskTexture = gl.createTexture();
  const maskCanvas = document.createElement('canvas');
  const maskCtx = maskCanvas.getContext('2d');

  const updateTextMask = () => {
    const rect = textElem.getBoundingClientRect();
    if (rect.width <= 10 || rect.height <= 10) return;

    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(rect.width * dpr);
    const pixelHeight = Math.round(rect.height * dpr);

    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    maskCanvas.width = pixelWidth;
    maskCanvas.height = pixelHeight;

    if (!maskCtx) return;

    maskCtx.clearRect(0, 0, pixelWidth, pixelHeight);
    maskCtx.save();
    maskCtx.scale(dpr, dpr);

    const style = window.getComputedStyle(textElem);
    const fontSize = parseFloat(style.fontSize) || 160;
    const fontFamily = style.fontFamily || 'Syne, sans-serif';
    const fontWeight = style.fontWeight || '800';

    maskCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    if ('letterSpacing' in maskCtx && style.letterSpacing && style.letterSpacing !== 'normal') {
      maskCtx.letterSpacing = style.letterSpacing;
    }
    maskCtx.fillStyle = '#ffffff';

    // Draw centered "VYRN" glyphs
    maskCtx.fillText('VYRN', rect.width * 0.5, rect.height * 0.5);
    maskCtx.restore();

    // Upload to WebGL texture
    gl.bindTexture(gl.TEXTURE_2D, maskTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (stage) {
      stage.classList.add('has-webgl-vyrn');
    }
  };

  // Font loading synchronization
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      updateTextMask();
    });
  }
  // Also run immediately & on next frame for robust initial sizing
  updateTextMask();
  requestAnimationFrame(updateTextMask);

  // 5. Render Loop (Strictly Autonomous, No Mouse Uniforms or Event Listeners)
  let isVisible = true;
  let animFrameId = null;
  const startTime = performance.now();

  const render = () => {
    if (!isVisible || document.hidden) return;

    const currentTime = (performance.now() - startTime) / 1000;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const isMobileDevice = window.innerWidth <= 768 || ('ontouchstart' in window);
    gl.uniform1f(uniforms.isMobile, isMobileDevice ? 1.0 : 0.0);
    gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
    gl.uniform1f(uniforms.time, currentTime);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, maskTexture);
    gl.uniform1i(uniforms.textMask, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animFrameId = requestAnimationFrame(render);
  };

  // 6. Pause Render Loop When Offscreen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !document.hidden) {
        cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animFrameId);
      }
    });
  }, { threshold: 0.05 });
  observer.observe(canvas);

  // Pause render loop when page or screen is hidden/locked
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrameId);
    } else if (isVisible) {
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(render);
    }
  });

  // 7. Responsive Resizing
  window.addEventListener('resize', () => {
    updateTextMask();
  }, { passive: true });

  animFrameId = requestAnimationFrame(render);
}

/**
 * 7. Hero Glass Pills Ambient Mouse Parallax
 * Adds subtle ambient mouse parallax so the glass pill badges glide gently across the letters.
 */
function initHeroRefractionStage() {
  const stage = document.getElementById('hero-stage');
  if (!stage) return;

  const pills = stage.querySelectorAll('.hero-glass-pill');
  if (!pills.length) return;

  stage.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 640) return; // Preserve mobile framing on small viewports
    const rect = stage.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    pills.forEach((pill, idx) => {
      const factor = (idx % 2 === 0 ? 1 : -1) * (idx + 1) * 4;
      pill.style.transform = `translate(${relX * factor}px, ${relY * factor}px)`;
    });
  });

  stage.addEventListener('mouseleave', () => {
    if (window.innerWidth <= 640) return;
    pills.forEach((pill) => {
      pill.style.transform = '';
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 640) {
      pills.forEach((pill) => {
        pill.style.transform = '';
      });
    }
  }, { passive: true });
}
