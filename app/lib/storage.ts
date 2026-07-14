import type {
  DemoScenarioId,
  ReadinessFilter,
} from "./readiness/types";

export type { DemoScenarioId } from "./readiness/types";

export const SITE_OPTIONS = [
  { id: "hatch", label: "Hatch" },
  { id: "farley", label: "Farley" },
  { id: "vogtle-1-2", label: "Vogtle 1 & 2" },
  { id: "vogtle-3-4", label: "Vogtle 3 & 4" },
] as const;

export type SiteId = (typeof SITE_OPTIONS)[number]["id"];

export const DEMO_SCENARIO_IDS = [
  "ready",
  "blocked",
  "review-required",
  "ready-day-of",
  "unable-to-verify",
] as const satisfies readonly DemoScenarioId[];

export type FeedbackReason =
  | "incorrect-status"
  | "missing-data"
  | "source-link-problem"
  | "missing-readiness-check"
  | "other";

export type StoredReadinessFilter = ReadinessFilter;

export type RecentWorkOrder = {
  workOrderNumber: string;
  site: SiteId;
  scenario: DemoScenarioId;
  viewedAt: string;
};

export type PrototypeFeedback = {
  id: string;
  reason: FeedbackReason;
  relatedCategory: string;
  comment: string;
  expectedStatus?: string;
  createdAt: string;
};

export const DEFAULT_RECENT_WORK_ORDERS: readonly RecentWorkOrder[] = [
  {
    workOrderNumber: "SNC255555",
    site: "hatch",
    scenario: "blocked",
    viewedAt: "",
  },
  {
    workOrderNumber: "SNC255556",
    site: "farley",
    scenario: "ready",
    viewedAt: "",
  },
  {
    workOrderNumber: "SNC255557",
    site: "vogtle-1-2",
    scenario: "review-required",
    viewedAt: "",
  },
  {
    workOrderNumber: "SNC255558",
    site: "vogtle-3-4",
    scenario: "ready-day-of",
    viewedAt: "",
  },
  {
    workOrderNumber: "SNC255559",
    site: "hatch",
    scenario: "unable-to-verify",
    viewedAt: "",
  },
];

export const STORAGE_KEYS = {
  lastSite: "work-order-readiness:v1:last-site",
  recentWorkOrders: "work-order-readiness:v1:recent-work-orders",
  feedback: "work-order-readiness:v1:feedback",
  selectedFilter: "work-order-readiness:v1:selected-filter",
  reviewedOperationalExperience:
    "work-order-readiness:v1:reviewed-operational-experience",
} as const;

const MAX_RECENT_WORK_ORDERS = 8;
const MAX_FEEDBACK_REPORTS = 50;

function canUseStorage() {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  } catch {
    return false;
  }
}

export function readStoredValue<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue === null ? fallback : (JSON.parse(rawValue) as T);
  } catch {
    return fallback;
  }
}

