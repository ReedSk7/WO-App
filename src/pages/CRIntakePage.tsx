import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sampleCRs } from '../data/sampleCRs';
import { AppHeader } from '../components/layout/AppHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { CRForm } from '../components/forms/CRForm';
import { MissingInfoSummary } from '../components/forms/MissingInfoSummary';
import { SampleQuickLoad } from '../components/samples/SampleQuickLoad';
import { ChecklistProgress } from '../components/checklist/ChecklistProgress';
import { StatusBadge } from '../components/ui/StatusBadge';
import { loadCurrentCR, loadDraft, loadTemplates, saveCurrentCR, upsertDraft } from '../storage/local';
import type { CRIntake, SampleCR } from '../types';
import { emptyCRIntake, makeDraft } from '../utils/draft';
import { deriveDraftStatus } from '../utils/status';
import { useCRValidation } from '../hooks/useCRValidation';

export default function CRIntakePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CRIntake>(() => loadCurrentCR() ?? emptyCRIntake());
  const [sampleLoaded, setSampleLoaded] = useState<string | null>(null);
  const [lastDraftId, setLastDraftId] = useState<string | null>(() => loadDraft()?.id ?? null);
  const validation = useCRValidation(form);
  const currentDraft = lastDraftId ? loadDraft(lastDraftId) : undefined;
  const statusPreview = useMemo(() => deriveDraftStatus(validation.missingInfo, currentDraft?.checklistPercent ?? 0), [currentDraft?.checklistPercent, validation.missingInfo]);

  const setField = <K extends keyof CRIntake>(field: K, value: CRIntake[K]) => {
    const next = { ...form, [field]: value };
    setForm(next);
    saveCurrentCR(next);
  };

  const focusFirstInvalid = () => {
    const first = Object.keys(validation.fieldErrors)[0];
    if (first) document.getElementById(first)?.focus();
  };

  const buildDraft = () => {
    const next = makeDraft(form, loadTemplates());
    const existing = lastDraftId ? loadDraft(lastDraftId) : undefined;
    if (!existing) return next;
    return {
      ...next,
      id: existing.id,
      checklist: existing.checklist,
      checklistPercent: existing.checklistPercent,
      status: deriveDraftStatus(next.missingInfo, existing.checklistPercent),
      createdAt: existing.createdAt,
    };
  };

  const generate = () => {
    validation.setSubmitted(true);
    const draft = upsertDraft(buildDraft());
    setLastDraftId(draft.id);
    if (validation.isValid) navigate(`/draft/${draft.id}`);
    else window.setTimeout(focusFirstInvalid, 0);
  };

  const saveOnly = () => {
    const draft = upsertDraft(buildDraft());
    setLastDraftId(draft.id);
  };

  const loadSample = (sample: SampleCR) => {
    setForm(sample.intake);
    saveCurrentCR(sample.intake);
    setSampleLoaded(sample.name);
    setLastDraftId(null);
    validation.setSubmitted(false);
  };

  const clearForm = () => {
    const empty = emptyCRIntake();
    setForm(empty);
    saveCurrentCR(empty);
    setSampleLoaded(null);
    setLastDraftId(null);
    validation.setSubmitted(false);
  };

  return (
    <>
      <AppHeader
        actions={
          <>
            <button className="btn" onClick={generate} type="button">Generate Draft Work Order</button>
            {lastDraftId ? <Link className="btn-secondary" to={`/draft/${lastDraftId}`}>Open Current Draft</Link> : null}
          </>
        }
        subtitle="Grouped intake keeps the CR context, asset condition, and planning needs visible while missing information is flagged."
        title="CR Intake"
      />
      <PageContainer>
        {validation.submitted && validation.missingInfo.length > 0 ? <MissingInfoSummary items={validation.missingInfo} onChipClick={(item) => item.field && document.getElementById(String(item.field))?.focus()} /> : null}
        {sampleLoaded ? (
          <div className="rounded-panel border border-brand-500/40 bg-brand-500/10 px-4 py-3 text-sm font-semibold text-brand-700 dark:text-brand-400">
            Demo sample loaded: {sampleLoaded}
          </div>
        ) : null}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <CRForm form={form} onClear={clearForm} onGenerate={generate} onSave={saveOnly} setField={setField} validation={validation} />

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <MissingInfoSummary items={validation.missingInfo} onChipClick={(item) => item.field && document.getElementById(String(item.field))?.focus()} />
            <div className="rounded-panel border border-border-subtle bg-surface-light p-5 shadow-panel dark:bg-surface-dark">
              <h2 className="text-base font-semibold">Draft status preview</h2>
              <div className="mt-3 flex items-center gap-3">
                <StatusBadge status={statusPreview} />
                <span className="text-sm text-texttone-secondaryLight dark:text-texttone-secondaryDark">{validation.missingInfo.filter((item) => item.severity === 'blocking').length} blocking items</span>
              </div>
              <div className="mt-4">
                <ChecklistProgress percent={currentDraft?.checklistPercent ?? 0} />
              </div>
            </div>
            <div className="rounded-panel border border-border-subtle bg-surface-light p-5 shadow-panel dark:bg-surface-dark">
              <h2 className="text-base font-semibold">Sample CR quick-load</h2>
              <p className="mb-4 mt-1 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">Every sample is fake/demo-only.</p>
              <SampleQuickLoad onLoad={loadSample} samples={sampleCRs} />
            </div>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
