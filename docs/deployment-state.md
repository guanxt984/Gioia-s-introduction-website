# Deployment state

- Target: Render Static Site, free plan, platform `onrender.com` HTTPS URL.
- Repository: `https://github.com/guanxt984/Gioia-s-introduction-website.git`
- Release branch: `codex/experience-island-six-view-rebuild`
- Build command: `npm ci && npm run build:viewer && npm run build:site`
- Publish directory: `public`
- Backend/database/auth: none required; the site is browser-rendered static HTML/CSS/JS and assets.
- Service: Render `gioia-portfolio` (`srv-dakk5boae00c73bnpll0`), first deploy `dep-dakk5c8ae00c73bnpn00`.
- Live URL: `https://gioia-portfolio.onrender.com/`
- Published commit: `86b71f2` (`Update portfolio experience island`, pushed 2026-09-19 14:09 +08:00).
- Status: deployed successfully and live; homepage, card detail dialog (`仟传`), `#experience` direct access, standalone 3D page, and 3D page refresh verified in the deployed site.
- Local verification: `npm ci`, `npm run build:viewer`, `npm run build:site`, `check-portfolio-site.mjs`, `check-experience-overview.mjs`, and `check-experience-navigation.mjs` passed.
- Known check limitation: `check:cloudflare-assets` reports files over Cloudflare Workers' 25 MiB asset limit; this deployment targets Render Static Site, so that platform-specific check is not applicable. `check-skillcloud-details.mjs` needs Playwright, which is not in the project dependencies.
