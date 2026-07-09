import type { PlannerPackage, PlannerRefinementReport, PlannerTabContent, PlannerTabEdits, RefinementLineChange } from '../types';

function splitLines(value: string) {
  const normalized = value.replace(/\r\n/g, '\n').replace(/\n$/, '');
  return normalized ? normalized.split('\n') : [''];
}

function safeFilePart(value: string) {
  return value.trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'planner-refinement';
}

export function agentGeneratedText(tab: PlannerTabContent) {
  return tab.lines.join('\n');
}

export function plannerFinalText(tab: PlannerTabContent, tabEdits: PlannerTabEdits) {
  return tabEdits[tab.id] ?? agentGeneratedText(tab);
}

export function summarizeRefinementTab(tab: PlannerTabContent, tabEdits: PlannerTabEdits) {
  const agentGeneratedBaseline = agentGeneratedText(tab);
  const plannerFinal = plannerFinalText(tab, tabEdits);
  const generatedLines = splitLines(agentGeneratedBaseline);
  const finalLines = splitLines(plannerFinal);
  const maxLines = Math.max(generatedLines.length, finalLines.length);
  const changes: RefinementLineChange[] = [];
  let kept = 0;
  let added = 0;
  let removed = 0;
  let edited = 0;

  for (let index = 0; index < maxLines; index += 1) {
    const agentGenerated = generatedLines[index] ?? '';
    const plannerFinalLine = finalLines[index] ?? '';
    const lineNumber = index + 1;

    if (agentGenerated === plannerFinalLine) {
      kept += 1;
      continue;
    }

    if (!agentGenerated && plannerFinalLine) {
      added += 1;
      changes.push({ type: 'added', lineNumber, plannerFinal: plannerFinalLine });
    } else if (agentGenerated && !plannerFinalLine) {
      removed += 1;
      changes.push({ type: 'removed', lineNumber, agentGenerated });
    } else {
      edited += 1;
      changes.push({ type: 'edited', lineNumber, agentGenerated, plannerFinal: plannerFinalLine });
    }
  }

  return {
    tabId: tab.id,
    tabLabel: tab.label,
    agentGeneratedBaseline,
    plannerFinalText: plannerFinal,
    kept,
    added,
    removed,
    edited,
    changes,
  };
}

export function createRefinementReport(
  plannerPackage: PlannerPackage,
  tabEdits: PlannerTabEdits,
  sessionId: string,
  exportedAt = new Date().toISOString(),
): PlannerRefinementReport {
  const tabs = plannerPackage.tabs.map((tab) => summarizeRefinementTab(tab, tabEdits));
  const totals = tabs.reduce(
    (current, tab) => ({
      kept: current.kept + tab.kept,
      added: current.added + tab.added,
      removed: current.removed + tab.removed,
      edited: current.edited + tab.edited,
    }),
    { kept: 0, added: 0, removed: 0, edited: 0 },
  );

  return {
    sessionId,
    input: plannerPackage.input,
    siteId: plannerPackage.siteId,
    siteLabel: plannerPackage.siteLabel,
    mode: plannerPackage.mode,
    modeLabel: plannerPackage.modeLabel,
    recordNumber: plannerPackage.recordNumber,
    title: plannerPackage.title,
    generatedAt: plannerPackage.generatedAt,
    exportedAt,
    changedTabs: tabs.filter((tab) => tab.added + tab.removed + tab.edited > 0).length,
    totals,
    tabs,
  };
}

export function formatRefinementReportJson(report: PlannerRefinementReport) {
  return JSON.stringify(report, null, 2);
}

export function formatRefinementReportMarkdown(report: PlannerRefinementReport) {
  const header = [
    `# Planner Refinement Report - ${report.recordNumber}`,
    '',
    `- Title: ${report.title}`,
    `- Site: ${report.siteLabel}`,
    `- Mode: ${report.modeLabel}`,
    `- Input: ${report.input}`,
    `- Generated: ${report.generatedAt}`,
    `- Exported: ${report.exportedAt}`,
    `- Changed tabs: ${report.changedTabs}`,
    `- Kept lines: ${report.totals.kept}`,
    `- Removed generated lines: ${report.totals.removed}`,
    `- Planner-added lines: ${report.totals.added}`,
    `- Edited lines: ${report.totals.edited}`,
    '',
  ].join('\n');

  const body = report.tabs
    .map((tab) =>
      [
        `## ${tab.tabLabel}`,
        '',
        `Kept: ${tab.kept} | Removed: ${tab.removed} | Added: ${tab.added} | Edited: ${tab.edited}`,
        '',
        '### Agent Generated Baseline',
        '',
        '```text',
        tab.agentGeneratedBaseline,
        '```',
        '',
        '### Planner Final Text For Copy/Paste',
        '',
        '```text',
        tab.plannerFinalText,
        '```',
        '',
        '### Refinement Changes',
        '',
        tab.changes.length > 0
          ? tab.changes
              .map((change) => {
                if (change.type === 'added') return `- Line ${change.lineNumber} added: ${change.plannerFinal}`;
                if (change.type === 'removed') return `- Line ${change.lineNumber} removed: ${change.agentGenerated}`;
                return `- Line ${change.lineNumber} edited from "${change.agentGenerated}" to "${change.plannerFinal}"`;
              })
              .join('\n')
          : '- No planner changes on this tab.',
      ].join('\n'),
    )
    .join('\n\n');

  return `${header}${body}\n`;
}

export function refinementReportFileStem(report: PlannerRefinementReport) {
  return `planner-refinement-${safeFilePart(report.recordNumber)}-${safeFilePart(report.sessionId)}`;
}
