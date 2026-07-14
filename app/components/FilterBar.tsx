"use client";

import type {
  FilterCounts,
  ReadinessFilter,
} from "@/app/lib/readiness/types";

export type FilterBarProps = {
  value: ReadinessFilter;
  counts: FilterCounts;
  onChange: (filter: ReadinessFilter) => void;
  className?: string;
};

const FILTERS = [
  { value: "action-needed", label: "Action Needed" },
  { value: "blockers", label: "Blockers" },
  { value: "review", label: "Review" },
  { value: "pending", label: "Pending" },
  { value: "complete", label: "Complete" },
  { value: "all", label: "All" },
] as const;

export function FilterBar({
  value,
  counts,
  onChange,
  className = "",
}: FilterBarProps) {
  return (
    <nav
      className={`readiness-filters ${className}`.trim()}
      aria-label="Filter readiness checks"
    >
      <div className="readiness-filters__scroller" role="group">
        {FILTERS.map((filter) => {
          const typedValue = filter.value as ReadinessFilter;
          const isActive = String(value) === filter.value;
          const count = counts[typedValue];

          return (
            <button
              key={filter.value}
              type="button"
              className={`filter-chip${isActive ? " filter-chip--active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onChange(typedValue)}
            >
              <span>{filter.label}</span>
              <span className="filter-chip__count" aria-label={`${count} items`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
