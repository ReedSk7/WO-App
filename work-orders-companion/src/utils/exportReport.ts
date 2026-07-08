import type { WorkRequest } from '../types';

function csvValue(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function buildScreeningReportCsv(workRequests: WorkRequest[]) {
  const headings = ['Ticket Number', 'Description', 'Location', 'Status', 'WO Type', 'Criticality', 'Priority', '% Complete', 'Owner'];
  const rows = workRequests.map((request) => [
    request.ticketNumber,
    request.description,
    request.location,
    request.status,
    request.woType,
    request.criticality,
    request.priority,
    `${request.percentComplete}%`,
    request.owner,
  ]);

  return [headings, ...rows].map((row) => row.map(csvValue).join(',')).join('\n');
}

export function downloadScreeningReport(workRequests: WorkRequest[]) {
  const blob = new Blob([buildScreeningReportCsv(workRequests)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mock-screening-report.csv';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
