import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function SectionCard({ title, description, actions, children, className }: SectionCardProps) {
  return (
    <section className={cn('rounded-panel border border-border-subtle bg-surface-light p-[var(--wo-density-padding)] shadow-panel dark:bg-surface-dark', className)}>
      {title || actions ? (
        <div className="mb-5 flex flex-col gap-3 border-b border-border-subtle pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-xl font-semibold leading-7">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
