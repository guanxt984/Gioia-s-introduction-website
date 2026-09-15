# Deployment state

- Target: Render Static Site, free plan, platform `onrender.com` HTTPS URL.
- Repository: `https://github.com/guanxt984/Gioia-s-introduction-website.git`
- Release branch: `codex/experience-island-six-view-rebuild`
- Build command: `npm ci && npm run build:viewer && npm run build:site`
- Publish directory: `public`
- Backend/database/auth: none required; the site is browser-rendered static HTML/CSS/JS and assets.
- Status: local build verified; GitHub push and Render site creation still pending.
- Known check limitation: `check-skillcloud-details.mjs` needs Playwright, which is not in the project dependencies.
