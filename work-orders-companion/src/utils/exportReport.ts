import type { ConditionRecord } from '../types';

function csvValue(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function buildScreeningReportCsv(records: ConditionRecord[]) {
  const headings = [
    'CR Number',
    'Record Type',
    'Plant',
    'Unit',
    'Description',
    'Location',
    'Status',
    'Decision State',
    'Readiness Score',
    'Open Gaps',
    'WO Type',
    'Criticality',
    'Priority',
    '% Complete',
    'Owner',
  ];
  const rows = records.map((record) => [
    record.recordNumber,
    record.recordType,
    record.plant,
    record.unit,
    record.description,
    record.location,
    record.status,
    record.decisionState,
    `${record.readinessScore}%`,
    record.readinessGaps.length,
    record.woType,
    record.criticality,
    record.priority,
    `${record.percentComplete}%`,
    record.owner,
  ]);

  return [headings, ...rows].map((row) => row.map(csvValue).join(',')).join('\n');
}

export function downloadScreeningReport(records: ConditionRecord[]) {
  const blob = new Blob([buildScreeningReportCsv(records)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mock-cr-screening-report.csv';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
