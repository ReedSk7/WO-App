import {
  READINESS_CATEGORY_LABELS,
  type ReadinessChange,
} from "@/app/lib/readiness/types";

export type WhatChangedProps = {
  changes: ReadinessChange[];
  maxVisible?: number;
  className?: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function textValue(record: UnknownRecord, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function WhatChanged({
  changes,
  maxVisible = 6,
  className = "",
}: WhatChangedProps) {
  const visibleChanges = changes.slice(0, Math.max(1, maxVisible));

  return (
    <section
      className={`what-changed ${className}`.trim()}
      aria-labelledby="what-changed-title"
    >
      <div className="what-changed__heading">
        <div>
          <p className="what-changed__eyebrow">Demonstration history</p>
          <h2 id="what-changed-title">What Changed</h2>
        </div>
        <span className="what-changed__count">
          {changes.length} {changes.length === 1 ? "update" : "updates"}
        </span>
      </div>

      {visibleChanges.length === 0 ? (
        <p className="empty-state">
          No recorded demonstration changes for this work order.
        </p>
      ) : (
        <ol className="what-changed__list">
          {visibleChanges.map((change, index) => {
            const data = asRecord(change);
            const id = textValue(data, ["id"], `change-${index}`);
            const timestamp = textValue(
              data,
              ["timestamp", "changedAt", "occurredAt"],
              "Time unavailable",
            );
            const categoryKey = textValue(
              data,
              ["category"],
              "Readiness check",
            );
            const category =
              READINESS_CATEGORY_LABELS[
                categoryKey as keyof typeof READINESS_CATEGORY_LABELS
              ] ?? categoryKey;
            const previous = textValue(
              data,
              ["previousState", "from"],
              "Previous state unavailable",
            );
            const next = textValue(
              data,
              ["newState", "to"],
              "New state unavailable",
            );
            const explanation = textValue(
              data,
              ["explanation", "description", "summary"],
              "Demonstration record updated.",
            );

            return (
              <li className="what-changed__item" key={id}>
                <div className="what-changed__marker" aria-hidden="true">
                  ↻
                </div>
                <div className="what-changed__body">
                  <div className="what-changed__meta">
                    <span>{category}</span>
                    <time dateTime={timestamp}>{formatTimestamp(timestamp)}</time>
                  </div>
                  <div
                    className="what-changed__transition"
                    aria-label={`Changed from ${previous} to ${next}`}
                  >
                    <span>{previous}</span>
                    <span aria-hidden="true">→</span>
                    <strong>{next}</strong>
                  </div>
                  <p>{explanation}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {changes.length > visibleChanges.length ? (
        <p className="what-changed__more">
          {changes.length - visibleChanges.length} earlier demonstration updates
          not shown.
        </p>
      ) : null}
      <p className="what-changed__notice">
        Prototype history only — this is not real-time monitoring.
      </p>
    </section>
  );
}
