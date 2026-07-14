"use client";

import {
  READINESS_CATEGORY_LABELS,
  type ReadinessActionItem,
} from "@/app/lib/readiness/types";

export type ActionSummaryProps = {
  actions: ReadinessActionItem[];
  onViewActionItems?: () => void;
  actionItemsId?: string;
  maxVisible?: number;
  title?: string;
  className?: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function firstText(record: UnknownRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function ActionSummary({
  actions,
  onViewActionItems,
  actionItemsId = "action-items",
  maxVisible = 4,
  title = "Why this work order is not ready",
  className = "",
}: ActionSummaryProps) {
  if (actions.length === 0) return null;

  const visibleActions = actions.slice(0, Math.max(1, maxVisible));
  const remainingCount = Math.max(0, actions.length - visibleActions.length);

  function viewActions() {
    if (onViewActionItems) {
      onViewActionItems();
      return;
    }
    document.getElementById(actionItemsId)?.scrollIntoView({ block: "start" });
  }

  return (
    <section
      className={`action-summary ${className}`.trim()}
      aria-labelledby="action-summary-title"
    >
      <div className="action-summary__heading">
        <div>
          <p className="action-summary__eyebrow">Action summary</p>
          <h2 id="action-summary-title">{title}</h2>
        </div>
        <span className="action-summary__count">
          {actions.length} {actions.length === 1 ? "issue" : "issues"}
        </span>
      </div>

      <ol className="action-summary__list">
        {visibleActions.map((action, index) => {
          const data = asRecord(action);
          const description = firstText(
            data,
            ["description", "action", "nextAction", "title"],
            "Review this readiness item in the approved source system.",
          );
          const categoryKey = firstText(data, ["category", "relatedCategory"]);
          const category =
            READINESS_CATEGORY_LABELS[
              categoryKey as keyof typeof READINESS_CATEGORY_LABELS
            ] ?? categoryKey;
          const owner = firstText(data, ["owner", "responsibleGroup"]);
          const targetDate = firstText(data, ["dueDate", "targetReadyDate"]);
          const sourceUrl = firstText(data, ["sourceRecordUrl", "recordUrl"]);
          const isBlocking = data.impact === "blocking";
          const actionId = firstText(data, ["id"], `${category}-${index}`);

          return (
            <li className="action-summary__item" key={actionId}>
              <div className="action-summary__item-body">
                <p className="action-summary__description">{description}</p>
                <div className="action-summary__meta">
                  {category ? <span>{category}</span> : null}
                  {owner ? <span>Owner: {owner}</span> : null}
                  {targetDate ? (
                    <span>Target: {formatDate(targetDate)}</span>
                  ) : null}
                  <span
                    className={
                      isBlocking
                        ? "action-label action-label--blocking"
                        : "action-label action-label--nonblocking"
                    }
                  >
                    {isBlocking ? "Blocks execution" : "Non-blocking action"}
                  </span>
                </div>
              </div>
              {sourceUrl ? (
                <a
                  className="text-link action-summary__source-link"
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open demonstration source record for ${description}`}
                >
                  Open source record
                </a>
              ) : null}
            </li>
          );
        })}
      </ol>

      {remainingCount > 0 ? (
        <p className="action-summary__more">
          +{remainingCount} more {remainingCount === 1 ? "issue" : "issues"}
        </p>
      ) : null}

      <button
        className="button button--secondary action-summary__button"
        type="button"
        onClick={viewActions}
        aria-controls={actionItemsId}
      >
        View Action Items
      </button>
    </section>
  );
}
