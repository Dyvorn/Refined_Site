# REFINED Roadmap: Phase 2

## 1. Immersive Experience (The "Atmosphere")
- [x] **Physics-Based Cursor**: Implemented velocity-based rotation and stretch.
- [x] **Custom 404 Page**: Created cinematic error page.

## 2. Deep Content (The "Story")
- [ ] **Case Study Deep Dives**: Create dedicated sub-pages for flagship projects like **TaskFlow**, allowing for long-form technical explanations and galleries.
- [x] **Cinematic Media Gallery**: Implemented automated gallery grid via media.json.
- [x] **Snippets Feed**: Automated injection of Gists via Python.
- [x] **Testimonial Slider**: Implemented automated testimonial section via JSON.

## 3. Advanced Automation (The "Intelligence")
- [x] **Real-Time GitHub Stats**: Integrated user stats and total star count into Hero.
- [ ] **Auto-Generated Social Cards**: Use a Python library (like `Pillow`) to automatically generate OG:Images for the site whenever `update_site.py` runs.
- [x] **Dynamic Journal**: Decoupled Journal from index.html using notes.json.
- [b. Technical Polish (The "Final 1%")
- [ ] **I18n (Internationalization)**: Add a language switcher for English/German (or other) while maintaining the minimalist UI.
- [ ] **Zero-CLS Optimization**: Further refine the "Loading Skeleton" system to ensure a Cumulative Layout Shift (CLS) score of exactly 0.
- [ ] **Custom Scroll-Triggered Animations**: Use `GSAP` or similar for complex, scroll-synced path animations (e.g., a gold line that "wires up" the projects as you scroll).
- [x] **Advanced SEO**: Implemented JSON-LD schema markup.
