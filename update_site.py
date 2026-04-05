import os
import requests
import json
from datetime import datetime
from bs4 import BeautifulSoup

# --- CONFIGURATION ---
# Use Environment Variables for security. Fallback provided for local runs.
YT_API_KEY = os.getenv("YT_API_KEY", "AIzaSyAfvxhjH1V3W1jiMGROEpUsRwGhBWfGC1Y")
YT_CHANNEL_ID = os.getenv("YT_CHANNEL_ID", "UCGe5VOk80siQe0r2OfQQWPw")
GH_USERNAME = os.getenv("GH_USERNAME", "Dyvorn")
GH_TOKEN = os.getenv("GH_TOKEN")
HTML_FILE = "index.html"
NOTES_FILE = "notes.json"

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
    headers = {}
    if GH_TOKEN:
        headers["Authorization"] = f"token {GH_TOKEN}"
        print("Using GitHub Token for authenticated request.")

    try:
        url = f"https://api.github.com/users/{GH_USERNAME}/repos?sort=updated&per_page=10"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        repos = response.json()
        # Filter out forks and return top 3
        return [r for r in repos if not r.get('fork', False)][:3]
    except Exception as e:
        print(f"Error fetching GitHub data: {e}")
    return []

def get_github_gists():
    """Fetches the latest public Gists from GitHub."""
    headers = {}
    if GH_TOKEN:
        headers["Authorization"] = f"token {GH_TOKEN}"
    try:
        url = f"https://api.github.com/users/{GH_USERNAME}/gists?per_page=3"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching Gists: {e}")
    return []

def update_site():
    print("Syncing with external APIs...")
    video_url = get_latest_youtube_video()
    repos = get_github_repos()
    gists = get_github_gists()

    if not video_url and not repos:
        print("No updates found. Skipping sync to preserve content.")
        return

    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Update YouTube Iframe
    if video_url:
        iframe = soup.find(id="yt-iframe")
        if iframe:
            iframe['src'] = video_url
            print("Updated YouTube video.")

    # Separate TaskFlow from other projects
    featured_repo = next((r for r in repos if r['name'].lower() == 'taskflow'), None)
    other_repos = [r for r in repos if r['name'].lower() != 'taskflow'][:3]

    # Update Featured Project (TaskFlow)
    featured_container = soup.find(id="featured-container")
    if featured_container and featured_repo:
        featured_container.clear()
        desc = featured_repo.get('description') or 'A cornerstone project focused on high-performance workflow optimization and cinematic execution.'
        stars = featured_repo.get('stargazers_count', 0)
        link = featured_repo.get('html_url', '#')
        
        featured_html = f'''
        <a href="{link}" target="_blank" class="featured-card" style="text-decoration: none; display: block;">
            <span class="mono featured-tag">Flagship Project</span>
            <h2 style="text-decoration: none;">{featured_repo['name']}</h2>
            <p style="font-size: 1.2rem; max-width: 700px; color: var(--muted); position: relative; z-index: 2;">{desc}</p>
            <div class="featured-features mono">
                <div class="f-item"><i>//</i> Active Dev</div>
                <div class="f-item"><i>//</i> Open Source</div>
                <div class="f-item"><i>//</i> Python Based</div>
            </div>
            <div style="margin-top: 40px; display: flex; gap: 20px;" class="mono">
                <span class="accent">⭐ {stars} Stars</span>
                <span style="color: var(--muted);">View Source Code →</span>
            </div>
        </a>
        '''
        featured_container.append(BeautifulSoup(featured_html, 'html.parser'))
        print("Updated Featured Project: TaskFlow")

    # Update GitHub Projects
    grid = soup.find(id="project-grid")
    if grid and other_repos:
        grid.clear()
        for repo in other_repos:
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

    # Update Snippets (Gists)
    snippets_grid = soup.find(id="snippets-grid")
    if snippets_grid and gists:
        snippets_grid.clear()
        for gist in gists:
            filename = list(gist['files'].keys())[0]
            desc = gist.get('description') or f"Code snippet: {filename}"
            link = gist.get('html_url', '#')
            
            gist_html = f'''
            <a href="{link}" target="_blank" class="card">
                <span class="mono accent" style="font-size: 0.6rem; margin-bottom: 10px; display: block;">Snippet</span>
                <h3 style="font-family: 'JetBrains Mono', monospace; font-size: 1rem;">{filename}</h3>
                <p style="font-size: 0.85rem; opacity: 0.8;">{desc}</p>
            </a>
            '''
            snippets_grid.append(BeautifulSoup(gist_html, 'html.parser'))
        print(f"Updated {len(gists)} Snippets.")

    # Update Journal (Notes) from JSON
    notes_grid = soup.find(id="notes-grid")
    if notes_grid and os.path.exists(NOTES_FILE):
        try:
            with open(NOTES_FILE, 'r', encoding='utf-8') as nf:
                notes = json.load(nf)
            notes_grid.clear()
            for note in notes[:5]: # Show latest 5
                note_html = f'''
                <div class="note-item">
                    <span class="note-date mono">{note['date']}</span>
                    <p class="note-content">{note['content']}</p>
                </div>
                '''
                notes_grid.append(BeautifulSoup(note_html, 'html.parser'))
            print("Updated Journal from notes.json")
        except Exception as e:
            print(f"Error updating notes: {e}")

    # Write changes back
    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())
    
    print("Site update complete.")

if __name__ == "__main__":
    update_site()