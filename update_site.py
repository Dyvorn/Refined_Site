import os
import requests
from datetime import datetime
from bs4 import BeautifulSoup

# --- CONFIGURATION ---
# Use Environment Variables for security. Fallback provided for local runs.
YT_API_KEY = os.getenv("YT_API_KEY", "AIzaSyAfvxhjH1V3W1jiMGROEpUsRwGhBWfGC1Y")
YT_CHANNEL_ID = os.getenv("YT_CHANNEL_ID", "UCGe5VOk80siQe0r2OfQQWPw")
GH_USERNAME = os.getenv("GH_USERNAME", "Dyvorn")
HTML_FILE = "index.html"

def get_latest_youtube_video():
    """Fetches the latest video ID using the uploads playlist (100x more quota efficient)."""
    try:
        # The "Uploads" playlist ID is usually the Channel ID with 'UU' instead of 'UC'
        playlist_id = "UU" + YT_CHANNEL_ID[2:]
        url = f"https://www.googleapis.com/youtube/v3/playlistItems?key={YT_API_KEY}&playlistId={playlist_id}&part=snippet&maxResults=1"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if "items" in data and len(data["items"]) > 0:
            video_id = data["items"][0]["snippet"]["resourceId"]["videoId"]
            return f"https://www.youtube.com/embed/{video_id}"
    except Exception as e:
        print(f"Error fetching YouTube data: {e}")
    return None

def get_github_repos():
    """Fetches top 3 recent repositories from GitHub."""
    try:
        url = f"https://api.github.com/users/{GH_USERNAME}/repos?sort=updated&per_page=10"
        response = requests.get(url)
        response.raise_for_status()
        repos = response.json()
        # Filter out forks and return top 3
        return [r for r in repos if not r.get('fork', False)][:3]
    except Exception as e:
        print(f"Error fetching GitHub data: {e}")
    return []

def update_site():
    print("Syncing with external APIs...")
    video_url = get_latest_youtube_video()
    repos = get_github_repos()

    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Update YouTube Iframe
    if video_url:
        iframe = soup.find(id="yt-iframe")
        if iframe:
            iframe['src'] = video_url
            print("Updated YouTube video.")

    # Update GitHub Projects
    grid = soup.find(id="project-grid")
    if grid and repos:
        grid.clear()
        for repo in repos:
            lang = repo.get('language', 'Project')
            # Clean up empty or "None" descriptions
            desc = repo.get('description')
            desc_tag = f'<p>{desc}</p>' if desc else ''
            name = repo.get('name', 'Untitled')
            link = repo.get('html_url', '#')
            stars = repo.get('stargazers_count', 0)
            updated = datetime.strptime(repo.get('updated_at'), '%Y-%m-%dT%H:%M:%SZ').strftime('%b %Y')

            card_html = f'''
            <a href="{link}" target="_blank" class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <span class="mono accent" style="font-size: 0.6rem;">{lang}</span>
                    <span class="mono" style="font-size: 0.6rem; color: var(--muted);">⭐ {stars}</span>
                </div>
                <h3>{name}</h3>
                {desc_tag}
                <div class="mono" style="font-size: 0.55rem; color: var(--muted); margin-top: 20px; opacity: 0.5;">Last sync: {updated}</div>
            </a>
            '''
            grid.append(BeautifulSoup(card_html, 'html.parser'))
        print(f"Updated {len(repos)} GitHub projects.")

    # Write changes back
    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())
    
    print("Site update complete.")

if __name__ == "__main__":
    update_site()