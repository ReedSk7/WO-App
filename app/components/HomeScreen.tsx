"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_RECENT_WORK_ORDERS,
  SITE_OPTIONS,
  addRecentWorkOrder,
  loadLastSite,
  loadRecentWorkOrders,
  saveLastSite,
  type DemoScenarioId,
  type RecentWorkOrder,
  type SiteId,
} from "../lib/storage";
import {
  DEMO_SCENARIOS,
  DemoScenarioSelector,
} from "./DemoScenarioSelector";
import { PrototypeBanner } from "./PrototypeBanner";

const PROTOTYPE_NOTICE =
  "Prototype using demonstration data. Verify all information in the approved source system before work.";

function scenarioLabel(scenarioId: DemoScenarioId) {
  return (
    DEMO_SCENARIOS.find((scenario) => scenario.id === scenarioId)?.label ??
    "Demonstration"
  );
}

function siteLabel(siteId: SiteId) {
  return SITE_OPTIONS.find((site) => site.id === siteId)?.label ?? siteId;
}

export function HomeScreen() {
  const router = useRouter();
  const [site, setSite] = useState<SiteId>("hatch");
  const [workOrderNumber, setWorkOrderNumber] = useState("SNC255555");
  const [scenario, setScenario] = useState<DemoScenarioId>("blocked");
  const [recentWorkOrders, setRecentWorkOrders] = useState<RecentWorkOrder[]>([
    ...DEFAULT_RECENT_WORK_ORDERS,
  ]);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    const storageRead = window.setTimeout(() => {
      setSite(loadLastSite());
      setRecentWorkOrders(loadRecentWorkOrders());
    }, 0);

    return () => window.clearTimeout(storageRead);
  }, []);

  const recentScenarioMap = useMemo(
    () => new Map(DEMO_SCENARIOS.map((item) => [item.id, item.label])),
    [],
  );

  function navigateToWorkOrder(
    number: string,
    selectedSite: SiteId,
    selectedScenario: DemoScenarioId,
  ) {
    const normalizedNumber = number.trim().toUpperCase();
    if (!normalizedNumber) {
      setValidationMessage(
        "Enter a demonstration work order number before checking readiness.",
      );
      return;
    }
    if (!/^[A-Z0-9-]{3,20}$/.test(normalizedNumber)) {
      setValidationMessage(
        "Use 3–20 letters, numbers, or hyphens for the demonstration work order number.",
      );
      return;
    }

    saveLastSite(selectedSite);
    const recognizedDemo = DEFAULT_RECENT_WORK_ORDERS.find(
      (recent) => recent.workOrderNumber === normalizedNumber,
    );
    if (recognizedDemo) {
      setRecentWorkOrders(
        addRecentWorkOrder({
          workOrderNumber: normalizedNumber,
          site: selectedSite,
          scenario: recognizedDemo.scenario,
        }),
      );
    }
    setValidationMessage("");

    const query = new URLSearchParams({
      site: selectedSite,
      scenario: recognizedDemo?.scenario ?? selectedScenario,
    });
    router.push(
      `/work-orders/${encodeURIComponent(normalizedNumber)}?${query.toString()}`,
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToWorkOrder(workOrderNumber, site, scenario);
  }

  function handleScenarioChange(nextScenario: DemoScenarioId) {
    setScenario(nextScenario);
    const scenarioWorkOrder = DEMO_SCENARIOS.find(
      (item) => item.id === nextScenario,
    )?.workOrderNumber;
    if (scenarioWorkOrder) setWorkOrderNumber(scenarioWorkOrder);
    setValidationMessage("");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <a
        className="sr-only z-50 rounded-md bg-white px-4 py-3 font-bold text-blue-800 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#work-order-search"
      >
        Skip to work order search
      </a>

      <header className="bg-[#0b1f36] text-white">
        <div className="mx-auto flex min-h-16 max-w-[92rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-black tracking-[0.18em]">FIELD OPS</p>
            <p className="text-xs text-slate-300">Work readiness decision support</p>
          </div>
          <span className="hidden rounded-full border border-blue-300/30 bg-blue-200/10 px-3 py-1.5 text-xs font-bold text-blue-100 sm:inline-flex">
            Demonstration only
          </span>
        </div>
      </header>

      <PrototypeBanner />

      <main
        className="mx-auto max-w-[86rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        id="work-order-search"
        tabIndex={-1}
      >
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
          <section aria-labelledby="home-title">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-800">
              Field-first readiness check
            </p>
            <h1
              className="mt-1.5 max-w-3xl text-2xl font-black tracking-tight text-[#0b1f36] sm:text-3xl"
              id="home-title"
            >
              Work Order Readiness
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              See whether a synthetic work order can be executed, what is
              preventing execution, and the next action required.
            </p>
            <p className="mt-2 text-sm font-bold text-slate-700">
              For Mechanical, Electrical, and Instrument &amp; Controls maintenance.
            </p>

            <div className="mt-5 rounded-lg border border-slate-300 bg-white p-4 shadow-sm sm:p-5">
              <form noValidate onSubmit={handleSubmit}>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-bold text-slate-800"
                      htmlFor="site-selector"
                    >
                      Site
                    </label>
                    <select
                      className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-900 outline-none transition hover:border-slate-500 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                      id="site-selector"
                      onChange={(event) => {
                        const nextSite = event.target.value as SiteId;
                        setSite(nextSite);
                        saveLastSite(nextSite);
                      }}
                      value={site}
                    >
                      {SITE_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <DemoScenarioSelector
                    onChange={handleScenarioChange}
                    value={scenario}
                  />
                </div>

                <div className="mt-5">
                  <label
                    className="mb-1.5 block text-sm font-bold text-slate-800"
                    htmlFor="work-order-number"
                  >
                    Work order number
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      aria-describedby={
                        validationMessage
                          ? "work-order-error work-order-hint"
                          : "work-order-hint"
                      }
                      aria-invalid={Boolean(validationMessage)}
                      autoCapitalize="characters"
                      autoComplete="off"
                      className="min-h-12 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 font-mono text-base font-bold uppercase tracking-wide text-slate-950 outline-none placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                      id="work-order-number"
                      inputMode="text"
                      onChange={(event) => {
                        setWorkOrderNumber(event.target.value);
                        if (validationMessage) setValidationMessage("");
                      }}
                      placeholder="Enter demonstration work order"
                      value={workOrderNumber}
                    />
                    <button
                      className="min-h-12 shrink-0 rounded-md bg-blue-700 px-6 py-3 text-base font-black text-white shadow-sm outline-none transition hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:min-w-44"
                      type="submit"
                    >
                      Check Readiness
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-600" id="work-order-hint">
                    Try the synthetic work order <span className="font-mono font-bold">SNC255555</span>.
                  </p>
                  {validationMessage ? (
                    <p
                      className="mt-2 text-sm font-bold text-red-700"
                      id="work-order-error"
                      role="alert"
                    >
                      {validationMessage}
                    </p>
                  ) : null}
                </div>
              </form>
            </div>

            <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-950">
              {PROTOTYPE_NOTICE}
            </p>
          </section>

          <section
            aria-labelledby="recent-work-orders-title"
            className="rounded-lg border border-slate-300 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Demonstration data
              </p>
              <h2
                className="mt-1 text-lg font-black text-[#0b1f36]"
                id="recent-work-orders-title"
              >
                Recent synthetic work orders
              </h2>
            </div>
            <ul className="divide-y divide-slate-200">
              {recentWorkOrders.map((recent) => (
                <li key={`${recent.workOrderNumber}-${recent.scenario}`}>
                  <button
                    className="group flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left outline-none transition hover:bg-slate-50 focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 sm:px-5"
                    onClick={() =>
                      navigateToWorkOrder(
                        recent.workOrderNumber,
                        recent.site,
                        recent.scenario,
                      )
                    }
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-sm font-black tracking-wide text-[#0b1f36]">
                        {recent.workOrderNumber}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {siteLabel(recent.site)} · {recentScenarioMap.get(recent.scenario) ?? scenarioLabel(recent.scenario)}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-xl font-bold text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700 motion-reduce:transform-none"
                    >
                      ›
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
