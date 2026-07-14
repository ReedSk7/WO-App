"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { filterReadinessItems } from "../lib/readiness/evaluate";
import { createMockReadinessService } from "../lib/readiness/service";
import {
  READINESS_CATEGORY_LABELS,
  type ReadinessFilter,
  type ReadinessViewModel,
  type Site,
} from "../lib/readiness/types";
import {
  SITE_OPTIONS,
  isDemoScenarioId,
  isSiteId,
  loadReviewedOperationalExperienceIds,
  loadSelectedFilter,
  saveReviewedOperationalExperienceIds,
  saveSelectedFilter,
  type DemoScenarioId,
  type SiteId,
} from "../lib/storage";
import { ActionItemsPanel } from "./ActionItemsPanel";
import { ActionSummary } from "./ActionSummary";
import { DEMO_SCENARIOS, DemoScenarioSelector } from "./DemoScenarioSelector";
import { FeedbackPanel } from "./FeedbackPanel";
import { FilterBar } from "./FilterBar";
import { PrototypeBanner } from "./PrototypeBanner";
import { ReadinessCard } from "./ReadinessCard";
import { ReadinessSummary } from "./ReadinessSummary";
import { WhatChanged } from "./WhatChanged";

export type WorkOrderReadinessProps = {
  requestedWorkOrderNumber: string;
  requestedSite?: string;
  requestedScenario?: string;
};

