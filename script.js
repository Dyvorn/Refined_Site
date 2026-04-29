/**
 * Refined_OS v2.2.0 - Core Engine
 * Optimized for performance and high-end visual fidelity.
 */

const CONFIG = {
  cursorLerp: 0.18,
  tiltSensitivity: 40,
  magneticStrength: 0.4
};

// Binary Rain Effect
const canvas = document.getElementById('binary-rain-canvas');
const ctx = canvas.getContext('2d');

let animationFrameId; // To store the requestAnimationFrame ID for binary rain
let lastRainTime = 0;

function setupBinaryRain() {
  // Ensure canvas is visible before setting dimensions
  if (canvas.parentElement && !canvas.parentElement.classList.contains('hidden')) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = ['0', '1'];
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];

    // Initialize drops to 1, so they start at the top
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const goldColor = rootStyles.getPropertyValue('--gold').trim();

    function drawBinaryRain(timestamp) {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(drawBinaryRain);
        return;
      }

      const deltaTime = timestamp - (lastRainTime || timestamp);
      lastRainTime = timestamp;

      // Semi-transparent black rectangle to create the fading trail effect
      ctx.fillStyle = 'rgba(5, 6, 8, 0.05)'; // Use bg-main with transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = goldColor; // Yellow gold color
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Send the drop back to the top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        // Normalize speed: ~16 units per second
        drops[i] += (deltaTime * 0.06);
      }

      animationFrameId = requestAnimationFrame(drawBinaryRain);
    }

    requestAnimationFrame(drawBinaryRain);
  }
}

let cardBounds = [];
let timelineBounds = null;
const cardElements = document.querySelectorAll('.card');

function updateCachedBounds() {
  cardBounds = Array.from(cardElements).map(card => ({
    el: card,
    rect: card.getBoundingClientRect(),
    isTiltable: !card.classList.contains('contact-form')
  }));
  
  const container = document.querySelector('.timeline-container');
  if (container) timelineBounds = container.getBoundingClientRect();
}

// Use ResizeObserver for more robust boundary tracking
const resizeObserver = new ResizeObserver(() => {
  updateCachedBounds();
});
cardElements.forEach(card => resizeObserver.observe(card));

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const handleResize = debounce(() => {
  if (document.getElementById('loading-screen') && !document.getElementById('loading-screen').classList.contains('hidden')) {
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); }
    setupBinaryRain();
  }
  cachedHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  updateCachedBounds();
}, 300);

window.addEventListener('resize', handleResize, { passive: true });

// Loading Screen Logic
window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');
  if (!loader) return;
  const progress = document.getElementById('loader-progress');
  const logContainer = document.getElementById('boot-logs');

  // Start binary rain immediately
  setupBinaryRain();

  const bootMessages = [
    "Initializing Refined_OS v2.1.0...",
    "Loading Core.Geometry...",
    "Mounting Workspace_Dyvorn.drv",
    "Checking Motion_Engine...",
    "Syncing Creative_Workflow...",
    "Optimizing UX_Shaders...",
    "System Check: Optimal.",
    "Bypassing Security...",
    "Ready."
  ];
  
  let msgIndex = 0;

  function processBoot() {
    if (msgIndex < bootMessages.length) {
      // Create log entry
      const log = document.createElement('div');
      log.textContent = `> ${bootMessages[msgIndex]}`;
      logContainer.appendChild(log);
      
      // Auto-scroll log
      logContainer.scrollTop = logContainer.scrollHeight;

      // Update progress bar based on message count
      const percent = ((msgIndex + 1) / bootMessages.length) * 100;
      progress.style.width = percent + '%';

      msgIndex++;
      
      // Variable timing for a realistic "computing" feel
      const delay = msgIndex === bootMessages.length ? 600 : Math.random() * 300 + 100;
      setTimeout(processBoot, delay);
    } else {
      // Finish loading
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.cursor = 'none';
        if (animationFrameId) { // Stop binary rain animation
          cancelAnimationFrame(animationFrameId);
          // Clear the canvas to ensure no lingering rain
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.style.display = 'none'; // Hide canvas
        }
        updateCachedBounds();
      }, 400);
    }
  }

  processBoot();
});

// Update copyright year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Split Text Utility for smooth reveals
document.querySelectorAll('.split-reveal').forEach(el => {
  const text = el.textContent;
  el.textContent = '';
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.className = 'char';
    span.style.transitionDelay = `${i * 0.03}s`;
    el.appendChild(span);
  });
});

// Cache selectors for performance
const revealElements = document.querySelectorAll('.reveal');
const filterElement = document.querySelector('#liquid-deform feDisplacementMap');
let isFilterAnimateRunning = false;
let cachedHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

