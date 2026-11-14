/**
 * VYRN — Studio Client-Side Logic
 * Features:
 * - Viewport scroll progress indicator (CSS Scroll-Driven w/ JS fallback)
 * - IntersectionObserver-driven floating glass nav & back-to-top states
 * - Accessible mobile navigation drawer (inert + Escape focus return)
 * - Dynamic YouTube API latest video integration (Default: 5t1xed1vlO4)
 * - Privacy-enhanced video embed trigger via DOM construction
 * - Safe DOM project card renderer
 * - Accessible form validation synced with :user-invalid & polite live announcements
 */

/**
 * Clean URL Handler:
 * Strips ugly trailing file extensions (e.g., /index.html) from the browser address bar
 * ensuring clean, professional, canonical URLs (e.g. lennardpenzler.com/)
 */
(function initCleanUrls() {
  if (typeof window === 'undefined' || !window.location) return;
  const path = window.location.pathname;
  if (path.endsWith('/index.html') || path === '/index.html') {
    const cleanPath = path.replace(/\/index\.html$/, '') || '/';
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }
})();

const reducedMotionQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false, addEventListener: () => {} };

/**
 * Validates URLs from config/data sources so only safe HTTP(S), relative paths,
 * or same-page hash anchors are assigned to href attributes.
 */
function sanitizeUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return '#projects';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '#projects';
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
  } catch (err) {}
  return '#projects';
}

/**
 * Fallback Projects Data (Used if config.js is missing or CONFIG.PROJECTS is empty)
 */
const DEFAULT_PROJECTS = [];

document.addEventListener('DOMContentLoaded', () => {
  initUnifiedScroll();
  initMobileNav();
  initVideoPlayer();
  fetchLatestYouTubeVideo();
  initProjectsLiquidGlass();
  initProjectsGrid();
  initAccessibleForms();
  initDiscordWaitlist();
  initContactForm();
  initHeroWatercolorText();
  initHeroRefractionStage();
});


/**
 * 1. Scroll-Driven Progress & Sentinel-Based Scroll State Controller
 * Uses native CSS `animation-timeline: scroll()` when available and
 * IntersectionObserver sentinels to toggle scrolled UI states without
 * polling layout geometry on every scroll event.
 */
function initUnifiedScroll() {
  const progressBar = document.getElementById('scroll-progress');
  const navPill = document.getElementById('nav-pill');
  const backToTopBtn = document.getElementById('back-to-top');

  const supportsScrollTimeline = typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline: scroll()');
  const supportsIO = 'IntersectionObserver' in window;

  if (supportsIO && (navPill || backToTopBtn)) {
    if (navPill) {
      const navSentinel = document.createElement('div');
      navSentinel.className = 'scroll-sentinel scroll-sentinel--nav';
      navSentinel.setAttribute('aria-hidden', 'true');
      document.body.prepend(navSentinel);

      let isScrolled = false;
      const navObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const scrolled = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (scrolled !== isScrolled) {
          isScrolled = scrolled;
          navPill.classList.toggle('is-scrolled', isScrolled);
        }
      }, { threshold: 0 });
      navObserver.observe(navSentinel);
    }

    if (backToTopBtn) {
      const topSentinel = document.createElement('div');
      topSentinel.className = 'scroll-sentinel scroll-sentinel--top';
      topSentinel.setAttribute('aria-hidden', 'true');
      document.body.prepend(topSentinel);

      const topObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const visible = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        backToTopBtn.classList.toggle('is-visible', visible);
      }, { threshold: 0 });
      topObserver.observe(topSentinel);
    }
  }

  // Only bind a scroll listener for features lacking native CSS/IO support
  if (!supportsScrollTimeline || !supportsIO) {
    let isScrolled = false;
    let ticking = false;

    const updateScrollFallback = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (!supportsScrollTimeline && progressBar) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight > 0) {
          const progress = Math.min(1, Math.max(0, scrollTop / scrollHeight));
          progressBar.style.transform = `scaleX(${progress})`;
        }
      }

      if (!supportsIO && navPill) {
        const scrolled = scrollTop > 40;
        if (scrolled !== isScrolled) {
          isScrolled = scrolled;
          navPill.classList.toggle('is-scrolled', isScrolled);
        }
      }

      if (!supportsIO && backToTopBtn) {
        backToTopBtn.classList.toggle('is-visible', scrollTop > 300);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollFallback);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScrollFallback();
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth'
      });
      if (e.detail === 0) {
        const topTarget = document.querySelector('.skip-link') || document.querySelector('.brand-signature');
        if (topTarget) topTarget.focus({ preventScroll: true });
      }
    });
  }
}

