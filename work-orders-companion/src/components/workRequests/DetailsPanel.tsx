import type { EditableClassificationField, WorkRequest } from '../../types';
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
  request,
  onClassificationChange,
}: {
  request: WorkRequest;
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
            label="WO Type"
            onChange={(value) => onClassificationChange('woType', value)}
            options={recommendationOptions.woType}
            value={request.classification.woType}
          />
          <RecommendationSelect
            label="Criticality"
            onChange={(value) => onClassificationChange('criticality', value)}
            options={recommendationOptions.criticality}
            value={request.classification.criticality}
          />
          <RecommendationSelect
            label="Priority"
            onChange={(value) => onClassificationChange('priority', value)}
            options={recommendationOptions.priority}
            value={request.classification.priority}
          />
          <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
            <span className="text-sm font-semibold text-app-muted">Confidence</span>
            <div className="flex items-center gap-3">
              <span className="w-10 text-sm font-bold text-app-navy">{request.classification.confidence}%</span>
              <ProgressBar value={request.classification.confidence} />
            </div>
          </div>
        </div>
        <div className="mt-3 border-t border-app-line pt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-app-muted">Rationale</p>
          <p className="mt-2 text-sm leading-5 text-app-navy">{request.classification.rationale}</p>
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
          {request.references.map((reference) => (
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
          {request.keyFactors.map((factor) => (
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

function PlaceholderTab({ activeTab, request }: { activeTab: DetailTab; request: WorkRequest }) {
  const content: Record<Exclude<DetailTab, 'Classification'>, string[]> = {
    'Related Records': request.references.map((reference) => `${reference.id} - ${reference.title}`),
    'Risk & Mitigation': [
      'Confirm source documents before routing.',
      'Do not infer technical acceptance criteria from mock data.',
      'Planner verification required before work package use.',
    ],
    'Screening Actions': ['Assign owner', 'Confirm classification', 'Disposition related records', 'Route to planning when complete'],
    Notes: ['Demo note: screening record is local-only and not connected to Maximo.'],
    History: ['Created in demo screening queue', 'Mock AI recommendation generated', 'Awaiting planner review'],
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
  request,
  onClassificationChange,
  onExport,
  onMoveToPlanning,
  onTabChange,
}: {
  activeTab: DetailTab;
  request: WorkRequest;
  onClassificationChange: (field: EditableClassificationField, value: string) => void;
  onExport: () => void;
  onMoveToPlanning: () => void;
  onTabChange: (tab: DetailTab) => void;
}) {
  return (
    <section aria-labelledby="wr-details-heading" className="space-y-4">
      <div className="panel p-3">
        <div className="flex flex-col gap-2 border-b border-app-line pb-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-app-navy" id="wr-details-heading">
              WR Details - {request.ticketNumber}
            </h2>
            <span className="badge border-app-green/25 bg-app-greenSoft text-app-green">{request.percentComplete}% complete</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-9 px-3 py-1.5 text-xs" onClick={onExport}>
              <Icon className="h-4 w-4" name="export" />
              Export Screening Report
            </Button>
            <Button className="min-h-9 px-3 py-1.5 text-xs" onClick={onMoveToPlanning} variant="primary">
              <Icon className="h-4 w-4" name="arrow" />
              Move to Planning
            </Button>
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-2 py-2 sm:grid-cols-2 xl:grid-cols-4">
          <MetaItem label="Ticket Number" value={request.ticketNumber} />
          <MetaItem label="Site ID" value={request.siteId} />
          <MetaItem label="Location" value={request.location} />
          <div>
            <dt className="text-[0.7rem] font-semibold text-app-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={request.status} />
            </dd>
          </div>
          <MetaItem label="Date" value={request.date} />
          <MetaItem label="Ticket ID" value={request.ticketId} />
          <MetaItem label="Asset Number" value={request.assetNumber} />
          <MetaItem label="Owner" value={request.owner} />
          <div className="sm:col-span-2 xl:col-span-4">
            <dt className="text-[0.7rem] font-semibold text-app-muted">Description</dt>
            <dd className="line-clamp-2 mt-1 max-w-5xl text-xs font-medium leading-5 text-app-navy">{request.detailDescription}</dd>
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
        <ClassificationPanel onClassificationChange={onClassificationChange} request={request} />
      ) : (
        <PlaceholderTab activeTab={activeTab} request={request} />
      )}
    </section>
  );
}

export type { DetailTab };