// Intersection Observer for Reveal Animations
const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (!isFilterAnimateRunning) animateFilter();
      observer.unobserve(entry.target);
    }
  });
};

// Animate the SVG filter scale to "crystallize" the content
function animateFilter() {
  if (!filterElement) return;
  isFilterAnimateRunning = true;
  
  // Mobile Optimization: Faster duration and lower scale for smaller screens
  const isMobile = window.innerWidth < 768;
  const duration = isMobile ? 600 : 1200;
  const maxScale = isMobile ? 15 : 30;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4); // Quartic Out
    filterElement.setAttribute('scale', (1 - ease) * maxScale); 
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      isFilterAnimateRunning = false;
    }
  }
  requestAnimationFrame(update);
}

const revealObserver = new IntersectionObserver(revealCallback, {
  threshold: 0.15
});

revealElements.forEach(el => revealObserver.observe(el));

// Refined Scroll Logic
const header = document.querySelector('header');
const scrollProgress = document.getElementById('progress-bar');
const navLinks = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('section[id]');

function updateTimeline() {
  const container = document.querySelector('.timeline-container');
  const line = document.querySelector('.timeline-line-inner');
  if (!container || !line || !timelineBounds) return;

  const windowHeight = window.innerHeight;
  
  // Calculate progress based on container's position in viewport
  const startTrigger = windowHeight * 0.9;
  const endTrigger = windowHeight * 0.1;
  // Use cached timelineBounds.top adjusted by current scroll
  const currentTop = timelineBounds.top - (window.scrollY - (timelineBounds.scrollY || 0));
  const progress = (startTrigger - currentTop) / (timelineBounds.height + (startTrigger - endTrigger));

  line.style.height = `${Math.min(Math.max(progress * 100, 0), 100)}%`;
}

function handleScroll() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('scrolled', scrollY > 50);
  scrollProgress.style.width = (scrollY / (maxScroll || 1)) * 100 + "%";
  document.body.style.setProperty('--scroll-y', `${scrollY}px`);
  updateTimeline();
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Instant-Smooth Navigation Transitions
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      const target = document.getElementById(targetId.substring(1));
      if (target) {
        // Disable snapping temporarily to prevent "drag" or "trapping" during jump
        document.documentElement.style.scrollSnapType = 'none';
        target.scrollIntoView({ behavior: 'smooth' });
        // Re-enable snapping once the jump is complete
        setTimeout(() => {
          document.documentElement.style.scrollSnapType = 'y mandatory';
        }, 800);
      }
    }
  });
});

// Optimized Scroll Spy using Intersection Observer
const spyOptions = { threshold: 0.5, rootMargin: "0px" };
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, spyOptions);

sections.forEach(section => spyObserver.observe(section));

// Custom Cursor Logic with LERP (Linear Interpolation)
const cursor = document.getElementById('cursor');
const state = {
  mouseX: 0,
  mouseY: 0,
  cursorX: 0,
  cursorY: 0,
  scrollY: 0,
  targetScrollY: 0,
  cursorVisible: false
};

document.addEventListener('mousemove', (e) => {
  if (!state.cursorVisible) {
    cursor.style.display = 'block';
    state.cursorVisible = true;
  }
  
  state.mouseX = e.clientX;
  state.mouseY = e.clientY;
});

function updateApp() {
  // 1. Smooth Cursor LERP
  const dx = state.mouseX - state.cursorX;
  const dy = state.mouseY - state.cursorY;
  
  if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
    state.cursorX += dx * CONFIG.cursorLerp;
    state.cursorY += dy * CONFIG.cursorLerp;
    cursor.style.transform = `translate3d(${state.cursorX}px, ${state.cursorY}px, 0) translate3d(-50%, -50%, 0)`;
  }

  // 2. Card Visuals (Spotlight & Tilt)
  cardBounds.forEach(data => {
    const x = state.mouseX - data.rect.left;
    const y = state.mouseY - data.rect.top;
    
    // Check if mouse is over this specific card
    const isOver = x >= 0 && y >= 0 && x <= data.rect.width && y <= data.rect.height;
    
    if (isOver) {
      data.el.style.setProperty('--mouse-x', `${x}px`);
      data.el.style.setProperty('--mouse-y', `${y}px`);

      if (data.isTiltable) {
        const centerX = data.rect.width / 2;
        const centerY = data.rect.height / 2;
        const rotateX = (y - centerY) / CONFIG.tiltSensitivity;
        const rotateY = (centerX - x) / CONFIG.tiltSensitivity;
        data.el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      }
    } else {
      // Smooth reset
      if (data.isTiltable) {
        data.el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
      }
    }
  });

  requestAnimationFrame(updateApp);
}
requestAnimationFrame(updateApp);

