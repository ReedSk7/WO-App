// @ts-expect-error -- Node's direct TypeScript runner requires an explicit extension.
import { READINESS_CATEGORIES, READINESS_CATEGORY_LABELS } from "./types.ts";
import type {
  EvaluationOptions,
  FilterCounts,
  OverallReadinessState,
  PermitControlRecord,
  ReadinessActionItem,
  ReadinessEvaluation,
  ReadinessFilter,
  ReadinessItem,
  ReadinessStatus,
  StatusCounts,
} from "./types.ts";

const DEFAULT_STALE_AFTER_MINUTES = 360;

/**
 * Sorting precedence is intentionally impact-based rather than alphabetical or
 * percentage-based. A lower number is shown first.
 */
export const STATUS_SORT_PRECEDENCE: Record<ReadinessStatus, number> = {
  blocker: 0,
  unableToVerify: 1,
  review: 2,
  pending: 3,
  dayOfAction: 4,
  complete: 5,
  notApplicable: 6,
};

const ACTION_STATUSES = new Set<ReadinessStatus>([
  "blocker",
  "unableToVerify",
  "review",
  "pending",
  "dayOfAction",
]);

function toDate(value: Date | string | undefined): Date {
  if (value instanceof Date) return value;
  if (value) return new Date(value);
  return new Date();
}

function isMissingOrStale(
  timestamp: string | undefined,
  now: Date,
  staleAfterMinutes: number,
): boolean {
  if (!timestamp) return true;
  const checkedAt = new Date(timestamp);
  if (Number.isNaN(checkedAt.getTime())) return true;
  return now.getTime() - checkedAt.getTime() > staleAfterMinutes * 60_000;
}

function defaultNextAction(status: ReadinessStatus): string | undefined {
  switch (status) {
    case "blocker":
      return "Resolve the confirmed blocker and verify the updated source record before work.";
    case "unableToVerify":
      return "Restore or verify the required source data using the approved source system.";
    case "review":
      return "Have a qualified reviewer evaluate the finding and document the disposition.";
    case "pending":
      return "Complete the outstanding prerequisite and verify readiness before execution.";
    case "dayOfAction":
      return "Complete and verify the identified execution-day action before beginning work.";
    default:
      return undefined;
  }
}

/**
 * Normalizes permit/control lifecycle semantics. A record merely being created,
 * requested, or under review never becomes ready. Likewise, an unavailable
 * source can never be interpreted as "Not Required."
 */
export function normalizePermitControl(
  record: PermitControlRecord,
  options: EvaluationOptions = {},
): PermitControlRecord {
  const now = toDate(options.now);
  const staleAfterMinutes =
    options.defaultStaleAfterMinutes ?? DEFAULT_STALE_AFTER_MINUTES;
  const unavailable =
    record.sourceAvailability === "unavailable" ||
    record.sourceAvailability === "partial" ||
    record.verificationMethod === "unableToVerify" ||
    !record.verificationMethod ||
    isMissingOrStale(record.lastVerifiedAt, now, staleAfterMinutes);

  if (unavailable) {
    return {
      ...record,
      readinessClassification: "unableToVerify",
    };
  }

  if (record.applicability === "Not Required") {
    return { ...record, readinessClassification: "notApplicable" };
  }

  if (record.applicability === "Undetermined") {
    return { ...record, readinessClassification: "pending" };
  }

  if (record.blockingIssue || record.lifecycleStatus === "Blocked") {
    return { ...record, readinessClassification: "blocker" };
  }

  if (record.lifecycleStatus === "Expired") {
    return { ...record, readinessClassification: "blocker" };
  }

  if (
    record.sourceStatus?.trim().toLowerCase() === "created" ||
    record.lifecycleStatus === "Not Started" ||
    record.lifecycleStatus === "Requested" ||
    record.lifecycleStatus === "Under Review" ||
    record.lifecycleStatus === "Canceled"
  ) {
    return { ...record, readinessClassification: "pending" };
  }

  if (record.lifecycleStatus === "Ready for Issuance") {
    if (
      record.advancePrerequisitesComplete === true &&
      record.requiresDayOfIssuance === true &&
      !(record.outstandingPrerequisites?.length)
    ) {
      return { ...record, readinessClassification: "dayOfAction" };
    }
    return { ...record, readinessClassification: "pending" };
  }

  if (record.lifecycleStatus === "Issued / Active") {
    if (
      record.advancePrerequisitesComplete === false ||
      record.outstandingPrerequisites?.length
    ) {
      return { ...record, readinessClassification: "pending" };
    }
    return { ...record, readinessClassification: "complete" };
  }

  return { ...record, readinessClassification: "unableToVerify" };
}

