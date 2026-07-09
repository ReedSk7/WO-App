import type { ChecklistItem } from '../../types';

type ChecklistGroupProps = {
  title: string;
  items: ChecklistItem[];
  onToggle: (id: string, checked: boolean) => void;
};

export function ChecklistGroup({ title, items, onToggle }: ChecklistGroupProps) {
  return (
    <section className="rounded-panel border border-border-subtle bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <label className="flex min-h-11 items-start gap-3 rounded-md px-2 py-2 hover:bg-surface-raisedLight dark:hover:bg-surface-raisedDark" htmlFor={item.id} key={item.id}>
            <input
              checked={item.checked}
              className="mt-1 h-4 w-4 accent-brand-500"
              id={item.id}
              onChange={(event) => onToggle(item.id, event.target.checked)}
              type="checkbox"
            />
            <span className="text-sm leading-5">
              {item.label}
              {item.critical ? <span className="ml-2 text-xs font-semibold text-status-caution">Critical</span> : null}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
