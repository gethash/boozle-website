# boozle-website

Marketing and documentation website for [Boozle](https://github.com/gethash/boozle) — an open-source, single-binary PDF presenter for fullscreen, timed, auto-advancing slideshows.

Live at **[boozle.io](https://boozle.io)**

---

## About Boozle

Boozle turns any PDF into a fullscreen, auto-advancing slideshow. It is built for trade show booths, kiosk displays, lobby screens, classrooms, and hands-free presentations. No presentation suite. No runtime. No installer. Just a single static binary.

Key features: auto-advance timer, loop mode, per-slide timing via TOML sidecar config, progress overlay, slide overview grid, HiDPI rendering, multi-monitor support with monitor selection by index or name, presenter view with speaker notes (from TOML, `.pdfpc`, or imported PowerPoint notes), and cross-platform binaries for macOS (Intel and Apple Silicon), Linux (x86_64 and ARM64), and Windows.

---

## What's in this repo

```
boozle-website/
├── index.html          # Home: hero with running deck, features, install, use cases, quick start, compare, FAQ
├── docs.html           # CLI reference, keyboard shortcuts, TOML/pdfpc sidecars, performance, platform notes
├── use-cases.html      # Seven use-case walkthroughs with display mockups
├── compare.html        # Feature comparison vs PowerPoint, Keynote, Acrobat, browser viewers
├── legal-notice.html   # Impressum
├── privacy.html        # Privacy policy
├── 404.html            # "This page isn't in the deck." (served by GitHub Pages for unknown URLs)
├── CNAME               # Custom domain (boozle.io)
├── assets/
│   ├── css/style.css   # Single stylesheet: fonts, tokens (dark + light), bz-* components, pg-* page layout
│   ├── js/main.js      # Vanilla JS: theme toggle, mobile menu, install tabs, copy, docs scroll-spy, reveals
│   ├── fonts/          # Bricolage Grotesque, Geist, Geist Mono (variable woff2, OFL, self-hosted)
│   └── og/boozle-og.png  # 1200×630 social preview image
├── logos/
│   ├── logo.svg / logo.png          # Primary lockup for dark grounds
│   ├── logo-light.svg               # Lockup for light grounds
│   ├── logo-mono-white.svg / -black # One-colour versions
│   ├── mark.svg / mark-light.svg    # The "b" mark alone
│   ├── app-icon.svg, apple-touch-icon.png
│   └── favicon.svg / favicon.png
├── styleguide/
│   └── boozle_styleguide.png        # One-page overview of the design system
└── .github/workflows/deploy.yml     # GitHub Actions: deploy to GitHub Pages on push to main
```

---

## Tech stack

Pure static HTML, CSS, and vanilla JavaScript. No build step, no bundler, no framework, no dependencies. The site can be opened directly in a browser from the filesystem.

- **Fonts**: Bricolage Grotesque (display), Geist (text), Geist Mono (code, timers). Self-hosted from `assets/fonts/`, with no third-party font requests.
- **Themes**: dark by default. Light follows the OS setting, and the header toggle stores an explicit choice in `localStorage` (`boozle-theme`). A tiny inline script in each `<head>` applies it before first paint.
- **Icons**: inline SVG, outline style, 1.75 stroke.
- **Motion**: CSS transitions with custom curves. The hero deck auto-advances with CSS keyframes (transform/opacity only). Sections below the fold rise in once via IntersectionObserver. `prefers-reduced-motion` keeps fades and drops movement.
- **Interactive**: install tabs (clip-path indicator, arrow-key navigation), copy-to-clipboard, FAQ (`<details>`), mobile menu, docs scroll-spy, theme toggle.

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

The visual system lives in the **Boozle - Design System** artifact (tokens, components, motion rules, logo). The page designs live in the **Boozle - Website** artifact. `styleguide/boozle_styleguide.png` is a one-page overview.

The idea is that **the timer is the brand**. The eight-stop spectrum is used only for time and progress: progress segments, countdown rings and the logo bowl. Everything else is neutral.

| Token | Dark | Light | Usage |
|---|---|---|---|
| `--ground` | `#0b0b12` | `#f7f7fb` | Page background |
| `--surface` | `#12121b` | `#ffffff` | Code windows, tables, cards |
| `--ink` | `#f4f4fa` | `#12121a` | Primary text, primary button fill |
| `--ink-muted` | `#a9a9c0` | `#545469` | Ledes, card copy |
| `--signal` | `#5ce1ff` | `#0a62b0` | Links, active docs item |
| `--spectrum-*` | `#ff4d6d` → `#ff61d8` | same | Time and progress only |
| `--font-display` | Bricolage Grotesque | | Headlines |
| `--font-sans` | Geist | | Body and UI |
| `--font-mono` | Geist Mono | | Commands, flags, timers |

Class prefixes in `style.css`: `bz-` for design-system components and `pg-` for page layout.

---

## License

Apache-2.0 — same as the [Boozle](https://github.com/gethash/boozle) app itself.
