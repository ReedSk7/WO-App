import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error -- Node's direct TypeScript runner requires an explicit extension.
import { calculateStatusCounts, deriveActionItems, determineOverallStatus, evaluateReadiness, normalizePermitControl, normalizeReadinessItem, sortReadinessItems } from "../app/lib/readiness/evaluate.ts";
// @ts-expect-error -- Node's direct TypeScript runner requires an explicit extension.
import { getMockScenario, MOCK_SCENARIOS } from "../app/lib/readiness/mock-scenarios.ts";
import type {
  PermitControlRecord,
  ReadinessItem,
  ReadinessStatus,
} from "../app/lib/readiness/types.ts";
// @ts-expect-error -- Node's direct TypeScript runner requires an explicit extension.
import { READINESS_CATEGORIES } from "../app/lib/readiness/types.ts";
// @ts-expect-error -- Node's direct TypeScript runner requires an explicit extension.
import { MockWorkOrderReadinessProvider } from "../app/lib/providers/mock.ts";

const NOW = new Date("2026-07-14T16:00:00.000Z");
const FRESH = "2026-07-14T15:30:00.000Z";
const STALE = "2026-07-13T12:00:00.000Z";
const ISOLATED_OPTIONS = {
  now: NOW,
  requireCompleteCategoryCoverage: false,
} as const;

function item(
  status: ReadinessStatus,
  overrides: Partial<ReadinessItem> = {},
): ReadinessItem {
  return {
    id: overrides.id ?? `item-${status}`,
    category: overrides.category ?? "safety-and-job-hazards",
    title: overrides.title ?? `Synthetic ${status} item`,
    shortResult: overrides.shortResult ?? "Synthetic result",
    status,
    isExecutionBlocker: overrides.isExecutionBlocker ?? status === "blocker",
    applicability: overrides.applicability ?? "required",
    sourceSystem: overrides.sourceSystem ?? "Demonstration Dataset",
    sourceRecordLabel: overrides.sourceRecordLabel ?? "DEMO-RECORD",
    lastCheckedAt: overrides.lastCheckedAt ?? FRESH,
    verificationMethod: overrides.verificationMethod ?? "inferredDemo",
    sourceAvailability: overrides.sourceAvailability ?? "available",
    requiresSourceVerification: overrides.requiresSourceVerification ?? true,
    isCriticalData: overrides.isCriticalData ?? false,
    ...overrides,
  };
}

function permit(
  overrides: Partial<PermitControlRecord> = {},
): PermitControlRecord {
  return {
    id: "permit-1",
    type: "Radiation Work Permit",
    applicability: "Required",
    lifecycleStatus: "Requested",
    readinessClassification: "complete",
    lastVerifiedAt: FRESH,
    verificationMethod: "inferredDemo",
    sourceAvailability: "available",
    ...overrides,
  };
}

test("mock catalog has the exact five scenarios, synthetic work orders, and all categories", () => {
  const mapping = Object.fromEntries(
    MOCK_SCENARIOS.map((scenario) => [scenario.id, scenario.workOrder.workOrderNumber]),
  );
  assert.deepEqual(mapping, {
    blocked: "SNC255555",
    ready: "SNC255556",
    "review-required": "SNC255557",
    "ready-day-of": "SNC255558",
    "unable-to-verify": "SNC255559",
  });

  for (const scenario of MOCK_SCENARIOS) {
    assert.equal(scenario.items.length, 14);
    assert.deepEqual(
      new Set(scenario.items.map((candidate) => candidate.category)),
      new Set(READINESS_CATEGORIES),
    );
    assert.equal(scenario.workOrder.isSynthetic, true);
  }
});

test("the five demo scenarios evaluate to their intended overall states", () => {
  const expected = {
    blocked: "BLOCKED",
    ready: "READY",
    "review-required": "REVIEW REQUIRED",
    "ready-day-of": "READY WITH DAY-OF ACTIONS",
    "unable-to-verify": "UNABLE TO VERIFY",
  } as const;

  for (const [scenarioId, overall] of Object.entries(expected)) {
    const scenario = getMockScenario(scenarioId as keyof typeof expected);
    const evaluation = evaluateReadiness(scenario.items, { now: new Date() });
    assert.equal(evaluation.overallStatus, overall, scenarioId);
  }
});