function mostSevereStatus(statuses: ReadinessStatus[]): ReadinessStatus {
  return statuses.slice(1).reduce<ReadinessStatus>(
    (current, candidate) =>
      STATUS_SORT_PRECEDENCE[candidate] < STATUS_SORT_PRECEDENCE[current]
        ? candidate
        : current,
    statuses[0] ?? "unableToVerify",
  );
}

function getPermitRollup(records: PermitControlRecord[]): ReadinessStatus {
  const applicable = records
    .map((record) => record.readinessClassification)
    .filter((status) => status !== "notApplicable");
  return applicable.length ? mostSevereStatus(applicable) : "notApplicable";
}

/**
 * Applies shared false-green rules to a readiness item. Presentation components
 * should render this normalized result instead of interpreting raw source data.
 */
export function normalizeReadinessItem(
  item: ReadinessItem,
  options: EvaluationOptions = {},
): ReadinessItem {
  const now = toDate(options.now);
  const staleAfterMinutes =
    item.staleAfterMinutes ??
    options.defaultStaleAfterMinutes ??
    DEFAULT_STALE_AFTER_MINUTES;
  const normalizedPermits = item.details?.permits?.map((record) =>
    normalizePermitControl(record, options),
  );
  const hasEmptyPermitCollection =
    Array.isArray(item.details?.permits) && item.details.permits.length === 0;

  let status = item.status;
  let permitExecutionBlocker = false;
  if (normalizedPermits?.length) {
    const permitRollup = getPermitRollup(normalizedPermits);
    status = mostSevereStatus([status, permitRollup]);
    permitExecutionBlocker = permitRollup === "blocker";
  } else if (
    hasEmptyPermitCollection &&
    item.applicability !== "notRequired" &&
    status !== "blocker"
  ) {
    status = "unableToVerify";
  }

  const sourceUnavailable =
    item.sourceAvailability === "unavailable" ||
    item.verificationMethod === "unableToVerify";
  const sourceVerificationMissing =
    item.requiresSourceVerification === true &&
    (!item.sourceSystem || !item.verificationMethod || !item.lastCheckedAt);
  const sourcePartial = item.sourceAvailability === "partial";
  let refreshRecommended = false;

  if (status !== "blocker" && (sourceUnavailable || sourceVerificationMissing)) {
    status = "unableToVerify";
  }

  if (status !== "blocker" && sourcePartial) {
    if (
      item.isCriticalData === true ||
      item.applicability === "notRequired" ||
      item.staleBehavior === "unableToVerify"
    ) {
      status = "unableToVerify";
    } else if (
      status === "complete" ||
      status === "dayOfAction" ||
      status === "notApplicable"
    ) {
      status = "review";
      refreshRecommended = true;
    }
  }

  if (
    status !== "blocker" &&
    item.applicability === "notRequired" &&
    (sourceUnavailable || sourceVerificationMissing)
  ) {
    status = "unableToVerify";
  } else if (
    status !== "blocker" &&
    item.applicability === "notRequired"
  ) {
    status = "notApplicable";
  }

  if (
    status === "complete" &&
    (item.applicability === "undetermined" ||
      item.applicability === "notYetEvaluated")
  ) {
    status = "pending";
  }

  const shouldCheckFreshness =
    item.requiresSourceVerification === true &&
    status !== "blocker" &&
    !sourceUnavailable &&
    !sourceVerificationMissing;
  if (
    shouldCheckFreshness &&
    isMissingOrStale(item.lastCheckedAt, now, staleAfterMinutes)
  ) {
    if (
      item.isCriticalData === true ||
      item.staleBehavior === "unableToVerify" ||
      item.applicability === "notRequired"
    ) {
      status = "unableToVerify";
    } else {
      status = "review";
      refreshRecommended = true;
    }
  }

  const nextAction = ACTION_STATUSES.has(status)
    ? item.nextAction || defaultNextAction(status)
    : undefined;

  return {
    ...item,
    status,
    isExecutionBlocker: item.isExecutionBlocker || permitExecutionBlocker,
    shortResult: refreshRecommended
      ? `Refresh Recommended — ${item.shortResult}`
      : item.shortResult,
    nextAction,
    details: item.details
      ? {
          ...item.details,
          permits: normalizedPermits,
        }
      : undefined,
  };
}

