"use client";

import {
  READINESS_CATEGORY_LABELS,
  type ReadinessItem,
} from "@/app/lib/readiness/types";
import { StatusBadge } from "./StatusBadge";

export type ReadinessCardProps = {
  item: ReadinessItem;
  onOpenDetails: (item: ReadinessItem, trigger: HTMLElement) => void;
  className?: string;
};

function formatDate(value?: string, includeTime = false) {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(parsed);
}

export function ReadinessCard({
  item,
  onOpenDetails,
  className = "",
}: ReadinessCardProps) {
  const categoryLabel = READINESS_CATEGORY_LABELS[item.category];
  const owner = item.owner ?? item.responsibleGroup;
  const quiet = item.status === "complete" || item.status === "notApplicable";

  return (
    <article
      className={`field-check-card field-check-card--${item.status}${
        quiet ? " field-check-card--quiet" : ""
      } ${className}`.trim()}
      data-readiness-status={item.status}
    >
      <button
        aria-haspopup="dialog"
        className="field-check-card__button"
        onClick={(event) => onOpenDetails(item, event.currentTarget)}
        type="button"
      >
        <span className="field-check-card__topline">
          <span>
            <span className="field-check-card__category">{categoryLabel}</span>
            <span className="field-check-card__title">{item.title}</span>
          </span>
          <StatusBadge compact status={item.status} />
        </span>

        <span className="field-check-card__result">{item.shortResult}</span>

        <span className="field-check-card__meta">
          {item.isExecutionBlocker ? (
            <span className="field-check-card__blocking">
              <span aria-hidden="true">!</span> Blocks work
            </span>
          ) : null}
          {owner ? <span>Owner: {owner}</span> : null}
          {item.targetReadyDate ? (
            <span>Target: {formatDate(item.targetReadyDate)}</span>
          ) : null}
        </span>

        {item.status !== "complete" && item.status !== "notApplicable" ? (
          <span className="field-check-card__next-action">
            <strong>Next:</strong>{" "}
            {item.nextAction ??
              "Verify this unresolved item in the approved source system."}
          </span>
        ) : null}

        <span className="field-check-card__open">
          Open details <span aria-hidden="true">›</span>
        </span>
      </button>
    </article>
  );
}
