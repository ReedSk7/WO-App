# Deployment Guide

This app is a static Vite site. It has no backend, no authentication, no external API calls, and does not save generated work packages to a backend.

Do not enter proprietary, confidential, export-controlled, plant-sensitive, or real equipment data.

## Recommended Option: Netlify

Use Netlify when you want the easiest public URL to open from another computer without installing anything.

### Settings

- Repository: `ReedSk7/WO-App`
- Branch: `codex/build-work-order-agent-companion-app` or `main`
- Build command: `npm run build`
- Publish directory: `dist`
- Config file: `netlify.toml`

### Steps

1. Sign in to Netlify.
2. Choose **Add new site**.
3. Choose **Import an existing project**.
4. Connect GitHub and select `ReedSk7/WO-App`.
5. Select the branch you want to deploy.
6. Confirm the build command is `npm run build`.
7. Confirm the publish directory is `dist`.
8. Deploy the site.
9. Open the generated `.netlify.app` URL from the work computer.

The committed `netlify.toml` includes SPA fallback routing:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Backup Option: GitHub Pages

Use GitHub Pages if you want hosting directly from the repo.

### Settings

- GitHub Pages source: **GitHub Actions**
- Workflow file: `.github/workflows/deploy-pages.yml`
- Build command in workflow: `npm run build:pages`
- Published artifact: `dist`
- Expected URL: `https://reedsk7.github.io/WO-App/`

### Steps

1. Open the GitHub repo: `https://github.com/ReedSk7/WO-App`.
2. Go to **Settings** > **Pages**.
3. Set source to **GitHub Actions**.
4. Push to `main` or `codex/build-work-order-agent-companion-app`.
5. Wait for the **Deploy GitHub Pages** workflow to complete.
6. Open:

```text
https://reedsk7.github.io/WO-App/
```

GitHub Pages uses a `/WO-App/` asset base. The MVP opens from the root app URL.

## Optional Option: Vercel

Use Vercel if you prefer its dashboard or already have a Vercel account.

### Settings

- Repository: `ReedSk7/WO-App`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Config file: `vercel.json`

### Steps

1. Sign in to Vercel.
2. Choose **Add New** > **Project**.
3. Import `ReedSk7/WO-App`.
4. Confirm framework preset is `Vite`.
5. Confirm build command is `npm run build`.
6. Confirm output directory is `dist`.
7. Deploy.

`vercel.json` includes a rewrite so React routes resolve to `index.html`.

## Troubleshooting

### Blank Page After Deploy

- Confirm the deploy used the correct build command.
- For Netlify/Vercel, use `npm run build`.
- For GitHub Pages, use `npm run build:pages`.
- Confirm the deploy output directory is `dist`.
- Confirm assets are loading from the expected base path.

### 404 On Refresh

- Netlify: confirm `netlify.toml` is committed and detected.
- Vercel: confirm `vercel.json` is committed and detected.
- GitHub Pages: use the root app URL `https://reedsk7.github.io/WO-App/`.

### Assets Not Loading

- Netlify/Vercel builds should use base path `/`.
- GitHub Pages builds should use base path `/WO-App/`.
- Re-run `npm run build:pages` locally if checking the Pages build.

### Work Browser Blocks Site

- Try the provider's default domain first, such as the `.netlify.app` URL.
- If the work browser blocks Netlify, try GitHub Pages or Vercel.
- If all public hosting is blocked, ask IT which static hosting domains are allowed.

### Generated Packages Are Missing On Work Computer

- This is expected.
- Generated packages are created in the current browser session.
- Re-enter the fake CR/MPL/WO number or demo condition note on the work computer.
