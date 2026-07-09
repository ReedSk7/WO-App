import type { ConditionRecord, EditableClassificationField } from '../../types';
import { cn } from '../../utils/cn';
import { CriticalityBadge, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';

const detailTabs = ['Classification', 'Related Records', 'Risk & Mitigation', 'Screening Actions', 'Notes', 'History'] as const;

type DetailTab = (typeof detailTabs)[number];

const recommendationOptions = {
  woType: ['DN - Deficient Maintenance', 'DL - Delinquent Maintenance', 'CC - Corrective Condition', 'IM - Instrument Maintenance', 'UN - Unclassified'],
  criticality: ['Crit Cat 1', 'Crit Cat 2', 'Crit Cat 3'],
  priority: ['1 - High', '2 - Elevated', '3 - Moderate', '4 - Routine'],
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
    <label className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-sm">
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
    <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_1fr]">
      <section className="panel p-3">
        <div className="mb-3 flex items-center gap-2">
          <Icon className="h-4 w-4 text-app-purple" name="spark" />
          <h3 className="text-sm font-bold text-app-navy">AI Recommendation</h3>
        </div>
        <div className="space-y-3">
          <RecommendationSelect
            label="Rec. WO Type"
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
          <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
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
            <h3 className="text-sm font-bold text-app-navy">Top References</h3>
          </div>
          <Button className="min-h-8 px-2 py-1 text-xs" variant="ghost">
            <Icon className="h-3.5 w-3.5" name="plus" />
            Add
          </Button>
        </div>
        <div className="space-y-2.5">
          {record.references.map((reference) => (
            <div className="grid grid-cols-[1fr_auto] gap-3 text-sm" key={reference.id}>
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-bold text-app-navy">{reference.id}</p>
                <p className="truncate text-xs text-app-muted">{reference.title}</p>
              </div>
              <span className="font-bold text-app-green">{reference.similarity}%</span>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full rounded-lg border border-app-line px-3 py-2 text-xs font-bold text-app-purple hover:bg-app-purpleSoft" type="button">
          View all references
        </button>
      </section>

      <section className="panel p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-app-purple" name="check" />
            <h3 className="text-sm font-bold text-app-navy">Key Factors</h3>
          </div>
          <Button className="min-h-8 px-2 py-1 text-xs" variant="ghost">
            <Icon className="h-3.5 w-3.5" name="plus" />
            Add
          </Button>
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
        <span className="badge border-app-blue/25 bg-app-blueSoft text-app-blue">Read only</span>
      </div>
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

function PlaceholderTab({ activeTab, record }: { activeTab: DetailTab; record: ConditionRecord }) {
  const content: Record<Exclude<DetailTab, 'Classification'>, string[]> = {
    'Related Records': record.references.map((reference) => `${reference.id} - ${reference.title}`),
    'Risk & Mitigation': [
      'Confirm source documents before routing.',
      'Do not infer technical acceptance criteria from mock data.',
      'Planner verification required before work package use.',
    ],
    'Screening Actions': ['Assign owner', 'Confirm CR classification', 'Disposition related records', 'Route to planning when complete'],
    Notes: ['Demo note: source record is local-only and not connected to Maximo.'],
    History: ['Created in demo screening queue', 'Mock Databricks agent output generated', 'Awaiting planner review'],
  };

  return (
    <section className="panel p-4">
      <h3 className="text-sm font-bold text-app-navy">{activeTab}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-app-muted">
        {content[activeTab as Exclude<DetailTab, 'Classification'>].map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-app-purple" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
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
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-9 px-3 py-1.5 text-xs" onClick={onExport}>
              <Icon className="h-4 w-4" name="export" />
              Export Screening Report
            </Button>
            <Button className="min-h-9 px-3 py-1.5 text-xs" onClick={onMoveToPlanning} variant="primary">
              <Icon className="h-4 w-4" name="arrow" />
              Route to Planning
            </Button>
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-2 py-2 sm:grid-cols-2 xl:grid-cols-4">
          <MetaItem label={numberLabel} value={record.recordNumber} />
          <MetaItem label="Site ID" value={record.siteId} />
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
              <Icon className="h-4 w-4" name={tab === 'Classification' ? 'spark' : tab === 'History' ? 'refresh' : 'list'} />
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Classification' ? (
        <>
          <ClassificationPanel onClassificationChange={onClassificationChange} record={record} />
          <AgentOutputPanel record={record} />
        </>
      ) : (
        <PlaceholderTab activeTab={activeTab} record={record} />
      )}
    </section>
  );
}

export type { DetailTab };
