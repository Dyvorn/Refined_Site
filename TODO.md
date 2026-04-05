# REFINED Roadmap: Phase 2

## 1. Immersive Experience (The "Atmosphere")
- [x] **Ambient UI Sound Design**: Implemented Web Audio oscillator sounds for clicks/hovers.
- [x] **Physics-Based Cursor**: Implemented velocity-based squash/stretch and rotation.
- [x] **Multi-Layered Parallax**: Separated Grid, Glow, and Stars into asynchronous layers.
- [x] **Custom 404 Page**: Created minimalist cinematic 404.html.

## 2. Deep Content (The "Story")
- [ ] **Case Study Deep Dives**: Create dedicated sub-pages for flagship projects like **TaskFlow**, allowing for long-form technical explanations and galleries.
- [ ] **Cinematic Media Gallery**: A lightbox-style gallery for high-resolution stills or short clips from your media productions.
- [x] **Snippets Feed**: Integrated GitHub Gists via update_site.py.
- [ ] **Testimonial Slider**: A minimalist, high-typography section for quotes from collaborators or clients.

## 3. Advanced Automation (The "Intelligence")
- [ ] **Real-Time GitHub Stats**: Add a "Live Stats" dashboard showing total commits this year, languages used, and a contribution heatmap.
- [ ] **Auto-Generated Social Cards**: Use a Python library (like `Pillow`) to automatically generate OG:Images for the site whenever `update_site.py` runs.
- [x] **Dynamic Journal**: Decoupled Journal from index.html using notes.json.
- [ ] **Automated Performance Audits**: Add a GitHub Action to run Lighthouse scores on every push and alert if performance drops below 95.

## 4. Technical Polish (The "Final 1%")
- [ ] **I18n (Internationalization)**: Add a language switcher for English/German (or other) while maintaining the minimalist UI.
- [ ] **Zero-CLS Optimization**: Further refine the "Loading Skeleton" system to ensure a Cumulative Layout Shift (CLS) score of exactly 0.
- [ ] **Custom Scroll-Triggered Animations**: Use `GSAP` or similar for complex, scroll-synced path animations (e.g., a gold line that "wires up" the projects as you scroll).
- [x] **Advanced SEO**: Implemented JSON-LD schema markup.
