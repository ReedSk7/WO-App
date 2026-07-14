# Work Order Readiness

A field-first decision-support prototype for reviewing synthetic work-order
readiness. The app is designed for tablet use and answers three questions:

1. Can the demonstration work order be executed?
2. If not, what is preventing execution?
3. What needs to happen next?

This repository does **not** connect to a production work-management, permit,
clearance, document, scheduling, or plant-information system. It uses clearly
synthetic demonstration records only and does not authorize work.

## Run locally on Windows

Prerequisites:

- Node.js 22.13 or newer
- npm

From PowerShell:

```powershell
npm install
npm run dev
```

Use the local URL printed by the development server.

## Demonstration scenarios

| Work order | Scenario | Expected overall state |
| --- | --- | --- |
| `SNC255555` | Incomplete scaffold and permit prerequisite | Blocked |
| `SNC255556` | All required demonstration checks complete | Ready |
| `SNC255557` | Relevant history and OE need review | Review Required |
| `SNC255558` | Advance prerequisites complete; day-of issuance remains | Ready with Day-of Actions |
| `SNC255559` | Critical source checks unavailable or partial | Unable to Verify |

The demo scenario selector is a reviewer convenience and is not presented as a
production capability.

## Validation commands

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Run all checks with:

```powershell
npm run check
```

## Netlify deployment

The default build uses standard Next.js and produces the `.next` directory
expected by Netlify's Next.js runtime:

```powershell
npm run build
```

Repository build settings are defined in `netlify.toml`. The existing vinext
adapter remains available for the separate Sites workflow through
`npm run build:sites`.

## Project structure

- `app/components/` — field UI, summaries, filters, expandable detail views,
  change history, and local-only feedback
- `app/lib/readiness/` — normalized models, mock scenarios, deterministic
  evaluation, and the application service
- `app/lib/providers/` — provider contracts and the mock adapter that future
  authorized integrations can replace
- `app/lib/storage.ts` — guarded localStorage helpers for safe prototype
  preferences and acknowledgments
- `tests/` — evaluator, false-green, permit-lifecycle, scenario, and refresh
  regression tests

## Prototype safety boundary

- Missing, stale, partial, or unavailable required data is never converted to a
  passing result.
- Readiness is determined by explicit state precedence, not a completion
  percentage.
- Equipment history and operating experience require review when relevant; they
  do not automatically become blockers.
- No clearance boundary, procedure step, test instruction, acceptance criterion,
  permit requirement, qualification record, or operational decision is created
  by the app.
- Source-record buttons open an in-app placeholder explaining that no production
  integration exists.
- Feedback and OE acknowledgment remain in local browser storage and are not
  submitted to a work-management system.

Always verify readiness using approved processes and source systems before
beginning work.
