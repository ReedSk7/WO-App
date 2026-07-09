import type { ReactNode } from 'react';
import type { MissingInfoItem } from '../../types';
import { InlineFlagChip } from '../ui/InlineFlagChip';

type FormSectionProps = {
  title: string;
  description?: string;
  flags?: MissingInfoItem[];
  children: ReactNode;
};

export function FormSection({ title, description, flags = [], children }: FormSectionProps) {
  return (
    <section className="rounded-panel border border-border-subtle bg-surface-light p-[var(--wo-density-padding)] shadow-sm dark:bg-surface-dark">
      <div className="mb-5">
        <h2 className="text-xl font-semibold leading-7">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">{description}</p> : null}
        {flags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {flags.map((flag) => (
              <InlineFlagChip item={flag} key={flag.id} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
