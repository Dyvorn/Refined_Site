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
        videoContainer.innerHTML = '<p class="text-center text-muted" style="margin-top: 25%;">Please configure your YouTube API Key in config.js.</p>';
        return;
    }

    try {
        // Fetch Subscriber Count and Uploads Playlist ID
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${channelId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (channelData.items && channelData.items.length > 0) {
            const channelInfo = channelData.items[0];
            const subs = channelInfo.statistics.subscriberCount;
            animateValue(subCountEl, 0, parseInt(subs), 2000);
            
            const uploadsPlaylistId = channelInfo.contentDetails.relatedPlaylists.uploads;

            // Fetch Latest Video from the Uploads Playlist
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${apiKey}`;
            const playlistResponse = await fetch(playlistUrl);
            const playlistData = await playlistResponse.json();

            if (playlistData.items && playlistData.items.length > 0) {
                const videoId = playlistData.items[0].snippet.resourceId.videoId;
                const title = playlistData.items[0].snippet.title;
                const thumbnails = playlistData.items[0].snippet.thumbnails;
                const thumbnailUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || '';

                videoContainer.innerHTML = `
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer" style="display: block; position: absolute; inset: 0; width: 100%; height: 100%; text-decoration: none; overflow: hidden; border-radius: 12px;">
                        <img src="${thumbnailUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; pointer-events: none;">
                            <div style="background: rgba(0,0,0,0.6); padding: 1rem; border-radius: 50%; backdrop-filter: blur(4px);">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent-color)">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                        </div>
                    </a>`;
            } else {
                if (playlistData.error) console.error("YouTube Playlist API Error:", playlistData.error);
                videoContainer.innerHTML = '<p class="text-center text-muted" style="margin-top: 25%;">No videos found.</p>';
            }
        } else {
            if (channelData.error) console.error("YouTube Channel API Error:", channelData.error);
            subCountEl.textContent = "Error";
            videoContainer.innerHTML = '<p class="text-center text-muted" style="margin-top: 25%;">Failed to load channel data.</p>';
        }

    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        subCountEl.textContent = "Error";
        videoContainer.innerHTML = '<p class="text-center text-muted" style="margin-top: 25%;">Failed to connect to YouTube.</p>';
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