/**
 * 3. Floating Glass Nav Mobile Toggle (manages inert & keyboard focus return)
 */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const panel = document.getElementById('mobile-nav-panel');
  if (!menuBtn || !panel) return;

  panel.inert = true;

  const closeMenu = (restoreFocus = false) => {
    menuBtn.classList.remove('is-active');
    menuBtn.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    panel.inert = true;
    if (restoreFocus) {
      menuBtn.focus();
    }
  };

  const toggleMenu = () => {
    const isOpen = panel.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      menuBtn.classList.add('is-active');
      menuBtn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      panel.inert = false;
    }
  };

  menuBtn.addEventListener('click', toggleMenu);

  // Close when clicking links inside panel
  const mobileLinks = panel.querySelectorAll('.mobile-nav-item, a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => closeMenu(false));
  });

  // Close on Escape key and restore focus to trigger button
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      closeMenu(true);
    }
  });

  // Close when clicking outside of nav
  document.addEventListener('click', (e) => {
    const pill = document.getElementById('nav-pill');
    if (pill && !pill.contains(e.target) && panel.classList.contains('is-open')) {
      closeMenu(false);
    }
  });
}

/**
 * 4. Fast Privacy-Enhanced Video Embed Trigger (DOM-constructed iframe)
 */
function initVideoPlayer() {
  const videoWrapper = document.getElementById('video-wrapper');
  const videoTrigger = document.getElementById('video-trigger');

  if (!videoWrapper || !videoTrigger) return;

  const embedVideo = () => {
    const videoId = videoWrapper.getAttribute('data-video-id') || '5t1xed1vlO4';
    const iframe = document.createElement('iframe');
    iframe.className = 'video-embed-frame';
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    iframe.title = 'YouTube Video Player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    videoWrapper.replaceChildren(iframe);
  };

  videoTrigger.addEventListener('click', embedVideo);
}

/**
 * Helper: Animate numeric counter values smoothly
 */
