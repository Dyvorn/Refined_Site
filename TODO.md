# REFINED Roadmap: Phase 2

## 1. Immersive Experience (The "Atmosphere")
- [ ] **Physics-Based Cursor**: Replace the current Lerp cursor with a physics-based "liquid" cursor that deforms slightly based on velocity.
- [
## 2. Deep Content (The "Story")
- [ ] **Case Study Deep Dives**: Create dedicated sub-pages for flagship projects like **TaskFlow**, allowing for long-form technical explanations and galleries.
- [ ] **Cinematic Media Gallery**: A lightbox-style gallery for high-resolution stills or short clips from your media productions.
- [ ] **Snippets Feed**: Integrate GitHub Gists to showcase a "Live Code Snippet" feed for reusable Python logic.
- [ ] **Testimonial Slider**: A minimalist, high-typography section for quotes from collaborators or clients.

## 3. Advanced Automation (The "Intelligence")
- [ ] **Real-Time GitHub Stats**: Add a "Live Stats" dashboard showing total commits this year, languages used, and a contribution heatmap.
- [ ] **Auto-Generated Social Cards**: Use a Python library (like `Pillow`) to automatically generate OG:Images for the site whenever `update_site.py` runs.
- [x] **Dynamic Journal**: Decoupled Journal from index.html using notes.json.
- [b. Technical Polish (The "Final 1%")
- [ ] **I18n (Internationalization)**: Add a language switcher for English/German (or other) while maintaining the minimalist UI.
- [ ] **Zero-CLS Optimization**: Further refine the "Loading Skeleton" system to ensure a Cumulative Layout Shift (CLS) score of exactly 0.
- [ ] **Custom Scroll-Triggered Animations**: Use `GSAP` or similar for complex, scroll-synced path animations (e.g., a gold line that "wires up" the projects as you scroll).
- [x] **Advanced SEO**: Implemented JSON-LD schema markup.