function addMissingCategoryItems(items: ReadinessItem[]): ReadinessItem[] {
  const present = new Set(items.map((item) => item.category));
  const missing = READINESS_CATEGORIES.filter(
    (category) => !present.has(category),
  ).map<ReadinessItem>((category) => ({
    id: `missing-${category}`,
    category,
    title: READINESS_CATEGORY_LABELS[category],
    shortResult: "Required category data was not returned.",
    detailedBasis:
      "The provider did not return this readiness category, so the prototype cannot infer a passing result.",
    status: "unableToVerify",
    isExecutionBlocker: false,
    applicability: "notYetEvaluated",
    sourceAvailability: "unavailable",
    verificationMethod: "unableToVerify",
    isCriticalData: true,
    requiresSourceVerification: false,
    nextAction:
      "Restore or verify this category using the approved source system before work.",
  }));
  return [...items, ...missing];
}

export function sortReadinessItems(items: ReadinessItem[]): ReadinessItem[] {
  return [...items].sort((left, right) => {
    const statusDifference =
      STATUS_SORT_PRECEDENCE[left.status] -
      STATUS_SORT_PRECEDENCE[right.status];
    if (statusDifference !== 0) return statusDifference;

    if (left.isExecutionBlocker !== right.isExecutionBlocker) {
      return left.isExecutionBlocker ? -1 : 1;
    }

    if (left.targetReadyDate && right.targetReadyDate) {
      const dateDifference =
        new Date(left.targetReadyDate).getTime() -
        new Date(right.targetReadyDate).getTime();
      if (!Number.isNaN(dateDifference) && dateDifference !== 0) {
        return dateDifference;
      }
    } else if (left.targetReadyDate) {
      return -1;
    } else if (right.targetReadyDate) {
      return 1;
    }

    return left.title.localeCompare(right.title);
  });
}

export function deriveActionItems(
  items: ReadinessItem[],
): ReadinessActionItem[] {
  return sortReadinessItems(items)
    .filter((item) => ACTION_STATUSES.has(item.status))
    .map((item) => ({
      id: `action-${item.id}`,
      readinessItemId: item.id,
      description:
        item.nextAction ||
        defaultNextAction(item.status) ||
        "Verify this readiness item before work.",
      category: item.category,
      owner: item.owner || item.responsibleGroup,
      dueDate: item.targetReadyDate,
      impact:
        item.status === "blocker" && item.isExecutionBlocker
          ? "blocking"
          : "nonBlocking",
      status: item.status,
      sourceRecordLabel: item.sourceRecordLabel,
      sourceRecordUrl: item.sourceRecordUrl,
    }));
}

export function calculateStatusCounts(items: ReadinessItem[]): StatusCounts {
  const counts: StatusCounts = {
    complete: 0,
    blocker: 0,
    review: 0,
    pending: 0,
    dayOfAction: 0,
    notApplicable: 0,
    unableToVerify: 0,
    total: items.length,
    actionNeeded: 0,
    completedChecks: 0,
    confirmedBlockers: 0,
    reviewRequired: 0,
    unableToVerifyCount: 0,
  };

  for (const item of items) {
    counts[item.status] += 1;
    if (ACTION_STATUSES.has(item.status)) counts.actionNeeded += 1;
    if (item.status === "complete") counts.completedChecks += 1;
    if (item.status === "blocker" && item.isExecutionBlocker) {
      counts.confirmedBlockers += 1;
    }
    if (item.status === "review") counts.reviewRequired += 1;
    if (item.status === "unableToVerify") counts.unableToVerifyCount += 1;
  }

  return counts;
}

export function filterReadinessItems(
  items: ReadinessItem[],
  filter: ReadinessFilter,
): ReadinessItem[] {
  switch (filter) {
    case "action-needed":
      return items.filter((item) => ACTION_STATUSES.has(item.status));
    case "blockers":
      return items.filter((item) => item.status === "blocker");
    case "review":
      return items.filter((item) => item.status === "review");
    case "pending":
      return items.filter(
        (item) => item.status === "pending" || item.status === "dayOfAction",
      );
    case "complete":
      return items.filter(
        (item) =>
          item.status === "complete" || item.status === "notApplicable",
      );
    case "all":
      return [...items];
  }
}