function animateValue(obj, start, end, duration, suffix = '') {
  if (!obj) return;
  if (reducedMotionQuery.matches) {
    obj.textContent = end.toLocaleString() + suffix;
    return;
  }
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
    if (typeof CONFIG !== 'undefined' && CONFIG.LATEST_VIDEO) {
      if (videoTitle && CONFIG.LATEST_VIDEO.title) videoTitle.textContent = CONFIG.LATEST_VIDEO.title;
      if (videoLink && CONFIG.LATEST_VIDEO.url) videoLink.href = CONFIG.LATEST_VIDEO.url;
      if (videoWrapper && CONFIG.LATEST_VIDEO.id) videoWrapper.setAttribute('data-video-id', CONFIG.LATEST_VIDEO.id);
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
function createArrowUpRightIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  const line = document.createElementNS(ns, 'line');
  line.setAttribute('x1', '7');
  line.setAttribute('y1', '17');
  line.setAttribute('x2', '17');
  line.setAttribute('y2', '7');

  const polyline = document.createElementNS(ns, 'polyline');
  polyline.setAttribute('points', '7 7 17 7 17 17');

  svg.append(line, polyline);
  return svg;
}

function initProjectsGrid() {
  const grid = document.getElementById('projects-grid');
  const emptyBlock = document.getElementById('projects-empty-block');
  if (!grid) return;

  const projects = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.PROJECTS) && CONFIG.PROJECTS.length > 0)
    ? CONFIG.PROJECTS
    : DEFAULT_PROJECTS;

  // When no projects are configured yet, showcase the Active Development Lab canvas
  if (!projects || projects.length === 0) {
    grid.replaceChildren();
    grid.hidden = true;
    if (emptyBlock) emptyBlock.hidden = false;
    return;
  }

  // When projects exist, reveal the grid and hide the standalone empty state
  if (emptyBlock) emptyBlock.hidden = true;
  grid.hidden = false;

  const ALLOWED_DISCIPLINES = new Set(['audio', 'video', 'code', 'all']);
  const cards = projects.map(proj => {
    const rawDiscipline = typeof proj.discipline === 'string' ? proj.discipline.trim().toLowerCase() : 'all';
    const discipline = ALLOWED_DISCIPLINES.has(rawDiscipline) ? rawDiscipline : 'all';

    let dotClass = 'dot-cyan';
    if (discipline === 'audio' || discipline === 'all') dotClass = 'dot-pink';
    else if (discipline === 'code') dotClass = 'dot-amber';

    const article = document.createElement('article');
    article.className = 'project-card';
    article.dataset.discipline = discipline;

    const topWrap = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'project-card-header';

    const badge = document.createElement('span');
    badge.className = `discipline-badge badge-${discipline === 'all' ? 'multi' : discipline}`;
    const dot = document.createElement('span');
    dot.className = `color-dot ${dotClass}`;
    dot.setAttribute('aria-hidden', 'true');
    const categoryText = document.createElement('span');
    categoryText.textContent = proj.category || 'PROJECT';
    badge.append(dot, categoryText);

    const statusBadge = document.createElement('span');
    statusBadge.className = proj.status ? 'project-status-badge status--in-dev' : 'project-status-badge';
    statusBadge.textContent = proj.status || 'UPCOMING';

    header.append(badge, statusBadge);

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = proj.title || 'Untitled Project';

    const desc = document.createElement('p');
    desc.className = 'project-desc';
    desc.textContent = proj.description || '';

    topWrap.append(header, title, desc);

    if (Array.isArray(proj.tags) && proj.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'project-tags';
      proj.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'project-tag';
        tagSpan.textContent = String(tag);
        tagsContainer.appendChild(tagSpan);
      });
      topWrap.appendChild(tagsContainer);
    }

    const footer = document.createElement('div');
    footer.className = 'project-footer';

    const yearSpan = document.createElement('span');
    yearSpan.className = 'project-year';
    yearSpan.textContent = proj.year || '2026';

    const link = document.createElement('a');
    link.href = sanitizeUrl(proj.link);
    link.className = 'pill-btn pill-btn--glass pill-btn--sm';
    link.setAttribute('aria-label', `View ${proj.title || 'project'}`);
    if (/^https?:\/\//i.test(link.href) && new URL(link.href).origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const detailsText = document.createElement('span');
    detailsText.textContent = 'Details';
    link.append(detailsText, createArrowUpRightIcon());

    footer.append(yearSpan, link);
    article.append(topWrap, footer);
    return article;
  });

  grid.replaceChildren(...cards);
}

/**
 * 7b. Accessible Validation & Live Error Sync (:user-invalid + aria-invalid)
 * Mirrors :user-invalid onto aria-invalid and dynamic aria-describedby
 * error messages after user interaction, announcing errors through one polite
 * page-wide live region.
 */
const formValidators = new WeakMap();

