import type { RecordStatus, SiteOption } from '../../types';
import { Icon } from '../ui/Icon';

export function FiltersBar({
  search,
  siteOptions,
  siteFilter,
  statusFilter,
  onSearchChange,
  onSiteFilterChange,
  onStatusFilterChange,
}: {
  search: string;
  siteOptions: SiteOption[];
  siteFilter: string;
  statusFilter: RecordStatus | 'All Status';
  onSearchChange: (value: string) => void;
  onSiteFilterChange: (value: string) => void;
  onStatusFilterChange: (value: RecordStatus | 'All Status') => void;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <h2 className="text-sm font-bold text-app-navy" id="condition-reports-heading">
        CR / WO / PM Queue
      </h2>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <select aria-label="Filter by site" className="field sm:w-64" onChange={(event) => onSiteFilterChange(event.target.value)} value={siteFilter}>
          <option>All Sites</option>
          {siteOptions.map((site) => (
            <option key={site.id} value={site.id}>
              {site.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          className="field sm:w-40"
          onChange={(event) => onStatusFilterChange(event.target.value as RecordStatus | 'All Status')}
          value={statusFilter}
        >
          <option>All Status</option>
          <option>REVIEW</option>
          <option>OPEN</option>
          <option>NEW</option>
          <option>PLANNING</option>
        </select>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search condition reports</span>
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" name="search" />
          <input
            className="field pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search CR, WO, PM, location..."
            type="search"
            value={search}
          />
        </label>
      </div>
    </div>
  );
}
