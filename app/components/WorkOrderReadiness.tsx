"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createMockReadinessService } from "../lib/readiness/service";
import {
  READINESS_CATEGORY_LABELS,
  type ReadinessItem,
  type ReadinessViewModel,
  type Site,
} from "../lib/readiness/types";
import {
  SITE_OPTIONS,
  isDemoScenarioId,
  isSiteId,
  loadReviewedOperationalExperienceIds,
  saveReviewedOperationalExperienceIds,
  type DemoScenarioId,
  type SiteId,
} from "../lib/storage";
import { DEMO_SCENARIOS, DemoScenarioSelector } from "./DemoScenarioSelector";
import { FeedbackPanel } from "./FeedbackPanel";
import { PrototypeBanner } from "./PrototypeBanner";
import { ReadinessCard } from "./ReadinessCard";
import { ReadinessItemDialog } from "./ReadinessItemDialog";
import {
  ReadinessNavigation,
  type ReadinessMainView,
} from "./ReadinessNavigation";
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
  const [activeView, setActiveView] = useState<ReadinessMainView>("overview");
  const [selectedItem, setSelectedItem] = useState<ReadinessItem | null>(null);
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

  const unresolvedItems = useMemo(() => {
    if (!viewModel) return [];
    return viewModel.evaluation.sortedItems.filter(
      (item) => item.status !== "complete" && item.status !== "notApplicable",
    );
  }, [viewModel]);

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
  const priorityItems = unresolvedItems.slice(0, 3);

  return (
    <div className="readiness-app">
      <a className="skip-link" href="#readiness-main">
        Skip to readiness workspace
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
      <PrototypeBanner compact />

      <main className="readiness-main" id="readiness-main" tabIndex={-1}>
        <div className="readiness-toolbar">
          <div>
            <p className="eyebrow">Field readiness</p>
            <p>Select an area to see its status, record number, and next action.</p>
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

        <p className="sr-status" aria-live="polite" role="status">
          {refreshMessage}
        </p>

        <div className="field-workspace">
          <ReadinessNavigation
            actionCount={viewModel.evaluation.counts.actionNeeded}
            activeView={activeView}
            changeCount={viewModel.scenario.changes.length}
            items={viewModel.evaluation.normalizedItems}
            onOpenItem={(item) => setSelectedItem(item)}
            onSelectView={setActiveView}
            openItemId={selectedItem?.id}
          />

          <div
            aria-label="Selected readiness view"
            className="field-workspace__content"
            id="readiness-workspace-panel"
            role="region"
          >
            <ReadinessSummary
              evaluation={viewModel.evaluation}
              onRefresh={refreshData}
              refreshing={refreshing}
              sourceAvailability={viewModel.scenario.sourceAvailability}
              workOrder={viewModel.workOrder}
            />

            {activeView === "overview" ? (
              <section
                className="workspace-panel workspace-panel--below-summary"
                aria-labelledby="overview-title"
              >
                <div className="workspace-panel__heading">
                  <div>
                    <p className="eyebrow">Overview</p>
                    <h2 id="overview-title">Start with what needs attention</h2>
                  </div>
                  {unresolvedItems.length > 3 ? (
                    <button
                      className="button button--tertiary"
                      onClick={() => setActiveView("action-needed")}
                      type="button"
                    >
                      View all {unresolvedItems.length}
                    </button>
                  ) : null}
                </div>

                <div className="field-start-note">
                  <span aria-hidden="true">1</span>
                  <div>
                    <h3>Choose a readiness area from the menu.</h3>
                    <p>
                      Its status, synthetic record number, and full details open
                      in one popup.
                    </p>
                  </div>
                </div>

                {priorityItems.length > 0 ? (
                  <div className="field-priority-list" aria-label="Highest priority items">
                    {priorityItems.map((item) => (
                      <ReadinessCard
                        item={item}
                        key={item.id}
                        onOpenDetails={(nextItem) => setSelectedItem(nextItem)}
                      />
                    ))}
                  </div>
                ) : (
                  <section
                    className="no-actions-summary"
                    aria-labelledby="no-actions-title"
                  >
                    <span aria-hidden="true">✓</span>
                    <div>
                      <h2 id="no-actions-title">No unresolved action items</h2>
                      <p>
                        Required demonstration checks are complete. Continue to
                        verify approved sources and field conditions before work.
                      </p>
                    </div>
                  </section>
                )}
              </section>
            ) : null}

            {activeView === "action-needed" ? (
              <section
                className="workspace-panel workspace-panel--below-summary"
                aria-labelledby="actions-title"
              >
                <div className="workspace-panel__heading">
                  <div>
                    <p className="eyebrow">Action needed</p>
                    <h2 id="actions-title">Resolve these items first</h2>
                    <p>Sorted by impact. Select an item for the record and next action.</p>
                  </div>
                  <span className="workspace-panel__count">
                    {unresolvedItems.length}
                  </span>
                </div>

                {unresolvedItems.length > 0 ? (
                  <div className="field-priority-list">
                    {unresolvedItems.map((item) => (
                      <ReadinessCard
                        item={item}
                        key={item.id}
                        onOpenDetails={(nextItem) => setSelectedItem(nextItem)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state empty-state--panel">
                    <span aria-hidden="true">✓</span>
                    <h3>No unresolved items</h3>
                    <p>No missing result was converted into a passing status.</p>
                  </div>
                )}
              </section>
            ) : null}

            {activeView === "changes" ? (
              <section className="workspace-panel workspace-panel--component workspace-panel--below-summary" aria-label="What changed">
                <WhatChanged changes={viewModel.scenario.changes} />
              </section>
            ) : null}

            {activeView === "feedback" ? (
              <section className="workspace-panel workspace-panel--component workspace-panel--below-summary" aria-label="Report information">
                <FeedbackPanel categories={categoryLabels} />
              </section>
            ) : null}
          </div>
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

      <ReadinessItemDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onMarkOperationalExperienceReviewed={markOeReviewed}
        referenceTime={viewModel.evaluation.evaluatedAt}
        reviewedOperationalExperienceIds={reviewedOeIds}
      />
    </div>
  );
}

function siteIdToSite(siteId: SiteId): Site {
  return (
    SITE_OPTIONS.find((site) => site.id === siteId)?.label ?? "Hatch"
  ) as Site;
}
