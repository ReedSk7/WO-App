type PrototypeBannerProps = {
  compact?: boolean;
};

export function PrototypeBanner({ compact = false }: PrototypeBannerProps) {
  return (
    <aside
      aria-label="Decision-support prototype notice"
      className="border-y border-amber-300 bg-amber-50 text-slate-900"
      role="note"
    >
      <div
        className={`mx-auto flex max-w-[92rem] items-start gap-3 px-4 ${
          compact ? "py-2.5" : "py-3.5"
        } sm:px-6 lg:px-8`}
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-700 text-sm font-black text-amber-800"
        >
          !
        </span>
        <div>
          {!compact ? (
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-900">
              Decision-support prototype
            </p>
          ) : null}
          <p className="text-sm font-medium leading-6">
            Decision-support prototype. Verify work readiness, permits,
            clearances, plant conditions, qualifications, work documents, and
            field conditions using approved processes and source systems before
            beginning work.
          </p>
        </div>
      </div>
    </aside>
  );
}