test("overall precedence is blocker, critical unavailable, pending, review, day-of, ready", () => {
  const blocker = item("blocker", { id: "blocker", isExecutionBlocker: true });
  const unavailable = item("unableToVerify", {
    id: "unavailable",
    isCriticalData: true,
    verificationMethod: "unableToVerify",
  });
  const pending = item("pending", { id: "pending" });
  const review = item("review", { id: "review" });
  const dayOf = item("dayOfAction", { id: "day-of" });
  const complete = item("complete", { id: "complete" });

  assert.equal(
    evaluateReadiness(
      [dayOf, review, pending, unavailable, blocker],
      ISOLATED_OPTIONS,
    ).overallStatus,
    "BLOCKED",
  );
  assert.equal(
    evaluateReadiness([dayOf, review, pending, unavailable], ISOLATED_OPTIONS)
      .overallStatus,
    "UNABLE TO VERIFY",
  );
  assert.equal(
    evaluateReadiness([dayOf, review, pending], ISOLATED_OPTIONS).overallStatus,
    "NOT READY",
  );
  assert.equal(
    evaluateReadiness([dayOf, review], ISOLATED_OPTIONS).overallStatus,
    "REVIEW REQUIRED",
  );
  assert.equal(
    evaluateReadiness([dayOf], ISOLATED_OPTIONS).overallStatus,
    "READY WITH DAY-OF ACTIONS",
  );
  assert.equal(
    evaluateReadiness([complete], ISOLATED_OPTIONS).overallStatus,
    "READY",
  );
});

test("a blocker-classified item can never fall through to READY", () => {
  const dispositionRequired = item("blocker", {
    isExecutionBlocker: false,
  });
  const evaluation = evaluateReadiness(
    [dispositionRequired],
    ISOLATED_OPTIONS,
  );
  assert.equal(evaluation.overallStatus, "NOT READY");
  assert.match(evaluation.overallReason, /disposition/i);
});

test("missing or stale source verification cannot silently remain green", () => {
  const missing = normalizeReadinessItem(
    item("complete", {
      lastCheckedAt: undefined,
      requiresSourceVerification: true,
      isCriticalData: true,
    }),
    { now: NOW },
  );
  assert.equal(missing.status, "unableToVerify");

  const staleCritical = normalizeReadinessItem(
    item("complete", {
      lastCheckedAt: STALE,
      isCriticalData: true,
      staleAfterMinutes: 60,
    }),
    { now: NOW },
  );
  assert.equal(staleCritical.status, "unableToVerify");

  const staleNoncritical = normalizeReadinessItem(
    item("complete", {
      lastCheckedAt: STALE,
      isCriticalData: false,
      staleAfterMinutes: 60,
    }),
    { now: NOW },
  );
  assert.equal(staleNoncritical.status, "review");
  assert.match(staleNoncritical.shortResult, /Refresh Recommended/);

  const missingNotRequired = normalizeReadinessItem(
    item("notApplicable", {
      applicability: "notRequired",
      verificationMethod: "unableToVerify",
      sourceAvailability: "unavailable",
    }),
    { now: NOW },
  );
  assert.equal(missingNotRequired.status, "unableToVerify");
});

test("empty or incomplete category snapshots cannot evaluate READY", () => {
  const empty = evaluateReadiness([], { now: NOW });
  assert.equal(empty.overallStatus, "UNABLE TO VERIFY");
  assert.equal(empty.counts.unableToVerifyCount, READINESS_CATEGORIES.length);
  assert.ok(empty.actions.every((action) => action.description.length > 0));

  const partialSnapshot = evaluateReadiness([item("complete")], { now: NOW });
  assert.equal(partialSnapshot.overallStatus, "UNABLE TO VERIFY");
  assert.equal(
    partialSnapshot.normalizedItems.length,
    READINESS_CATEGORIES.length,
  );
});

