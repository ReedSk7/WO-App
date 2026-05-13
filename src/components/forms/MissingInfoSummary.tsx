import { useId } from 'react';
import type { MissingInfoItem } from '../../types';
import { InlineFlagChip } from '../ui/InlineFlagChip';

type MissingInfoSummaryProps = {
  items: MissingInfoItem[];
  onChipClick?: (item: MissingInfoItem) => void;
};

export function MissingInfoSummary({ items, onChipClick }: MissingInfoSummaryProps) {
  const titleId = useId();
  const blocking = items.filter((item) => item.severity === 'blocking');
  const caution = items.filter((item) => item.severity === 'caution');
  const info = items.filter((item) => item.severity === 'info');
  const groups = [
    { label: 'Blocking', items: blocking },
    { label: 'Caution', items: caution },
    { label: 'Info', items: info },
  ].filter((group) => group.items.length > 0);

  return (
    <section className="rounded-panel border border-border-subtle bg-surface-light p-4 shadow-sm dark:bg-surface-dark" aria-labelledby={titleId}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold" id={titleId}>
            Missing-info summary
          </h2>
          <p className="mt-1 text-xs leading-5 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
            {blocking.length} blocking, {caution.length} caution, {info.length} informational.
          </p>
        </div>
        <span className="rounded-full border border-border-subtle px-2.5 py-1 text-xs font-semibold">{items.length}</span>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 text-xs font-semibold uppercase text-texttone-secondaryLight dark:text-texttone-secondaryDark">
                {group.label} ({group.items.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <InlineFlagChip item={item} key={item.id} onClick={item.field && onChipClick ? () => onChipClick(item) : undefined} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">No missing information detected. Planner review is still required.</p>
      )}
    </section>
  );
}
