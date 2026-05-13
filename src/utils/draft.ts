import type { CRIntake, DraftSection, MissingInfoItem, TemplateSettings, WorkOrderDraft } from '../types';
import { createDefaultChecklist } from './checklist';
import { deriveDraftStatus } from './status';

const weak = (value: string, minimumLength: number) => value.trim().length < minimumLength;

export function emptyCRIntake(): CRIntake {
  return {
    crNumber: '',
    crTitle: '',
    assetNumber: '',
    componentDescription: '',
    location: '',
    problemStatement: '',
    discoveredCondition: '',
    requestedAction: '',
    discipline: 'Generic',
    workType: 'Generic Work',
    priority: 'Normal',
    safetySignificance: false,
    requiresClearance: false,
    requiresEngineeringInput: false,
    requiresParts: false,
    requiresScaffoldOrLift: false,
    notes: '',
  };
}

export function detectMissingInfo(input: CRIntake): MissingInfoItem[] {
  const issues: MissingInfoItem[] = [];

  if (!input.crNumber.trim()) {
    issues.push({
      id: 'missing-cr-number',
      severity: 'blocking',
      message: 'Missing CR number.',
      field: 'crNumber',
      section: 'Work Order Summary',
    });
  }
  if (!input.assetNumber.trim()) {
    issues.push({
      id: 'missing-asset',
      severity: 'blocking',
      message: 'Missing asset number.',
      field: 'assetNumber',
      section: 'Work Order Summary',
    });
  }
  if (!input.componentDescription.trim()) {
    issues.push({
      id: 'missing-component',
      severity: 'blocking',
      message: 'Missing component description.',
      field: 'componentDescription',
      section: 'Scope of Work',
    });
  }
  if (!input.location.trim()) {
    issues.push({
      id: 'missing-location',
      severity: 'blocking',
      message: 'Missing location.',
      field: 'location',
      section: 'Planning Basis',
    });
  }
  if (!input.problemStatement.trim() || weak(input.problemStatement, 12)) {
    issues.push({
      id: 'unclear-problem',
      severity: 'blocking',
      message: 'Problem statement is missing or too unclear.',
      field: 'problemStatement',
      section: 'Problem Statement',
    });
  }
  if (!input.requestedAction.trim() || weak(input.requestedAction, 8)) {
    issues.push({
      id: 'unclear-action',
      severity: 'blocking',
      message: 'Requested action is missing or too unclear.',
      field: 'requestedAction',
      section: 'Scope of Work',
    });
  }

  issues.push({
    id: 'missing-acceptance-criteria',
    severity: 'caution',
    message: 'Acceptance criteria placeholder still requires verified technical data.',
    section: 'Acceptance Criteria Placeholder',
  });
  issues.push({
    id: 'missing-pmt',
    severity: 'caution',
    message: 'PMT placeholder still requires verified post-maintenance testing requirements.',
    section: 'Post Maintenance Testing Placeholder',
  });

  if (input.requiresParts) {
    issues.push({
      id: 'parts-required',
      severity: 'caution',
      message: 'Parts are required; material details are not defined yet.',
      field: 'requiresParts',
      section: 'Parts / Materials',
    });
  }
  if (input.requiresClearance) {
    issues.push({
      id: 'clearance-boundary',
      severity: 'caution',
      message: 'Clearance boundary is not yet defined.',
      field: 'requiresClearance',
      section: 'Clearance / Tagging Considerations',
    });
  }
  if (input.requiresEngineeringInput) {
    issues.push({
      id: 'engineering-input',
      severity: 'caution',
      message: 'Engineering input is required before finalizing scope.',
      field: 'requiresEngineeringInput',
      section: 'Planning Basis',
    });
  }

  return issues;
}

export const missingInfo = (input: CRIntake) => detectMissingInfo(input).map((item) => item.message.replace(/\.$/, ''));

function line(value: string, fallback: string) {
  return value.trim() || fallback;
}

function shouldIncludeOra(input: CRIntake) {
  return input.workType !== 'Generic Work' || input.discipline !== 'Generic';
}

function section(id: string, title: string, content: string): DraftSection {
  return { id, title, content };
}

