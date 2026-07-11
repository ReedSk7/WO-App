import type { ConditionRecord, EditableClassificationField, PlannerActionStatus, ReadinessCheckStatus } from '../../types';
import { cn } from '../../utils/cn';
import { StatusBadge, ToneBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';

const detailTabs = ['Classification', 'Evidence', 'Planner Gaps', 'Actions', 'Notes', 'History'] as const;

type DetailTab = (typeof detailTabs)[number];

const recommendationOptions = {
  woType: ['DN - Deficient Maintenance', 'DL - Delinquent Maintenance', 'CC - Corrective Condition', 'IM - Instrument Maintenance', 'UN - Unclassified'],
  criticality: ['Crit Cat 1', 'Crit Cat 2', 'Crit Cat 3'],
  priority: ['1 - High', '2 - Elevated', '3 - Moderate', '4 - Routine'],
};

const readinessTone: Record<ReadinessCheckStatus, 'good' | 'medium' | 'neutral'> = {
  Ready: 'good',
  Gap: 'medium',
  Review: 'neutral',
};

const actionTone: Record<PlannerActionStatus, 'good' | 'medium' | 'high' | 'neutral'> = {
  Open: 'medium',
  'In progress': 'neutral',
  Ready: 'good',
  Blocked: 'high',
  Done: 'good',
};

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.7rem] font-semibold text-app-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-xs font-bold text-app-navy">{value}</dd>
    </div>
  );
}

function RecommendationSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid grid-cols-[6rem_1fr] items-center gap-3 text-sm">
      <span className="font-semibold text-app-muted">{label}</span>
      <select className="field min-h-9 py-1.5 text-sm" onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ClassificationPanel({
  record,
  onClassificationChange,
}: {
  record: ConditionRecord;
  onClassificationChange: (field: EditableClassificationField, value: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_0.9fr]">
      <section className="panel p-3">
        <div className="mb-3 flex items-center gap-2">
          <Icon className="h-4 w-4 text-app-purple" name="spark" />
          <h3 className="text-sm font-bold text-app-navy">Agent Recommendation</h3>
        </div>
        <div className="space-y-3">
          <RecommendationSelect
            label="WO Type"
            onChange={(value) => onClassificationChange('woType', value)}
            options={recommendationOptions.woType}
            value={record.classification.woType}
          />
          <RecommendationSelect
            label="Criticality"
            onChange={(value) => onClassificationChange('criticality', value)}
            options={recommendationOptions.criticality}
            value={record.classification.criticality}
          />
          <RecommendationSelect
            label="Priority"
            onChange={(value) => onClassificationChange('priority', value)}
            options={recommendationOptions.priority}
            value={record.classification.priority}
          />
          <div className="grid grid-cols-[6rem_1fr] items-center gap-3">
            <span className="text-sm font-semibold text-app-muted">Confidence</span>
            <div className="flex items-center gap-3">
              <span className="w-10 text-sm font-bold text-app-navy">{record.classification.confidence}%</span>
              <ProgressBar value={record.classification.confidence} />
            </div>
          </div>
        </div>
        <div className="mt-3 border-t border-app-line pt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-app-muted">Rationale</p>
          <p className="mt-2 text-sm leading-5 text-app-navy">{record.classification.rationale}</p>
        </div>
      </section>

      <section className="panel p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-app-purple" name="reports" />
            <h3 className="text-sm font-bold text-app-navy">Top Evidence Matches</h3>
          </div>
          <span className="badge border-app-blue/25 bg-app-blueSoft text-app-blue">{record.evidenceMatches.length} found</span>
        </div>
        <div className="space-y-2.5">
          {record.evidenceMatches.slice(0, 4).map((reference) => (
            <div className="rounded-lg border border-app-line bg-app-soft/40 p-2 text-sm" key={reference.id}>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-bold text-app-navy">
                    {reference.id} <span className="font-sans font-semibold text-app-muted">- {reference.sourceType}</span>
                  </p>
                  <p className="truncate text-xs text-app-muted">{reference.title}</p>
                </div>
                <span className="font-bold text-app-green">{reference.similarity}%</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-app-navy">{reference.whyMatched}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-3">
        <div className="mb-3 flex items-center gap-2">
          <Icon className="h-4 w-4 text-app-purple" name="check" />
          <h3 className="text-sm font-bold text-app-navy">Key Factors</h3>
        </div>
        <ul className="space-y-2.5 text-sm text-app-navy">
          {record.keyFactors.map((factor) => (
            <li className="flex gap-2" key={factor}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-app-green/30 bg-app-greenSoft text-app-green">
                <Icon className="h-3 w-3" name="check" />
              </span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function AgentOutputPanel({ record }: { record: ConditionRecord }) {
  const sections = [
    { title: 'Known Conditions', items: record.agentReview.knownConditions },
    { title: 'Planner Gaps', items: record.agentReview.plannerGaps },
    { title: 'Data Search Findings', items: record.agentReview.dataSearchFindings },
    { title: 'Next Planner Checks', items: record.agentReview.nextPlannerChecks },
  ];

  return (
    <section className="panel p-4" aria-labelledby="agent-output-heading">
      <div className="flex flex-col gap-2 border-b border-app-line pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-app-purple" name="spark" />
          <h3 className="text-sm font-bold text-app-navy" id="agent-output-heading">
            Databricks Agent Output
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge border-app-blue/25 bg-app-blueSoft text-app-blue">Read only</span>
          <span className="badge border-app-purple/25 bg-app-purpleSoft text-app-purple">{record.agentRun.mode}</span>
        </div>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
        <MetaItem label="Run ID" value={record.agentRun.runId} />
        <MetaItem label="Completed" value={record.agentRun.completedAt} />
        <MetaItem label="Data freshness" value={record.agentRun.dataFreshness} />
        <MetaItem label="Guardrail" value={record.agentRun.guardrail} />
      </dl>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {sections.map((section) => (
          <article className="rounded-lg border border-app-line bg-app-soft/40 p-3" key={section.title}>
            <h4 className="text-xs font-bold uppercase tracking-wide text-app-muted">{section.title}</h4>
            <ul className="mt-2 space-y-2 text-sm leading-5 text-app-navy">
              {section.items.map((item) => (
                <li className="flex gap-2" key={item}>
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-app-purple" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function EvidenceTab({ record }: { record: ConditionRecord }) {
  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-app-navy">Evidence Matches</h3>
        <span className="text-xs font-semibold text-app-muted">Similarity matches are review aids only</span>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {record.evidenceMatches.map((match) => (
          <article className="rounded-lg border border-app-line bg-white p-3 shadow-soft" key={match.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-app-navy">{match.id}</p>
                <p className="mt-1 text-sm font-bold text-app-navy">{match.title}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="badge border-app-purple/25 bg-app-purpleSoft text-app-purple">{match.sourceType}</span>
                <span className="text-xs font-bold text-app-green">{match.similarity}%</span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-5 text-app-muted">{match.whyMatched}</p>
            <p className="mt-2 text-xs font-bold text-app-navy">{match.reviewed ? 'Reviewed in demo packet' : 'Needs planner disposition'}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PlannerGapsTab({ record }: { record: ConditionRecord }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="panel p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-app-navy">Readiness Checklist</h3>
          <span className="text-sm font-bold text-app-navy">{record.readinessScore}%</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={record.readinessScore} />
        </div>
        <div className="mt-4 space-y-3">
          {record.readinessChecks.map((check) => (
            <article className="rounded-lg border border-app-line bg-app-soft/40 p-3" key={check.label}>
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-bold text-app-navy">{check.label}</h4>
                <ToneBadge status={check.status} tone={readinessTone[check.status]} />
              </div>
              <p className="mt-2 text-sm leading-5 text-app-muted">{check.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="text-sm font-bold text-app-navy">Planner Gaps</h3>
        <ul className="mt-3 space-y-3">
          {(record.readinessGaps.length ? record.readinessGaps : ['No blocking mock planner gaps are open.']).map((gap) => (
            <li className="flex gap-3 rounded-lg border border-app-line bg-white p-3 text-sm leading-5 text-app-navy shadow-soft" key={gap}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-app-amber/30 bg-app-amberSoft text-app-amber">
                <Icon className="h-3 w-3" name="warning" />
              </span>
              <span>{gap}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ActionsTab({ record }: { record: ConditionRecord }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div className="panel p-4">
        <h3 className="text-sm font-bold text-app-navy">Action Queue</h3>
        <div className="mt-3 space-y-3">
          {record.plannerActions.map((action) => (
            <article className="rounded-lg border border-app-line bg-white p-3 shadow-soft" key={action.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-bold text-app-muted">{action.id}</p>
                  <h4 className="mt-1 text-sm font-bold text-app-navy">{action.title}</h4>
                </div>
                <ToneBadge status={action.status} tone={actionTone[action.status]} />
              </div>
              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <MetaItem label="Owner" value={action.owner} />
                <MetaItem label="Due" value={action.due} />
              </dl>
            </article>
          ))}
        </div>
      </div>

      <aside className="panel p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-app-purple" name="export" />
          <h3 className="text-sm font-bold text-app-navy">Review Packet</h3>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <MetaItem label="Decision path" value={record.decisionState} />
          <MetaItem label="Evidence matches" value={String(record.evidenceMatches.length)} />
          <MetaItem label="Open gaps" value={String(record.readinessGaps.length)} />
          <MetaItem label="Agent profile" value={record.agentRun.modelVersion} />
        </dl>
      </aside>
    </section>
  );
}

function NotesTab({ record }: { record: ConditionRecord }) {
  return (
    <section className="panel p-4">
      <h3 className="text-sm font-bold text-app-navy">Notes</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <article className="rounded-lg border border-app-line bg-app-soft/40 p-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-app-muted">Agent assumptions</h4>
          <ul className="mt-2 space-y-2 text-sm leading-5 text-app-navy">
            {record.agentReview.assumptions.map((item) => (
              <li className="flex gap-2" key={item}>
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-app-purple" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-app-line bg-app-soft/40 p-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-app-muted">Planner note</h4>
          <p className="mt-2 text-sm leading-5 text-app-navy">
            Demo note: source record is local-only and not connected to production Maximo, Databricks, document search, or action routing.
          </p>
        </article>
      </div>
    </section>
  );
}

function HistoryTab({ record }: { record: ConditionRecord }) {
  return (
    <section className="panel p-4">
      <h3 className="text-sm font-bold text-app-navy">History</h3>
      <ol className="mt-3 space-y-3">
        {record.auditTrail.map((event) => (
          <li className="grid gap-2 rounded-lg border border-app-line bg-white p-3 shadow-soft sm:grid-cols-[10rem_1fr]" key={`${event.label}-${event.timestamp}`}>
            <time className="text-xs font-bold text-app-muted">{event.timestamp}</time>
            <div>
              <p className="text-sm font-bold text-app-navy">{event.label}</p>
              <p className="mt-1 text-sm leading-5 text-app-muted">{event.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TabContent({
  activeTab,
  record,
  onClassificationChange,
}: {
  activeTab: DetailTab;
  record: ConditionRecord;
  onClassificationChange: (field: EditableClassificationField, value: string) => void;
}) {
  if (activeTab === 'Classification') {
    return (
      <>
        <ClassificationPanel onClassificationChange={onClassificationChange} record={record} />
        <AgentOutputPanel record={record} />
      </>
    );
  }

  if (activeTab === 'Evidence') return <EvidenceTab record={record} />;
  if (activeTab === 'Planner Gaps') return <PlannerGapsTab record={record} />;
  if (activeTab === 'Actions') return <ActionsTab record={record} />;
  if (activeTab === 'Notes') return <NotesTab record={record} />;
  return <HistoryTab record={record} />;
}

export function DetailsPanel({
  activeTab,
  record,
  onClassificationChange,
  onExport,
  onMoveToPlanning,
  onTabChange,
}: {
  activeTab: DetailTab;
  record: ConditionRecord;
  onClassificationChange: (field: EditableClassificationField, value: string) => void;
  onExport: () => void;
  onMoveToPlanning: () => void;
  onTabChange: (tab: DetailTab) => void;
}) {
  const heading = record.recordType === 'CR' ? `CR Details - ${record.recordNumber}` : `${record.recordType} Planning Record - ${record.recordNumber}`;
  const numberLabel = record.recordType === 'CR' ? 'CR Number' : 'Source Record';

  return (
    <section aria-labelledby="cr-details-heading" className="space-y-4">
      <div className="panel p-3">
        <div className="flex flex-col gap-2 border-b border-app-line pb-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-app-navy" id="cr-details-heading">
              {heading}
            </h2>
            <span className="badge border-app-green/25 bg-app-greenSoft text-app-green">{record.percentComplete}% complete</span>
            <span className="badge border-app-purple/25 bg-app-purpleSoft text-app-purple">{record.decisionState}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-9 px-3 py-1.5 text-xs" onClick={onExport}>
              <Icon className="h-4 w-4" name="export" />
              Export Review Packet
            </Button>
            <Button className="min-h-9 px-3 py-1.5 text-xs" onClick={onMoveToPlanning} variant="primary">
              <Icon className="h-4 w-4" name="arrow" />
              Route to Planning
            </Button>
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-2 py-2 sm:grid-cols-2 xl:grid-cols-4">
          <MetaItem label={numberLabel} value={record.recordNumber} />
          <MetaItem label="Site / Unit" value={`${record.plant} ${record.unit}`} />
          <MetaItem label="Reactor family" value={record.reactorFamily} />
          <MetaItem label="Location" value={record.location} />
          <div>
            <dt className="text-[0.7rem] font-semibold text-app-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={record.status} />
            </dd>
          </div>
          <MetaItem label="Date" value={record.date} />
          <MetaItem label="Record ID" value={record.recordId} />
          <MetaItem label="Asset Number" value={record.assetNumber} />
          <MetaItem label="Owner" value={record.owner} />
          <MetaItem label="Source age" value={record.sourceAge} />
          <MetaItem label="Readiness" value={`${record.readinessScore}%`} />
          <MetaItem label="Open gaps" value={String(record.readinessGaps.length)} />
          <div className="sm:col-span-2 xl:col-span-4">
            <dt className="text-[0.7rem] font-semibold text-app-muted">Description</dt>
            <dd className="line-clamp-2 mt-1 max-w-5xl text-xs font-medium leading-5 text-app-navy">{record.detailDescription}</dd>
          </div>
        </dl>
      </div>

      <div className="overflow-hidden rounded-xl border border-app-line bg-white shadow-soft">
        <div className="flex overflow-x-auto border-b border-app-line">
          {detailTabs.map((tab) => (
            <button
              aria-selected={activeTab === tab}
              className={cn(
                'flex min-h-10 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-bold transition',
                activeTab === tab ? 'border-app-purple bg-app-purpleSoft/60 text-app-purple' : 'border-transparent text-app-muted hover:bg-app-soft hover:text-app-navy',
              )}
              key={tab}
              onClick={() => onTabChange(tab)}
              role="tab"
              type="button"
            >
              <Icon className="h-4 w-4" name={tab === 'Classification' ? 'spark' : tab === 'History' ? 'refresh' : tab === 'Actions' ? 'actions' : 'list'} />
              {tab}
            </button>
          ))}
        </div>
      </div>

      <TabContent activeTab={activeTab} onClassificationChange={onClassificationChange} record={record} />
    </section>
  );
}

export type { DetailTab };
