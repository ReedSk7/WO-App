import type { PlannerAssistantGuidance, PlannerModeDefinition, PlannerResponseMode } from '../types';

export const DEFAULT_RESPONSE_MODE: PlannerResponseMode = 'create-work-order-draft';

export const PLANNER_RESPONSE_MODES: PlannerModeDefinition[] = [
  {
    id: 'create-work-order-draft',
    label: 'Create Work Order Draft',
    summary: 'Build a conservative draft package from a fake source record or condition note.',
    outputSections: [
      'Work order title and problem statement',
      'Source summary and equipment context',
      'Scope, unknowns, walkdown need, and support reviews',
      'High-level task list and planner next actions',
    ],
    focus: [
      'Identify work trigger, work type, equipment, and planning basis.',
      'Use constrained draft language when the input is weak.',
      'Keep field-facing content clear without creating executable instructions.',
    ],
  },
  {
    id: 'review-work-order',
    label: 'Review Work Order',
    summary: 'Check a draft package for completeness, quality, and planner review gaps.',
    outputSections: [
      'Overall assessment and strengths',
      'Fatal risks, major gaps, and minor issues',
      'Task structure observations',
      'Recommended edits and planner next actions',
    ],
    focus: [
      'Separate quality concerns from missing source data.',
      'Flag review/support gaps without approving the package.',
      'Use conservative language for weak, conflicting, or incomplete inputs.',
    ],
  },
  {
    id: 'research-planning-basis',
    label: 'Research / Planning Basis',
    summary: 'Summarize fake maintenance history and planning-basis questions for planner research.',
    outputSections: [
      'What is known',
      'What it may indicate',
      'What cannot be concluded',
      'Planning implications, documents to check, and walkdown questions',
    ],
    focus: [
      'Treat history as context, not authority.',
      'Suggest patterns and research questions only.',
      'Avoid PMT, acceptance, operability, or scope conclusions without approved sources.',
    ],
  },
  {
    id: 'general-guidance',
    label: 'General Guidance',
    summary: 'Answer planning-process questions with public-safe, source-grounded structure.',
    outputSections: [
      'Direct answer',
      'Planning considerations',
      'Limits of the answer',
      'Minimum next action',
    ],
    focus: [
      'Distinguish system workflow behavior from requirements.',
      'Prefer short, practical answers over broad essays.',
      'Point back to approved sources when the question touches requirements.',
    ],
  },
];

export const ASSISTANT_GUIDANCE: PlannerAssistantGuidance = {
  capabilities: [
    'Research fake equipment and work-history context for planning questions.',
    'Summarize planning-basis issues, repeat-condition indicators, and missing information.',
    'Draft conservative work-order planning content for qualified planner review.',
    'Review draft packages for completeness, source gaps, and field usability.',
  ],
  operatingPriorities: [
    'Nuclear safety',
    'Configuration control',
    'Conservative planning',
    'Procedural adherence',
    'Work package quality',
    'Planner transparency',
  ],
  sourcePrecedence: [
    'Class 1: controlling procedures, forms, and official requirements.',
    'Class 2: approved planner aids, checklists, and cover sheets.',
    'Class 3: enterprise workflow and planning job aids.',
    'Class 4: approved examples and templates for structure only.',
    'Class 5: condition reports, event records, and work history for context only.',
  ],
  outputDiscipline: [
    'Separate facts, assumptions, missing information, risks, and planner next actions.',
    'State conflicts clearly and defer to the governing source class.',
    'Use pending input, planner to verify, or not provided when data is missing.',
    'Recommend the smallest next action needed to improve the package.',
  ],
  limitations: [
    'No live maintenance, work-management, or plant system access is represented in this demo.',
    'No work authorization, operability determination, or compliance conclusion is created.',
    'No procedures, values, tolerances, limits, acceptance criteria, or clearance boundaries are invented.',
    'Examples and history are not converted into requirements.',
  ],
};

export function getPlannerModeDefinition(mode: PlannerResponseMode) {
  return PLANNER_RESPONSE_MODES.find((option) => option.id === mode) ?? PLANNER_RESPONSE_MODES[0];
}