function initAccessibleForms() {
  const forms = document.querySelectorAll('#discord-waitlist-form, #contact-form');
  if (!forms.length) return;

  const supportsUserInvalid = typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('selector(:user-invalid)');
  const dirtyState = new WeakMap();
  const flagged = new WeakSet();
  const announced = new WeakSet();

  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.className = 'visually-hidden';
  document.body.append(announcer);

  let announceTimer;
  let announcedField;

  const linkError = (el, shown) => {
    const errorId = el.dataset.error;
    if (!errorId) return;
    const ids = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  const spokenText = (node) => {
    const copy = node.cloneNode(true);
    copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    copy.querySelectorAll('[role="img"][aria-label]').forEach((n) => {
      n.replaceWith(`${n.getAttribute('aria-label')}: `);
    });
    return copy.textContent.replace(/\s+/g, ' ').trim();
  };

  const announceError = (el) => {
    const errorEl = el.dataset.error ? document.getElementById(el.dataset.error) : null;
    if (!errorEl) return;
    const labelText = el.labels?.[0] ? `${spokenText(el.labels[0])}: ` : '';
    clearTimeout(announceTimer);
    announcer.textContent = '';
    announcedField = el;
    announceTimer = setTimeout(() => {
      announcer.textContent = labelText + spokenText(errorEl);
    }, 500);
  };

  const isFieldUserInvalid = (el) => {
    if (supportsUserInvalid) {
      return el.matches(':user-invalid');
    }
    const state = dirtyState.get(el);
    return Boolean(state && state.hasInteracted && state.hasBlurred && !el.validity.valid);
  };

  const syncAria = (el, announce = false) => {
    if (!el.matches?.('input, select, textarea')) return;

    if (!supportsUserInvalid && dirtyState.get(el)?.hasBlurred) {
      el.classList.toggle('user-invalid-fallback', !el.validity.valid);
      el.classList.toggle('user-valid-fallback', el.validity.valid);
    }

    const invalid = isFieldUserInvalid(el);
    if (invalid) {
      if (announce && !announced.has(el)) {
        announceError(el);
        announced.add(el);
      }
      el.setAttribute('aria-invalid', 'true');
      linkError(el, true);
      flagged.add(el);
    } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
      el.setAttribute('aria-invalid', 'false');
      linkError(el, false);
      flagged.delete(el);
      announced.delete(el);
      if (announcedField === el) {
        clearTimeout(announceTimer);
        announcer.textContent = '';
      }
    }
  };

  forms.forEach((form) => {
    // Progressively use accessible inline validation + focus routing while
    // keeping native attributes active if JavaScript fails to run.
    form.noValidate = true;

    const controls = [...form.querySelectorAll('input, select, textarea')];
    controls.forEach((el) => el.setAttribute('aria-invalid', 'false'));

    form.addEventListener('blur', (e) => {
      const el = e.target;
      if (!el.matches?.('input, select, textarea')) return;
      if (!supportsUserInvalid) {
        const state = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
        state.hasBlurred = true;
        dirtyState.set(el, state);
      }
      syncAria(el, true);
    }, true);

    form.addEventListener('input', (e) => {
      const el = e.target;
      if (!el.matches?.('input, select, textarea')) return;
      if (!supportsUserInvalid) {
        const state = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
        state.hasInteracted = true;
        dirtyState.set(el, state);
      }
      if (el.hasAttribute('aria-invalid')) syncAria(el, false);
    });

    form.addEventListener('change', (e) => {
      const el = e.target;
      if (!el.matches?.('input, select, textarea')) return;
      if (!supportsUserInvalid) {
        dirtyState.set(el, { hasInteracted: true, hasBlurred: true });
      }
      syncAria(el, true);
    }, true);

    form.addEventListener('invalid', (e) => {
      const el = e.target;
      dirtyState.set(el, { hasInteracted: true, hasBlurred: true });
      announced.add(el);
      syncAria(el, false);
    }, true);

    form.addEventListener('reset', () => {
      setTimeout(() => {
        controls.forEach((el) => {
          dirtyState.delete(el);
          el.classList.remove('user-invalid-fallback', 'user-valid-fallback');
          flagged.delete(el);
          announced.delete(el);
          el.setAttribute('aria-invalid', 'false');
          linkError(el, false);
        });
      }, 0);
    });

    formValidators.set(form, () => {
      let firstInvalid = null;
      controls.forEach((el) => {
        if (!el.checkValidity()) {
          if (!firstInvalid) firstInvalid = el;
          dirtyState.set(el, { hasInteracted: true, hasBlurred: true });
          if (!supportsUserInvalid) {
            el.classList.add('user-invalid-fallback');
            el.classList.remove('user-valid-fallback');
          }
          el.setAttribute('aria-invalid', 'true');
          linkError(el, true);
          flagged.add(el);
          announced.add(el);
        } else {
          syncAria(el, false);
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return false;
      }
      return true;
    });
  });
}

/**
 * Shared Form Submission Helpers (Waitlist & Contact)
 */
function resolveFormEndpoint(specificKey) {
  if (typeof CONFIG === 'undefined' || !CONFIG) return '';
  const specific = CONFIG[specificKey];
  const shared = CONFIG.BACKEND_ENDPOINT;
  return String(specific || shared || '').trim();
}

async function postFormPayload(endpoint, payload) {
  const isAppsScript = /script\.google(?:usercontent)?\.com/i.test(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: isAppsScript
        ? { 'Content-Type': 'text/plain;charset=utf-8' }
        : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const rawText = await res.text();
    let data = null;
    if (rawText && rawText.trim().startsWith('{')) {
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        data = null;
      }
    }

    if (!res.ok || (data && (data.ok === false || data.success === false))) {
      const serverMsg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
      throw new Error(serverMsg);
    }

    return data || { ok: true };
  } finally {
    clearTimeout(timeoutId);
  }
}

function setSubmitBusy(submitBtn, isBusy, busyLabel) {
  if (!submitBtn) return;
  const labelTarget = submitBtn.querySelector('span') || submitBtn;
  if (isBusy) {
    if (!submitBtn.dataset.originalLabel) {
      submitBtn.dataset.originalLabel = labelTarget.textContent;
    }
    labelTarget.textContent = busyLabel;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
  } else {
    if (submitBtn.dataset.originalLabel) {
      labelTarget.textContent = submitBtn.dataset.originalLabel;
    }
    submitBtn.disabled = false;
    submitBtn.removeAttribute('aria-busy');
  }
}

function showFormFeedback(statusEl, message, isError, timerState, autoHideMs = 7000) {
  clearTimeout(timerState.id);
  statusEl.classList.toggle('is-error', Boolean(isError));
  statusEl.textContent = message;
  statusEl.classList.add('is-visible');
  if (!isError && autoHideMs > 0) {
    timerState.id = setTimeout(() => {
      statusEl.classList.remove('is-visible');
    }, autoHideMs);
  }
}

/**
 * 8. Discord Community Waitlist Email Subscription
 */
function initDiscordWaitlist() {
  const form = document.getElementById('discord-waitlist-form');
  const input = document.getElementById('waitlist-email');
  const status = document.getElementById('waitlist-status');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !input || !status) return;

  const timerState = { id: null };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const validate = formValidators.get(form);
    if (validate && !validate()) return;

    const honeypot = form.querySelector('input[name="_website"]')?.value.trim() || '';
    if (honeypot) {
      form.reset();
      showFormFeedback(status, "You're on the list! We'll email your invite once Discord opens.", false, timerState);
      return;
    }

    const email = input.value.trim();
    if (!email) return;

    const endpoint = resolveFormEndpoint('WAITLIST_ENDPOINT');
    const contactEmail = (typeof CONFIG !== 'undefined' && CONFIG.CONTACT_EMAIL) ? CONFIG.CONTACT_EMAIL : 'refined.mov@gmail.com';
    if (!endpoint) {
      showFormFeedback(
        status,
        `Waitlist endpoint is not connected yet. Please email ${contactEmail} directly to request early access.`,
        true,
        timerState,
        0
      );
      return;
    }

    setSubmitBusy(submitBtn, true, 'Joining...');

    try {
      const data = await postFormPayload(endpoint, {
        action: 'waitlist',
        email,
        consent: true,
        source: window.location.pathname,
        _website: honeypot,
      });

      form.reset();
      showFormFeedback(
        status,
        (data && data.message) || "You're on the list! We'll email your invite as soon as Discord goes live.",
        false,
        timerState
      );
    } catch (err) {
      const msg = (err && err.name === 'AbortError')
        ? 'Request timed out. Please try again.'
        : (err && err.message && err.message !== 'Failed to fetch')
          ? err.message
          : `Unable to register right now. Please try again or email ${contactEmail}.`;
      showFormFeedback(status, msg, true, timerState, 0);
    } finally {
      setSubmitBusy(submitBtn, false);
    }
  });
}

