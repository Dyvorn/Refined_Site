import requests
from bs4 import BeautifulSoup

# --- CONFIGURATION ---
YT_API_KEY = "AIzaSyAfvxhjH1V3W1jiMGROEpUsRwGhBWfGC1Y"
YT_CHANNEL_ID = "UCGe5VOk80siQe0r2OfQQWPw"
GH_USERNAME = "Dyvorn"
HTML_FILE = "index.html"

def get_latest_youtube_video():
    """Fetches the latest video ID from the YouTube channel."""
    try:
        # Use search endpoint to find the latest video
        url = f"https://www.googleapis.com/youtube/v3/search?key={YT_API_KEY}&channelId={YT_CHANNEL_ID}&part=snippet,id&order=date&maxResults=1&type=video"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if "items" in data and len(data["items"]) > 0:
            video_id = data["items"][0]["id"]["videoId"]
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
            desc = repo.get('description', 'No description provided.')
            name = repo.get('name', 'Untitled')
            link = repo.get('html_url', '#')

            card_html = f'''
            <a href="{link}" target="_blank" class="card">
                <span class="mono accent" style="font-size: 0.6rem; margin-bottom: 10px; display: block;">{lang}</span>
                <h3>{name}</h3>
                <p>{desc}</p>
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