// Optimized Event Delegation for Cursor and Interactions
document.addEventListener('mouseover', (e) => {
  const target = e.target.closest('a, button, .card:not(.contact-form), input, textarea, .legal-trigger, .modal-close');
  if (target) cursor.classList.add('expanding');
});

document.addEventListener('mouseout', (e) => {
  const target = e.target.closest('a, button, .card:not(.contact-form), input, textarea, .legal-trigger, .modal-close');
  if (target) cursor.classList.remove('expanding');
});

// Quick Copy Email Feature
document.getElementById('email-copy-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  navigator.clipboard.writeText('refined.mov@gmail.com');
  showToast("Email address copied to clipboard", 'success');
});

// Magnetic Button Effect
document.querySelectorAll('.btn-primary, .btn-ghost, nav ul li a').forEach(item => {
  let rect;
  item.addEventListener('mouseenter', () => {
    rect = item.getBoundingClientRect();
  });
  
  item.addEventListener('mousemove', (e) => {
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) * CONFIG.magneticStrength;
    const y = (e.clientY - rect.top - rect.height / 2) * CONFIG.magneticStrength;
    item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'translate3d(0, 0, 0)';
  });
});

// Add click handler for video container to enable iframe interaction
const videoContainer = document.getElementById('video-container');
if (videoContainer) {
  videoContainer.addEventListener('click', () => {
    const latestVideoFrame = document.getElementById('latest-video-frame');
    latestVideoFrame.style.pointerEvents = 'auto';
    // Instantly switch to system cursor on click
    videoContainer.style.cursor = 'auto';
    cursor.style.opacity = '0';

    // Reset the tilt effect on the parent card immediately
    const parentCard = videoContainer.closest('.card');
  }, { once: true });

  videoContainer.addEventListener('mouseenter', () => {
    const frame = document.getElementById('latest-video-frame');
    if (frame && frame.style.pointerEvents === 'auto') {
      videoContainer.style.cursor = 'auto';
    }
  });

  videoContainer.addEventListener('mouseleave', () => {
    // Restore custom cursor when leaving the video area
    cursor.style.opacity = '1';
  });
}

// Typewriter Animation Engine
const phrases = [
  "Designing spaces, tools, and motion.",
  "Building worlds through level design.",
  "Crafting tools for creative workflows.",
  "Editing stories with cinematic precision.",
  "Turning complex ideas into simple code.",
  "Lowering the barrier to creativity."
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
  const typewriterEl = document.getElementById('typewriter-text');
  if (!typewriterEl) return;

  const currentPhrase = phrases[phraseIndex];
  
  if (isDeleting) {
    typewriterEl.classList.remove('glitch');
    typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    typeSpeed = 50;
  } else {
    typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    typeSpeed = 100;
  }

  if (!isDeleting && charIndex === currentPhrase.length) {
    isDeleting = true;
    typewriterEl.classList.add('glitch');
    typeSpeed = 2000; // Pause at end
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 500; // Pause before next
  }

  setTimeout(type, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
  type();
  loadLatestVideo();
  updateRelativeTimes();
});

// Relative Time Engine for "What's New"
function updateRelativeTimes() {
  const updateItems = document.querySelectorAll('.updates-list li');
  const now = new Date();

  updateItems.forEach(item => {
    const dateStr = item.getAttribute('data-date');
    if (!dateStr) return;

    const itemDate = new Date(dateStr);
    const diffInMs = now - itemDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    let relativeText = "";
    if (diffInDays === 0) relativeText = "Today";
    else if (diffInDays === 1) relativeText = "Yesterday";
    else relativeText = `${diffInDays}d ago`;

    const badge = item.querySelector('.update-date');
    if (badge) badge.textContent = relativeText;
  });
}

// Automated YouTube Latest Video Fetcher
async function loadLatestVideo() {
  const channelID = 'UCGe5VOk80siQe0r2OfQQWPw';
  const fallbackID = 'dQw4w9WgXcQ'; // Replace with a default video ID you like
  const videoFrame = document.getElementById('latest-video-frame');
  const container = document.getElementById('video-container');
  const loader = document.getElementById('video-loader');
  
  try {
    // Using a public RSS-to-JSON API to fetch the channel's feed
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3D${channelID}`, {
      cache: 'no-store'
    });
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      // More robust ID extraction
      const url = new URL(data.items[0].link);
      const videoId = url.searchParams.get('v');
      
      videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId || fallbackID}?rel=0&modestbranding=1`;
      
      videoFrame.onload = () => {
        container.classList.add('loaded');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 800);
      };
    } else {
      throw new Error("No items found");
    }
  } catch (error) {
    console.error("Error fetching latest video:", error);
    if (loader) {
      loader.innerHTML = `<span style="color: var(--text-muted)">Feed unavailable</span>`;
      videoFrame.src = `https://www.youtube-nocookie.com/embed/${fallbackID}`;
      container.classList.add('loaded');
    }
  }
}