export function makeDraft(input: CRIntake, templates: TemplateSettings): WorkOrderDraft {
  const missingInfoItems = detectMissingInfo(input);
  const checklist = createDefaultChecklist();
  const checklistPercent = 0;
  const now = new Date().toISOString();
  const title = line(input.crTitle, `Draft Work Order for ${line(input.assetNumber, '[asset required]')}`);

  const sections: DraftSection[] = [
    section(
      'summary',
      'Work Order Summary',
      [
        templates.draftDisclaimer,
        '',
        `CR Number: ${line(input.crNumber, '[enter CR number]')}`,
        `CR Title: ${title}`,
        `Equipment / Asset: ${line(input.assetNumber, '[enter asset number]')}`,
        `Component: ${line(input.componentDescription, '[enter component description]')}`,
        `Unit / Area / Location: ${line(input.location, '[enter location]')}`,
        `Discipline: ${input.discipline}`,
        `Work Type: ${input.workType}`,
        `Priority: ${input.priority}`,
        '',
        'Draft for planner review only.',
      ].join('\n'),
    ),
    section('problem', 'Problem Statement', line(input.problemStatement, '[Add a clear problem statement from the demo CR.]')),
    section(
      'scope',
      'Scope of Work',
      [
        line(input.requestedAction, '[Define the requested planner action.]'),
        '',
        `Discovered condition: ${line(input.discoveredCondition, '[describe discovered condition]')}`,
        '',
        'Do not add unverified technical values. Insert approved procedures, verified data, and work boundaries during planner review.',
      ].join('\n'),
    ),
    section(
      'basis',
      'Planning Basis',
      [
        'Use approved procedures and verified technical data only.',
        shouldIncludeOra(input) ? templates.oraNote : 'Administrative/generic work still requires appropriate planner screening.',
        input.requiresEngineeringInput ? 'Engineering input is required before finalizing scope.' : 'Engineering input not requested in intake. Verify whether it is required.',
      ].join('\n'),
    ),
    section('prerequisites', 'Prerequisites', '[Prerequisites placeholder: approvals, permits, pre-job brief, access, and verified source documents.]'),
    section(
      'safety',
      'Safety and Human Performance Notes',
      [
        templates.safetyNote,
        input.safetySignificance ? 'Safety significance toggle is selected. Qualified review is required before planning release.' : 'Safety significance toggle is not selected. Verify during planner review.',
        input.requiresScaffoldOrLift ? 'Scaffold/lift support is requested. Access method must be reviewed and approved before execution.' : 'No scaffold/lift support requested in intake. Verify access needs.',
      ].join('\n'),
    ),
    section(
      'clearance',
      'Clearance / Tagging Considerations',
      input.requiresClearance
        ? `${templates.clearanceNote}\nClearance boundary is not defined in this demo draft and must be established from approved work scope and site procedure requirements.`
        : 'No clearance requested in intake. Verify applicability during planner review.',
    ),
    section('tools', 'Tools and Test Equipment', '[Tool list placeholder: planner to define verified tools, calibrated test equipment, and any access equipment.]'),
    section(
      'parts',
      'Parts / Materials',
      input.requiresParts
        ? '[Parts required: planner to define approved materials. Do not infer part numbers, substitutions, or material specifications.]'
        : 'No parts requested in intake. Planner to verify whether parts/materials are required.',
    ),
    section('labor', 'Labor / Craft Estimate', `[Labor estimate placeholder: planner to validate by craft/task. Primary discipline: ${input.discipline}.`),
    section(
      'instructions',
      'Step-by-Step Work Instructions',
      [
        '1. Validate CR scope, asset, location, and work boundaries.',
        '2. Confirm prerequisites, clearances, access needs, and required reviews.',
        '3. Insert approved procedure references and verified technical data.',
        '4. Execute only after qualified planner review and approved work direction.',
      ].join('\n'),
    ),
    section('acceptance', 'Acceptance Criteria Placeholder', templates.acceptanceCriteriaPlaceholder),
    section('pmt', 'Post Maintenance Testing Placeholder', templates.pmtPlaceholder),
    section('closeout', 'Documentation / Closeout Notes', 'Document as-left condition, deficiencies, parts/materials used, testing performed, and closeout references per approved process.'),
    section(
      'assumptions',
      'Assumptions and Missing Information',
      [
        templates.missingInfoWarning,
        '',
        missingInfoItems.length > 0
          ? missingInfoItems.map((item) => `- [${item.severity.toUpperCase()}] ${item.message}`).join('\n')
          : '- No blocking missing information detected. Planner review still required.',
      ].join('\n'),
    ),
    section('reviewer', 'Reviewer Comments', templates.reviewerNote),
  ];

  return {
    id: crypto.randomUUID(),
    title,
    crIntake: input,
    sections,
    missingInfo: missingInfoItems,
    status: deriveDraftStatus(missingInfoItems, checklistPercent),
    checklist,
    checklistPercent,
    createdAt: now,
    updatedAt: now,
  };
}
