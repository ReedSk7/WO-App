# Work Order Agent Companion

Local demo web app for converting fake CR intake records into conservative draft work orders.

## Setup
```bash
npm install
```

## Run locally
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Test
```bash
npm run test
```

## Notes
- Browser local storage only; no external APIs/databases.
- Draft output always includes: "Draft for planner review only."
- Future integrations panel is placeholder-only (not active).
- Future Copilot Studio / Power Automate / Maximo integration can be added later via secure API layer, auth, and environment-specific connectors after governance review.
