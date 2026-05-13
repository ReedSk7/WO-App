import type { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: number | string;
  description?: string;
  icon?: ReactNode;
  onClick?: () => void;
};

export function StatCard({ label, value, description, icon, onClick }: StatCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className="w-full rounded-panel border border-border-subtle bg-surface-light p-6 text-left shadow-panel transition hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-light dark:bg-surface-dark dark:focus-visible:ring-offset-canvas-dark"
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">{label}</p>
          <p className="mt-2 text-3xl font-semibold leading-9 text-texttone-primaryLight dark:text-texttone-primaryDark">{value}</p>
          {description ? <p className="mt-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">{description}</p> : null}
        </div>
        {icon ? <div className="shrink-0 text-brand-700 dark:text-brand-400">{icon}</div> : null}
      </div>
    </Tag>
  );
}
