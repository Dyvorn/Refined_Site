# REFINED | Portfolio

A high-performance, cinematic portfolio designed to be professional yet "calm and chill." This space documents a journey through software development and media production, utilizing a minimalist **Gold, Neon, and Black** aesthetic.

## ✨ Philosophy
- **Minimalism**: Single-page architecture focused on typography and whitespace.
- **Cinematic Feel**: Parallax depth, animated grain, and interactive fluid morphism.
- **Automation**: Self-updating content synced via official APIs.
- **Cortisol Lowering**: Smooth transitions, blur-in reveals, and organic motion.

## 🚀 Tech Stack
- **Frontend**: Vanilla HTML5, CSS3 (Modern features like `backdrop-filter` and `conic-gradient`), and high-performance JavaScript.
- **Backend Engine**: Python script (`update_site.py`) using YouTube Data API v3 and GitHub API.
- **Automation**: GitHub Actions (`sync.yml`) for daily content synchronization.

## 🛠️ Core Features
- **Flagship Highlight**: A dedicated, interactive 3D section for **TaskFlow**.
- **Live Content**: Automatically fetches the latest YouTube upload and most recent GitHub repositories.
- **Tactile UI**: Custom smoothed cursor with linear interpolation (Lerp) and magnetic navigation links.
- **Atmospheric Polish**: Real-time parallax background and dynamic "System Online" status indicators.

## 📦 Installation & Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/Dyvorn/Refined_Site.git
   ```

2. **Install Dependencies**:
   ```bash
   pip install requests beautifulsoup4
   ```

3. **Configure Environment Variables**:
   Set the following secrets in your environment or GitHub Repository:
   - `YT_API_KEY`: Your Google Cloud YouTube Data API Key.
   - `YT_CHANNEL_ID`: Your unique YouTube Channel ID.
   - `GH_USERNAME`: Your GitHub username.

4. **Run Manual Sync**:
   ```bash
   python update_site.py
   ```

## 📈 Automation
The site is configured to update itself every 24 hours via GitHub Actions. It pulls the latest metadata, updates `index.html`, and pushes the changes back to the repository automatically.

---
*Built with focus & low cortisol.*
