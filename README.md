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

## Build

```powershell
npm run build
```

## Test

```powershell
npm run test
```

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