export function writeStoredValue<T>(key: string, value: T) {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function isSiteId(value: unknown): value is SiteId {
  return SITE_OPTIONS.some((site) => site.id === value);
}

export function isDemoScenarioId(value: unknown): value is DemoScenarioId {
  return DEMO_SCENARIO_IDS.some((scenario) => scenario === value);
}

function isRecentWorkOrder(value: unknown): value is RecentWorkOrder {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<RecentWorkOrder>;
  return (
    typeof candidate.workOrderNumber === "string" &&
    candidate.workOrderNumber.trim().length > 0 &&
    isSiteId(candidate.site) &&
    isDemoScenarioId(candidate.scenario) &&
    typeof candidate.viewedAt === "string"
  );
}

function isFeedbackReason(value: unknown): value is FeedbackReason {
  return (
    value === "incorrect-status" ||
    value === "missing-data" ||
    value === "source-link-problem" ||
    value === "missing-readiness-check" ||
    value === "other"
  );
}

function isPrototypeFeedback(value: unknown): value is PrototypeFeedback {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PrototypeFeedback>;
  return (
    typeof candidate.id === "string" &&
    isFeedbackReason(candidate.reason) &&
    typeof candidate.relatedCategory === "string" &&
    typeof candidate.comment === "string" &&
    typeof candidate.createdAt === "string" &&
    (candidate.expectedStatus === undefined ||
      typeof candidate.expectedStatus === "string")
  );
}

export function loadLastSite(): SiteId {
  const storedSite = readStoredValue<unknown>(STORAGE_KEYS.lastSite, "hatch");
  return isSiteId(storedSite) ? storedSite : "hatch";
}

export function saveLastSite(site: SiteId) {
  return writeStoredValue(STORAGE_KEYS.lastSite, site);
}

export function loadRecentWorkOrders(): RecentWorkOrder[] {
  const storedRecents = readStoredValue<unknown>(
    STORAGE_KEYS.recentWorkOrders,
    DEFAULT_RECENT_WORK_ORDERS,
  );

  if (!Array.isArray(storedRecents)) {
    return [...DEFAULT_RECENT_WORK_ORDERS];
  }

  const validRecents = storedRecents
    .filter(isRecentWorkOrder)
    .slice(0, MAX_RECENT_WORK_ORDERS);

  return validRecents.length > 0
    ? validRecents
    : [...DEFAULT_RECENT_WORK_ORDERS];
}

export function addRecentWorkOrder(
  entry: Omit<RecentWorkOrder, "viewedAt"> & { viewedAt?: string },
) {
  const normalizedEntry: RecentWorkOrder = {
    ...entry,
    workOrderNumber: entry.workOrderNumber.trim().toUpperCase(),
    viewedAt: entry.viewedAt ?? new Date().toISOString(),
  };

  const nextRecents = [
    normalizedEntry,
    ...loadRecentWorkOrders().filter(
      (recent) =>
        recent.workOrderNumber.toUpperCase() !==
        normalizedEntry.workOrderNumber,
    ),
  ].slice(0, MAX_RECENT_WORK_ORDERS);

  writeStoredValue(STORAGE_KEYS.recentWorkOrders, nextRecents);
  return nextRecents;
}

export function loadFeedbackReports(): PrototypeFeedback[] {
  const storedFeedback = readStoredValue<unknown>(STORAGE_KEYS.feedback, []);
  return Array.isArray(storedFeedback)
    ? storedFeedback.filter(isPrototypeFeedback).slice(0, MAX_FEEDBACK_REPORTS)
    : [];
}

export function saveFeedbackReport(
  report: Omit<PrototypeFeedback, "id" | "createdAt">,
) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `prototype-feedback-${Date.now()}`;
  const savedReport: PrototypeFeedback = {
    ...report,
    id,
    comment: report.comment.trim(),
    createdAt: new Date().toISOString(),
  };
  const nextReports = [savedReport, ...loadFeedbackReports()].slice(
    0,
    MAX_FEEDBACK_REPORTS,
  );

  return writeStoredValue(STORAGE_KEYS.feedback, nextReports)
    ? savedReport
    : null;
}

export function loadSelectedFilter(): StoredReadinessFilter {
  const storedFilter = readStoredValue<unknown>(
    STORAGE_KEYS.selectedFilter,
    "action-needed",
  );
  return storedFilter === "action-needed" ||
    storedFilter === "blockers" ||
    storedFilter === "review" ||
    storedFilter === "pending" ||
    storedFilter === "complete" ||
    storedFilter === "all"
    ? storedFilter
    : "action-needed";
}

export function saveSelectedFilter(filter: StoredReadinessFilter) {
  return writeStoredValue(STORAGE_KEYS.selectedFilter, filter);
}

export function loadReviewedOperationalExperienceIds(): string[] {
  const storedIds = readStoredValue<unknown>(
    STORAGE_KEYS.reviewedOperationalExperience,
    [],
  );
  return Array.isArray(storedIds)
    ? storedIds.filter((id): id is string => typeof id === "string")
    : [];
}

export function saveReviewedOperationalExperienceIds(ids: readonly string[]) {
  return writeStoredValue(
    STORAGE_KEYS.reviewedOperationalExperience,
    [...new Set(ids)],
  );
}
