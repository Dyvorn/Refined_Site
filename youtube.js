// youtube.js
document.addEventListener('DOMContentLoaded', () => {
    fetchYouTubeData();
});

async function fetchYouTubeData() {
    const subCountEl = document.getElementById('sub-count');
    const videoContainer = document.getElementById('latest-video-container');

    if (!subCountEl || !videoContainer) return;

    const apiKey = CONFIG.YOUTUBE_API_KEY;
    const channelId = CONFIG.YOUTUBE_CHANNEL_ID;

    if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY') {
        subCountEl.textContent = "N/A";
        videoContainer.innerHTML = '<p class="text-center text-muted" style="margin-top: 25%;">Please configure your YouTube API Key in config.js.</p>';
        return;
    }

    try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${channelId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (channelData.items && channelData.items.length > 0) {
            const channelInfo = channelData.items[0];
            const subs = channelInfo.statistics.subscriberCount;
            animateValue(subCountEl, 0, parseInt(subs), 2000);
            
            const uploadsPlaylistId = channelInfo.contentDetails.relatedPlaylists.uploads;

            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${apiKey}`;
            const playlistResponse = await fetch(playlistUrl);
            const playlistData = await playlistResponse.json();

            if (playlistData.items && playlistData.items.length > 0) {
                const videoId = playlistData.items[0].snippet.resourceId.videoId;
                const title = playlistData.items[0].snippet.title;
                const thumbnails = playlistData.items[0].snippet.thumbnails;
                const thumbnailUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || '';

                // Securely create elements instead of innerHTML
                videoContainer.innerHTML = '';
                
                const link = document.createElement('a');
                link.href = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.cssText = 'display: block; position: absolute; inset: 0; width: 100%; height: 100%; text-decoration: none; overflow: hidden; border-radius: 12px;';

                const img = document.createElement('img');
                img.src = thumbnailUrl;
                img.alt = title;
                img.loading = 'lazy';
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;';
                img.onmouseover = () => img.style.transform = 'scale(1.05)';
                img.onmouseout = () => img.style.transform = 'scale(1)';

                const overlay = document.createElement('div');
                overlay.style.cssText = 'position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; pointer-events: none;';
                
                const iconBg = document.createElement('div');
                iconBg.style.cssText = 'background: rgba(0,0,0,0.6); padding: 1rem; border-radius: 50%; backdrop-filter: blur(4px);';
                
                iconBg.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent-color)"><path d="M8 5v14l11-7z"/></svg>';

                overlay.appendChild(iconBg);
                link.appendChild(img);
                link.appendChild(overlay);
                videoContainer.appendChild(link);
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
