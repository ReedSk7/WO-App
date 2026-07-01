import { describe, expect, it } from 'vitest';
import { createPlannerPackage } from './plannerPackage';
import {
  createRefinementReport,
  formatRefinementReportJson,
  formatRefinementReportMarkdown,
  plannerFinalText,
  summarizeRefinementTab,
} from './refinementReport';

const fixedNow = new Date('2026-07-01T12:00:00.000Z');

describe('refinement report', () => {
  it('summarizes kept, removed, added, and edited planner final text', () => {
    const plannerPackage = createPlannerPackage('DEMO-CR-1001', fixedNow);
    const tab = plannerPackage.tabs[0];
    const generatedLines = tab.lines;
    const tabEdits = {
      [tab.id]: [
        generatedLines[0],
        'Edited response mode line',
        generatedLines[2],
        generatedLines[3],
        generatedLines[4],
        generatedLines[5],
        generatedLines[6],
        generatedLines[7],
        generatedLines[8],
        generatedLines[9],
        '',
        'Planner-added final work order note.',
      ].join('\n'),
    };

    const summary = summarizeRefinementTab(tab, tabEdits);

    expect(summary.kept).toBe(9);
    expect(summary.edited).toBe(1);
    expect(summary.removed).toBe(1);
    expect(summary.added).toBe(1);
    expect(summary.changes.map((change) => change.type)).toEqual(['edited', 'removed', 'added']);
    expect(plannerFinalText(tab, tabEdits)).toContain('Planner-added final work order note.');
  });

  it('exports JSON and Markdown with agent baseline and planner final text', () => {
    const plannerPackage = createPlannerPackage('DEMO-WO-3001', fixedNow);
    const tab = plannerPackage.tabs[0];
    const tabEdits = {
      [tab.id]: `${tab.lines.join('\n')}\nPlanner final line used in copy/paste.`,
    };

    const report = createRefinementReport(plannerPackage, tabEdits, 'session-1', '2026-07-01T13:00:00.000Z');
    const json = formatRefinementReportJson(report);
    const markdown = formatRefinementReportMarkdown(report);

    expect(report.changedTabs).toBe(1);
    expect(report.totals.added).toBe(1);
    expect(json).toContain('"agentGeneratedBaseline"');
    expect(json).toContain('"plannerFinalText"');
    expect(markdown).toContain('### Agent Generated Baseline');
    expect(markdown).toContain('### Planner Final Text For Copy/Paste');
    expect(markdown).toContain('Planner final line used in copy/paste.');
  });
});
