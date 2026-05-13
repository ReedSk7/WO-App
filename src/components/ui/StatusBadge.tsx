import type { DraftStatus } from '../../types';
import { cn } from '../../utils/cn';

type StatusBadgeProps = {
  status: DraftStatus;
};

const styles: Record<DraftStatus, string> = {
  Draft: 'border-brand-500/40 bg-brand-500/10 text-brand-700 dark:text-brand-400',
  'Needs Info': 'border-status-danger/50 bg-status-danger/10 text-status-danger dark:text-status-dangerDark',
  'Review Ready': 'border-status-success/50 bg-status-success/10 text-status-success dark:text-status-successDark',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold', styles[status])}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}
