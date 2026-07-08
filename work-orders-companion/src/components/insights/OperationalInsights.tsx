import type { OperationalInsight, WorkRequest } from '../../types';
import { ToneBadge } from '../ui/Badge';
import { Icon, type IconName } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';

const iconByInsight: Record<string, IconName> = {
  classification: 'shield',
  related: 'integrations',
  hre: 'warning',
  cspv: 'shield',
};

function confidenceFromMetrics(insight: OperationalInsight) {
  const metric = insight.metrics.find((item) => item.label.toLowerCase() === 'confidence');
  if (!metric) return null;
  const parsed = Number(metric.value.replace('%', ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function OperationalInsights({ request }: { request: WorkRequest }) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto" aria-labelledby="operational-insights-heading">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 text-app-purple">
            <Icon className="h-5 w-5" name="spark" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-app-navy" id="operational-insights-heading">
              Operational Insights
            </h2>
            <p className="mt-1 text-xs font-semibold text-app-muted">Insights for {request.ticketNumber}</p>
          </div>
        </div>
        <button className="rounded-lg p-2 text-app-muted hover:bg-app-soft hover:text-app-navy" aria-label="Close insights panel" type="button">
          <Icon className="h-4 w-4" name="close" />
        </button>
      </div>

      {request.insights.map((insight, index) => {
        const confidence = confidenceFromMetrics(insight);
        return (
          <article className="panel p-3" key={insight.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-app-purple" name={iconByInsight[insight.id] ?? 'info'} />
                <h3 className="truncate text-sm font-bold text-app-navy">
                  {index + 1}. {insight.title}
                </h3>
              </div>
              <ToneBadge status={insight.status} tone={insight.tone} />
            </div>

            <p className="mt-2 text-xs font-semibold leading-5 text-app-navy">{insight.summary}</p>

            <dl className="mt-2 space-y-1.5">
              {insight.metrics.map((metric) => (
                <div className="grid grid-cols-[1fr_auto] gap-3 text-xs" key={metric.label}>
                  <dt className="text-app-muted">{metric.label}</dt>
                  <dd className="font-bold text-app-navy">{metric.value}</dd>
                </div>
              ))}
            </dl>

            {confidence !== null ? (
              <div className="mt-2">
                <ProgressBar value={confidence} />
              </div>
            ) : null}

            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-wide text-app-muted">Findings</p>
              <ul className="mt-1.5 space-y-1 text-xs leading-5 text-app-navy">
                {insight.findings.slice(0, 1).map((finding) => (
                  <li className="flex gap-2" key={finding}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-app-navy" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="mt-2 flex w-full items-center justify-between rounded-lg py-1.5 text-left text-xs font-bold text-app-purple hover:bg-app-purpleSoft" type="button">
              <span>View details</span>
              <Icon className="h-4 w-4" name="chevron" />
            </button>
          </article>
        );
      })}
    </aside>
  );
}
