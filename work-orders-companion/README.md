# Work Orders Companion Prototype

Separate React/Vite prototype for a demo-safe Work Orders Companion screening workflow.

This app is intentionally local/static:

- Mock data only
- No Maximo connection
- No backend
- No auth
- No analytics
- No real plant data, real equipment IDs, technical setpoints, torque values, acceptance criteria, or procedure content

## Local Setup

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Test And Build

```powershell
npm run test
npm run typecheck
npm run build
```

## Deployment Notes

For a separate static deployment from this repo:

- Branch: `feature/work-orders-companion-app`
- Base directory: `work-orders-companion`
- Build command: `npm run build`
- Publish directory: `dist`

## Design Reference

The accepted design concept used for this implementation is stored outside the repo by Codex at:

```text
C:\Users\reeds\.codex\generated_images\019f4359-d12e-73e1-9e57-1e21ba18217d\ig_0f884190ebe2079c016a4eaeffcbb48193acbe21ce9048fbbf.png
```
