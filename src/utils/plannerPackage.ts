import { MAXIMO_TABS, plannerSamples, type PlannerSample } from '../data/plannerSamples';
import type { MaximoTabId, PlannerPackage, PlannerRecordType, PlannerTabContent } from '../types';

export const PLANNER_DISCLAIMER =
  'Draft only. Not approved for execution. Requires qualified planner review and applicable organizational approvals.';

export function normalizePlannerInput(value: string) {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function inferRecordType(normalizedInput: string): PlannerRecordType {
  if (normalizedInput.includes('MPL')) return 'MPL';
  if (normalizedInput.includes('WO')) return 'WO';
  if (normalizedInput.includes('CR')) return 'CR';
  return 'Unknown';
}

function findSample(normalizedInput: string) {
  return plannerSamples.find((sample) => sample.aliases.some((alias) => normalizedInput.includes(alias)));
}

function lineGroup(title: string, lines: string[]) {
  return [`${title}:`, ...lines.map((line) => `- ${line}`)];
}

function genericSample(normalizedInput: string): PlannerSample {
  const recordType = inferRecordType(normalizedInput);
  return {
    aliases: [],
    recordType,
    recordNumber: normalizedInput || 'UNSPECIFIED DEMO INPUT',
    title: 'Generic demo planner review package',
    asset: 'Needs planner confirmation',
    location: 'Needs planner confirmation',
    priority: 'Needs review',
    workType: 'Generic planning review',
    discipline: 'Needs review',
    sourceSummary:
      'No canned fake sample matched the entered value. A conservative generic planner package was created from the typed input.',
    knownFacts: [
      `Planner entered: ${normalizedInput || '[blank input]'}.`,
      'No matching fake sample record was found.',
      'The app cannot confirm asset, scope, priority, parts, reviews, or testing basis.',
    ],
    informationGaps: [
      'Confirm the source record type and record number.',
      'Confirm affected asset, location, and equipment status.',
      'Confirm approved work direction, reviews, clearance needs, and scheduling holds.',
      'Confirm acceptance criteria and PMT source before any execution planning.',
    ],
    relatedRecords: ['No related fake records matched this input.'],
  };
}

function tabLines(tabId: MaximoTabId, sample: PlannerSample, confidence: number, generatedAt: string): string[] {
  switch (tabId) {
    case 'workorder':
      return [
        PLANNER_DISCLAIMER,
        `Record: ${sample.recordNumber}`,
        `Title: ${sample.title}`,
        `Asset: ${sample.asset}`,
        `Location: ${sample.location}`,
        `Work type: ${sample.workType}`,
        `Discipline: ${sample.discipline}`,
        `Priority: ${sample.priority}`,
        `Status: Draft planner review package`,
      ];
    case 'plans':
      return [
        'Job plan: select or create only after qualified review.',
        'Task numbering awareness: 0-9 clearance and release prerequisites, 10-14 scope and precautions, 15+ high-level work, PMT, and support tasks.',
        'Labor: planner to confirm craft and support needs.',
        'Materials: identify by category only until approved parts data is available.',
        'Tools and test equipment: placeholder pending approved source documents.',
        'Use approved procedure, engineering direction, or qualified test guidance. This demo does not define acceptance criteria.',
      ];
    case 'reviews':
      return [
        'Planner review: required.',
        'Operations review: required before field planning assumptions are accepted.',
        'Safety review: required for work planning screening.',
        'Fire protection screening: required for every generated demo WO package.',
        'Task-level ORA: required for non-administrative work.',
        'QC, Environmental, Cyber, and Engineering: screen by applicability.',
      ];
    case 'engineering':
      return [
        'Engineering input is a review path, not an app-generated determination.',
        'No operability, compliance, setpoint, acceptance, or design-basis conclusions are created.',
        ...lineGroup('Engineering questions', [
          'Is the affected asset and scope confirmed?',
          'Is technical disposition needed before work scope is finalized?',
          'What approved document supplies acceptance criteria?',
        ]),
      ];
    case 'scheduling':
      return [
        'Work window: needs scheduling review.',
        'Parts hold: needs review.',
        'Procedure hold: needs review.',
        'Engineering hold: needs review if technical basis is incomplete.',
        'Clearance hold: review required for possible field work.',
      ];
    case 'logic':
      return [
        `Planner confidence: ${confidence}/100.`,
        sample.sourceSummary,
        ...lineGroup('Known conditions', sample.knownFacts),
        ...lineGroup('Information gaps', sample.informationGaps),
      ];
    case 'related-records':
      return [
        `Source record: ${sample.recordNumber}`,
        ...lineGroup('Related fake records for planner research', sample.relatedRecords),
        'Related records are research prompts only and do not expand the authorized scope.',
      ];
    case 'actuals':
      return [
        'Actual labor: none recorded in this demo draft.',
        'Actual materials: none recorded in this demo draft.',
        'As found: required for CM and troubleshooting, otherwise screen by planner.',
        'As left: required when work changes equipment condition or configuration.',
      ];
    case 'safety-plan':
      return [
        'This is not a clearance boundary. Potential isolation points are listed for review only. Qualified operations/electrical review required.',
        'Clearance scope must align with final approved work instructions. This app does not create or approve clearance boundaries.',
        'Screen industrial safety, FME, environmental, fire protection, radiological placeholder, and access needs.',
      ];
    case 'impact-plans':
      return [
        'Operational impact must be verified by qualified reviewers.',
        'Equipment availability impact is not determined by this app.',
        'Contingency plans, compensatory measures, and work windows require approved organizational direction.',
      ];
    case 'log':
      return [
        `Generated: ${generatedAt}`,
        `Input captured: ${sample.recordNumber}`,
        'Generation method: deterministic fake-data lookup with conservative generic fallback.',
        PLANNER_DISCLAIMER,
      ];
    case 'specifications':
      return [
        'Acceptance criteria must come from approved procedure, engineering direction, vendor manual, or qualified test guidance.',
        'No torque values, test values, setpoints, calibration tolerances, or procedure steps are generated.',
        'Specifications are placeholders until the planner attaches approved source references.',
      ];
    default:
      return [PLANNER_DISCLAIMER];
  }
}

export function createPlannerPackage(rawInput: string, now: Date = new Date()): PlannerPackage {
  const normalizedInput = normalizePlannerInput(rawInput);
  const sample = findSample(normalizedInput) ?? genericSample(normalizedInput);
  const isSample = sample.aliases.length > 0;
  const generatedAt = now.toISOString();
  const confidence = isSample ? 72 : 34;
  const tabs: PlannerTabContent[] = MAXIMO_TABS.map((tab) => ({
    ...tab,
    lines: tabLines(tab.id, sample, confidence, generatedAt),
  }));

  return {
    input: rawInput,
    normalizedInput,
    matchType: isSample ? 'sample' : 'generic',
    recordType: sample.recordType,
    recordNumber: sample.recordNumber,
    title: sample.title,
    asset: sample.asset,
    location: sample.location,
    priority: sample.priority,
    workType: sample.workType,
    discipline: sample.discipline,
    status: isSample ? 'Sample matched' : 'Generic fallback',
    confidence,
    generatedAt,
    knownFacts: sample.knownFacts,
    informationGaps: sample.informationGaps,
    tabs,
  };
}
