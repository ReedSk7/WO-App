import type { TemplateSettings } from '../types';
export const defaultTemplates: TemplateSettings = {
  draftDisclaimer: 'Draft for planner review only.',
  safetyNote: 'Use site-required human performance and safety controls. Verify hazards with approved processes.',
  missingInfoWarning: 'Missing or weak information must be resolved before execution planning.',
  oraNote: 'ORA / operational risk awareness review required before final package release.',
  clearanceNote: 'If clearance is required, clearance boundary must match approved work scope and site procedure requirements.',
  pmtPlaceholder: '[PMT REQUIREMENT PLACEHOLDER: VERIFIED PMT DATA REQUIRED]',
  acceptanceCriteriaPlaceholder: '[ACCEPTANCE CRITERIA PLACEHOLDER: VERIFIED TECHNICAL CRITERIA REQUIRED]',
  reviewerNote: 'Planner/reviewer comments required before approval routing.'
};
