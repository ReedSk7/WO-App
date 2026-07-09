import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { sampleCRs } from '../data/sampleCRs';
import { AppHeader } from '../components/layout/AppHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icons';
import { SafetyBanner } from '../components/ui/SafetyBanner';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SampleQuickLoad } from '../components/samples/SampleQuickLoad';
import { loadDrafts, saveCurrentCR } from '../storage/local';
import type { SampleCR } from '../types';

function timeLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [drafts] = useState(loadDrafts());
  const latestDraft = drafts[0];
  const counts = useMemo(
    () => ({
      needsInfo: drafts.filter((draft) => draft.status === 'Needs Info').length,
      draft: drafts.filter((draft) => draft.status === 'Draft').length,
      ready: drafts.filter((draft) => draft.status === 'Review Ready').length,
    }),
    [drafts],
  );

  const loadSample = (sample: SampleCR) => {
    saveCurrentCR(sample.intake);
    navigate('/intake');
  };

  return (
    <>
      <AppHeader
        actions={
          <>
            <Link className="btn" to="/intake">
              <Icon className="h-4 w-4" name="intake" />
              New CR to WO
            </Link>
            {latestDraft ? (
              <Link className="btn-secondary" to={`/draft/${latestDraft.id}`}>
                Open Draft Review
              </Link>
            ) : null}
          </>
        }
        subtitle="Local, fake-data planning companion for turning demo CR-style issues into conservative draft work orders."
        title="Dashboard"
      />
      <PageContainer>
        <SafetyBanner />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard description="Fake records available for intake." icon={<Icon className="h-6 w-6" name="samples" />} label="Demo CRs" onClick={() => navigate('/samples')} value={sampleCRs.length} />
          <StatCard description="Drafts saved in this browser." icon={<Icon className="h-6 w-6" name="draft" />} label="Saved Drafts" value={drafts.length} />
          <StatCard description="Blocking missing information exists." icon={<Icon className="h-6 w-6" name="warning" />} label="Needs Info" value={counts.needsInfo} />
          <StatCard description="No blocking items and checklist at threshold." icon={<Icon className="h-6 w-6" name="check" />} label="Review Ready" value={counts.ready} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="rounded-panel border border-border-subtle bg-surface-light shadow-panel dark:bg-surface-dark">
            <div className="flex flex-col gap-3 border-b border-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold leading-7">Recent drafts</h2>
                <p className="mt-1 text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">Structured rows show planning readiness without opening each package.</p>
              </div>
              <Link className="btn-secondary" to="/draft">
                Draft Review
              </Link>
            </div>
            {drafts.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {drafts.slice(0, 8).map((draft) => (
                  <article className="grid gap-3 p-4 md:grid-cols-[1.4fr_1fr_auto] md:items-center" key={draft.id}>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{draft.title}</h3>
                      <p className="mt-1 font-mono text-xs text-texttone-secondaryLight dark:text-texttone-secondaryDark">
                        {draft.crIntake.crNumber || 'CR missing'} / {draft.crIntake.assetNumber || 'asset missing'}
                      </p>
                    </div>
                    <dl className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <dt className="label">Missing</dt>
                        <dd className="font-semibold">{draft.missingInfo.length}</dd>
                      </div>
                      <div>
                        <dt className="label">Checklist</dt>
                        <dd className="font-semibold">{draft.checklistPercent}%</dd>
                      </div>
                      <div>
                        <dt className="label">Updated</dt>
                        <dd className="font-semibold">{timeLabel(draft.updatedAt)}</dd>
                      </div>
                    </dl>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <StatusBadge status={draft.status} />
                      <Link className="btn-tertiary" to={`/draft/${draft.id}`}>
                        Open
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  action={
                    <Link className="btn" to="/intake">
                      Start CR Intake
                    </Link>
                  }
                  description="Load a fake sample CR or enter demo intake details to create the first planner-review draft."
                  title="No draft work orders yet"
                />
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-panel border border-border-subtle bg-surface-light p-5 shadow-panel dark:bg-surface-dark">
              <h2 className="text-base font-semibold">Quick actions</h2>
              <div className="mt-4 grid gap-2">
                <Link className="btn-secondary justify-start" to="/intake">New CR to WO</Link>
                <Link className="btn-secondary justify-start" to="/samples">Sample CR Library</Link>
                <Link className="btn-secondary justify-start" to="/fields">Maximo Field Builder</Link>
                <Link className="btn-secondary justify-start" to="/checklist">Planning Checklist</Link>
                <Link className="btn-secondary justify-start" to="/settings">Settings</Link>
              </div>
            </div>
            <div className="rounded-panel border border-border-subtle bg-surface-light p-5 shadow-panel dark:bg-surface-dark">
              <h2 className="text-base font-semibold">Sample quick-load</h2>
              <p className="mb-4 mt-1 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">Use fake CR data to move directly into intake.</p>
              <SampleQuickLoad onLoad={loadSample} samples={sampleCRs} />
            </div>
          </aside>
        </section>
      </PageContainer>
    </>
  );
}
