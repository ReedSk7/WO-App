# Codex Brief: Work Orders Companion Branch

Branch: `feature/work-orders-companion-app`

## Purpose

This branch is for a separate prototype direction for the WO app. Do not reshape or overwrite the current production/main layout unless specifically asked later. Treat this as an experimental Work Orders Companion app branch.

Use the provided screenshot only as design direction. Do not copy plant-specific details, plant-sensitive data, names, IDs, or proprietary content. Use mock/demo-safe work order data.

## Product direction

Build a professional enterprise-style Work Orders Companion dashboard focused on screening, classifying, consolidating, and routing work requests.

The desired app structure should include:

- Left navigation rail
- Top workflow phase tabs
- Central work request table
- Selected work request detail area
- Right-side AI/operational insights panel

## Workflow tabs

Across the top of the main content area:

- Intake
- Screening
- Planning
- Scheduling
- Weekly Review
- Completion

Default page for this prototype should be Screening.

## Left navigation

Include a left sidebar similar to a work management product:

- Home
- Workflows
  - Intake
  - Screening
  - Planning
  - Scheduling
  - Weekly Review
  - Completion
- Reports
- Analytics
- Actions Hub
- Work Order Audit
- Integrations
- Admin

## Screening page requirements

Create a central Work Requests table using mock data.

Columns:

- Ticket Number
- Description
- Location
- Status
- WO Type
- Criticality
- Priority
- Percent Complete
- Owner

Selecting a row should update the detail panel below.

Add top action buttons:

- Add WR
- Refresh from Maximo
- Export Screening Report
- Move to Planning

These can be non-functional buttons for now unless easy to wire up locally.

## Work Request Details panel

When a work request is selected, show a details card below the table with:

- Ticket Number
- Site ID
- Location
- Status
- Date
- Ticket ID
- Asset Number
- Owner
- Description

Below the details, add tabs:

- Classification
- Related Records
- Risk & Mitigation
- Screening Actions
- Notes
- History

## Classification tab

Include three cards:

### AI Recommendation

Show:

- WO Type dropdown
- Criticality dropdown
- Priority dropdown
- Confidence progress bar
- Rationale text

### Top References

Show mock related work orders/condition reports with similarity percentages.

### Key Factors

Show bullets such as:

- Equipment match
- Description similarity
- Location match
- Recent similar failures
- Safety system dependency

## Right Operational Insights panel

Add a sticky right-side panel titled `Operational Insights`.

Include cards:

1. Classification Summary
2. Related Records
3. HRE Review
4. CSPV Review

Each card should include:

- Status badge
- Short findings
- Small progress/confidence indicators where useful
- `View details` affordance

Use only mock data.

## Visual style

- Desktop-first layout
- Clean white/light background
- Soft cards
- Rounded corners
- Compact table rows
- Purple/navy accent color
- Status badges
- Subtle shadows/borders
- Professional utility-app feel

## Important constraints

- Do not commit real plant data.
- Do not hard-code sensitive names, locations, work orders, or asset data.
- Keep mock data obviously fake/demo-safe.
- Do not break the existing main branch.
- Keep the implementation simple and maintainable.
- Reuse the existing project stack.
- Avoid adding big new dependencies unless necessary.
- Add comments where mock data should later be replaced with Maximo/API data.

## Acceptance criteria

- App runs locally with no build/runtime errors.
- Branch remains separate from `main`.
- User can select different mock work requests and see details update.
- Screening workflow visually follows the provided layout direction without being a direct copy.
- Right-side Operational Insights panel is visible and useful.
