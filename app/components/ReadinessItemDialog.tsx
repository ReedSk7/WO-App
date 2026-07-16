"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";
import {
  READINESS_CATEGORY_LABELS,
  VERIFICATION_METHOD_LABELS,
  type ReadinessCategory,
  type ReadinessItem,
} from "@/app/lib/readiness/types";
import { ReadinessDetails } from "./ReadinessDetails";
import { StatusBadge } from "./StatusBadge";

export type ReadinessItemDialogProps = {
  item: ReadinessItem | null;
  onClose: () => void;
  referenceTime?: Date | string;
  reviewedOperationalExperienceIds?: ReadonlySet<string> | readonly string[];
  onMarkOperationalExperienceReviewed?: (resultId: string) => void;
  className?: string;
};

const RECORD_CONTEXT_LABELS: Record<ReadinessCategory, string> = {
  "safety-and-job-hazards": "Synthetic hazard-review record",
  "clearance-and-energy-control": "Synthetic clearance number",
  "equipment-history-and-impact": "Synthetic equipment-history record",
  "operational-risk-and-plant-conditions":
    "Synthetic operational-condition record",
  "permits-and-special-controls": "Synthetic permit / control record set",
  "scaffolding-and-access": "Synthetic scaffold / access record",
  "parts-and-materials": "Synthetic material-readiness record",
  "tools-and-test-equipment": "Synthetic tool / test-equipment record",
  "work-package-and-procedures": "Synthetic work-package record",
  "walkdown-and-task-preview": "Synthetic walkdown / task-preview record",
  "support-group-coordination": "Synthetic support-coordination record",
  "operational-experience": "Synthetic operating-experience record",
  "workforce-readiness": "Synthetic workforce-readiness record",
  "testing-and-restoration": "Synthetic testing / restoration record",
};

function recordIdentity(item: ReadinessItem): string | undefined {
  if (item.category === "clearance-and-energy-control") {
    return (
      item.details?.clearance?.clearanceRequestNumber ?? item.sourceRecordLabel
    );
  }
  return item.sourceRecordLabel;
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

function formatCheckedAt(value?: string) {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function freshnessLabel(item: ReadinessItem, referenceTime?: Date | string) {
  if (item.sourceAvailability === "unavailable" || !item.lastCheckedAt) {
    return "Unable to Verify";
  }
  if (item.sourceAvailability === "partial") return "Partial data returned";

  const checkedAt = new Date(item.lastCheckedAt);
  if (Number.isNaN(checkedAt.getTime())) return "Unable to Verify";
  if (typeof item.staleAfterMinutes === "number") {
    const evaluatedAt = referenceTime ? new Date(referenceTime) : new Date();
    if (Number.isNaN(evaluatedAt.getTime())) return "Unable to Verify";
    const ageMinutes = (evaluatedAt.getTime() - checkedAt.getTime()) / 60_000;
    if (ageMinutes > item.staleAfterMinutes) {
      return item.staleBehavior === "unableToVerify"
        ? "Unable to Verify — source data is stale"
        : "Refresh Recommended";
    }
  }
  return "Current demonstration check";
}

/**
 * One modal detail surface for the compact readiness selector. Native dialog
 * supplies modal focus containment and Escape handling; closing returns focus
 * to the category control that opened it when that control remains mounted.
 */
export function ReadinessItemDialog({
  item,
  onClose,
  referenceTime,
  reviewedOperationalExperienceIds,
  onMarkOperationalExperienceReviewed,
  className = "",
}: ReadinessItemDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const generatedId = useId().replace(/:/g, "");
  const titleId = `readiness-item-dialog-title-${generatedId}`;
  const descriptionId = `readiness-item-dialog-description-${generatedId}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (item && !dialog.open) {
      dialog.showModal();
    } else if (!item && dialog.open) {
      dialog.close();
    }
  }, [item]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function closeFromBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeDialog();
  }

  const recordNumber = item ? recordIdentity(item) : undefined;
  const recordHref = item ? safeRecordHref(item.sourceRecordUrl) : null;
  const sourceUnavailable = item?.sourceAvailability === "unavailable";

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={`readiness-item-dialog readiness-card ${className}`.trim()}
      onClick={closeFromBackdrop}
      onClose={onClose}
      ref={dialogRef}
    >
      {item ? (
        <div>
          <div className="readiness-card__main">
            <div className="readiness-card__heading-row">
              <div className="readiness-card__heading-copy">
                <p className="readiness-card__category">
                  {READINESS_CATEGORY_LABELS[item.category]}
                </p>
                <h3 id={titleId}>{item.title}</h3>
              </div>
              <div className="detail-record__actions">
                <StatusBadge status={item.status} />
                <button
                  aria-label={`Close ${item.title} details`}
                  autoFocus
                  className="icon-button"
                  onClick={closeDialog}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </div>

            <p className="readiness-card__result" id={descriptionId}>
              {item.shortResult}
            </p>

            <dl className="detail-grid readiness-item-dialog__verification">
              <div className="detail-grid__item">
                <dt>
                  {sourceUnavailable ? "Last known " : ""}
                  {RECORD_CONTEXT_LABELS[item.category]}
                </dt>
                <dd className="mono">
                  {recordNumber ?? "Not provided — verify in an approved source"}
                </dd>
              </div>
              <div className="detail-grid__item">
                <dt>Source</dt>
                <dd>
                  {sourceUnavailable
                    ? "Unable to verify source availability"
                    : item.sourceSystem ?? "Source unavailable"}
                </dd>
              </div>
              <div className="detail-grid__item">
                <dt>Verification</dt>
                <dd>
                  {sourceUnavailable
                    ? "Unable to Verify"
                    : item.verificationMethod
                    ? VERIFICATION_METHOD_LABELS[item.verificationMethod]
                    : "Unable to Verify"}
                </dd>
              </div>
              <div className="detail-grid__item">
                <dt>Last checked / freshness</dt>
                <dd>
                  {formatCheckedAt(item.lastCheckedAt)} ·{" "}
                  {freshnessLabel(item, referenceTime)}
                </dd>
              </div>
            </dl>

            <div className="readiness-card__next-action">
              <strong>Next action</strong>
              <span>
                {item.nextAction ??
                  "No unresolved prototype action. Verify approved sources and field conditions before work."}
              </span>
            </div>

            {recordHref ? (
              <div className="detail-record__actions">
                <a
                  aria-label={`Open demonstration source record for ${item.title}`}
                  className="button button--tertiary"
                  href={recordHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  {sourceUnavailable
                    ? "Open last known record reference"
                    : "Open source record"}
                </a>
              </div>
            ) : null}
          </div>

          <div className="readiness-card__details">
            <ReadinessDetails
              item={item}
              onMarkReviewed={onMarkOperationalExperienceReviewed}
              reviewedOperationalExperienceIds={
                reviewedOperationalExperienceIds
              }
            />
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
