import type { ReactNode } from 'react';

type ToolbarProps = {
  label: string;
  children: ReactNode;
};

export function Toolbar({ label, children }: ToolbarProps) {
  return (
    <div aria-label={label} className="flex flex-wrap items-center gap-2 rounded-panel border border-border-subtle bg-surface-light p-3 shadow-sm dark:bg-surface-dark" role="toolbar">
      {children}
    </div>
  );
}