export function WorkOrderReadiness({
  requestedWorkOrderNumber,
  requestedSite,
  requestedScenario,
}: WorkOrderReadinessProps) {
  const router = useRouter();
  const [service] = useState(() => createMockReadinessService());
  const [viewModel, setViewModel] = useState<ReadinessViewModel | null>(null);
  const [loadState, setLoadState] = useState<
    "loading" | "ready" | "not-found" | "error"
  >("loading");
  const [filter, setFilter] = useState<ReadinessFilter>("action-needed");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const [reviewedOeIds, setReviewedOeIds] = useState<Set<string>>(new Set());

  const selectedSiteId: SiteId = isSiteId(requestedSite)
    ? requestedSite
    : "hatch";
  const selectedSite = siteIdToSite(selectedSiteId);

  useEffect(() => {
    let active = true;

    service
      .load({
        workOrderNumber: requestedWorkOrderNumber,
        site: selectedSite,
      })
      .then((model) => {
        if (!active) return;
        if (!model) {
          setViewModel(null);
          setLoadState("not-found");
          return;
        }

        setViewModel(model);
        setReviewedOeIds(new Set(loadReviewedOperationalExperienceIds()));
        const storedFilter = loadSelectedFilter();
        setFilter(
          model.evaluation.counts.actionNeeded > 0
            ? "action-needed"
            : storedFilter === "action-needed"
              ? "all"
              : storedFilter,
        );
        setLoadState("ready");
      })
      .catch(() => {
        if (!active) return;
        setViewModel(null);
        setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [requestedWorkOrderNumber, selectedSite, service]);

  const filteredItems = useMemo(() => {
    if (!viewModel) return [];
    return filterReadinessItems(viewModel.evaluation.sortedItems, filter);
  }, [filter, viewModel]);

  function changeFilter(nextFilter: ReadinessFilter) {
    setFilter(nextFilter);
    saveSelectedFilter(nextFilter);
  }

  function changeScenario(scenario: DemoScenarioId) {
    const definition = DEMO_SCENARIOS.find((item) => item.id === scenario);
    if (!definition) return;
    const query = new URLSearchParams({
      site: selectedSiteId,
      scenario,
    });
    router.push(
      `/work-orders/${definition.workOrderNumber}?${query.toString()}`,
    );
  }

  async function refreshData() {
    if (!viewModel || refreshing) return;
    setRefreshing(true);
    setRefreshMessage("Refreshing synthetic demonstration records…");
    try {
      const refreshedAt = new Date();
      const [nextModel] = await Promise.all([
        service.refresh(
          {
            scenarioId: viewModel.scenario.id,
            site: viewModel.workOrder.site,
          },
          refreshedAt,
        ),
        new Promise((resolve) => window.setTimeout(resolve, 350)),
      ]);
      if (nextModel) {
        setViewModel(nextModel);
        setRefreshMessage(
          "Demonstration timestamps updated. Unavailable source states were preserved.",
        );
      } else {
        setRefreshMessage("The demonstration refresh returned no record.");
      }
    } catch {
      setRefreshMessage(
        "The demonstration refresh failed. Readiness remains unverified until data is checked.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  function markOeReviewed(id: string) {
    setReviewedOeIds((current) => {
      const next = new Set(current);
      next.add(id);
      saveReviewedOperationalExperienceIds([...next]);
      return next;
    });
  }

  const requestedScenarioIsValid = isDemoScenarioId(requestedScenario);

  if (loadState === "loading") {
    return (
      <main className="state-page">
        <PrototypeBanner />
        <section className="state-card" aria-live="polite" role="status">
          <span className="state-icon state-icon-info" aria-hidden="true">
            ↻
          </span>
          <p className="eyebrow">Loading demonstration readiness data</p>
          <h1 className="mono">{requestedWorkOrderNumber}</h1>
          <p>The normalized readiness checks are being prepared.</p>
        </section>
      </main>
    );
  }

  if (loadState === "not-found") {
    return (
      <main className="state-page">
        <PrototypeBanner />
        <section className="state-card" aria-labelledby="missing-record-title">
          <span className="state-icon" aria-hidden="true">
            ?
          </span>
          <p className="eyebrow">Work order not found</p>
          <h1 className="mono" id="missing-record-title">
            {requestedWorkOrderNumber.trim().toUpperCase() || "No number entered"}
          </h1>
          <p>
            This number is not included in the synthetic demonstration dataset.
            No production source system was queried, and no passing result was
            inferred.
          </p>
          <Link className="button button--primary" href="/">
            Return to search
          </Link>
        </section>
      </main>
    );
  }

  if (loadState === "error" || !viewModel) {
    return (
      <main className="state-page">
        <PrototypeBanner />
        <section className="state-card" role="alert">
          <span className="state-icon state-icon-error" aria-hidden="true">
            !
          </span>
          <p className="eyebrow">Source unavailable</p>
          <h1>Readiness could not be determined.</h1>
          <p>
            The local demonstration provider did not return a usable record.
            Verify all information through approved processes before work.
          </p>
          <Link className="button button--primary" href="/">
            Return to search
          </Link>
        </section>
      </main>
    );
  }

  const categoryLabels = Object.values(READINESS_CATEGORY_LABELS);

  return (
    <div className="readiness-app">
      <a className="skip-link" href="#readiness-main">
        Skip to readiness summary
      </a>
      <header className="field-header">
        <div className="field-header__inner">
          <Link className="field-header__back" href="/">
            <span aria-hidden="true">←</span>
            Back to search
          </Link>
          <div className="field-header__brand">
            <span className="field-header__mark" aria-hidden="true">
              FO
            </span>
            <div>
              <p>FIELD OPS</p>
              <span>Work Order Readiness</span>
            </div>
          </div>
          <span className="field-header__demo">Demonstration only</span>
        </div>
      </header>
      <PrototypeBanner />

      <main className="readiness-main" id="readiness-main" tabIndex={-1}>
        <div className="readiness-toolbar">
          <div>
            <p className="eyebrow">Readiness workspace</p>
            <p>
              Review unresolved conditions first, then open any check for its
              demonstration basis and next action.
            </p>
          </div>
          <DemoScenarioSelector
            compact
            value={viewModel.scenario.id}
            onChange={changeScenario}
          />
        </div>

        {!requestedScenarioIsValid && requestedScenario ? (
          <p className="route-notice">
            The unrecognized demo scenario parameter was ignored. The selected
            synthetic work order determined the displayed scenario.
          </p>
        ) : null}

        <ReadinessSummary
          evaluation={viewModel.evaluation}
          onRefresh={refreshData}
          refreshing={refreshing}
          sourceAvailability={viewModel.scenario.sourceAvailability}
          workOrder={viewModel.workOrder}
        />

        <p className="sr-status" aria-live="polite" role="status">
          {refreshMessage}
        </p>

        {viewModel.evaluation.actions.length > 0 ? (
          <ActionSummary
            actions={viewModel.evaluation.actions}
            onViewActionItems={() => {
              setActionsOpen(true);
              window.setTimeout(
                () => document.getElementById("action-items")?.focus(),
                0,
              );
            }}
          />
        ) : (
          <section className="no-actions-summary" aria-labelledby="no-actions-title">
            <span aria-hidden="true">✓</span>
            <div>
              <h2 id="no-actions-title">No unresolved action items</h2>
              <p>
                All required demonstration checks are complete. Continue to
                verify approved sources and field conditions before work.
              </p>
            </div>
          </section>
        )}

        <ActionItemsPanel
          actions={viewModel.evaluation.actions}
          onClose={() => setActionsOpen(false)}
          open={actionsOpen}
        />

        <section className="readiness-list-section" aria-labelledby="checks-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Fourteen normalized categories</p>
              <h2 id="checks-title">Readiness Checks</h2>
              <p>
                Showing {filteredItems.length} of {viewModel.evaluation.counts.total}
                {" "}checks. Unresolved checks are sorted by execution impact.
              </p>
            </div>
            {filter !== "all" ? (
              <button
                className="button button--tertiary"
                onClick={() => changeFilter("all")}
                type="button"
              >
                Show all 14 categories
              </button>
            ) : null}
          </div>

          <div className="readiness-sticky">
            <FilterBar
              counts={viewModel.evaluation.filterCounts}
              onChange={changeFilter}
              value={filter}
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state empty-state--panel">
              <span aria-hidden="true">✓</span>
              <h3>No checks match this filter.</h3>
              <p>
                Choose another filter or show all categories. No missing result
                was converted into a passing status.
              </p>
            </div>
          ) : (
            <div className="readiness-list">
              {filteredItems.map((item) => (
                <ReadinessCard
                  item={item}
                  key={item.id}
                  onMarkOperationalExperienceReviewed={markOeReviewed}
                  referenceTime={viewModel.evaluation.evaluatedAt}
                  reviewedOperationalExperienceIds={reviewedOeIds}
                />
              ))}
            </div>
          )}
        </section>

        <div className="supporting-grid">
          <WhatChanged changes={viewModel.scenario.changes} />
          <FeedbackPanel categories={categoryLabels} />
        </div>

        <footer className="readiness-footer">
          <p>
            Synthetic demonstration data only. This prototype does not authorize
            work or replace approved work-management, clearance, permit,
            operational, qualification, document-control, or field-verification
            processes.
          </p>
        </footer>
      </main>
    </div>
  );
}

function siteIdToSite(siteId: SiteId): Site {
  return (
    SITE_OPTIONS.find((site) => site.id === siteId)?.label ?? "Hatch"
  ) as Site;
}
