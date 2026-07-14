"use client";

import { useId, useState } from "react";
import {
  READINESS_CATEGORY_LABELS,
  VERIFICATION_METHOD_LABELS,
  type ReadinessItem,
} from "@/app/lib/readiness/types";
import { ReadinessDetails } from "./ReadinessDetails";
import { StatusBadge } from "./StatusBadge";

export type ReadinessCardProps = {
  item: ReadinessItem;
  defaultExpanded?: boolean;
  referenceTime?: Date | string;
  reviewedOperationalExperienceIds?: ReadonlySet<string> | string[];
  onMarkOperationalExperienceReviewed?: (resultId: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
};

type FreshnessState = {
  label: string;
  tone: "current" | "refresh" | "unavailable";
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

function getFreshness(
  item: ReadinessItem,
  referenceTime?: Date | string,
): FreshnessState {
  if (item.sourceAvailability === "unavailable" || !item.lastCheckedAt) {
    return { label: "Unable to Verify", tone: "unavailable" };
  }
  if (item.sourceAvailability === "partial") {
    return { label: "Partial data returned", tone: "refresh" };
  }

  const checked = new Date(item.lastCheckedAt);
  const now = referenceTime ? new Date(referenceTime) : new Date();
  if (Number.isNaN(checked.getTime()) || Number.isNaN(now.getTime())) {
    return { label: "Unable to Verify", tone: "unavailable" };
  }

  if (typeof item.staleAfterMinutes === "number") {
    const ageMinutes = (now.getTime() - checked.getTime()) / 60_000;
    if (ageMinutes > item.staleAfterMinutes) {
      return item.staleBehavior === "unableToVerify"
        ? { label: "Unable to Verify — source data is stale", tone: "unavailable" }
        : { label: "Refresh Recommended", tone: "refresh" };
    }
  }

  return { label: "Current demonstration check", tone: "current" };
}

function safeRecordHref(value?: string) {
  if (!value || value === "#") return null;
  try {
    const parsed = new URL(value, "https://prototype.invalid");
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? value
      : null;
  } catch {
    return null;
  }
}

export function ReadinessCard({
  item,
  defaultExpanded = false,
  referenceTime,
  reviewedOperationalExperienceIds,
  onMarkOperationalExperienceReviewed,
  onExpandedChange,
  className = "",
}: ReadinessCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const reactId = useId();
  const detailsId = `readiness-details-${reactId.replace(/:/g, "")}`;
  const headingId = `readiness-heading-${reactId.replace(/:/g, "")}`;
  const categoryLabel = READINESS_CATEGORY_LABELS[item.category];
  const owner = item.owner ?? item.responsibleGroup;
  const verificationLabel = item.verificationMethod
    ? VERIFICATION_METHOD_LABELS[item.verificationMethod]
    : "Unable to Verify";
  const freshness = getFreshness(item, referenceTime);
  const recordHref = safeRecordHref(item.sourceRecordUrl);
  const quiet = item.status === "complete" || item.status === "notApplicable";

  function toggleExpanded() {
    setExpanded((current) => {
      const next = !current;
      onExpandedChange?.(next);
      return next;
    });
  }

  return (
    <article
      className={`readiness-card readiness-card--${item.status}${
        quiet ? " readiness-card--quiet" : ""
      } ${className}`.trim()}
      aria-labelledby={headingId}
      data-readiness-status={item.status}
    >
      <div className="readiness-card__main">
        <div className="readiness-card__heading-row">
          <div className="readiness-card__heading-copy">
            <p className="readiness-card__category">{categoryLabel}</p>
            <h3 id={headingId}>{item.title}</h3>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <p className="readiness-card__result">{item.shortResult}</p>

        <div className="readiness-card__impact-row">
          <span
            className={
              item.isExecutionBlocker
                ? "execution-impact execution-impact--blocking"
                : "execution-impact execution-impact--nonblocking"
            }
          >
            <span aria-hidden="true">{item.isExecutionBlocker ? "!" : "i"}</span>
            {item.isExecutionBlocker
              ? "Blocks execution"
              : "Does not independently block execution"}
          </span>
          {owner ? <span>Owner: {owner}</span> : null}
          {item.targetReadyDate ? (
            <span>Target: {formatDate(item.targetReadyDate)}</span>
          ) : null}
        </div>

        <dl className="readiness-card__source-grid">
          <div>
            <dt>Source</dt>
            <dd>
              {item.sourceSystem ?? "Source unavailable"}
              {item.sourceRecordLabel ? (
                <span className="mono"> · {item.sourceRecordLabel}</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt>Verification</dt>
            <dd>{verificationLabel}</dd>
          </div>
          <div>
            <dt>Freshness</dt>
            <dd className={`freshness freshness--${freshness.tone}`}>
              <span aria-hidden="true">
                {freshness.tone === "current" ? "✓" : freshness.tone === "refresh" ? "↻" : "?"}
              </span>
              {freshness.label}
            </dd>
          </div>
          <div>
            <dt>Last checked</dt>
            <dd>{formatDate(item.lastCheckedAt, true)}</dd>
          </div>
        </dl>

        {item.status !== "complete" && item.status !== "notApplicable" ? (
          <div className="readiness-card__next-action">
            <strong>Next action</strong>
            <span>
              {item.nextAction ??
                "Verify this unresolved item in the approved source system."}
            </span>
          </div>
        ) : null}

        <div className="readiness-card__footer">
          {recordHref ? (
            <a
              className="text-link"
              href={recordHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open demonstration source record for ${item.title}`}
            >
              Open source record
            </a>
          ) : (
            <span className="record-link-unavailable">Record link unavailable</span>
          )}
          <button
            className="readiness-card__toggle"
            type="button"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={toggleExpanded}
          >
            <span>{expanded ? "Hide details" : "View details"}</span>
            <span className="readiness-card__chevron" aria-hidden="true">
              {expanded ? "⌃" : "⌄"}
            </span>
          </button>
        </div>
      </div>

      <div
        id={detailsId}
        className="readiness-card__details"
        hidden={!expanded}
      >
        {expanded ? (
          <ReadinessDetails
            item={item}
            reviewedOperationalExperienceIds={reviewedOperationalExperienceIds}
            onMarkReviewed={onMarkOperationalExperienceReviewed}
          />
        ) : null}
      </div>
    </article>
  );
}