test("partial source responses cannot remain green", () => {
  const critical = normalizeReadinessItem(
    item("complete", {
      sourceAvailability: "partial",
      isCriticalData: true,
    }),
    { now: NOW },
  );
  assert.equal(critical.status, "unableToVerify");

  const noncritical = normalizeReadinessItem(
    item("complete", {
      sourceAvailability: "partial",
      isCriticalData: false,
    }),
    { now: NOW },
  );
  assert.equal(noncritical.status, "review");
  assert.match(noncritical.shortResult, /Refresh Recommended/);
});

test("impact sorting is stable across all status groups", () => {
  const input = [
    item("notApplicable", { id: "na", title: "G" }),
    item("complete", { id: "complete", title: "F" }),
    item("dayOfAction", { id: "day", title: "E" }),
    item("pending", { id: "pending", title: "D" }),
    item("review", { id: "review", title: "C" }),
    item("unableToVerify", { id: "unable", title: "B" }),
    item("blocker", { id: "blocker", title: "A" }),
  ];
  assert.deepEqual(
    sortReadinessItems(input).map((candidate) => candidate.status),
    [
      "blocker",
      "unableToVerify",
      "review",
      "pending",
      "dayOfAction",
      "complete",
      "notApplicable",
    ],
  );
});

test("actions are derived from unresolved checks and counts remain consistent", () => {
  const normalized = [
    normalizeReadinessItem(item("blocker", { id: "b" }), { now: NOW }),
    normalizeReadinessItem(item("review", { id: "r" }), { now: NOW }),
    normalizeReadinessItem(item("pending", { id: "p" }), { now: NOW }),
    normalizeReadinessItem(item("dayOfAction", { id: "d" }), { now: NOW }),
    normalizeReadinessItem(item("unableToVerify", { id: "u" }), { now: NOW }),
    normalizeReadinessItem(item("complete", { id: "c" }), { now: NOW }),
    normalizeReadinessItem(
      item("notApplicable", {
        id: "n",
        applicability: "notRequired",
      }),
      { now: NOW },
    ),
  ];
  const actions = deriveActionItems(normalized);
  assert.equal(actions.length, 5);
  assert.ok(actions.every((action) => action.description.length > 0));
  assert.equal(actions[0]?.impact, "blocking");

  const counts = calculateStatusCounts(normalized);
  assert.equal(counts.total, 7);
  assert.equal(counts.actionNeeded, 5);
  assert.equal(counts.completedChecks, 1);
  assert.equal(counts.confirmedBlockers, 1);
  assert.equal(counts.reviewRequired, 1);
  assert.equal(counts.unableToVerifyCount, 1);

  const evaluation = evaluateReadiness(normalized, ISOLATED_OPTIONS);
  assert.equal(evaluation.defaultFilter, "action-needed");
  assert.equal(evaluation.filterCounts.pending, 2);
  assert.equal(evaluation.filterCounts.complete, 2);
});

test("permit lifecycle normalization enforces readiness invariants", () => {
  assert.equal(
    normalizePermitControl(permit({ sourceStatus: "Created" }), { now: NOW })
      .readinessClassification,
    "pending",
    "created is not ready",
  );
  assert.equal(
    normalizePermitControl(permit({ lifecycleStatus: "Under Review" }), {
      now: NOW,
    }).readinessClassification,
    "pending",
  );
  assert.equal(
    normalizePermitControl(
      permit({
        lifecycleStatus: "Ready for Issuance",
        advancePrerequisitesComplete: true,
        requiresDayOfIssuance: true,
        outstandingPrerequisites: [],
      }),
      { now: NOW },
    ).readinessClassification,
    "dayOfAction",
    "ready for day-of issuance is not a blocker",
  );
  assert.equal(
    normalizePermitControl(
      permit({
        lifecycleStatus: "Ready for Issuance",
        advancePrerequisitesComplete: false,
        requiresDayOfIssuance: true,
      }),
      { now: NOW },
    ).readinessClassification,
    "pending",
  );
  assert.equal(
    normalizePermitControl(
      permit({ applicability: "Not Required", lifecycleStatus: "Not Started" }),
      { now: NOW },
    ).readinessClassification,
    "notApplicable",
  );
  assert.equal(
    normalizePermitControl(
      permit({
        applicability: "Not Required",
        lifecycleStatus: "Not Started",
        sourceAvailability: "unavailable",
        verificationMethod: "unableToVerify",
      }),
      { now: NOW },
    ).readinessClassification,
    "unableToVerify",
    "missing source data is not Not Required",
  );
  assert.equal(
    normalizePermitControl(permit({ lifecycleStatus: "Issued / Active" }), {
      now: NOW,
    }).readinessClassification,
    "complete",
  );
  assert.equal(
    normalizePermitControl(
      permit({
        lifecycleStatus: "Issued / Active",
        advancePrerequisitesComplete: false,
        outstandingPrerequisites: [],
      }),
      { now: NOW },
    ).readinessClassification,
    "pending",
    "issued does not override explicitly incomplete advance prerequisites",
  );
});

