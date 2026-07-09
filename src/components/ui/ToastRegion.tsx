type ToastRegionProps = {
  message?: string | null;
};

export function ToastRegion({ message }: ToastRegionProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 no-print" aria-live="polite" aria-atomic="true">
      {message ? (
        <div className="rounded-md border border-border-subtle bg-surface-light px-4 py-3 text-sm font-semibold shadow-panel dark:bg-surface-dark">
          {message}
        </div>
      ) : null}
    </div>
  );
}
