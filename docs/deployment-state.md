# Deployment state

- Target: Render Static Site, free plan, platform `onrender.com` HTTPS URL.
- Repository: `https://github.com/guanxt984/Gioia-s-introduction-website.git`
- Release branch: `codex/experience-island-six-view-rebuild`
- Build command: `npm ci && npm run build:viewer && npm run build:site`
- Publish directory: `public`
- Backend/database/auth: none required; the site is browser-rendered static HTML/CSS/JS and assets.
- Service: Render `gioia-portfolio` (`srv-dakk5boae00c73bnpll0`), first deploy `dep-dakk5c8ae00c73bnpn00`.
- Live URL: `https://gioia-portfolio.onrender.com/`
- Published commit: `0d7742d6c1d8d74a623f35470a7d8dfdf06971b7`.
- Status: deployed successfully and live; homepage, card detail, hash section direct access, and standalone 3D page refresh verified.
- Known check limitation: `check-skillcloud-details.mjs` needs Playwright, which is not in the project dependencies.
