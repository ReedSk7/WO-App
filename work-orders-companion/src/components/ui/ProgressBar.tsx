export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={value}>
      <div className="h-full rounded-full bg-app-purple" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
