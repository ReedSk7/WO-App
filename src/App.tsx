import { useMemo, useState } from 'react';
import { DEFAULT_RESPONSE_MODE, PLANNER_RESPONSE_MODES } from './data/agentGuidance';
import { MAXIMO_TABS } from './data/plannerSamples';
import { findPlannerSite, PLANNER_SITES } from './data/plannerSites';
import { ToastRegion } from './components/ui/ToastRegion';
import { useClipboard } from './hooks/useClipboard';
import { useTheme } from './hooks/useTheme';
import { appendPlannerRefinementLog, loadCurrentPlannerReviewSession, upsertPlannerReviewSession } from './storage/local';
import type {
  MaximoTabId,
  PlannerCopyBlock,
  PlannerPackage,
  PlannerRelatedRecord,
  PlannerResponseMode,
  PlannerReviewSession,
  PlannerSiteId,
  PlannerTabContent,
  PlannerTabEdits,
} from './types';
import { downloadTextFile } from './utils/export';
import { PLANNER_DISCLAIMER, createPlannerPackage } from './utils/plannerPackage';
import {
  agentGeneratedText,
  createRefinementReport,
  formatRefinementReportJson,
  formatRefinementReportMarkdown,
  plannerFinalText,
  refinementReportFileStem,
  summarizeRefinementTab,
} from './utils/refinementReport';

type ScreenState = 'input' | 'result';
type SiteSelectValue = PlannerSiteId | '';

const exampleInputs = ['DEMO-CR-1001', 'DEMO-MPL-2001', 'DEMO-WO-3001'];

function createInitialTabEdits(plannerPackage: PlannerPackage): PlannerTabEdits {
  return plannerPackage.tabs.reduce<PlannerTabEdits>((edits, tab) => {
    edits[tab.id] = agentGeneratedText(tab);
    return edits;
  }, {});
}

function changedTabsFor(plannerPackage: PlannerPackage, tabEdits: PlannerTabEdits) {
  return plannerPackage.tabs.filter((tab) => plannerFinalText(tab, tabEdits).trim() !== agentGeneratedText(tab).trim());
}

function formatEditedPackage(plannerPackage: PlannerPackage, tabEdits: PlannerTabEdits) {
  return plannerPackage.tabs.map((tab) => `## ${tab.label}\n\n${plannerFinalText(tab, tabEdits)}`).join('\n\n');
}

function planBlockHeading(block: PlannerCopyBlock) {
  return `Task ${block.sequence} - ${block.summary}`;
}

function planBlockValues(blocks: PlannerCopyBlock[], finalText: string) {
  const normalizedFinalText = finalText.replace(/\r\n/g, '\n');
  const values = blocks.reduce<Record<string, string>>((current, block) => {
    current[block.id] = block.longDescription;
    return current;
  }, {});

  blocks.forEach((block, index) => {
    const heading = planBlockHeading(block);
    const start = normalizedFinalText.indexOf(heading);
    if (start < 0) return;

    const nextHeading = blocks[index + 1] ? planBlockHeading(blocks[index + 1]) : null;
    const bodyStart = start + heading.length;
    const bodyEnd = nextHeading ? normalizedFinalText.indexOf(nextHeading, bodyStart) : -1;
    const body = normalizedFinalText.slice(bodyStart, bodyEnd >= 0 ? bodyEnd : undefined).replace(/^\n+|\n+$/g, '');
    values[block.id] = body;
  });

  return values;
}

function formatPlanBlockAggregate(blocks: PlannerCopyBlock[], values: Record<string, string>) {
  return blocks.map((block) => `${planBlockHeading(block)}\n${values[block.id] ?? block.longDescription}`).join('\n\n');
}

function makeReviewSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `review-${Date.now()}`;
}

function makeRevisionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `revision-${crypto.randomUUID()}`;
  return `revision-${Date.now()}`;
}

function isAdminQueryEnabled() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('admin') === '1';
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

