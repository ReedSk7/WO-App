import type { TemplateSettings } from '../types';
export const defaultTemplates: TemplateSettings = {
  draftDisclaimer: 'Draft only. Not approved for execution. Requires qualified planner review and applicable organizational approvals.',
  safetyNote: 'Use required human performance and safety controls. Verify hazards with approved processes. Fire protection screening is required for every generated demo WO package.',
  missingInfoWarning: 'Missing or weak information must be resolved before execution planning.',
  oraNote: 'Task-level ORA required for non-administrative work before final package release.',
  clearanceNote:
    'This is not a clearance boundary. Potential isolation points are listed for review only. Qualified operations/electrical review required.\nClearance scope must align with final approved work instructions. This app does not create or approve clearance boundaries.',
  pmtPlaceholder: 'Use approved procedure, engineering direction, or qualified test guidance. This demo does not define acceptance criteria.',
  acceptanceCriteriaPlaceholder:
    'Acceptance criteria must come from approved procedure, engineering direction, vendor manual, or qualified test guidance.',
  reviewerNote: 'Planner/reviewer comments required before approval routing.'
};
