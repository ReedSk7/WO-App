import type { MissingInfoItem, MissingInfoSeverity } from '../../types';
import { cn } from '../../utils/cn';

const severityStyles: Record<MissingInfoSeverity, string> = {
  blocking: 'border-status-danger/50 bg-status-danger/10 text-status-danger dark:text-status-dangerDark',
  caution: 'border-status-caution/60 bg-status-caution/10 text-[#8a3800] dark:text-status-warning',
  info: 'border-brand-500/40 bg-brand-500/10 text-brand-700 dark:text-status-info',
};

type InlineFlagChipProps = {
  item: MissingInfoItem;
  onClick?: () => void;
};

export function InlineFlagChip({ item, onClick }: InlineFlagChipProps) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        severityStyles[item.severity],
      )}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      title={item.message}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      <span className="capitalize">{item.severity}</span>
      <span>{item.message}</span>
    </Tag>
  );
}
