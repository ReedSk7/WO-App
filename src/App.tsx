import { useMemo, useState } from 'react';
import { DEFAULT_RESPONSE_MODE, PLANNER_RESPONSE_MODES } from './data/agentGuidance';
import { MAXIMO_TABS } from './data/plannerSamples';
import { ToastRegion } from './components/ui/ToastRegion';
import { useClipboard } from './hooks/useClipboard';
import { useTheme } from './hooks/useTheme';
import { loadCurrentPlannerReviewSession, upsertPlannerReviewSession } from './storage/local';
import type { MaximoTabId, PlannerPackage, PlannerResponseMode, PlannerReviewSession, PlannerTabEdits, PlannerTabContent } from './types';
import { PLANNER_DISCLAIMER, createPlannerPackage } from './utils/plannerPackage';

type ScreenState = 'input' | 'result';

const exampleInputs = ['DEMO-CR-1001', 'DEMO-MPL-2001', 'DEMO-WO-3001'];

type ChangeSummary = {
  added: number;
  removed: number;
  changed: number;
  total: number;
  details: string[];
};

function generatedTabText(tab: PlannerTabContent) {
  return tab.lines.join('\n');
}

function createInitialTabEdits(plannerPackage: PlannerPackage): PlannerTabEdits {
  return plannerPackage.tabs.reduce<PlannerTabEdits>((edits, tab) => {
    edits[tab.id] = generatedTabText(tab);
    return edits;
  }, {});
}

function editedTextFor(tab: PlannerTabContent, tabEdits: PlannerTabEdits) {
  return tabEdits[tab.id] ?? generatedTabText(tab);
}

function summarizeTextChanges(generatedText: string, editedText: string): ChangeSummary {
  const generatedLines = generatedText.split(/\r?\n/);
  const editedLines = editedText.split(/\r?\n/);
  const maxLines = Math.max(generatedLines.length, editedLines.length);
  const details: string[] = [];
  let added = 0;
  let removed = 0;
  let changed = 0;

  for (let index = 0; index < maxLines; index += 1) {
    const generated = generatedLines[index] ?? '';
    const edited = editedLines[index] ?? '';
    if (generated === edited) continue;

    const lineNumber = index + 1;
    if (!generated && edited) {
      added += 1;
      details.push(`Line ${lineNumber} added: ${edited}`);
    } else if (generated && !edited) {
      removed += 1;
      details.push(`Line ${lineNumber} removed: ${generated}`);
    } else {
      changed += 1;
      details.push(`Line ${lineNumber} changed from "${generated}" to "${edited}"`);
    }
  }

  return { added, removed, changed, total: added + removed + changed, details: details.slice(0, 6) };
}

function changedTabsFor(plannerPackage: PlannerPackage, tabEdits: PlannerTabEdits) {
  return plannerPackage.tabs.filter((tab) => editedTextFor(tab, tabEdits).trim() !== generatedTabText(tab).trim());
}

function formatEditedPackage(plannerPackage: PlannerPackage, tabEdits: PlannerTabEdits) {
  return plannerPackage.tabs.map((tab) => `## ${tab.label}\n\n${editedTextFor(tab, tabEdits)}`).join('\n\n');
}

function makeReviewSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `review-${Date.now()}`;
}

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

