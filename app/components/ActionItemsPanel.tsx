import {
  READINESS_CATEGORY_LABELS,
  type ReadinessActionItem,
} from "../lib/readiness/types";
import { StatusBadge } from "./StatusBadge";

type ActionItemsPanelProps = {
  actions: ReadinessActionItem[];
  open: boolean;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "No target date provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ActionItemsPanel({
  actions,
  open,
  onClose,
}: ActionItemsPanelProps) {
  if (!open) return null;

  return (
    <section
      className="action-items-panel"
      id="action-items"
      aria-labelledby="action-items-title"
      tabIndex={-1}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Derived from readiness checks</p>
          <h2 id="action-items-title">Action Items</h2>
          <p>
            Each action below comes directly from an unresolved readiness item.
          </p>
        </div>
        <button className="icon-button" onClick={onClose} type="button">
          <span aria-hidden="true">×</span>
          <span className="sr-only">Close action items</span>
        </button>
      </div>

      {actions.length === 0 ? (
        <p className="empty-state">
          No unresolved action items exist in this demonstration scenario.
        </p>
      ) : (
        <ul className="action-items-list">
          {actions.map((action) => (
            <li className="action-item" key={action.id}>
              <div className="action-item__status">
                <StatusBadge status={action.status} compact />
                <span
                  className={
                    action.impact === "blocking"
                      ? "action-label action-label--blocking"
                      : "action-label action-label--nonblocking"
                  }
                >
                  {action.impact === "blocking"
                    ? "Blocks execution"
                    : "Non-blocking action"}
                </span>
              </div>
              <div className="action-item__body">
                <h3>{action.description}</h3>
                <dl>
                  <div>
                    <dt>Category</dt>
                    <dd>{READINESS_CATEGORY_LABELS[action.category]}</dd>
                  </div>
                  <div>
                    <dt>Owner</dt>
                    <dd>{action.owner ?? "Responsible group not provided"}</dd>
                  </div>
                  <div>
                    <dt>Target</dt>
                    <dd>{formatDate(action.dueDate)}</dd>
                  </div>
                </dl>
              </div>
              <div className="action-item__link">
                {action.sourceRecordUrl ? (
                  <a
                    className="button button--tertiary"
                    href={action.sourceRecordUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source record
                  </a>
                ) : (
                  <span className="record-link-unavailable">
                    Record link unavailable
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