// Generalized Modal Logic
const modalTriggers = document.querySelectorAll('.legal-trigger');
const modalCloses = document.querySelectorAll('.modal-close');
const modals = document.querySelectorAll('.modal-overlay');

modalTriggers.forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const modalId = trigger.getAttribute('data-modal-target');
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

const closeAllModals = () => {
  modals.forEach(modal => modal.classList.remove('active'));
  document.body.style.overflow = '';
};

modalCloses.forEach(btn => btn.addEventListener('click', closeAllModals));
modals.forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAllModals();
  });
});

// Legal Language Toggle Logic
document.querySelectorAll('.lang-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const modal = toggle.closest('.modal-overlay');
    const currentLang = modal.getAttribute('data-lang') || 'de';
    const newLang = currentLang === 'de' ? 'en' : 'de';
    modal.setAttribute('data-lang', newLang);
    toggle.textContent = newLang === 'de' ? 'Switch to EN' : 'Switch to DE';
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllModals();
});

// Toast Notification Engine
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`; // Add type class for styling
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-dot toast-dot-${type}"></span>
      <span class="toast-text">${message}</span>
    </div>
  `;
  container.appendChild(toast);
  
  // Force reflow to ensure transition plays
  void toast.offsetWidth; 
  toast.classList.add('active');

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Captcha Logic
let captchaExpectedAnswer = ''; // Store the expected answer
function generateCaptcha() {
  const questions = [
    { q: "SYSTEM_CHECK: What is the primary accent color of Refined_OS?", a: "gold" },
    { q: "SYSTEM_CHECK: What is the first letter of 'Refined'?", a: "r" },
    { q: "SYSTEM_CHECK: How many fingers are on one human hand?", a: "5" } // Simple numeric for variety
  ];
  const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
  captchaExpectedAnswer = String(selectedQuestion.a).toLowerCase(); // Store lowercase string answer
  const captchaLabel = document.getElementById('captcha-label');
  if (captchaLabel) {
    captchaLabel.textContent = selectedQuestion.q;
  }
}

// Initialize captcha on page load
document.addEventListener('DOMContentLoaded', generateCaptcha);


// Contact Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const originalText = btn.textContent;
    const captchaInput = document.getElementById('captcha-input');

    // Captcha validation
    if (captchaInput.value.toLowerCase().trim() !== captchaExpectedAnswer) {
      showToast("Captcha incorrect. Please try again.", 'error', 4000);
      captchaInput.value = ''; // Clear input
      generateCaptcha(); // Generate new captcha
      return; // Stop submission
    }

    const formData = new FormData(contactForm);

    // Remove captcha field from formData before sending to Web3Forms
    formData.delete('captcha');

    btn.textContent = "Sending...";
    btn.disabled = true;
    
    try {
      // Note: Replace 'YOUR_WEB3FORMS_ACCESS_KEY' in index.html with your actual key
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        showToast("Message sent successfully", 'success');
        contactForm.reset();
        generateCaptcha(); // Generate new captcha after successful submission
      } else if (result.message === "Honeypot field detected!") {
        // Silently handle honeypot, act like it was successful to not alert bots
        showToast("Message sent successfully (spam detected and blocked)", 'success');
        contactForm.reset();
        generateCaptcha();
      } else if (result.message) {
        showToast(`Transmission error: ${result.message}`, 'error', 5000);
      } else {
        showToast("Transmission error. Please try again.", 'error');
      }
    } catch (error) {
      showToast("Network error. Check your connection.", 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// System Status Engine (Clock, Simulated CPU, Browser RAM)
function updateSystemStatus() {
  const clockEl = document.getElementById('system-clock');
  const cpuEl = document.getElementById('system-cpu');
  const ramEl = document.getElementById('system-ram');

  if (!clockEl) return;

  // 1. Actual Live Clock
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString('en-GB', { hour12: false });

  // 2. Simulated CPU Load (Jittering between 2.4% and 12.8% for OS feel)
  const simulatedCPU = (Math.random() * 10 + 2).toFixed(1);
  cpuEl.textContent = `${simulatedCPU}%`;

  // 3. RAM Usage (Performance API for Current Tab)
  if (performance.memory) {
    const usedRam = Math.round(performance.memory.usedJSHeapSize / 1048576);
    ramEl.textContent = `${usedRam}MB`;
  } else {
    // Fallback for browsers without performance.memory (Safari/Firefox)
    const jitter = (Math.random() * 5 + 124).toFixed(0);
    ramEl.textContent = `${jitter}MB`;
  }
}

setInterval(updateSystemStatus, 1000);