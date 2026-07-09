import { describe, expect, it } from 'vitest';
import { defaultTemplates } from '../templates/defaults';
import { emptyCRIntake, detectMissingInfo, makeDraft } from './draft';

describe('draft generation', () => {
  it('detectMissingInfo flags critical missing fields', () => {
    const issues = detectMissingInfo(emptyCRIntake());
    expect(issues.some((issue) => issue.id === 'missing-cr-number' && issue.severity === 'blocking')).toBe(true);
    expect(issues.some((issue) => issue.id === 'missing-asset' && issue.severity === 'blocking')).toBe(true);
    expect(issues.some((issue) => issue.id === 'missing-acceptance-criteria' && issue.severity === 'caution')).toBe(true);
  });

  it('makeDraft returns required sections', () => {
    const draft = makeDraft(
      {
        ...emptyCRIntake(),
        crNumber: 'DEMO-CR-1',
        crTitle: 'Demo title',
        assetNumber: 'FAKE-ASSET-1',
        componentDescription: 'Demo component',
        location: 'Demo area',
        problemStatement: 'Demo problem statement is clear.',
        requestedAction: 'Draft a conservative work package.',
      },
      defaultTemplates,
    );
    expect(draft.sections.map((section) => section.title)).toEqual(
      expect.arrayContaining([
        'Work Order Summary',
        'Scope of Work',
        'Acceptance Criteria Placeholder',
        'Post Maintenance Testing Placeholder',
        'Assumptions and Missing Information',
      ]),
    );
    expect(draft.sections.length).toBeGreaterThanOrEqual(16);
  });
});
