"use client";

import {
  READINESS_CATEGORY_LABELS,
  type ReadinessCategory,
  type ReadinessItem,
} from "@/app/lib/readiness/types";
import { getStatusPresentation } from "./StatusBadge";

export type ReadinessMainView =
  | "overview"
  | "action-needed"
  | "changes"
  | "feedback";

type ReadinessNavigationProps = {
  items: ReadinessItem[];
  activeView: ReadinessMainView;
  actionCount: number;
  changeCount: number;
  openItemId?: string;
  onSelectView: (view: ReadinessMainView) => void;
  onOpenItem: (item: ReadinessItem, trigger: HTMLElement) => void;
};

const SHORT_CATEGORY_LABELS: Record<ReadinessCategory, string> = {
  "safety-and-job-hazards": "Safety & Hazards",
  "clearance-and-energy-control": "Clearance & Energy",
  "equipment-history-and-impact": "Equipment History",
  "operational-risk-and-plant-conditions": "Plant Conditions",
  "permits-and-special-controls": "Permits & Controls",
  "scaffolding-and-access": "Scaffold & Access",
  "parts-and-materials": "Parts & Materials",
  "tools-and-test-equipment": "Tools & Test Equipment",
  "work-package-and-procedures": "Work Package",
  "walkdown-and-task-preview": "Walkdown & Preview",
  "support-group-coordination": "Support Groups",
  "operational-experience": "Operating Experience",
  "workforce-readiness": "Workforce",
  "testing-and-restoration": "Testing & Restoration",
};

const CATEGORY_GROUPS: Array<{
  label: string;
  categories: ReadinessCategory[];
}> = [
  {
    label: "Work controls",
    categories: [
      "safety-and-job-hazards",
      "clearance-and-energy-control",
      "operational-risk-and-plant-conditions",
      "permits-and-special-controls",
      "scaffolding-and-access",
    ],
  },
  {
    label: "Job resources",
    categories: [
      "parts-and-materials",
      "tools-and-test-equipment",
      "work-package-and-procedures",
      "walkdown-and-task-preview",
      "support-group-coordination",
      "workforce-readiness",
    ],
  },
  {
    label: "Review & restore",
    categories: [
      "equipment-history-and-impact",
      "operational-experience",
      "testing-and-restoration",
    ],
  },
];

const MAIN_VIEWS: Array<{
  value: ReadinessMainView;
  label: string;
  glyph: string;
}> = [
  { value: "overview", label: "Overview", glyph: "⌂" },
  { value: "action-needed", label: "Action Needed", glyph: "!" },
];

const SECONDARY_VIEWS: Array<{
  value: ReadinessMainView;
  label: string;
  glyph: string;
}> = [
  { value: "changes", label: "What Changed", glyph: "↻" },
  { value: "feedback", label: "Report Information", glyph: "✎" },
];

export function ReadinessNavigation({
  items,
  activeView,
  actionCount,
  changeCount,
  openItemId,
  onSelectView,
  onOpenItem,
}: ReadinessNavigationProps) {
  const itemByCategory = new Map(items.map((item) => [item.category, item]));

  function renderViewButton(view: (typeof MAIN_VIEWS)[number]) {
    const selected = activeView === view.value;
    const count =
      view.value === "action-needed"
        ? actionCount
        : view.value === "changes"
          ? changeCount
          : null;
    return (
      <button
        aria-controls="readiness-workspace-panel"
        aria-pressed={selected}
        className={`readiness-nav-view${selected ? " readiness-nav-view--active" : ""}`}
        key={view.value}
        onClick={() => onSelectView(view.value)}
        type="button"
      >
        <span className="readiness-nav-view__glyph" aria-hidden="true">
          {view.glyph}
        </span>
        <span>{view.label}</span>
        {count !== null ? (
          <span className="readiness-nav-view__count" aria-label={`${count} items`}>
            {count}
          </span>
        ) : null}
      </button>
    );
  }

  function renderCategoryGroup(
    group: (typeof CATEGORY_GROUPS)[number],
  ) {
    return (
      <section className="readiness-nav-group" key={group.label}>
        <h3>{group.label}</h3>
        <div className="readiness-nav-group__items">
          {group.categories.map((category) => {
            const item = itemByCategory.get(category);
            if (!item) return null;
            const status = getStatusPresentation(item.status);
            const open = openItemId === item.id;
            return (
              <button
                aria-haspopup="dialog"
                className={`readiness-nav-item readiness-nav-item--${status.tone}${
                  open ? " readiness-nav-item--open" : ""
                }`}
                key={item.id}
                onClick={(event) => onOpenItem(item, event.currentTarget)}
                title={READINESS_CATEGORY_LABELS[category]}
                type="button"
              >
                <span className="readiness-nav-item__glyph" aria-hidden="true">
                  {status.glyph}
                </span>
                <span className="readiness-nav-item__copy">
                  <strong>{SHORT_CATEGORY_LABELS[category]}</strong>
                  <small>{status.label}</small>
                </span>
                <span className="readiness-nav-item__chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <aside className="readiness-navigation" aria-label="Readiness workspace menu">
      <div className="readiness-navigation__heading">
        <p className="eyebrow">Start here</p>
        <h2>Choose what to check</h2>
      </div>

      <nav className="readiness-navigation__views" aria-label="Workspace views">
        {MAIN_VIEWS.map(renderViewButton)}
      </nav>

      <div className="readiness-navigation__mobile-picker">
        <label htmlFor="readiness-area-select">Open a readiness area</label>
        <select
          id="readiness-area-select"
          defaultValue=""
          onChange={(event) => {
            const item = items.find((candidate) => candidate.id === event.target.value);
            if (item) onOpenItem(item, event.currentTarget);
            event.currentTarget.value = "";
          }}
        >
          <option value="">Select an area…</option>
          {CATEGORY_GROUPS.flatMap((group) =>
            group.categories.map((category) => {
              const item = itemByCategory.get(category);
              if (!item) return null;
              const status = getStatusPresentation(item.status);
              return (
                <option key={item.id} value={item.id}>
                  {SHORT_CATEGORY_LABELS[category]} — {status.label}
                </option>
              );
            }),
          )}
        </select>
      </div>

      <div className="readiness-navigation__groups">
        {renderCategoryGroup(CATEGORY_GROUPS[0])}
        <details className="readiness-navigation__more">
          <summary>More readiness checks</summary>
          {CATEGORY_GROUPS.slice(1).map(renderCategoryGroup)}
        </details>
      </div>

      <details className="readiness-navigation__tools">
        <summary>More tools</summary>
        <nav aria-label="Additional workspace views">
          {SECONDARY_VIEWS.map(renderViewButton)}
        </nav>
      </details>
    </aside>
  );
}
