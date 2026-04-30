# boozle-website

Marketing and documentation website for [Boozle](https://github.com/gethash/boozle) — an open-source, single-binary PDF presenter for fullscreen, timed, auto-advancing slideshows.

Live at **[boozle.io](https://boozle.io)**

---

## About Boozle

Boozle turns any PDF into a fullscreen, auto-advancing slideshow. It is built for trade show booths, kiosk displays, lobby screens, classrooms, and hands-free presentations. No presentation suite. No runtime. No installer. Just a single static binary.

Key features: auto-advance timer, loop mode, per-slide timing via TOML sidecar config, progress overlay, slide overview grid, HiDPI rendering, multi-monitor support, and cross-platform binaries for macOS, Linux, and Windows.

---

## What's in this repo

```
boozle-website/
├── index.html          # Home — hero, features, install, use cases preview, FAQ
├── docs.html           # Full CLI reference, keyboard shortcuts, sidecar config guide
├── use-cases.html      # Detailed use case walkthroughs
├── compare.html        # Feature comparison vs PowerPoint, Acrobat, browser viewers
├── CNAME               # Custom domain (boozle.io)
├── assets/
│   ├── css/
│   │   └── style.css   # Single shared stylesheet
│   └── js/
│       └── main.js     # Vanilla JS — tabs, copy buttons, FAQ accordion, animations
├── logos/
│   ├── logo.svg        # Primary wordmark (SVG)
│   ├── logo.png        # Raster fallback
│   ├── favicon.svg     # SVG favicon
│   └── favicon.png     # PNG favicon fallback
├── styleguide/
│   └── boozle_styleguide.png
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions — auto-deploy to GitHub Pages on push to main
```

---

## Tech stack

Pure static HTML, CSS, and vanilla JavaScript. No build step, no bundler, no framework, no dependencies. The site can be opened directly in a browser from the filesystem.

- **Fonts** — Inter (Google Fonts, loaded via CDN)
- **Icons** — Inline SVG throughout
- **Animations** — CSS `@keyframes` + IntersectionObserver for scroll fade-ins
- **Interactive** — Tabs, FAQ accordion, copy-to-clipboard, animated countdown mockups

---

## Local development

No setup required. Open any HTML file directly in your browser:

```bash
open index.html
```

Or serve it locally to avoid any browser same-origin restrictions:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then visit `http://localhost:8080`.

---

## Deployment

The site deploys automatically to GitHub Pages via GitHub Actions on every push to `main`.

**Workflow:** `.github/workflows/deploy.yml`

The workflow:
1. Checks out the repo
2. Configures GitHub Pages
3. Uploads the repo root as the Pages artifact
4. Deploys via the official `actions/deploy-pages` action

**One-time setup** (required after first push):
1. Go to the repo on GitHub → **Settings → Pages**
2. Under *Build and deployment → Source*, select **GitHub Actions**
3. The next push to `main` will trigger a live deployment

The `CNAME` file in the repo root is picked up automatically by GitHub Pages and routes `boozle.io` to the site. DNS must point to GitHub's Pages servers (`185.199.108–111.153.153`).

---

## Design system

The full visual spec is in `styleguide/boozle_styleguide.png`. Key tokens are defined as CSS custom properties at the top of `assets/css/style.css`:

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0e0e10` | Page background |
| `--color-surface` | `#18181c` | Cards, panels |
| `--color-text` | `#f8fafc` | Primary text |
| `--grad-1` – `--grad-8` | Rainbow spectrum | Gradient accents |
| `--font-sans` | Inter | Body and UI |
| `--font-mono` | Fira Code / Cascadia | Code blocks |

---

## License

Apache-2.0 — same as the [Boozle](https://github.com/gethash/boozle) app itself.