/**
 * 9. Direct Contact & Collaboration Form Handling
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !status) return;

  const timerState = { id: null };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const validate = formValidators.get(form);
    if (validate && !validate()) return;

    const honeypot = form.querySelector('input[name="_website"]')?.value.trim() || '';
    if (honeypot) {
      form.reset();
      showFormFeedback(status, 'Message received. Thank you for reaching out.', false, timerState);
      return;
    }

    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const topic = document.getElementById('contact-topic')?.value || 'General Inquiry';
    const message = document.getElementById('contact-message')?.value.trim();

    if (!name || !email || !message) return;

    const endpoint = resolveFormEndpoint('CONTACT_ENDPOINT');
    const recipient = (typeof CONFIG !== 'undefined' && CONFIG.CONTACT_EMAIL) ? CONFIG.CONTACT_EMAIL : 'refined.mov@gmail.com';

    if (!endpoint) {
      const mailtoLink = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(`[VYRN] ${topic} from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`)}`;
      window.location.href = mailtoLink;
      showFormFeedback(
        status,
        `Opening your email app for ${recipient} (direct web delivery endpoint not configured yet).`,
        false,
        timerState,
        9000
      );
      return;
    }

    setSubmitBusy(submitBtn, true, 'Sending...');

    try {
      const data = await postFormPayload(endpoint, {
        action: 'contact',
        name,
        email,
        topic,
        message,
        consent: true,
        source: window.location.pathname,
        _website: honeypot,
      });

      form.reset();
      showFormFeedback(
        status,
        (data && data.message) || "Message sent! Thank you for reaching out — I'll reply to you shortly.",
        false,
        timerState
      );
    } catch (err) {
      const msg = (err && err.name === 'AbortError')
        ? `Request timed out. Please try again or email ${recipient} directly.`
        : `Unable to send automatically right now. Please try again or email ${recipient} directly.`;
      showFormFeedback(status, msg, true, timerState, 0);
    } finally {
      setSubmitBusy(submitBtn, false);
    }
  });
}
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

  // 1. Sizing: Match block dimensions with hardware-aware DPR cap (Capped at 1.0 to eliminate 4x pixel overhead)
  let lastBlockWidth = 0;
  let lastBlockHeight = 0;

  const isLowPowerDevice = (typeof navigator !== 'undefined' && (
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    ('ontouchstart' in window) ||
    window.innerWidth <= 768
  ));
  const activeDpr = isLowPowerDevice ? 0.65 : Math.min(window.devicePixelRatio || 1, 0.75);

  const setCanvasSize = () => {
    const rect = block.getBoundingClientRect();
    if (Math.abs(rect.width - lastBlockWidth) < 2 && Math.abs(rect.height - lastBlockHeight) < 2) return;
    lastBlockWidth = rect.width;
    lastBlockHeight = rect.height;

    canvas.width = Math.max(1, Math.floor(rect.width * activeDpr));
    canvas.height = Math.max(1, Math.floor(rect.height * activeDpr));
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
    cyanGlow.addColorStop(0, 'rgba(0, 240, 255, 0.36)');
    cyanGlow.addColorStop(0.5, 'rgba(0, 240, 255, 0.12)');
    cyanGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = cyanGlow;
    ctx.fillRect(0, 0, 512, 512);

    // Glow Orb 2: Discipline Pink (#ff3b69)
    const pinkGlow = ctx.createRadialGradient(140, 140, 10, 140, 140, 190);
    pinkGlow.addColorStop(0, 'rgba(255, 59, 105, 0.34)');
    pinkGlow.addColorStop(0.6, 'rgba(255, 59, 105, 0.09)');
    pinkGlow.addColorStop(1, 'rgba(255, 59, 105, 0)');
    ctx.fillStyle = pinkGlow;
    ctx.fillRect(0, 0, 512, 512);

    // Glow Orb 3: Discipline Amber (#f59e0b)
    const amberGlow = ctx.createRadialGradient(380, 360, 10, 380, 360, 200);
    amberGlow.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
    amberGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
    amberGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = amberGlow;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle specular glass bevel gleam
    const ray = ctx.createLinearGradient(0, 80, 512, 432);
    ray.addColorStop(0, 'transparent');
    ray.addColorStop(0.46, 'rgba(255, 255, 255, 0.04)');
    ray.addColorStop(0.5, 'rgba(255, 255, 255, 0.09)');
    ray.addColorStop(0.54, 'rgba(255, 255, 255, 0.04)');
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

  // 6. Smooth Viscous Mouse & Fluid Velocity Tracking (Cached Geometry to avoid layout thrashing)
  let targetMouse = [canvas.width * 0.5, canvas.height * 0.5];
  let currentMouse = [canvas.width * 0.5, canvas.height * 0.5];
  let lastRawMouse = [canvas.width * 0.5, canvas.height * 0.5];
  let targetMouseVel = [0.0, 0.0];
  let currentMouseVel = [0.0, 0.0];
  let isHovered = false;
  let cachedBlockRect = null;

  const updateBlockRect = () => {
    cachedBlockRect = block.getBoundingClientRect();
  };

  const updateMouse = (clientX, clientY) => {
    if (!cachedBlockRect) updateBlockRect();
    const mx = (clientX - cachedBlockRect.left) * activeDpr;
    const my = (cachedBlockRect.height - (clientY - cachedBlockRect.top)) * activeDpr;

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

  block.addEventListener('mouseenter', updateBlockRect, { passive: true });
  block.addEventListener('mousemove', (e) => {
    updateMouse(e.clientX, e.clientY);
  }, { passive: true });

  block.addEventListener('mouseleave', () => {
    isHovered = false;
    targetMouse = [canvas.width * 0.5, canvas.height * 0.5];
    targetMouseVel = [0.0, 0.0];
  }, { passive: true });

  // Touch support
  block.addEventListener('touchstart', updateBlockRect, { passive: true });
  block.addEventListener('touchmove', (e) => {
    if (!e.touches.length) return;
    const touch = e.touches[0];
    updateMouse(touch.clientX, touch.clientY);
  }, { passive: true });

  block.addEventListener('touchend', () => {
    isHovered = false;
    targetMouse = [canvas.width * 0.5, canvas.height * 0.5];
    targetMouseVel = [0.0, 0.0];
  }, { passive: true });

  // 7. Render Loop with Frame Pacing (~60fps cap to save power on high-refresh 144Hz/240Hz screens)
  let isVisible = false;
  let animFrameId = null;
  const startTime = performance.now();
  let lastFrameTime = 0;
  const TARGET_FRAME_MS = 16.0;

  const render = (timestamp) => {
    if (!isVisible || document.hidden) return;

    if (timestamp && lastFrameTime && (timestamp - lastFrameTime < TARGET_FRAME_MS - 1.5)) {
      animFrameId = requestAnimationFrame(render);
      return;
    }
    lastFrameTime = timestamp || performance.now();

    const currentTime = (lastFrameTime - startTime) / 1000;

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
    if (!reducedMotionQuery.matches) {
      animFrameId = requestAnimationFrame(render);
    }
  };

  // 8. IntersectionObserver + Reduced Motion / Visibility / Content-Visibility lifecycle
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

  // Pause immediately when content-visibility: auto skips the parent subtree
  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    projectsSection.addEventListener('contentvisibilityautostatechange', (e) => {
      if (e.skipped) {
        isVisible = false;
        cancelAnimationFrame(animFrameId);
      }
    });
  }

  // Pause render loop when page or screen is hidden/locked
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrameId);
    } else if (isVisible) {
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(render);
    }
  });

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        cancelAnimationFrame(animFrameId);
      } else if (isVisible && !document.hidden) {
        cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(render);
      }
    });
  }

  // 9. Debounced Resize Handling (prevents mobile address-bar scroll stutter)
  let resizeTimer = null;
  const handleResize = () => {
    updateBlockRect();
    setCanvasSize();
    if (!isHovered) {
      targetMouse = [canvas.width * 0.5, canvas.height * 0.5];
      currentMouse = [canvas.width * 0.5, canvas.height * 0.5];
      lastRawMouse = [canvas.width * 0.5, canvas.height * 0.5];
    }
  };
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 120);
  }, { passive: true });
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

  let lastMaskKey = '';
  let lastMaskHeight = 0;
  let fontsHooked = false;

  const updateTextMask = () => {
    const canvasRect = canvas.getBoundingClientRect();
    const textRect = textElem.getBoundingClientRect();
    if (canvasRect.width <= 10 || canvasRect.height <= 10 || textRect.width <= 10 || textRect.height <= 10) return;

    const fontStatus = (document.fonts && document.fonts.status) ? document.fonts.status : 'loaded';
    if (!fontsHooked && fontStatus === 'loading' && document.fonts && document.fonts.ready) {
      fontsHooked = true;
      document.fonts.ready.then(updateTextMask);
    }

    const maskKey = `${Math.round(canvasRect.width)}x${Math.round(canvasRect.height)}:${Math.round(textRect.width)}:${fontStatus}`;
    if (maskKey === lastMaskKey && Math.abs(textRect.height - lastMaskHeight) < 2) return;
    lastMaskKey = maskKey;
    lastMaskHeight = textRect.height;

    const isLowPower = (typeof navigator !== 'undefined' && (
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
      ('ontouchstart' in window) ||
      window.innerWidth <= 768
    ));
    const dpr = isLowPower ? 0.9 : Math.min(window.devicePixelRatio || 1, 1.5);
    const pixelWidth = Math.max(1, Math.round(canvasRect.width * dpr));
    const pixelHeight = Math.max(1, Math.round(canvasRect.height * dpr));

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

    // Draw "VYRN" glyphs at exact text element center inside full-stage canvas
    const textCenterX = (textRect.left - canvasRect.left) + textRect.width * 0.5;
    const textCenterY = (textRect.top - canvasRect.top) + textRect.height * 0.5;
    maskCtx.fillText('VYRN', textCenterX, textCenterY);
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

  // 5. Render Loop with Frame Pacing (~60fps cap to save power on high-refresh screens)
  let isVisible = true;
  let animFrameId = null;
  const startTime = performance.now();
  let lastHeroFrameTime = 0;
  const TARGET_FRAME_MS = 16.0;

  const render = (timestamp) => {
    if (!isVisible || document.hidden) return;

    if (timestamp && lastHeroFrameTime && (timestamp - lastHeroFrameTime < TARGET_FRAME_MS - 1.5)) {
      animFrameId = requestAnimationFrame(render);
      return;
    }
    lastHeroFrameTime = timestamp || performance.now();

    const currentTime = (lastHeroFrameTime - startTime) / 1000;

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
    if (!reducedMotionQuery.matches) {
      animFrameId = requestAnimationFrame(render);
    }
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

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        cancelAnimationFrame(animFrameId);
      } else if (isVisible && !document.hidden) {
        cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(render);
      }
    });
  }

  // 7. Debounced Responsive Resizing
  let heroResizeTimer = null;
  window.addEventListener('resize', () => {
    if (heroResizeTimer) clearTimeout(heroResizeTimer);
    heroResizeTimer = setTimeout(updateTextMask, 120);
  }, { passive: true });

  animFrameId = requestAnimationFrame(render);
}

/**
 * 7. Hero Glass Pills Ambient Mouse Parallax (RAF Throttled with Cached Geometry)
 * Prevents synchronous reflows while gliding pills smoothly over the letterforms.
 */
