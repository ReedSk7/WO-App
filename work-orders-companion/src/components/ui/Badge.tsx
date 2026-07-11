import type { InsightTone, RecordStatus, RecordType } from '../../types';
import { cn } from '../../utils/cn';

const statusStyles: Record<RecordStatus, string> = {
  REVIEW: 'border-app-green/25 bg-app-greenSoft text-app-green',
  OPEN: 'border-app-blue/25 bg-app-blueSoft text-app-blue',
  NEW: 'border-slate-300 bg-slate-100 text-slate-700',
  PLANNING: 'border-app-purple/25 bg-app-purpleSoft text-app-purple',
};

const recordTypeStyles: Record<RecordType, string> = {
  CR: 'border-app-amber/25 bg-app-amberSoft text-app-amber',
  WO: 'border-app-blue/25 bg-app-blueSoft text-app-blue',
  PM: 'border-app-purple/25 bg-app-purpleSoft text-app-purple',
};

const toneStyles: Record<InsightTone, string> = {
  good: 'border-app-green/25 bg-app-greenSoft text-app-green',
  medium: 'border-app-amber/25 bg-app-amberSoft text-app-amber',
  high: 'border-app-red/25 bg-app-redSoft text-app-red',
  neutral: 'border-slate-300 bg-slate-100 text-slate-700',
};

function criticalityClass(criticality: string) {
  if (criticality.includes('1')) return 'border-app-red/25 bg-app-redSoft text-app-red';
  if (criticality.includes('2')) return 'border-app-amber/25 bg-app-amberSoft text-app-amber';
  return 'border-app-amber/25 bg-[#fff8e6] text-app-amber';
}

export function StatusBadge({ status }: { status: RecordStatus }) {
  return <span className={cn('badge', statusStyles[status])}>{status}</span>;
}

export function ToneBadge({ status, tone }: { status: string; tone: InsightTone }) {
  return <span className={cn('badge', toneStyles[tone])}>{status}</span>;
}

export function CriticalityBadge({ value }: { value: string }) {
  return <span className={cn('badge', criticalityClass(value))}>{value}</span>;
}

export function RecordTypeBadge({ recordType }: { recordType: RecordType }) {
  return <span className={cn('badge px-2 py-0.5 text-[0.65rem]', recordTypeStyles[recordType])}>{recordType}</span>;
}
