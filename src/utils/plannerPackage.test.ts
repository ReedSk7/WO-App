import { describe, expect, it } from 'vitest';
import { MAXIMO_TABS } from '../data/plannerSamples';
import { createPlannerPackage, PLANNER_DISCLAIMER } from './plannerPackage';

const fixedNow = new Date('2026-07-01T12:00:00.000Z');

describe('planner package generation', () => {
  it('matches canned fake records and preserves the Maximo tab order', () => {
    const plannerPackage = createPlannerPackage('please analyze DEMO-MPL-2001', fixedNow);

    expect(plannerPackage.matchType).toBe('sample');
    expect(plannerPackage.recordType).toBe('MPL');
    expect(plannerPackage.recordNumber).toBe('DEMO-MPL-2001');
    expect(plannerPackage.tabs.map((tab) => tab.label)).toEqual(MAXIMO_TABS.map((tab) => tab.label));
    expect(plannerPackage.tabs[0].lines).toContain(PLANNER_DISCLAIMER);
  });

  it('creates a conservative generic fallback when no sample matches', () => {
    const plannerPackage = createPlannerPackage('demo condition needs planning review', fixedNow);

    expect(plannerPackage.matchType).toBe('generic');
    expect(plannerPackage.recordType).toBe('Unknown');
    expect(plannerPackage.status).toBe('Generic fallback');
    expect(plannerPackage.asset).toBe('Needs planner confirmation');
    expect(plannerPackage.confidence).toBe(34);
  });

  it('includes required review warnings without real plant details', () => {
    const plannerPackage = createPlannerPackage('DEMO-WO-3001', fixedNow);
    const outputText = plannerPackage.tabs.flatMap((tab) => tab.lines).join('\n');

    expect(outputText).toContain(PLANNER_DISCLAIMER);
    expect(outputText).toContain(
      'This is not a clearance boundary. Potential isolation points are listed for review only. Qualified operations/electrical review required.',
    );
    expect(outputText).toContain(
      'Clearance scope must align with final approved work instructions. This app does not create or approve clearance boundaries.',
    );
    expect(outputText).toContain(
      'Use approved procedure, engineering direction, or qualified test guidance. This demo does not define acceptance criteria.',
    );
    expect(outputText).toContain(
      'Acceptance criteria must come from approved procedure, engineering direction, vendor manual, or qualified test guidance.',
    );
    expect(outputText).toContain('Fire protection screening: required for every generated demo WO package.');
    expect(outputText).toContain('Task-level ORA: required for non-administrative work.');
    expect(outputText).not.toMatch(/\bHatch\b/i);
    expect(outputText).not.toMatch(/\breal plant\b/i);
    expect(outputText).not.toMatch(/\btorque\s+\d+/i);
    expect(outputText).not.toMatch(/\bsetpoint\s+\d+/i);
  });
});
