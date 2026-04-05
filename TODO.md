# Future Improvements & Features

## 1. Visual & Interactive (The "Vibe")
- [x] **Card Tilt for All**: Extend the 3D tilt effect to standard project cards.
- [x] **Magnetic Strength Scaling**: Make the magnetic pull on nav links stronger based on proximity.
- [x] **Glow Trails**: Added smooth lagging trail circles to the custom cursor.
- [ ] **Loading Skeleton**: Implement "Skeleton Screens" for the YouTube and GitHub sections so the layout doesn't "jump" when the script updates the HTML.
- [x] **Noise Toggle**: Added a footer toggle to enable/disable film grain.

## 2. Functional Features (The "Content")
- [ ] **Spotify Integration**: Use the Spotify API to show what you are "Currently Vibing To" in the footer or a sidebar.
- [x] **Minimalist "Notes" Section**: Added a Journal section for micro-updates.
- [ ] **Project Search/Filter**: If the project list grows, add a mono-styled filter for (Python / HTML / Media).
- [ ] **Contact Form**: Integrate a service like Formspree into a minimalist overlay so people can reach out without leaving the page.
- [x] **Discord Status**: Integrated Lanyard API to sync status dot with Discord.

## 3. Technical & Performance (The "Engine")
- [ ] **Image Optimization**: Convert any future branding assets to `.webp` or `.avif` for faster loading.
- [x] **SEO Deep Dive**: Added OpenGraph and Twitter meta tags.
- [x] **Error Boundaries**: Updated `update_site.py` to prevent data clearing on API failure.
- [ ] **GitHub PAT Transition**: Move from public API calls to using a Personal Access Token (PAT) in the GitHub Action to avoid rate-limiting as the site grows.
- [ ] **PWA Support**: Add a `manifest.json` so the portfolio can be "installed" as an app on mobile devices.

## 4. Accessibility & Polish (The "Professionalism")
- [x] **ARIA Labels**: Added ARIA roles and labels to nav links and sections.
- [x] **Print Styles**: Added minimalist print CSS for professional distribution.
- [x] **Reduced Motion Support**: Added media queries to disable heavy animations and parallax.
- [x] **Typography Refinement**: Fine-tuned line-height and letter-spacing for premium feel.
```
