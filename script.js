// script.js
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    fetchYouTubeData();
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

        // Header logic
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }

    // Reveal Animations using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
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

async function fetchYouTubeData() {
    const subCountEl = document.getElementById('sub-count');
    const videoContainer = document.getElementById('latest-video-container');

    if (!subCountEl || !videoContainer) return; // Might not exist on all pages

    const apiKey = CONFIG.YOUTUBE_API_KEY;
    const channelId = CONFIG.YOUTUBE_CHANNEL_ID;

    if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY') {
        subCountEl.textContent = "N/A";
        videoContainer.innerHTML = '<p style="text-align: center; margin-top: 25%; color: var(--text-muted);">Please configure your YouTube API Key in config.js.</p>';
        return;
    }

    try {
        // Fetch Subscriber Count
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (channelData.items && channelData.items.length > 0) {
            const subs = channelData.items[0].statistics.subscriberCount;
            animateValue(subCountEl, 0, parseInt(subs), 2000);
        } else {
            subCountEl.textContent = "Error";
        }

        // Fetch Latest Video
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=date&type=video&key=${apiKey}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.items && searchData.items.length > 0) {
            const videoId = searchData.items[0].id.videoId;
            videoContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube-nocookie.com/embed/${videoId}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>`;
        } else {
            videoContainer.innerHTML = '<p style="text-align: center; margin-top: 25%; color: var(--text-muted);">No videos found.</p>';
        }

    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        subCountEl.textContent = "Error";
        videoContainer.innerHTML = '<p style="text-align: center; margin-top: 25%; color: var(--text-muted);">Failed to load video.</p>';
    }
}

// Helper function to animate numbers counting up
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