test("an empty permit collection cannot remain green without an explicit not-required determination", () => {
  const missingPermitRecords = normalizeReadinessItem(
    item("complete", {
      category: "permits-and-special-controls",
      details: { permits: [] },
    }),
    { now: NOW },
  );
  assert.equal(missingPermitRecords.status, "unableToVerify");

  const explicitlyNotRequired = normalizeReadinessItem(
    item("notApplicable", {
      category: "permits-and-special-controls",
      applicability: "notRequired",
      details: { permits: [] },
    }),
    { now: NOW },
  );
  assert.equal(explicitlyNotRequired.status, "notApplicable");
});

test("required confirmed permit blockers propagate execution-blocker semantics", () => {
  const permitCategory = item("complete", {
    id: "permit-parent",
    category: "permits-and-special-controls",
    isExecutionBlocker: false,
    details: {
      permits: [
        permit({
          lifecycleStatus: "Expired",
          readinessClassification: "complete",
        }),
      ],
    },
  });
  const blocked = evaluateReadiness([permitCategory], ISOLATED_OPTIONS);
  assert.equal(blocked.normalizedItems[0]?.status, "blocker");
  assert.equal(blocked.normalizedItems[0]?.isExecutionBlocker, true);
  assert.equal(blocked.overallStatus, "BLOCKED");

  const requestedParent = normalizeReadinessItem(
    {
      ...permitCategory,
      details: { permits: [permit({ lifecycleStatus: "Requested" })] },
    },
    { now: NOW },
  );
  assert.equal(requestedParent.status, "pending");
  assert.equal(requestedParent.isExecutionBlocker, false);

  const dayOfParent = normalizeReadinessItem(
    {
      ...permitCategory,
      details: {
        permits: [
          permit({
            lifecycleStatus: "Ready for Issuance",
            advancePrerequisitesComplete: true,
            requiresDayOfIssuance: true,
            outstandingPrerequisites: [],
          }),
        ],
      },
    },
    { now: NOW },
  );
  assert.equal(dayOfParent.status, "dayOfAction");
  assert.equal(dayOfParent.isExecutionBlocker, false);
});

test("refresh updates retrievable timestamps but preserves unavailable truth", async () => {
  const provider = new MockWorkOrderReadinessProvider();
  const refreshTime = new Date("2026-07-14T18:00:00.000Z");
  const refreshed = await provider.refreshScenario(
    { scenarioId: "unable-to-verify" },
    refreshTime,
  );
  assert.ok(refreshed);
  assert.equal(refreshed.workOrder.lastDataRefreshAt, refreshTime.toISOString());

  const unavailable = refreshed.items.find(
    (candidate) =>
      candidate.category === "operational-risk-and-plant-conditions",
  );
  assert.equal(unavailable?.status, "unableToVerify");
  assert.equal(unavailable?.verificationMethod, "unableToVerify");
  assert.notEqual(unavailable?.lastCheckedAt, refreshTime.toISOString());

  const available = refreshed.items.find(
    (candidate) => candidate.category === "parts-and-materials",
  );
  assert.equal(available?.lastCheckedAt, refreshTime.toISOString());
});

test("determineOverallStatus can evaluate already-normalized arrays directly", () => {
  assert.equal(determineOverallStatus([item("complete")]).status, "READY");
});