function initHeroRefractionStage() {
  const stage = document.getElementById('hero-stage');
  if (!stage) return;

  let stageRect = null;
  const updateRect = () => {
    stageRect = stage.getBoundingClientRect();
  };
  updateRect();

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  const stepPills = () => {
    rafId = null;
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;

    stage.style.setProperty('--pill-mx', `${(currentX * 9).toFixed(2)}px`);
    stage.style.setProperty('--pill-my', `${(currentY * 9).toFixed(2)}px`);

    if (Math.abs(targetX - currentX) > 0.004 || Math.abs(targetY - currentY) > 0.004) {
      rafId = requestAnimationFrame(stepPills);
    }
  };

  const scheduleStep = () => {
    if (!rafId) rafId = requestAnimationFrame(stepPills);
  };

  const resetPills = () => {
    targetX = 0;
    targetY = 0;
    if (reducedMotionQuery.matches) {
      cancelAnimationFrame(rafId);
      rafId = null;
      currentX = 0;
      currentY = 0;
      stage.style.setProperty('--pill-mx', '0px');
      stage.style.setProperty('--pill-my', '0px');
      return;
    }
    scheduleStep();
  };

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', (e) => {
      if (e.matches) resetPills();
    });
  }

  stage.addEventListener('mouseenter', updateRect, { passive: true });

  stage.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 640 || reducedMotionQuery.matches) return;
    if (!stageRect) updateRect();
    targetX = Math.max(-1, Math.min(1, (e.clientX - (stageRect.left + stageRect.width / 2)) / (stageRect.width / 2)));
    targetY = Math.max(-1, Math.min(1, (e.clientY - (stageRect.top + stageRect.height / 2)) / (stageRect.height / 2)));
    scheduleStep();
  }, { passive: true });

  stage.addEventListener('mouseleave', resetPills, { passive: true });

  window.addEventListener('resize', () => {
    updateRect();
    if (window.innerWidth <= 640 || reducedMotionQuery.matches) {
      resetPills();
    }
  }, { passive: true });
}
