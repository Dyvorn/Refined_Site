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
            listContainer.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-muted);">No posts available yet.</p>';
            return;
        }

        listContainer.innerHTML = '';
        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">${post.date}</p>
                <h3>${post.title}</h3>
                <p style="margin-bottom: 1.5rem;">${post.summary}</p>
                <a href="post.html?id=${post.id}" class="btn btn-primary" style="padding: 0.5rem 1.5rem; font-size: 0.9rem;">Read More</a>
            `;
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching blog list:', error);
        listContainer.innerHTML = '<p style="text-align: center; width: 100%; color: var(--accent-color);">Failed to load posts.</p>';
    }
}

// Function to load a specific blog post on post.html
async function loadPost() {
    const postContainer = document.getElementById('post-container');
    if (!postContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContainer.innerHTML = '<h2>Post Not Found</h2><p>No post ID was specified.</p>';
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
        postContainer.innerHTML = '<h2>Error Loading Post</h2><p>The requested post could not be loaded or does not exist.</p>';
    }
}