function EditableTabPanel({
  tab,
  tabEdits,
  changedTabCount,
  onEditChange,
}: {
  tab: PlannerTabContent;
  tabEdits: PlannerTabEdits;
  changedTabCount: number;
  onEditChange: (tabId: MaximoTabId, value: string) => void;
}) {
  const generatedText = generatedTabText(tab);
  const editedText = editedTextFor(tab, tabEdits);
  const summary = summarizeTextChanges(generatedText, editedText);

  return (
    <section
      aria-labelledby={`tab-${tab.id}`}
      className="rounded-b-md border border-t-0 border-border-subtle bg-surface-light p-5 dark:bg-surface-dark"
      id={`tabpanel-${tab.id}`}
      role="tabpanel"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">{tab.label}</h2>
          <p className="mt-1 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
            Compare the generated baseline against planner edits before copying into the work package.
          </p>
        </div>
        <div className="rounded-md border border-border-subtle bg-surface-raisedLight px-3 py-2 text-xs font-semibold text-texttone-secondaryLight dark:bg-surface-raisedDark dark:text-texttone-secondaryDark">
          Changed tabs: {changedTabCount}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <section className="min-w-0 rounded-md border border-border-subtle bg-surface-raisedLight p-4 dark:bg-surface-raisedDark">
          <h3 className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">Generated output</h3>
          <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-surface-light p-3 text-sm leading-6 text-texttone-primaryLight dark:bg-surface-dark dark:text-texttone-primaryDark">
            {generatedText}
          </pre>
        </section>

        <section className="min-w-0 rounded-md border border-border-subtle bg-surface-raisedLight p-4 dark:bg-surface-raisedDark">
          <label className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark" htmlFor={`edit-${tab.id}`}>
            Planner edited version
          </label>
          <textarea
            aria-label={`Planner edited version for ${tab.label}`}
            className="input mt-3 min-h-[28rem] resize-y font-mono text-sm leading-6"
            id={`edit-${tab.id}`}
            onChange={(event) => onEditChange(tab.id, event.target.value)}
            value={editedText}
          />
        </section>
      </div>

      <section className="mt-4 rounded-md border border-border-subtle bg-surface-raisedLight p-4 dark:bg-surface-raisedDark" aria-label={`Changes for ${tab.label}`}>
        <h3 className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">Changes before copy/paste</h3>
        {summary.total === 0 ? (
          <p className="mt-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">No planner edits on this tab yet.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
              Added: {summary.added} | Removed: {summary.removed} | Changed: {summary.changed}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
              {summary.details.map((detail) => (
                <li className="flex gap-2" key={detail}>
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-status-caution" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </section>
  );
}

function InputScreen({
  input,
  error,
  selectedMode,
  savedSession,
  onInputChange,
  onModeChange,
  onResumeSaved,
  onAnalyze,
}: {
  input: string;
  error: string;
  selectedMode: PlannerResponseMode;
  savedSession: PlannerReviewSession | null;
  onInputChange: (value: string) => void;
  onModeChange: (mode: PlannerResponseMode) => void;
  onResumeSaved: () => void;
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
          {savedSession ? (
            <div className="mt-4 rounded-md border border-border-subtle bg-surface-raisedLight p-4 dark:bg-surface-raisedDark">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">
                    Saved edit session: {savedSession.plannerPackage.recordNumber}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
                    Last saved {new Date(savedSession.updatedAt).toLocaleString()} with mode {savedSession.plannerPackage.modeLabel}.
                  </p>
                </div>
                <button className="btn-secondary w-full sm:w-auto" onClick={onResumeSaved} type="button">
                  Resume saved progress
                </button>
              </div>
            </div>
          ) : null}
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
  tabEdits,
  onActiveTabChange,
  onCopyEditedPackage,
  onCopyEditedTab,
  onEditChange,
  onSaveProgress,
  onStartOver,
}: {
  activeTabId: MaximoTabId;
  plannerPackage: PlannerPackage;
  tabEdits: PlannerTabEdits;
  onActiveTabChange: (tabId: MaximoTabId) => void;
  onCopyEditedPackage: () => void;
  onCopyEditedTab: () => void;
  onEditChange: (tabId: MaximoTabId, value: string) => void;
  onSaveProgress: () => void;
  onStartOver: () => void;
}) {
  const activeTab = useMemo(
    () => plannerPackage.tabs.find((tab) => tab.id === activeTabId) ?? plannerPackage.tabs[0],
    [activeTabId, plannerPackage.tabs],
  );
  const changedTabs = changedTabsFor(plannerPackage, tabEdits);

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
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button className="btn-secondary w-full sm:w-auto" onClick={onCopyEditedTab} type="button">
              Copy edited tab
            </button>
            <button className="btn-secondary w-full sm:w-auto" onClick={onCopyEditedPackage} type="button">
              Copy edited package
            </button>
            <button className="btn w-full sm:w-auto" onClick={onSaveProgress} type="button">
              Save progress
            </button>
            <button className="btn-secondary w-full sm:w-auto" onClick={onStartOver} type="button">
              Start over
            </button>
          </div>
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

        <section className="rounded-md border border-border-subtle bg-surface-light p-4 dark:bg-surface-dark" aria-label="Planner edit summary">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">Planner edit summary</h2>
              <p className="mt-1 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
                Saved sessions preserve generated baseline text and planner edits for later review.
              </p>
            </div>
            <p className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">
              Changed tabs: {changedTabs.length}
            </p>
          </div>
          {changedTabs.length > 0 ? (
            <p className="mt-3 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
              Edited tabs: {changedTabs.map((tab) => tab.label).join(', ')}
            </p>
          ) : (
            <p className="mt-3 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
              No planner edits have been made yet.
            </p>
          )}
        </section>

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
          <EditableTabPanel changedTabCount={changedTabs.length} onEditChange={onEditChange} tab={activeTab} tabEdits={tabEdits} />
        </section>
      </div>
    </main>
  );
}

export default function App() {
  useTheme();
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 1800);
  }

  const { copyText, copiedLabel } = useClipboard(showToast);

  const [screen, setScreen] = useState<ScreenState>('input');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [selectedMode, setSelectedMode] = useState<PlannerResponseMode>(DEFAULT_RESPONSE_MODE);
  const [activeTabId, setActiveTabId] = useState<MaximoTabId>('workorder');
  const [plannerPackage, setPlannerPackage] = useState<PlannerPackage | null>(null);
  const [tabEdits, setTabEdits] = useState<PlannerTabEdits>({});
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [reviewCreatedAt, setReviewCreatedAt] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<PlannerReviewSession | null>(() => loadCurrentPlannerReviewSession());

  function analyzeInput() {
    if (!input.trim()) {
      setError('Enter a fake CR, MPL, work order number, or demo condition note before analyzing.');
      return;
    }

    setError('');
    const nextPackage = createPlannerPackage(input, new Date(), selectedMode);
    setPlannerPackage(nextPackage);
    setTabEdits(createInitialTabEdits(nextPackage));
    setReviewSessionId(null);
    setReviewCreatedAt(nextPackage.generatedAt);
    setActiveTabId('workorder');
    setScreen('result');
  }

  function resumeSavedProgress() {
    const session = savedSession ?? loadCurrentPlannerReviewSession();
    if (!session) return;
    setPlannerPackage(session.plannerPackage);
    setTabEdits(session.tabEdits);
    setReviewSessionId(session.id);
    setReviewCreatedAt(session.createdAt);
    setActiveTabId(session.activeTabId);
    setInput(session.plannerPackage.input);
    setSelectedMode(session.plannerPackage.mode);
    setScreen('result');
    showToast('Saved progress loaded');
  }

  function updateTabEdit(tabId: MaximoTabId, value: string) {
    setTabEdits((current) => ({ ...current, [tabId]: value }));
  }

  function saveProgress() {
    if (!plannerPackage) return;
    const now = new Date().toISOString();
    const session = upsertPlannerReviewSession({
      id: reviewSessionId ?? makeReviewSessionId(),
      plannerPackage,
      tabEdits,
      activeTabId,
      createdAt: reviewCreatedAt ?? plannerPackage.generatedAt,
      updatedAt: now,
    });
    setReviewSessionId(session.id);
    setReviewCreatedAt(session.createdAt);
    setSavedSession(session);
    showToast('Progress saved');
  }

  function copyEditedTab() {
    if (!plannerPackage) return;
    const activeTab = plannerPackage.tabs.find((tab) => tab.id === activeTabId) ?? plannerPackage.tabs[0];
    void copyText(editedTextFor(activeTab, tabEdits), `${activeTab.label} edited text copied`);
  }

  function copyEditedPackage() {
    if (!plannerPackage) return;
    void copyText(formatEditedPackage(plannerPackage, tabEdits), 'Edited package copied');
  }

  function startOver() {
    setScreen('input');
    setPlannerPackage(null);
    setTabEdits({});
    setReviewSessionId(null);
    setReviewCreatedAt(null);
    setActiveTabId('workorder');
    setError('');
    setSavedSession(loadCurrentPlannerReviewSession());
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
          onCopyEditedPackage={copyEditedPackage}
          onCopyEditedTab={copyEditedTab}
          onEditChange={updateTabEdit}
          onSaveProgress={saveProgress}
          onStartOver={startOver}
          plannerPackage={plannerPackage}
          tabEdits={tabEdits}
        />
      ) : (
        <InputScreen
          error={error}
          input={input}
          onAnalyze={analyzeInput}
          onInputChange={setInput}
          onModeChange={setSelectedMode}
          onResumeSaved={resumeSavedProgress}
          savedSession={savedSession}
          selectedMode={selectedMode}
        />
      )}
      <ToastRegion message={toast ?? copiedLabel} />
    </div>
  );
}
