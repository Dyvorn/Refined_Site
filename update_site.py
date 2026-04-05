import requests
import re
from xml.etree import ElementTree
from bs4 import BeautifulSoup

# --- CONFIGURATION ---
GITHUB_USERNAME = "Dyvorn"
YT_CHANNEL_ID = "UCp0D2v_nLpD_S-wX4Iu7M_A" # Replace with your actual Channel ID
HTML_FILE = "index.html"

def get_github_data():
    url = f"https://api.github.com/users/{GITHUB_USERNAME}/repos?sort=updated&per_page=10"
    repos = requests.get(url).json()
    # Filter for non-forks and take top 3
    public_repos = [r for r in repos if not r['fork']][:3]
    total_count = requests.get(f"https://api.github.com/users/{GITHUB_USERNAME}").json().get('public_repos', 0)
    return public_repos, total_count

def get_youtube_latest():
    rss_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={YT_CHANNEL_ID}"
    response = requests.get(rss_url)
    root = ElementTree.fromstring(response.content)
    
    # Namespace for media tags
    ns = {'ns': 'http://www.w3.org/2005/Atom', 'media': 'http://search.yahoo.com/mrss/'}
    entry = root.find('ns:entry', ns)
    
    video_id = entry.find('ns:id', ns).text.split(':')[-1]
    title = entry.find('ns:title', ns).text
    description = entry.find('media:group/media:description', ns).text[:120] + "..."
    
    return {
        'id': video_id,
        'title': title,
        'desc': description,
        'url': f"https://www.youtube.com/embed/{video_id}"
    }

def update_html():
    print("Fetching data...")
    repos, repo_count = get_github_data()
    video = get_youtube_latest()
    
    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Update Stats
    if soup.find(id="stat-repos"): soup.find(id="stat-repos").string = str(repo_count)
    
    # Update Video
    if soup.find(id="latest-video-frame"):
        soup.find(id="latest-video-frame")['src'] = video['url']
    if soup.find(id="latest-video-title"):
        soup.find(id="latest-video-title").string = video['title']
    if soup.find(id="latest-video-desc"):
        soup.find(id="latest-video-desc").string = video['desc']

    # Update Projects
    container = soup.find(id="projects-container")
    if container:
        container.clear()
        for repo in repos:
            lang_class = "b1" if repo['language'] == "Python" else "b3"
            project_html = f'''
            <article class="project">
              <div class="cover" style="background:linear-gradient(135deg, rgba(76,132,255,.1), rgba(100,240,255,.05));">
                <div class="icon">📁</div>
              </div>
              <div class="project-body">
                <div class="project-row">
                  <div>
                    <h3 class="project-name">{repo['name']}</h3>
                    <p class="project-copy">{repo['description'] or "No description provided."}</p>
                  </div>
                  <div class="badges">
                    <span class="badge {lang_class}">{repo['language'] or "Misc"}</span>
                  </div>
                </div>
                <div class="project-bottom">
                  <div class="meta">
                    <span>Updated: {repo['updated_at'][:10]}</span>
                    <span>⭐ {repo['stargazers_count']}</span>
                  </div>
                  <a class="btn btn-ghost" href="{repo['html_url']}" target="_blank" rel="noopener noreferrer">Open repo</a>
                </div>
              </div>
            </article>
            '''
            container.append(BeautifulSoup(project_html, 'html.parser'))

    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())
    print("Site updated successfully!")

if __name__ == "__main__":
    update_html()