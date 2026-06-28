// mobile/ui.js
document.addEventListener('DOMContentLoaded', () => {
    initUI();
});

function initUI() {
    // Scroll Progress Bar
    const progressBarFill = document.getElementById('progressBarFill');
    
    // Header Scroll State
    const header = document.getElementById('main-header');

    window.addEventListener('scroll', () => {
        // Progress Bar logic
        if (progressBarFill) {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = (scrollTop / scrollHeight) * 100;
            progressBarFill.style.width = scrollPercentage + '%';
        }

        // Header scrolled state
        if (header) {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }, { passive: true });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
        const svgPath = mobileToggle.querySelector('path');
        const hamburgerPath = "M3 12h18M3 6h18M3 18h18";
        const closePath = "M18 6L6 18M6 6l12 12";

        const updateIcon = () => {
            if (svgPath) {
                if (mobileMenu.classList.contains('active')) {
                    svgPath.setAttribute('d', closePath);
                } else {
                    svgPath.setAttribute('d', hamburgerPath);
                }
            }
        };

        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            updateIcon();
        });
        
        // Close menu when clicking a link
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                updateIcon();
            });
        });
    }

    // Reveal Animations using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.05, // smaller threshold for mobile viewports
        rootMargin: "0px 0px -20px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));
}
