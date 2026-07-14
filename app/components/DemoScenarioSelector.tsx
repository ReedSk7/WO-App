"use client";

import { useId } from "react";
import type { DemoScenarioId } from "../lib/storage";

export const DEMO_SCENARIOS: readonly {
  id: DemoScenarioId;
  label: string;
  workOrderNumber: string;
}[] = [
  { id: "blocked", label: "Blocked", workOrderNumber: "SNC255555" },
  { id: "ready", label: "Ready", workOrderNumber: "SNC255556" },
  {
    id: "review-required",
    label: "Review Required",
    workOrderNumber: "SNC255557",
  },
  {
    id: "ready-day-of",
    label: "Ready with Day-of Actions",
    workOrderNumber: "SNC255558",
  },
  {
    id: "unable-to-verify",
    label: "Unable to Verify",
    workOrderNumber: "SNC255559",
  },
];

type DemoScenarioSelectorProps = {
  value: DemoScenarioId;
  onChange: (scenario: DemoScenarioId) => void;
  compact?: boolean;
  id?: string;
  className?: string;
};

export function DemoScenarioSelector({
  value,
  onChange,
  compact = false,
  id,
  className = "",
}: DemoScenarioSelectorProps) {
  const generatedId = useId();
  const selectId = id ?? `demo-scenario-${generatedId.replace(/:/g, "")}`;
  const helpId = `${selectId}-help`;

  return (
    <div className={`${compact ? "max-w-xs" : "w-full"} ${className}`}>
      <label
        className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600"
        htmlFor={selectId}
      >
        Demo Scenario
      </label>
      <select
        aria-describedby={helpId}
        className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition hover:border-slate-500 focus-visible:border-blue-700 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        id={selectId}
        onChange={(event) => onChange(event.target.value as DemoScenarioId)}
        value={value}
      >
        {DEMO_SCENARIOS.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.label}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs leading-5 text-slate-500" id={helpId}>
        Prototype control for switching synthetic readiness states.
      </p>
    </div>
  );
}
