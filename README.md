# Work Order Planning Agent MVP

Static demo web app for helping nuclear work order planners turn fake CR/MPL/WO inputs into conservative Maximo-style draft planning packages.

The app is intentionally simple:

- One input box labeled `paste or type CR/MPL/Work order number`
- One response-mode selector for draft creation, draft review, planning-basis research, or general guidance
- One `Analyze` action
- One result screen with Maximo-style top tabs
- Agent generated baseline beside planner final text for copy/paste
- Refinement summary showing what was kept, removed, added, or edited
- Local save/resume for in-progress planner edits
- Exportable refinement reports in JSON or Markdown
- Fake/demo sample data only
- No backend, auth, analytics, external AI calls, Maximo connection, Copilot Studio connection, or Power Automate connection
- Every generated package includes: `Draft only. Not approved for execution. Requires qualified planner review and applicable organizational approvals.`

Do not enter proprietary, confidential, export-controlled, plant-sensitive, real equipment, real CR, or real work order data.

## Sample Inputs

Use these fake samples to demo the app:

```text
DEMO-CR-1001
DEMO-MPL-2001
DEMO-WO-3001
```

Unknown input creates a conservative generic planner package with missing information clearly flagged.

## Response Modes

The mode selector changes the planner guidance in the generated package while keeping the MVP workflow simple:

- `Create Work Order Draft`: constrained draft package structure and next actions
- `Review Work Order`: completeness, risk, task-structure, and edit guidance
- `Research / Planning Basis`: known context, possible indicators, and limits of history use
- `General Guidance`: concise planning-process guidance with source and uncertainty limits

All modes separate facts, assumptions, missing information, risks, and planner next actions.

## Planner Edit Review

Each Maximo-style tab shows:

- `Agent generated baseline`: the original content the assistant provided
- `Planner final text for copy/paste`: the content the planner intends to use
- `What changed for agent refinement`: kept, removed, added, and edited line summary

Use `Save progress` to keep the generated baseline and planner final text in the current browser's local storage. The input screen shows `Resume saved progress` when a saved review session exists.

Use `Export refinement JSON` or `Export refinement Markdown` to preserve what the assistant provided versus what the planner actually kept for copy/paste. This is the local MVP refinement signal for improving the agent over time.

## Maximo-Style Tabs

The result screen keeps these tabs in order:

- Workorder
- Plans
- Reviews
- Engineering
- Scheduling
- Logic
- Related Records
- Actuals
- Safety Plan
- Impact Plans
- Log
- Specifications

Technical values, setpoints, torque values, PMT values, acceptance criteria, clearance boundaries, and procedure steps are not generated. The app points the planner back to approved source documents and qualified review.

## Planning Assistant Guidance

The app models a public-safe planning assistant. It can represent these planner-support behaviors using fake/demo data:

- Research fake equipment and work-history context
- Summarize planning-basis questions and repeat-condition indicators
- Draft conservative planning content for qualified planner review
- Review draft packages for completeness, source gaps, and field usability

It does not represent live system access, work authorization, operability decisions, or approval authority.

## Setup

```powershell
npm install
```

## Run Locally

```powershell
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Test

```powershell
npm run test
npm run typecheck
npm run build
```

## Netlify Deployment

Recommended for opening the app from a work desktop without installing anything.

1. Connect the GitHub repo: `ReedSk7/WO-App`.
2. Select the branch to deploy: `codex/build-work-order-agent-companion-app` or `main`.
3. Use build command: `npm run build`.
4. Use publish directory: `dist`.
5. Keep the committed Netlify config file: `netlify.toml`.
6. After deploy, open the provided `.netlify.app` URL from the work computer.

`netlify.toml` includes an SPA fallback so refreshes resolve to `index.html`.

## Backup Hosting

GitHub Pages and Vercel config files are included as backup static hosting options:

- GitHub Pages: run workflow `.github/workflows/deploy-pages.yml`
- Vercel: import the repo with framework preset `Vite`

## Security Note

- This is a demo app.
- Public static hosting means anyone with the URL may be able to access the app unless hosting-level protection is configured.
- The app does not save generated work packages to a backend.
- Future Maximo, Copilot Studio, Power Automate, or AI integration should be added only through a secure API layer, authentication, environment-specific configuration, and governance review.