export function calculateFilterCounts(items: ReadinessItem[]): FilterCounts {
  return {
    "action-needed": filterReadinessItems(items, "action-needed").length,
    blockers: filterReadinessItems(items, "blockers").length,
    review: filterReadinessItems(items, "review").length,
    pending: filterReadinessItems(items, "pending").length,
    complete: filterReadinessItems(items, "complete").length,
    all: items.length,
  };
}

/**
 * Overall readiness is a deterministic severity decision, never a completion
 * percentage. Confirmed blockers take precedence over source availability;
 * critical unavailable data takes precedence over pending and review findings.
 */
export function determineOverallStatus(
  items: ReadinessItem[],
): { status: OverallReadinessState; reason: string } {
  const confirmedBlockers = items.filter(
    (item) => item.status === "blocker" && item.isExecutionBlocker,
  );
  if (confirmedBlockers.length) {
    return {
      status: "BLOCKED",
      reason: `${confirmedBlockers.length} confirmed execution blocker${confirmedBlockers.length === 1 ? "" : "s"} must be resolved.`,
    };
  }

  const nonExecutionBlockers = items.filter(
    (item) => item.status === "blocker" && !item.isExecutionBlocker,
  );
  if (nonExecutionBlockers.length) {
    return {
      status: "NOT READY",
      reason: `${nonExecutionBlockers.length} blocker-classified finding${nonExecutionBlockers.length === 1 ? " requires" : "s require"} disposition before readiness can be confirmed.`,
    };
  }

  const criticalUnavailable = items.filter(
    (item) =>
      item.status === "unableToVerify" &&
      item.isCriticalData === true &&
      item.applicability !== "notRequired",
  );
  if (criticalUnavailable.length) {
    return {
      status: "UNABLE TO VERIFY",
      reason: `${criticalUnavailable.length} required critical source check${criticalUnavailable.length === 1 ? " is" : "s are"} unavailable or stale.`,
    };
  }

  const requiredIncomplete = items.filter(
    (item) =>
      (item.status === "pending" || item.status === "unableToVerify") &&
      item.applicability !== "notRequired",
  );
  if (requiredIncomplete.length) {
    return {
      status: "NOT READY",
      reason: `${requiredIncomplete.length} required or undetermined readiness item${requiredIncomplete.length === 1 ? " is" : "s are"} incomplete.`,
    };
  }

  const reviews = items.filter((item) => item.status === "review");
  if (reviews.length) {
    return {
      status: "REVIEW REQUIRED",
      reason: `${reviews.length} finding${reviews.length === 1 ? " requires" : "s require"} qualified human review.`,
    };
  }

  const dayOfActions = items.filter((item) => item.status === "dayOfAction");
  if (dayOfActions.length) {
    return {
      status: "READY WITH DAY-OF ACTIONS",
      reason: `${dayOfActions.length} execution-day action${dayOfActions.length === 1 ? " remains" : "s remain"} after advance prerequisites were completed.`,
    };
  }

  return {
    status: "READY",
    reason: "All required checks are complete and no unresolved blocking items remain.",
  };
}

export function evaluateReadiness(
  items: ReadinessItem[],
  options: EvaluationOptions = {},
): ReadinessEvaluation {
  const now = toDate(options.now);
  const itemsWithCoverage =
    options.requireCompleteCategoryCoverage === false
      ? items
      : addMissingCategoryItems(items);
  const normalizedItems = itemsWithCoverage.map((item) =>
    normalizeReadinessItem(item, { ...options, now }),
  );
  const sortedItems = sortReadinessItems(normalizedItems);
  const actions = deriveActionItems(normalizedItems);
  const counts = calculateStatusCounts(normalizedItems);
  const filterCounts = calculateFilterCounts(normalizedItems);
  const overall = determineOverallStatus(normalizedItems);

  return {
    overallStatus: overall.status,
    overallReason: overall.reason,
    normalizedItems,
    sortedItems,
    actions,
    counts,
    filterCounts,
    defaultFilter: counts.actionNeeded > 0 ? "action-needed" : "all",
    evaluatedAt: now.toISOString(),
  };
}
