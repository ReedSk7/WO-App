import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type SafetyBannerProps = {
  title?: string;
  children?: ReactNode;
  tone?: 'info' | 'warning';
};

export function SafetyBanner({ title = 'Draft planning content only', children, tone = 'warning' }: SafetyBannerProps) {
  return (
    <section
      aria-labelledby="safety-banner-title"
      className={cn(
        'rounded-panel border px-4 py-3 shadow-sm',
        tone === 'warning'
          ? 'border-status-warning/70 bg-status-warning/10'
          : 'border-brand-500/40 bg-brand-500/10',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className={cn('mt-1 h-2.5 w-2.5 rounded-full', tone === 'warning' ? 'bg-status-warning' : 'bg-brand-500')}
        />
        <div className="min-w-0">
          <h2 id="safety-banner-title" className="text-sm font-semibold">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
            {children ??
              'This demo creates draft planning content only. It is not approved work direction. Qualified planner review, approved procedures, verified technical data, and site-required reviews are required before use.'}
          </p>
        </div>
      </div>
    </section>
  );
}
