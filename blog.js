// blog.js

// Function to load the list of blog posts on blog.html
async function loadBlogList() {
    const listContainer = document.getElementById('blog-list');
    if (!listContainer) return;

    try {
        const response = await fetch('blog/index.json');
        if (!response.ok) throw new Error('Could not load blog index');
        const posts = await response.json();

        if (posts.length === 0) {
            listContainer.innerHTML = '<p class="text-center text-muted" style="width: 100%;">No posts available yet.</p>';
            return;
        }

        listContainer.innerHTML = '';
        posts.forEach((post, index) => {
            const card = document.createElement('div');
            card.className = 'blog-snap-card fade-in';
            card.style.animationDelay = `${index * 100}ms`;
            card.innerHTML = `
                <p class="date">${post.date}</p>
                <h3>${post.title}</h3>
                <p class="summary">${post.summary}</p>
                <div><a href="post.html?id=${post.id}" class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 1rem;">Read Article</a></div>
            `;
            listContainer.appendChild(card);
        });

        initWheelEffect();

    } catch (error) {
        console.error('Error fetching blog list:', error);
        listContainer.innerHTML = '<p class="text-center text-accent" style="width: 100%;">Failed to load posts.</p>';
    }
}

// Function to load a specific blog post on post.html
async function loadPost() {
    const postContainer = document.getElementById('post-container');
    if (!postContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContainer.innerHTML = '<h2 class="text-center">Post Not Found</h2><p class="text-center">No post ID was specified.</p>';
        return;
    }

    try {
        const response = await fetch(`blog/${postId}.md`);
        if (!response.ok) throw new Error('Post could not be found');
        
        const markdownText = await response.text();
        
        // Parse markdown
        const rawHtml = marked.parse(markdownText);
        
        // Sanitize for security
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        
        postContainer.innerHTML = cleanHtml;
        
    } catch (error) {
        console.error('Error loading post:', error);
        postContainer.innerHTML = '<h2 class="text-center">Error Loading Post</h2><p class="text-center">The requested post could not be loaded or does not exist.</p>';
    }
}

// 3D Wheel Scroll Logic
function initWheelEffect() {
    const cards = document.querySelectorAll('.blog-snap-card');
    if (cards.length === 0) return;

    function updateWheel() {
        const centerY = window.innerHeight / 2;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterY = rect.top + rect.height / 2;
            const distance = cardCenterY - centerY;
            
            // Normalize distance relative to viewport height
            const normalizedDistance = distance / (window.innerHeight / 2); // roughly -1 at top, 0 at center, 1 at bottom

            const maxRotation = 45; // degrees
            const rotateX = normalizedDistance * -maxRotation; 
            
            const scale = Math.max(0.7, 1 - Math.abs(normalizedDistance) * 0.3);
            const opacity = Math.max(0.1, 1 - Math.abs(normalizedDistance) * 0.8);

            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) scale(${scale})`;
            card.style.opacity = opacity;
            
            // Z-index calculation to bring the centered item to the front
            const zIndex = Math.round(100 - Math.abs(normalizedDistance) * 100);
            card.style.zIndex = zIndex;
        });
    }

    // Run once to initialize
    updateWheel();

    // Update on scroll
    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateWheel);
    }, { passive: true });
}
