# Sidharth Gadikota, portfolio v2

Dark athletic-editorial redesign. Static HTML/CSS/JS, works on GitHub Pages as-is.

## Ship it

Replace the contents of `Sidlmao/portfolio` with these files (`index.html`, `style.css`, `script.js`, `pfp.jpeg`, `README.md`), commit, push. GitHub Pages picks it up automatically.

```bash
git clone https://github.com/Sidlmao/portfolio.git && cd portfolio
# copy the new files in, overwriting the old ones, then:
git add -A && git commit -m "v2: dark redesign with Higgsfield art + GSAP motion" && git push
```

## Notes

- Visuals (hero court, contact texture, favicon, social card) were generated with Higgsfield and load from its CDN. They also live in your Higgsfield media library. To self-host later: save each image into an `assets/` folder, name them `hero.webp`, `texture.webp`, `favicon.webp`, `og.png`, and swap the four CDN URLs in `index.html`.
- Motion: Lenis smooth scroll + GSAP (CDN). Everything respects `prefers-reduced-motion` and degrades to a clean static page if scripts fail.
- The old contact form posted to a placeholder Formspree ID (it never delivered). Replaced with a direct email CTA + copy button.
- Content follows your resume (July 2026): Northeastern '30, the four AI internships, resume projects, and the new email (sidgadikota26@gmail.com).
- The hero cutout and about photo come from the graduation portrait (background removed via Higgsfield). The old `pfp.jpeg` stays in the repo as a backup.
- The highlight reel is a CSS 3D ring, spun by scroll (GSAP pinned scrub). Six Higgsfield plates, one per project or role.
