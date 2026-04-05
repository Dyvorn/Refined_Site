# Refined — static site

This repository contains a small static landing page you can publish with GitHub Pages.

How to publish
- Option A (recommended): Create a repository named `username.github.io` and push these files to its `main` branch. GitHub Pages will serve the site at `https://username.github.io`.
- Option B: In repository settings, enable GitHub Pages and select the `main` branch (or `gh-pages` branch) and `/ (root)` as the folder.

Files
- `index.html` — landing page
- `style.css` — main styles
- `script.js` — theme toggle
- `assets/` — images and logo

Local preview
Open `index.html` in a browser or use a simple server, e.g.:

```bash
python -m http.server 8000
# then open http://localhost:8000
```
