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
    filter.setAttribute('scale', 50 - (50 * ease));
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const revealObserver = new IntersectionObserver(revealCallback, {
  threshold: 0.15
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Navigation Scroll Spy
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul li a');
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  // Header logic
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 150) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href').includes(current));
  });
});

// Custom Cursor Logic
const cursor = document.getElementById('cursor');
let cursorVisible = false;

document.addEventListener('mousemove', (e) => {
  if (!cursorVisible) {
    cursor.style.display = 'block';
    cursorVisible = true;
  }
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button, .card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%, -50%) scale(3)');
  el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%, -50%) scale(1)');
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