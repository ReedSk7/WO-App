import type { WorkOrderDraft } from '../types';

function safeFilePart(value: string) {
  return value.trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'draft';
}

export function draftFileStem(draft: WorkOrderDraft) {
  const cr = draft.crIntake.crNumber || draft.title || 'work-order-draft';
  return `woac-${safeFilePart(cr)}`;
}

export function formatDraftMarkdown(draft: WorkOrderDraft) {
  const metadata = [
    `# ${draft.title}`,
    '',
    'Draft only. Not approved for execution. Requires qualified planner review and applicable organizational approvals.',
    '',
    `- CR: ${draft.crIntake.crNumber || '[missing]'}`,
    `- Asset: ${draft.crIntake.assetNumber || '[missing]'}`,
    `- Location: ${draft.crIntake.location || '[missing]'}`,
    `- Status: ${draft.status}`,
    `- Checklist: ${draft.checklistPercent}%`,
    '',
  ].join('\n');

  return `${metadata}${draft.sections.map((section) => `## ${section.title}\n\n${section.content}`).join('\n\n')}\n`;
}

export function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
