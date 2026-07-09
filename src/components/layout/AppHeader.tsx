import type { ReactNode } from 'react';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  metadata?: ReactNode;
  actions?: ReactNode;
};

export function AppHeader({ title, subtitle, metadata, actions }: AppHeaderProps) {
  return (
    <header aria-label="Application header" className="flex flex-col gap-4 border-b border-border-subtle bg-canvas-light px-4 pb-5 pt-16 dark:bg-canvas-dark sm:px-6 lg:px-8 lg:pt-5">
      <div className="mx-auto flex w-full max-w-workbench flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold leading-9 text-texttone-primaryLight dark:text-texttone-primaryDark">{title}</h1>
          {subtitle ? <p className="mt-1 max-w-3xl text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">{subtitle}</p> : null}
          {metadata ? <div className="mt-4">{metadata}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  );
}
