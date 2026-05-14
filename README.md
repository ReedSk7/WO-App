# Work Order Agent Companion

Local demo web app for converting fake CR-style intake records into conservative draft work orders for planner review.

The app is intentionally local-only:

- Fake/demo data only
- Browser local storage only
- No backend, auth, analytics, external AI calls, Maximo connection, Copilot Studio connection, or Power Automate connection
- Drafts always include: `Draft for planner review only.`
- Technical values, setpoints, torque values, PMT values, acceptance criteria, and procedure numbers are placeholders until verified by qualified review

## Setup

```powershell
npm install
```

## Run locally

```powershell
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Local Build

```powershell
npm run build
npm run preview
```

## Test

```powershell
npm run test
```

## Netlify Deployment

Recommended for sharing a no-install static version.

1. Connect the GitHub repo: `ReedSk7/WO-App`.
2. Select the branch to deploy: `codex/build-work-order-agent-companion-app` or `main`.
3. Use build command: `npm run build`.
4. Use publish directory: `dist`.
5. Keep the committed Netlify config file: `netlify.toml`.
6. After deploy, open the provided `.netlify.app` URL from the work computer.

`netlify.toml` includes an SPA fallback so direct links and refreshes resolve to `index.html`.

## Vercel Deployment

Optional static hosting target.

1. Import the GitHub repo into Vercel.
2. Use framework preset: `Vite`.
3. Use build command: `npm run build`.
4. Use output directory: `dist`.
5. `vercel.json` handles SPA fallback routing to `index.html`.

## GitHub Pages Deployment

Backup static hosting target.

1. In GitHub, enable Pages with **GitHub Actions** as the source.
2. Use the committed workflow: `.github/workflows/deploy-pages.yml`.
3. Push to `main` or `codex/build-work-order-agent-companion-app`.
4. The workflow runs `npm run build:pages` and deploys `dist`.
5. URL should be:

```text
https://reedsk7.github.io/WO-App/
```

GitHub Pages builds use base path `/WO-App/` and hash routing for refresh-safe client routes.

## Security Note

- This is a demo app.
- Do not enter proprietary, confidential, export-controlled, plant-sensitive, or real equipment data.
- Public static hosting means anyone with the URL may be able to access the app unless hosting-level protection is configured.
- `localStorage` data is browser-specific and is not synced between home and work computers.

## Feature Overview

- Dashboard with safety banner, draft status counts, quick actions, sample quick-load, and recent draft rows
- CR Intake with grouped form sections, sticky missing-info rail, sample loading, and deterministic draft generation
- Draft Review object page with metadata, status badge, section navigation, editable accordion sections, copy/export/print actions, and checklist readiness
- Maximo-style Field Builder for conservative copyable planning text
- Planning Checklist with draft-tied progress and status derivation
- Sample CR Library with fake/demo CRs and filters
- Settings / Template Editor with light/dark theme persistence, density mode, and inactive future integration placeholders

## UI / UX Notes

The interface uses a restrained modern-industrial style: enterprise sidebar, strong page headers, compact structured rows, grouped forms, neutral surfaces, accessible focus states, print styles, and persistent light/dark theme.

Status is derived deterministically:

- `Needs Info`: any blocking missing-info item exists
- `Draft`: no blocking missing-info items, checklist progress below 80%
- `Review Ready`: no blocking missing-info items and checklist progress at or above 80%

Future Copilot Studio / Power Automate / Maximo integration can be added later only through a secure API layer, authentication, environment-specific configuration, and governance review.