function PlansCopyBlocksPanel({
  tab,
  finalText,
  onCopyBlock,
  onEditChange,
}: {
  tab: PlannerTabContent;
  finalText: string;
  onCopyBlock: (text: string, label: string) => void;
  onEditChange: (tabId: MaximoTabId, value: string) => void;
}) {
  const blocks = tab.copyBlocks ?? [];
  const values = planBlockValues(blocks, finalText);

  function updateBlock(block: PlannerCopyBlock, value: string) {
    const nextValues = { ...values, [block.id]: value };
    onEditChange(tab.id, formatPlanBlockAggregate(blocks, nextValues));
  }

  return (
    <div className="mt-5 grid gap-4">
      {blocks.map((block) => {
        const value = values[block.id] ?? block.longDescription;
        return (
          <section className="rounded-md border border-border-subtle bg-surface-raisedLight p-4 dark:bg-surface-raisedDark" key={block.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="label">Task {block.sequence}</p>
                <h3 className="mt-1 text-base font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">{block.summary}</h3>
                <p className="mt-1 text-xs leading-5 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
                  Copy sends long description text only. The task summary stays as the Maximo row header.
                </p>
              </div>
              <button
                className="btn-secondary min-h-9 shrink-0 px-3 py-1.5 text-xs"
                onClick={() => onCopyBlock(value, `Task ${block.sequence} long description copied`)}
                type="button"
              >
                Copy long description
              </button>
            </div>
            <textarea
              aria-label={`Task ${block.sequence} long description for ${block.summary}`}
              className="input mt-3 min-h-36 resize-y font-mono text-sm leading-6"
              onChange={(event) => updateBlock(block, event.target.value)}
              value={value}
            />
          </section>
        );
      })}
    </div>
  );
}

function EditableTabPanel({
  tab,
  tabEdits,
  changedTabCount,
  isAdminMode,
  onCopyBlock,
  onEditChange,
}: {
  tab: PlannerTabContent;
  tabEdits: PlannerTabEdits;
  changedTabCount: number;
  isAdminMode: boolean;
  onCopyBlock: (text: string, label: string) => void;
  onEditChange: (tabId: MaximoTabId, value: string) => void;
}) {
  const generatedText = agentGeneratedText(tab);
  const finalText = plannerFinalText(tab, tabEdits);
  const summary = summarizeRefinementTab(tab, tabEdits);
  const changeTotal = summary.added + summary.removed + summary.edited;
  const details = summary.changes.slice(0, 6);
  const hasPlansCopyBlocks = tab.id === 'plans' && (tab.copyBlocks?.length ?? 0) > 0;

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
            {hasPlansCopyBlocks
              ? 'Edit each Maximo task long description separately before copying it into the task row.'
              : 'Compare the agent baseline against the planner final text before copying into the work package.'}
          </p>
        </div>
        {isAdminMode ? (
          <div className="rounded-md border border-border-subtle bg-surface-raisedLight px-3 py-2 text-xs font-semibold text-texttone-secondaryLight dark:bg-surface-raisedDark dark:text-texttone-secondaryDark">
            Changed tabs: {changedTabCount}
          </div>
        ) : null}
      </div>

      {hasPlansCopyBlocks ? (
        <PlansCopyBlocksPanel finalText={finalText} onCopyBlock={onCopyBlock} onEditChange={onEditChange} tab={tab} />
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <section className="min-w-0 rounded-md border border-border-subtle bg-surface-raisedLight p-4 dark:bg-surface-raisedDark">
            <h3 className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">Agent generated baseline</h3>
            <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-surface-light p-3 text-sm leading-6 text-texttone-primaryLight dark:bg-surface-dark dark:text-texttone-primaryDark">
              {generatedText}
            </pre>
          </section>

          <section className="min-w-0 rounded-md border border-border-subtle bg-surface-raisedLight p-4 dark:bg-surface-raisedDark">
            <label className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark" htmlFor={`final-${tab.id}`}>
              Planner final text for copy/paste
            </label>
            <textarea
              aria-label={`Planner final text for copy/paste for ${tab.label}`}
              className="input mt-3 min-h-[28rem] resize-y font-mono text-sm leading-6"
              id={`final-${tab.id}`}
              onChange={(event) => onEditChange(tab.id, event.target.value)}
              value={finalText}
            />
          </section>
        </div>
      )}

      {isAdminMode ? (
        <section className="mt-4 rounded-md border border-border-subtle bg-surface-raisedLight p-4 dark:bg-surface-raisedDark" aria-label={`Changes for ${tab.label}`}>
          <h3 className="text-sm font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">What changed for agent refinement</h3>
          {changeTotal === 0 ? (
            <p className="mt-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
              All {summary.kept} agent-generated lines are currently kept for copy/paste.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
                Kept: {summary.kept} | Removed: {summary.removed} | Added: {summary.added} | Edited: {summary.edited}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">
                {details.map((change) => {
                  const label =
                    change.type === 'added'
                      ? `Line ${change.lineNumber} added: ${change.plannerFinal}`
                      : change.type === 'removed'
                        ? `Line ${change.lineNumber} removed: ${change.agentGenerated}`
                        : `Line ${change.lineNumber} edited from "${change.agentGenerated}" to "${change.plannerFinal}"`;
                  return (
                    <li className="flex gap-2" key={`${change.type}-${change.lineNumber}`}>
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-status-caution" />
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      ) : null}
    </section>
  );
}

type RelationshipNodeKind = 'condition-report' | 'equipment' | 'significant-challenge' | 'source' | 'trouble-event' | 'work-order';

type RelationshipGraphNode = {
  id: string;
  badge: string;
  caption: string;
  kind: RelationshipNodeKind;
  label: string;
  tabId: MaximoTabId;
  x: number;
  y: number;
};

const relationshipNodeStyles: Record<RelationshipNodeKind, { color: string; fill: string; legendLabel: string }> = {
  'condition-report': {
    color: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.16)',
    legendLabel: 'Condition Report',
  },
  equipment: {
    color: '#84cc16',
    fill: 'rgba(132, 204, 22, 0.14)',
    legendLabel: 'Equipment',
  },
  'significant-challenge': {
    color: '#fb7185',
    fill: 'rgba(251, 113, 133, 0.14)',
    legendLabel: 'Significant Nuclear Challenge',
  },
  source: {
    color: '#67e8f9',
    fill: 'rgba(103, 232, 249, 0.18)',
    legendLabel: 'Selected Source',
  },
  'trouble-event': {
    color: '#f0abfc',
    fill: 'rgba(240, 171, 252, 0.14)',
    legendLabel: 'Trouble Event',
  },
  'work-order': {
    color: '#93c5fd',
    fill: 'rgba(147, 197, 253, 0.15)',
    legendLabel: 'Work Order',
  },
};

const relationshipLegend: RelationshipNodeKind[] = [
  'condition-report',
  'significant-challenge',
  'work-order',
  'trouble-event',
  'equipment',
];

const linkedNodePositions = [
  { x: 30, y: 27 },
  { x: 71, y: 30 },
  { x: 76, y: 61 },
  { x: 60, y: 77 },
  { x: 38, y: 75 },
  { x: 23, y: 57 },
  { x: 50, y: 17 },
];

function relationshipKindForRecord(recordNumber: string): RelationshipNodeKind {
  const normalizedRecordNumber = recordNumber.toUpperCase();
  if (normalizedRecordNumber.includes('-SNC-') || normalizedRecordNumber.startsWith('SNC')) return 'significant-challenge';
  if (normalizedRecordNumber.includes('-TE-') || normalizedRecordNumber.startsWith('TE')) return 'trouble-event';
  if (normalizedRecordNumber.includes('-WO-') || normalizedRecordNumber.startsWith('WO')) return 'work-order';
  if (normalizedRecordNumber.includes('-MPL-') || normalizedRecordNumber.startsWith('MPL')) return 'work-order';
  if (normalizedRecordNumber.includes('-CR-') || normalizedRecordNumber.startsWith('CR')) return 'condition-report';
  return 'condition-report';
}

function relationshipBadgeForRecord(recordNumber: string, fallback: string) {
  const normalizedRecordNumber = recordNumber.toUpperCase();
  if (normalizedRecordNumber.includes('-SNC-') || normalizedRecordNumber.startsWith('SNC')) return 'SNC';
  if (normalizedRecordNumber.includes('-TE-') || normalizedRecordNumber.startsWith('TE')) return 'TE';
  if (normalizedRecordNumber.includes('-MPL-') || normalizedRecordNumber.startsWith('MPL')) return 'MPL';
  if (normalizedRecordNumber.includes('-WO-') || normalizedRecordNumber.startsWith('WO')) return 'WO';
  if (normalizedRecordNumber.includes('-CR-') || normalizedRecordNumber.startsWith('CR')) return 'CR';
  return fallback;
}

function RelationshipGraphNodeButton({
  active,
  node,
  onClick,
}: {
  active: boolean;
  node: RelationshipGraphNode;
  onClick: () => void;
}) {
  const style = relationshipNodeStyles[node.kind];

  return (
    <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
      <button
        aria-label={`${node.label} - ${node.caption}`}
        aria-pressed={active}
        className={`group flex items-center justify-center rounded-full border-2 text-[0.68rem] font-bold transition focus:outline-none focus:ring-2 focus:ring-cyan-100 ${
          node.kind === 'source' ? 'h-14 w-14' : 'h-11 w-11'
        } ${active ? 'scale-110' : 'hover:scale-105'}`}
        onClick={onClick}
        style={{
          backgroundColor: active ? style.color : style.fill,
          borderColor: style.color,
          boxShadow: `0 0 0 1px ${style.color}66, 0 0 ${active ? '26px' : '16px'} ${style.color}55`,
          color: active ? '#07141c' : '#f8fafc',
        }}
        type="button"
      >
        {node.badge}
      </button>
      <span className="mt-2 max-w-32 break-words text-center text-[0.7rem] font-semibold leading-tight text-slate-100">{node.label}</span>
      <span className="mt-0.5 max-w-32 text-center text-[0.62rem] leading-tight text-slate-400">{node.caption}</span>
    </div>
  );
}

function RelationshipMappingPanel({
  activeTabId,
  plannerPackage,
  onSelectTab,
}: {
  activeTabId: MaximoTabId;
  plannerPackage: PlannerPackage;
  onSelectTab: (tabId: MaximoTabId) => void;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const linkedNodes: RelationshipGraphNode[] = [
    {
      id: plannerPackage.asset,
      badge: 'EQ',
      caption: 'Asset context',
      kind: 'equipment',
      label: plannerPackage.asset,
      tabId: 'logic',
      ...linkedNodePositions[0],
    },
    ...plannerPackage.relatedRecords.map((record: PlannerRelatedRecord, index) => {
      const position = linkedNodePositions[index + 1] ?? linkedNodePositions[linkedNodePositions.length - 1];
      return {
        id: record.recordNumber,
        badge: relationshipBadgeForRecord(record.recordNumber, 'REL'),
        caption: record.title,
        kind: relationshipKindForRecord(record.recordNumber),
        label: record.recordNumber,
        tabId: record.tabId,
        ...position,
      };
    }),
  ];

  const sourceNode: RelationshipGraphNode = {
    id: plannerPackage.recordNumber,
    badge: plannerPackage.recordType === 'Unknown' ? 'REC' : plannerPackage.recordType,
    caption: 'Source record',
    kind: 'source',
    label: plannerPackage.recordNumber,
    tabId: 'workorder',
    x: 50,
    y: 50,
  };
  const allNodes = [sourceNode, ...linkedNodes];
  const selectedNode = selectedNodeId ? allNodes.find((node) => node.id === selectedNodeId) : null;
  const activeNode = selectedNode?.tabId === activeTabId ? selectedNode : allNodes.find((node) => node.tabId === activeTabId) ?? sourceNode;
  const similarWorkOrderCount = plannerPackage.relatedRecords.filter((record) => relationshipBadgeForRecord(record.recordNumber, '') === 'WO').length;

  function selectGraphNode(node: RelationshipGraphNode) {
    setSelectedNodeId(node.id);
    onSelectTab(node.tabId);
  }

  return (
    <section
      className="overflow-hidden rounded-md border border-slate-700 bg-[#101820] text-slate-100 shadow-panel"
      aria-label="Relationship Mapping"
    >
      <div className="flex flex-col gap-2 border-b border-slate-700/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label text-cyan-100">Relationship Mapping</p>
          <h2 className="mt-1 text-sm font-bold uppercase tracking-[0.16em] text-slate-100">Relationship Map</h2>
        </div>
        <p className="font-mono text-xs font-semibold text-slate-300">
          {plannerPackage.recordNumber} + {linkedNodes.length} linked records
        </p>
      </div>

      <div
        className="relative min-h-[23rem] overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148, 163, 184, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.09) 1px, transparent 1px), radial-gradient(circle at 50% 48%, rgba(34, 211, 238, 0.12), transparent 36%)',
          backgroundSize: '64px 64px, 64px 64px, auto',
        }}
      >
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {linkedNodes.map((node) => (
            <line key={`${node.id}-line`} stroke="rgba(148, 163, 184, 0.28)" strokeWidth="0.35" x1={sourceNode.x} x2={node.x} y1={sourceNode.y} y2={node.y} />
          ))}
          {activeNode.id !== sourceNode.id ? (
            <g>
              <line stroke="#a5f3fc" strokeWidth="0.8" x1={sourceNode.x} x2={activeNode.x} y1={sourceNode.y} y2={activeNode.y} />
              <line
                stroke="#f8fafc"
                strokeDasharray="1.5 1.8"
                strokeLinecap="round"
                strokeWidth="0.45"
                x1={sourceNode.x}
                x2={activeNode.x}
                y1={sourceNode.y}
                y2={activeNode.y}
              />
            </g>
          ) : null}
        </svg>
        <RelationshipGraphNodeButton active={activeNode.id === sourceNode.id} node={sourceNode} onClick={() => selectGraphNode(sourceNode)} />
        {linkedNodes.map((node) => (
          <RelationshipGraphNodeButton active={activeNode.id === node.id} key={node.id} node={node} onClick={() => selectGraphNode(node)} />
        ))}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-700/80 bg-[#101820]/88 px-4 py-3 backdrop-blur">
          {relationshipLegend.map((kind) => (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200" key={kind}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: relationshipNodeStyles[kind].color }} />
              <span>{relationshipNodeStyles[kind].legendLabel}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-700/80 bg-[#14202a] p-4 sm:grid-cols-3">
        <div className="rounded-md border border-slate-600/80 bg-slate-900/35 p-4 text-center">
          <p className="text-3xl font-bold text-lime-300">{plannerPackage.knownFacts.length}</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">Verified Facts</p>
          <p className="mt-1 text-xs text-slate-400">source-backed</p>
        </div>
        <div className="rounded-md border border-slate-600/80 bg-slate-900/35 p-4 text-center">
          <p className="text-3xl font-bold text-amber-300">{plannerPackage.informationGaps.length}</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">Information Gaps</p>
          <p className="mt-1 text-xs text-slate-400">planner verification</p>
        </div>
        <div className="rounded-md border border-slate-600/80 bg-slate-900/35 p-4 text-center">
          <p className="text-3xl font-bold text-sky-300">{similarWorkOrderCount}</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">Similar WOs Found</p>
          <p className="mt-1 text-xs text-slate-400">fake WO history</p>
        </div>
      </div>
    </section>
  );
}

function InputScreen({
  input,
  error,
  selectedMode,
  selectedSiteId,
  savedSession,
  onInputChange,
  onModeChange,
  onResumeSaved,
  onSiteChange,
  onAnalyze,
}: {
  input: string;
  error: string;
  selectedMode: PlannerResponseMode;
  selectedSiteId: SiteSelectValue;
  savedSession: PlannerReviewSession | null;
  onInputChange: (value: string) => void;
  onModeChange: (mode: PlannerResponseMode) => void;
  onResumeSaved: () => void;
  onSiteChange: (siteId: SiteSelectValue) => void;
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
          <label className="label block" htmlFor="site-select">
            Select site
          </label>
          <select
            aria-describedby="site-select-help planner-input-error"
            className="input mt-2"
            id="site-select"
            onChange={(event) => onSiteChange(event.target.value as SiteSelectValue)}
            value={selectedSiteId}
          >
            <option value="">Select a site</option>
            {PLANNER_SITES.map((site) => (
              <option key={site.id} value={site.id}>
                {site.label}
              </option>
            ))}
          </select>
          <p className="helper mt-2" id="site-select-help">
            Site selection is stored as review metadata only. Use fake/demo record inputs.
          </p>

          <div className="mt-5">
            <ModeSelector onModeChange={onModeChange} selectedMode={selectedMode} />
          </div>

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
                    Last saved {new Date(savedSession.updatedAt).toLocaleString()} for {savedSession.plannerPackage.siteLabel} with mode{' '}
                    {savedSession.plannerPackage.modeLabel}.
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

function ResultScreen({
  activeTabId,
  isAdminMode,
  plannerPackage,
  tabEdits,
  onActiveTabChange,
  onCopyBlock,
  onCopyEditedPackage,
  onCopyEditedTab,
  onEditChange,
  onExportJson,
  onExportMarkdown,
  onSaveProgress,
  onStartOver,
}: {
  activeTabId: MaximoTabId;
  isAdminMode: boolean;
  plannerPackage: PlannerPackage;
  tabEdits: PlannerTabEdits;
  onActiveTabChange: (tabId: MaximoTabId) => void;
  onCopyBlock: (text: string, label: string) => void;
  onCopyEditedPackage: () => void;
  onCopyEditedTab: () => void;
  onEditChange: (tabId: MaximoTabId, value: string) => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
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
            {isAdminMode ? (
              <p className="mt-3 inline-flex rounded-md border border-status-caution/60 bg-status-caution/10 px-3 py-1 text-xs font-semibold text-texttone-primaryLight dark:text-texttone-primaryDark">
                Admin view
              </p>
            ) : null}
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
            {isAdminMode ? (
              <>
                <button className="btn-secondary w-full sm:w-auto" onClick={onExportJson} type="button">
                  Export refinement JSON
                </button>
                <button className="btn-secondary w-full sm:w-auto" onClick={onExportMarkdown} type="button">
                  Export refinement Markdown
                </button>
              </>
            ) : null}
            <button className="btn-secondary w-full sm:w-auto" onClick={onStartOver} type="button">
              Start over
            </button>
          </div>
        </header>

        <section className="rounded-md border border-status-warning/60 bg-status-warning/15 p-4 text-sm leading-6 text-texttone-primaryLight dark:text-texttone-primaryDark">
          {PLANNER_DISCLAIMER}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Planner package summary">
          <SummaryTile label="Site" value={plannerPackage.siteLabel} />
          <SummaryTile label="Mode" value={plannerPackage.modeLabel} />
          <SummaryTile label="Match" value={plannerPackage.status} />
          <SummaryTile label="Confidence" value={`${plannerPackage.confidence}/100`} />
          <SummaryTile label="Asset" value={plannerPackage.asset} />
        </section>

        <RelationshipMappingPanel activeTabId={activeTabId} onSelectTab={onActiveTabChange} plannerPackage={plannerPackage} />

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
          <EditableTabPanel
            changedTabCount={changedTabs.length}
            isAdminMode={isAdminMode}
            onCopyBlock={onCopyBlock}
            onEditChange={onEditChange}
            tab={activeTab}
            tabEdits={tabEdits}
          />
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
  const [selectedSiteId, setSelectedSiteId] = useState<SiteSelectValue>('');
  const [selectedMode, setSelectedMode] = useState<PlannerResponseMode>(DEFAULT_RESPONSE_MODE);
  const [activeTabId, setActiveTabId] = useState<MaximoTabId>('workorder');
  const [plannerPackage, setPlannerPackage] = useState<PlannerPackage | null>(null);
  const [tabEdits, setTabEdits] = useState<PlannerTabEdits>({});
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [reviewCreatedAt, setReviewCreatedAt] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<PlannerReviewSession | null>(() => loadCurrentPlannerReviewSession());
  const [isAdminMode] = useState(() => isAdminQueryEnabled());

  function analyzeInput() {
    if (!selectedSiteId) {
      setError('Select a site before analyzing a fake CR, MPL, or work order.');
      return;
    }

    if (!input.trim()) {
      setError('Enter a fake CR, MPL, work order number, or demo condition note before analyzing.');
      return;
    }

    setError('');
    const nextPackage = createPlannerPackage(input, new Date(), selectedMode, findPlannerSite(selectedSiteId));
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
    setSelectedSiteId(session.plannerPackage.siteId === 'site-not-captured' ? '' : session.plannerPackage.siteId);
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
    const sessionId = reviewSessionId ?? makeReviewSessionId();
    const session = upsertPlannerReviewSession({
      id: sessionId,
      plannerPackage,
      tabEdits,
      activeTabId,
      createdAt: reviewCreatedAt ?? plannerPackage.generatedAt,
      updatedAt: now,
    });
    const report = createRefinementReport(plannerPackage, tabEdits, session.id, now);
    const revisionId = makeRevisionId();
    appendPlannerRefinementLog({
      id: `log-${revisionId}`,
      sessionId: session.id,
      revisionId,
      savedAt: now,
      siteId: plannerPackage.siteId,
      siteLabel: plannerPackage.siteLabel,
      recordNumber: plannerPackage.recordNumber,
      activeTabId,
      report,
    });
    setReviewSessionId(session.id);
    setReviewCreatedAt(session.createdAt);
    setSavedSession(session);
    showToast('Progress saved');
  }

  function copyEditedTab() {
    if (!plannerPackage) return;
    const activeTab = plannerPackage.tabs.find((tab) => tab.id === activeTabId) ?? plannerPackage.tabs[0];
    void copyText(plannerFinalText(activeTab, tabEdits), `${activeTab.label} planner final text copied`);
  }

  function copyEditedPackage() {
    if (!plannerPackage) return;
    void copyText(formatEditedPackage(plannerPackage, tabEdits), 'Planner final package copied');
  }

  function copyBlock(text: string, label: string) {
    void copyText(text, label);
  }

  function currentRefinementReport() {
    if (!plannerPackage) return null;
    return createRefinementReport(plannerPackage, tabEdits, reviewSessionId ?? 'unsaved-session');
  }

  function exportRefinementJson() {
    const report = currentRefinementReport();
    if (!report) return;
    downloadTextFile(`${refinementReportFileStem(report)}.json`, formatRefinementReportJson(report), 'application/json');
    showToast('Refinement JSON exported');
  }

  function exportRefinementMarkdown() {
    const report = currentRefinementReport();
    if (!report) return;
    downloadTextFile(`${refinementReportFileStem(report)}.md`, formatRefinementReportMarkdown(report), 'text/markdown');
    showToast('Refinement Markdown exported');
  }

  function startOver() {
    setScreen('input');
    setPlannerPackage(null);
    setTabEdits({});
    setReviewSessionId(null);
    setReviewCreatedAt(null);
    setSelectedSiteId('');
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
          isAdminMode={isAdminMode}
          onActiveTabChange={setActiveTabId}
          onCopyBlock={copyBlock}
          onCopyEditedPackage={copyEditedPackage}
          onCopyEditedTab={copyEditedTab}
          onEditChange={updateTabEdit}
          onExportJson={exportRefinementJson}
          onExportMarkdown={exportRefinementMarkdown}
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
          onSiteChange={setSelectedSiteId}
          savedSession={savedSession}
          selectedMode={selectedMode}
          selectedSiteId={selectedSiteId}
        />
      )}
      <ToastRegion message={toast ?? copiedLabel} />
    </div>
  );
}
