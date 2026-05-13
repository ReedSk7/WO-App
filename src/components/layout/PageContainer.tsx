import type { ReactNode } from 'react';

type PageContainerProps = {
  children: ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return <div className="mx-auto flex w-full max-w-workbench flex-col gap-[var(--wo-density-gap)] px-4 py-6 sm:px-6 lg:px-8">{children}</div>;
}
