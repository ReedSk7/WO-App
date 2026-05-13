import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { DraftAccordion } from '../components/draft/DraftAccordion';
import { DraftToolbar } from '../components/draft/DraftToolbar';
import { MissingInfoSummary } from '../components/forms/MissingInfoSummary';
import { ChecklistProgress } from '../components/checklist/ChecklistProgress';
import { EmptyState } from '../components/ui/EmptyState';
import { MetaItem } from '../components/ui/MetaItem';
import { SafetyBanner } from '../components/ui/SafetyBanner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ToastRegion } from '../components/ui/ToastRegion';
import { loadDraft, upsertDraft } from '../storage/local';
import type { DraftSection, WorkOrderDraft } from '../types';
import { checklistPercent, criticalOpenCount } from '../utils/checklist';
import { deriveDraftStatus } from '../utils/status';
import { downloadTextFile, draftFileStem, formatDraftMarkdown } from '../utils/export';
import { useClipboard } from '../hooks/useClipboard';

export default function DraftReviewPage() {
  const { draftId } = useParams();
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<WorkOrderDraft | undefined>(() => loadDraft(draftId));
  const { copyText, copiedLabel } = useClipboard(setToast);

  const normalizedDraft = useMemo(() => {
    if (!draft) return undefined;
    const percent = checklistPercent(draft.checklist);
    return { ...draft, checklistPercent: percent, status: deriveDraftStatus(draft.missingInfo, percent) };
  }, [draft]);

  if (!normalizedDraft) {
    return (
      <>
        <AppHeader subtitle="No current draft was found in this browser." title="Draft Review" />
        <PageContainer>
          <EmptyState
            action={<Link className="btn" to="/intake">Create Draft from CR Intake</Link>}
            description="Drafts are stored in browser local storage only. Load a fake sample CR or complete intake to generate a review package."
            title="No draft available"
          />
        </PageContainer>
      </>
    );
  }

  const save = () => {
    const saved = upsertDraft(normalizedDraft);
    setDraft(saved);
    setToast('Draft saved');
  };

  const copyFull = () => copyText(formatDraftMarkdown(normalizedDraft), 'Full draft copied');

  const exportMarkdown = () => {
    downloadTextFile(`${draftFileStem(normalizedDraft)}.md`, formatDraftMarkdown(normalizedDraft), 'text/markdown');
    setToast('Markdown exported');
  };

  const exportJson = () => {
    downloadTextFile(`${draftFileStem(normalizedDraft)}.json`, JSON.stringify(normalizedDraft, null, 2), 'application/json');
    setToast('JSON exported');
  };

  const updateSection = (sectionId: string, content: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            sections: current.sections.map((section) => (section.id === sectionId ? { ...section, content } : section)),
            updatedAt: new Date().toISOString(),
          }
        : current,
    );
  };

  const copySection = (section: DraftSection) => copyText(section.content, `${section.title} copied`);

  const metadata = (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <MetaItem label="CR" mono value={normalizedDraft.crIntake.crNumber || 'Missing'} />
      <MetaItem label="Asset" mono value={normalizedDraft.crIntake.assetNumber || 'Missing'} />
      <MetaItem label="Location" value={normalizedDraft.crIntake.location || 'Missing'} />
      <MetaItem label="Missing info" value={normalizedDraft.missingInfo.length} />
      <MetaItem label="Checklist" value={`${normalizedDraft.checklistPercent}%`} />
    </dl>
  );

  return (
    <>
      <AppHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={normalizedDraft.status} />
            <Link className="btn-secondary" to="/checklist">Open Checklist</Link>
          </div>
        }
        metadata={metadata}
        subtitle="Editable planner-review package with deterministic placeholders, section flags, and local copy/export tools."
        title={normalizedDraft.title}
      />
      <PageContainer>
        <SafetyBanner />
        <DraftToolbar onCopy={copyFull} onExportJson={exportJson} onExportMarkdown={exportMarkdown} onPrint={() => window.print()} onSave={save} />

        <section className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_22rem]">
          <nav aria-label="Draft section navigation" className="hidden xl:block">
            <div className="sticky top-6 rounded-panel border border-border-subtle bg-surface-light p-4 shadow-panel dark:bg-surface-dark">
              <h2 className="text-sm font-semibold">Sections</h2>
              <div className="mt-3 space-y-1">
                {normalizedDraft.sections.map((section) => (
                  <a className="block rounded-md px-3 py-2 text-sm text-texttone-secondaryLight hover:bg-surface-raisedLight hover:text-texttone-primaryLight dark:text-texttone-secondaryDark dark:hover:bg-surface-raisedDark dark:hover:text-texttone-primaryDark" href={`#${section.id}`} key={section.id}>
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          <DraftAccordion flags={normalizedDraft.missingInfo} onCopySection={copySection} onSectionChange={updateSection} sections={normalizedDraft.sections} />

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-panel border border-border-subtle bg-surface-light p-5 shadow-panel dark:bg-surface-dark">
              <h2 className="text-base font-semibold">Readiness</h2>
              <div className="mt-4">
                <ChecklistProgress criticalOpen={criticalOpenCount(normalizedDraft.checklist)} percent={normalizedDraft.checklistPercent} />
              </div>
              <p className="mt-4 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
                Review Ready requires no blocking missing-info items and checklist progress of at least 80%.
              </p>
            </div>
            <MissingInfoSummary items={normalizedDraft.missingInfo} />
          </aside>
        </section>
      </PageContainer>
      <ToastRegion message={toast ?? copiedLabel} />
    </>
  );
}
