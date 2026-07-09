import type { ConditionRecord, DecisionState } from '../../types';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';

const decisionSteps: DecisionState[] = ['Screen', 'No WO', 'WO Needed', 'Planning Hold', 'Engineering Review', 'Ready for Planning'];

function decisionIndex(decisionState: DecisionState) {
  const index = decisionSteps.indexOf(decisionState);
  return index >= 0 ? index : 0;
}

function Metric({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-lg border border-app-line bg-app-soft/40 p-3">
      <p className="text-[0.7rem] font-bold uppercase tracking-wide text-app-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-app-navy">{value}</p>
      {helper ? <p className="mt-1 text-xs leading-5 text-app-muted">{helper}</p> : null}
    </div>
  );
}

export function PlanningCommandCenter({ onMoveToPlanning, record }: { onMoveToPlanning: () => void; record: ConditionRecord }) {
  const activeIndex = decisionIndex(record.decisionState);
  const nextAction = record.plannerActions.find((action) => action.status !== 'Done') ?? record.plannerActions[0];

  return (
    <section className="panel p-4" aria-label="Planner command center">
      <div className="flex flex-col gap-3 border-b border-app-line pb-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-app-navy">Planner Command Center</h2>
            <span className="badge border-app-purple/25 bg-app-purpleSoft text-app-purple">{record.decisionState}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-app-muted">
            {record.plant} {record.unit} - {record.reactorFamily} - {record.sourceSystem}
          </p>
        </div>
        <div className="rounded-lg border border-app-line bg-white px-3 py-2 text-xs font-semibold text-app-muted">
          <span className="font-bold text-app-navy">{record.agentRun.runId}</span> - {record.sourceAge}
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6" aria-label="CR to WO decision path">
        {decisionSteps.map((step, index) => {
          const active = step === record.decisionState;
          const complete = index < activeIndex;
          return (
            <div
              className={
                active
                  ? 'rounded-lg border border-app-purple bg-app-purple px-3 py-2 text-white shadow-soft'
                  : complete
                    ? 'rounded-lg border border-app-green/25 bg-app-greenSoft px-3 py-2 text-app-green'
                    : 'rounded-lg border border-app-line bg-white px-3 py-2 text-app-muted'
              }
              key={step}
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    active || complete
                      ? 'flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-current'
                      : 'flex h-5 w-5 items-center justify-center rounded-full border border-app-line bg-app-soft'
                  }
                >
                  {active || complete ? <Icon className="h-3 w-3" name="check" /> : null}
                </span>
                <span className="text-xs font-bold">{step}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg border border-app-line bg-app-soft/40 p-3 xl:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-app-muted">Readiness</p>
            <span className="text-sm font-bold text-app-navy">{record.readinessScore}%</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={record.readinessScore} />
          </div>
        </div>
        <Metric label="Open gaps" value={String(record.readinessGaps.length)} helper={record.readinessGaps[0] ?? 'No blocking mock gaps'} />
        <Metric label="Evidence matches" value={String(record.evidenceMatches.length)} helper="CR, WO, PM, and document search" />
        <Metric label="Risk marker" value={record.criticality} helper={record.classification.priority} />
        <Metric label="Owner" value={record.owner} helper={nextAction ? `Due: ${nextAction.due}` : 'No open action'} />
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-app-line bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-app-muted">Next best action</p>
          <p className="mt-1 text-sm font-bold text-app-navy">{nextAction?.title ?? 'Review source record and route when ready.'}</p>
          {nextAction ? (
            <p className="mt-1 text-xs font-semibold text-app-muted">
              {nextAction.owner} - {nextAction.status}
            </p>
          ) : null}
        </div>
        <Button className="shrink-0 px-3" onClick={onMoveToPlanning} variant="primary">
          <Icon className="h-4 w-4" name="arrow" />
          Route to Planning
        </Button>
      </div>
    </section>
  );
}
