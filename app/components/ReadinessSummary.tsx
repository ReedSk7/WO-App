import type {
  ReadinessEvaluation,
  SourceAvailability,
  WorkOrderSummary,
} from "../lib/readiness/types";
import { StatusBadge } from "./StatusBadge";

type ReadinessSummaryProps = {
  workOrder: WorkOrderSummary;
  evaluation: ReadinessEvaluation;
  sourceAvailability?: SourceAvailability;
  refreshing: boolean;
  onRefresh: () => void;
};

function formatDate(value: string, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime
      ? { hour: "numeric", minute: "2-digit" }
      : {}),
  }).format(date);
}

export function ReadinessSummary({
  workOrder,
  evaluation,
  sourceAvailability,
  refreshing,
  onRefresh,
}: ReadinessSummaryProps) {
  const counts = evaluation.counts;

  return (
    <section className="summary-card" aria-labelledby="work-order-title">
      <div className="summary-card__topline">
        <div className="summary-card__identity">
          <p className="eyebrow">Synthetic work order</p>
          <h1 className="mono" id="work-order-title">
            {workOrder.workOrderNumber}
          </h1>
          <p className="summary-card__description">
            {workOrder.taskDescription}
          </p>
        </div>
        <StatusBadge status={evaluation.overallStatus} />
      </div>

      <dl className="summary-quick-meta">
        <div>
          <dt>Site</dt>
          <dd>{workOrder.site}</dd>
        </div>
        <div>
          <dt>Scheduled</dt>
          <dd>{formatDate(workOrder.scheduledExecutionDate)}</dd>
        </div>
        <div>
          <dt>Window</dt>
          <dd>
            <span className="work-mode-badge">{workOrder.workMode}</span>
          </dd>
        </div>
        <div>
          <dt>Equipment / location</dt>
          <dd className="mono">{workOrder.equipmentOrLocation}</dd>
        </div>
      </dl>

      <div className={`overall-callout overall-callout--${evaluation.overallStatus.toLowerCase().replaceAll(" ", "-")}`}>
        <div>
          <p className="eyebrow">Overall status</p>
          <h2>{evaluation.overallStatus}</h2>
          <p>{evaluation.overallReason}</p>
        </div>
        <div className="refresh-control">
          <span>Updated</span>
          <time dateTime={workOrder.lastDataRefreshAt}>
            {formatDate(workOrder.lastDataRefreshAt, true)}
          </time>
          <button
            className="button button--secondary"
            disabled={refreshing}
            onClick={onRefresh}
            type="button"
          >
            <span aria-hidden="true">↻</span>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {sourceAvailability === "partial" ? (
        <p className="partial-data-notice" role="status">
          <span aria-hidden="true">?</span>
          Partial demonstration data returned. Unavailable checks remain
          unresolved and are not treated as passing.
        </p>
      ) : null}

      <div className="summary-counts" aria-label="Readiness status counts">
        <div className="summary-count summary-count--complete">
          <span aria-hidden="true">✓</span>
          <strong>{counts.completedChecks}</strong>
          <span>Complete</span>
        </div>
        <div className="summary-count summary-count--blocker">
          <span aria-hidden="true">!</span>
          <strong>{counts.confirmedBlockers}</strong>
          <span>Blockers</span>
        </div>
        <div className="summary-count summary-count--review">
          <span aria-hidden="true">!</span>
          <strong>{counts.reviewRequired}</strong>
          <span>Review</span>
        </div>
        <div className="summary-count summary-count--unable">
          <span aria-hidden="true">?</span>
          <strong>{counts.unableToVerifyCount}</strong>
          <span>Unverified</span>
        </div>
      </div>
    </section>
  );
}
