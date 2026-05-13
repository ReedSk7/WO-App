import type { ChecklistGroup, ChecklistItem } from '../types';

export const CHECKLIST_GROUPS: Array<{ id: string; title: string; labels: string[]; critical?: string[] }> = [
  {
    id: 'scope',
    title: 'Scope clarity',
    labels: ['Problem statement is clear', 'Requested action is bounded', 'No unverified technical values added'],
    critical: ['Problem statement is clear', 'Requested action is bounded'],
  },
  {
    id: 'asset',
    title: 'Asset/location accuracy',
    labels: ['CR number verified as demo data', 'Asset identifier is fake/demo only', 'Location is specific enough for planner review'],
  },
  {
    id: 'instructions',
    title: 'Work instructions',
    labels: ['Work instructions are conservative', 'Hold points and prerequisites are placeholders only', 'Approved procedure references are not invented'],
  },
  {
    id: 'materials',
    title: 'Parts/materials',
    labels: ['Material need is identified', 'Part numbers remain blank until verified', 'Substitution notes require planner review'],
  },
  {
    id: 'tools',
    title: 'Tools/test equipment',
    labels: ['Tool needs are described generically', 'Test equipment values are not invented', 'Calibration requirements are left for verified data'],
  },
  {
    id: 'clearance',
    title: 'Clearances/LOTO',
    labels: ['Clearance need is identified', 'Clearance boundary is not invented', 'Boundary must match approved work scope'],
    critical: ['Clearance boundary is not invented'],
  },
  {
    id: 'safety',
    title: 'Safety/HU tools',
    labels: ['Safety note is present', 'Human performance review is prompted', 'Safety significance requires qualified review'],
  },
  {
    id: 'ora',
    title: 'ORA/risk review',
    labels: ['ORA placeholder is included', 'Operations review is not bypassed', 'Risk language stays conservative'],
    critical: ['ORA placeholder is included'],
  },
  {
    id: 'pmt',
    title: 'PMT/acceptance criteria',
    labels: ['Acceptance criteria placeholder remains visible', 'PMT placeholder remains visible', 'No acceptance values are invented'],
    critical: ['No acceptance values are invented'],
  },
  {
    id: 'closeout',
    title: 'Documentation/closeout',
    labels: ['Closeout notes are present', 'As-left condition documentation is prompted', 'Reviewer comments remain required'],
  },
];

export function createDefaultChecklist(): ChecklistItem[] {
  return CHECKLIST_GROUPS.flatMap((group) =>
    group.labels.map((label, index) => ({
      id: `${group.id}-${index + 1}`,
      group: group.title,
      label,
      checked: false,
      critical: group.critical?.includes(label) ?? false,
    })),
  );
}

export function checklistPercent(items: ChecklistItem[]) {
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.checked).length / items.length) * 100);
}

export function criticalOpenCount(items: ChecklistItem[]) {
  return items.filter((item) => item.critical && !item.checked).length;
}

export function groupChecklist(items: ChecklistItem[]): ChecklistGroup[] {
  const groups = new Map<string, ChecklistItem[]>();
  for (const item of items) {
    groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  }
  return Array.from(groups, ([id, groupItems]) => ({ id, title: id, items: groupItems }));
}
