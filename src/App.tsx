import { useMemo, useState } from 'react';
import { DEFAULT_RESPONSE_MODE, PLANNER_RESPONSE_MODES } from './data/agentGuidance';
import { MAXIMO_TABS } from './data/plannerSamples';
import { useTheme } from './hooks/useTheme';
import type { MaximoTabId, PlannerPackage, PlannerResponseMode, PlannerTabContent } from './types';
import { PLANNER_DISCLAIMER, createPlannerPackage } from './utils/plannerPackage';

type ScreenState = 'input' | 'result';

const exampleInputs = ['DEMO-CR-1001', 'DEMO-MPL-2001', 'DEMO-WO-3001'];

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-light p-4 dark:bg-surface-dark">
      <p className="label">{label}</p>
      <p className="mt-2 break-words text-base font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">{value}</p>
    </div>
  );
}

function ReviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-md border border-border-subtle bg-surface-light p-4 dark:bg-surface-dark">
      <h2 className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 dark:bg-brand-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModeSelector({
  selectedMode,
  onModeChange,
}: {
  selectedMode: PlannerResponseMode;
  onModeChange: (mode: PlannerResponseMode) => void;
}) {
  return (
    <section aria-label="Response mode" className="rounded-md border border-border-subtle bg-surface-raisedLight p-2 dark:bg-surface-raisedDark">
      <div className="grid gap-2 sm:grid-cols-2">
        {PLANNER_RESPONSE_MODES.map((mode) => {
          const selected = mode.id === selectedMode;
          return (
            <button
              aria-pressed={selected}
              className={`rounded-md border px-3 py-3 text-left transition ${
                selected
                  ? 'border-brand-500 bg-surface-light text-texttone-primaryLight shadow-sm dark:border-brand-400 dark:bg-surface-dark dark:text-texttone-primaryDark'
                  : 'border-transparent text-texttone-secondaryLight hover:bg-surface-light hover:text-texttone-primaryLight dark:text-texttone-secondaryDark dark:hover:bg-surface-dark dark:hover:text-texttone-primaryDark'
              }`}
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              type="button"
            >
              <span className="block text-sm font-semibold">{mode.label}</span>
              <span className="mt-1 block text-xs leading-5">{mode.summary}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TabButton({
  active,
  label,
  tabId,
  onClick,
}: {
  active: boolean;
  label: string;
  tabId: MaximoTabId;
  onClick: (tabId: MaximoTabId) => void;
}) {
  return (
    <button
      aria-controls={`tabpanel-${tabId}`}
      aria-selected={active}
      className={`min-h-10 shrink-0 border-b-2 px-4 text-sm font-semibold transition ${
        active
          ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:border-brand-400 dark:text-brand-400'
          : 'border-transparent text-texttone-secondaryLight hover:bg-surface-raisedLight hover:text-texttone-primaryLight dark:text-texttone-secondaryDark dark:hover:bg-surface-raisedDark dark:hover:text-texttone-primaryDark'
      }`}
      id={`tab-${tabId}`}
      onClick={() => onClick(tabId)}
      role="tab"
      type="button"
    >
      {label}
    </button>
  );
}

function TabPanel({ tab }: { tab: PlannerTabContent }) {
  return (
    <section
      aria-labelledby={`tab-${tab.id}`}
      className="rounded-b-md border border-t-0 border-border-subtle bg-surface-light p-5 dark:bg-surface-dark"
      id={`tabpanel-${tab.id}`}
      role="tabpanel"
    >
      <h2 className="text-lg font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">{tab.label}</h2>
      <div className="mt-4 space-y-3 text-sm leading-6 text-texttone-primaryLight dark:text-texttone-primaryDark">
        {tab.lines.map((line) => {
          const isGroupHeading = line.endsWith(':');
          const isBullet = line.startsWith('- ');
          return (
            <p
              className={
                isGroupHeading
                  ? 'mt-5 font-semibold'
                  : isBullet
                    ? 'pl-4 text-texttone-secondaryLight dark:text-texttone-secondaryDark'
                    : undefined
              }
              key={line}
            >
              {line}
            </p>
          );
        })}
      </div>
    </section>
  );
}

function InputScreen({
  input,
  error,
  selectedMode,
  onInputChange,
  onModeChange,
  onAnalyze,
}: {
  input: string;
  error: string;
  selectedMode: PlannerResponseMode;
  onInputChange: (value: string) => void;
  onModeChange: (mode: PlannerResponseMode) => void;
  onAnalyze: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-8 sm:px-6" id="main-content" tabIndex={-1}>
      <section className="animate-fade-in rounded-panel border border-border-subtle bg-surface-light p-5 shadow-panel dark:bg-surface-dark sm:p-7">
        <div className="border-b border-border-subtle pb-5">
          <p className="label">WO Planning Agent MVP</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-texttone-primaryLight dark:text-texttone-primaryDark sm:text-3xl">
            Work order planning agent
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
            Paste a fake CR, MPL, work order number, or short condition note. The app creates a conservative demo planning package with
            Maximo-style tabs for planner review.
          </p>
        </div>

        <div className="pt-6">
          <ModeSelector onModeChange={onModeChange} selectedMode={selectedMode} />

          <label className="label mt-5 block" htmlFor="planner-input">
            paste or type CR/MPL/Work order number
          </label>
          <textarea
            aria-describedby="planner-input-help planner-input-error"
            className="input mt-2 min-h-36 resize-y text-base"
            id="planner-input"
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Try DEMO-CR-1001, DEMO-MPL-2001, DEMO-WO-3001, or describe the issue."
            value={input}
          />
          <p className="helper mt-2" id="planner-input-help">
            Sample inputs: {exampleInputs.join(', ')}. Use fictional/demo information only.
          </p>
          {error ? (
            <p className="mt-3 rounded-md border border-status-danger/40 bg-status-danger/10 px-3 py-2 text-sm font-semibold text-status-danger" id="planner-input-error">
              {error}
            </p>
          ) : (
            <span className="sr-only" id="planner-input-error">
              No input error.
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-texttone-secondaryLight dark:text-texttone-secondaryDark">{PLANNER_DISCLAIMER}</p>
          <button className="btn w-full sm:w-auto" onClick={onAnalyze} type="button">
            Analyze
          </button>
        </div>
      </section>
    </main>
  );
}

function AssistantGuidancePanel({ plannerPackage }: { plannerPackage: PlannerPackage }) {
  return (
    <section className="rounded-md border border-border-subtle bg-surface-light p-4 dark:bg-surface-dark" aria-label="Planning assistant guidance">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <p className="label">Planning assistant guidance</p>
          <h2 className="mt-2 text-lg font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">
            {plannerPackage.modeLabel}
          </h2>
          <p className="mt-2 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">{plannerPackage.modeSummary}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-texttone-secondaryLight dark:text-texttone-secondaryDark">Source grounding</p>
            <p className="mt-2 text-sm leading-6 text-texttone-primaryLight dark:text-texttone-primaryDark">
              Use the highest applicable approved source class and state conflicts plainly.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-texttone-secondaryLight dark:text-texttone-secondaryDark">Limits</p>
            <p className="mt-2 text-sm leading-6 text-texttone-primaryLight dark:text-texttone-primaryDark">
              No live system access, work authorization, or operability decision is represented.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-texttone-secondaryLight dark:text-texttone-secondaryDark">Output discipline</p>
            <p className="mt-2 text-sm leading-6 text-texttone-primaryLight dark:text-texttone-primaryDark">
              Separate facts, assumptions, missing information, risks, and planner next actions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultScreen({
  activeTabId,
  plannerPackage,
  onActiveTabChange,
  onStartOver,
}: {
  activeTabId: MaximoTabId;
  plannerPackage: PlannerPackage;
  onActiveTabChange: (tabId: MaximoTabId) => void;
  onStartOver: () => void;
}) {
  const activeTab = useMemo(
    () => plannerPackage.tabs.find((tab) => tab.id === activeTabId) ?? plannerPackage.tabs[0],
    [activeTabId, plannerPackage.tabs],
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-workbench px-4 py-6 sm:px-6 lg:px-8" id="main-content" tabIndex={-1}>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 border-b border-border-subtle pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="label">Draft planner package</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-texttone-primaryLight dark:text-texttone-primaryDark sm:text-3xl">
              {plannerPackage.title}
            </h1>
            <p className="mt-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
              {plannerPackage.recordType} record: {plannerPackage.recordNumber}
            </p>
          </div>
          <button className="btn-secondary w-full sm:w-auto" onClick={onStartOver} type="button">
            Start over
          </button>
        </header>

        <section className="rounded-md border border-status-warning/60 bg-status-warning/15 p-4 text-sm leading-6 text-texttone-primaryLight dark:text-texttone-primaryDark">
          {PLANNER_DISCLAIMER}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Planner package summary">
          <SummaryTile label="Mode" value={plannerPackage.modeLabel} />
          <SummaryTile label="Match" value={plannerPackage.status} />
          <SummaryTile label="Confidence" value={`${plannerPackage.confidence}/100`} />
          <SummaryTile label="Asset" value={plannerPackage.asset} />
        </section>

        <AssistantGuidancePanel plannerPackage={plannerPackage} />

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <ReviewList items={plannerPackage.knownFacts} title="Known Conditions" />
          <ReviewList items={plannerPackage.assumptions} title="Assumptions" />
          <ReviewList items={plannerPackage.informationGaps} title="Information Gaps" />
          <ReviewList items={plannerPackage.risks} title="Risks" />
          <ReviewList items={plannerPackage.plannerNextActions} title="Planner Next Actions" />
        </div>

        <section aria-label="Maximo-style planning details" className="min-w-0">
          <div
            aria-label="Maximo planning tabs"
            className="flex overflow-x-auto rounded-t-md border border-border-subtle bg-surface-light dark:bg-surface-dark"
            role="tablist"
          >
            {MAXIMO_TABS.map((tab) => (
              <TabButton active={tab.id === activeTab.id} key={tab.id} label={tab.label} onClick={onActiveTabChange} tabId={tab.id} />
            ))}
          </div>
          <TabPanel tab={activeTab} />
        </section>
      </div>
    </main>
  );
}

export default function App() {
  useTheme();

  const [screen, setScreen] = useState<ScreenState>('input');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [selectedMode, setSelectedMode] = useState<PlannerResponseMode>(DEFAULT_RESPONSE_MODE);
  const [activeTabId, setActiveTabId] = useState<MaximoTabId>('workorder');
  const [plannerPackage, setPlannerPackage] = useState<PlannerPackage | null>(null);

  function analyzeInput() {
    if (!input.trim()) {
      setError('Enter a fake CR, MPL, work order number, or demo condition note before analyzing.');
      return;
    }

    setError('');
    setPlannerPackage(createPlannerPackage(input, new Date(), selectedMode));
    setActiveTabId('workorder');
    setScreen('result');
  }

  function startOver() {
    setScreen('input');
    setPlannerPackage(null);
    setActiveTabId('workorder');
    setError('');
  }

  return (
    <div className="min-h-screen bg-canvas-light text-texttone-primaryLight dark:bg-canvas-dark dark:text-texttone-primaryDark">
      <a
        className="sr-only z-[60] rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#main-content"
      >
        Skip to main content
      </a>
      {screen === 'result' && plannerPackage ? (
        <ResultScreen
          activeTabId={activeTabId}
          onActiveTabChange={setActiveTabId}
          onStartOver={startOver}
          plannerPackage={plannerPackage}
        />
      ) : (
        <InputScreen
          error={error}
          input={input}
          onAnalyze={analyzeInput}
          onInputChange={setInput}
          onModeChange={setSelectedMode}
          selectedMode={selectedMode}
        />
      )}
    </div>
  );
}
