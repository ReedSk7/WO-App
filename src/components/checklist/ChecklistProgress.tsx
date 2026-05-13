type ChecklistProgressProps = {
  percent: number;
  criticalOpen?: number;
};

export function ChecklistProgress({ percent, criticalOpen = 0 }: ChecklistProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">Checklist progress</span>
        <span className="font-mono font-semibold">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-raisedLight dark:bg-surface-raisedDark">
        <div className="h-full rounded-full bg-status-success dark:bg-status-successDark" style={{ width: `${percent}%` }} />
      </div>
      {criticalOpen > 0 ? (
        <p className="text-xs font-semibold text-status-caution">{criticalOpen} critical checklist item{criticalOpen === 1 ? '' : 's'} still open.</p>
      ) : null}
    </div>
  );
}
