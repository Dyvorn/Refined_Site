document.getElementById("year").textContent = new Date().getFullYear();

// Binary Rain Effect
const canvas = document.getElementById('binary-rain-canvas');
const ctx = canvas.getContext('2d');

let animationFrameId; // To store the requestAnimationFrame ID for binary rain

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

    function drawBinaryRain() {
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
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(drawBinaryRain);
    }

    drawBinaryRain();
  }
}

// Handle window resize for responsiveness
window.addEventListener('resize', () => {
  if (document.getElementById('loading-screen') && !document.getElementById('loading-screen').classList.contains('hidden')) {
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); }
    setupBinaryRain();
  }
});

// Loading Screen Logic
window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');
  const progress = document.getElementById('loader-progress');
  const logContainer = document.getElementById('boot-logs');

  // Start binary rain immediately
  setupBinaryRain();

  const bootMessages = [
    "Initializing Refined_OS...",
    "Loading Core.Geometry...",
    "Mounting Level_Design.drv",
    "Checking Motion_Engine...",
    "Stabilizing Liquid_Deform.fx",
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
      }, 400);
    }
  }

  processBoot();
});

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

// Intersection Observer for Reveal Animations
const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animateFilter(entry.target);
    } else {
      // Remove visibility to allow re-triggering the "insane" transition
      entry.target.classList.remove('visible');
    }
  });
};

// Animate the SVG filter scale to "crystallize" the content
function animateFilter(el) {
  const filter = document.querySelector('#liquid-deform feDisplacementMap');
  let start = 50;
  const duration = 1200;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4); // Quartic Out
    filter.setAttribute('scale', (1 - ease) * 30); 
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Performance Optimization: Cache scroll height on resize
let cachedHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
window.addEventListener('resize', () => {
  cachedHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
}, { passive: true });

const revealObserver = new IntersectionObserver(revealCallback, {
  threshold: 0.15
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Navigation Scroll Spy
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul li a');
const header = document.querySelector('header');
const scrollProgress = document.getElementById('progress-bar');

function handleScroll() {
  const scrollY = window.scrollY;

  // Header logic
  if (scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Progress Bar
  scrollProgress.style.width = (scrollY / cachedHeight) * 100 + "%";

  // Background Parallax
  document.body.style.setProperty('--scroll-y', `${scrollY}px`);

  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (scrollY >= sectionTop - 150) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href').includes(current));
  });
}

window.addEventListener('scroll', handleScroll, { passive: true });

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

  // Card Spotlight Logic
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

function update() {
  // High-performance elastic LERP
  const lerpFactor = 0.15;
  state.cursorX += (state.mouseX - state.cursorX) * lerpFactor;
  state.cursorY += (state.mouseY - state.cursorY) * lerpFactor;
  
  cursor.style.transform = `translate3d(${state.cursorX}px, ${state.cursorY}px, 0) translate3d(-50%, -50%, 0)`;

  requestAnimationFrame(update);
}
update();

document.querySelectorAll('a, button, .card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expanding'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expanding'));
});

// Magnetic Button Effect
document.querySelectorAll('.btn-primary, .btn-ghost, nav ul li a').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
    item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'translate3d(0, 0, 0)';
  });
});

// 3D Tilt Card Logic
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
  });
});

// Typewriter Animation Engine
const typewriterEl = document.getElementById('typewriter-text');
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

document.addEventListener('DOMContentLoaded', type);

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
    }
  } catch (error) {
    console.error("Error fetching latest video:", error);
  }
}

loadLatestVideo();