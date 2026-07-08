import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export function ScreeningToolbar({
  isRefreshing,
  onAdd,
  onExport,
  onMoveToPlanning,
  onRefresh,
}: {
  isRefreshing: boolean;
  onAdd: () => void;
  onExport: () => void;
  onMoveToPlanning: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-normal text-app-navy">Screening</h1>
        <p className="mt-1 text-sm text-app-muted">Classify, consolidate, and route work requests.</p>
      </div>
      <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
        <Button className="px-3" onClick={onAdd}>
          <Icon className="h-4 w-4" name="plus" />
          Add WR
        </Button>
        <Button className="px-3" disabled={isRefreshing} onClick={onRefresh}>
          <Icon className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} name="refresh" />
          {isRefreshing ? 'Refreshing' : 'Refresh from Maximo'}
        </Button>
        <Button className="px-3" onClick={onExport}>
          <Icon className="h-4 w-4" name="export" />
          Export Screening Report
        </Button>
        <Button className="px-3" onClick={onMoveToPlanning} variant="primary">
          <Icon className="h-4 w-4" name="arrow" />
          Move to Planning
        </Button>
      </div>
    </div>
  );
}
