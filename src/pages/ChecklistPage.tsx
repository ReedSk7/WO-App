import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { ChecklistGroup } from '../components/checklist/ChecklistGroup';
import { ChecklistProgress } from '../components/checklist/ChecklistProgress';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ToastRegion } from '../components/ui/ToastRegion';
import { loadDraft, saveChecklistForDraft, upsertDraft } from '../storage/local';
import type { ChecklistItem } from '../types';
import { checklistPercent, criticalOpenCount, groupChecklist } from '../utils/checklist';
import { deriveDraftStatus } from '../utils/status';

export default function ChecklistPage() {
  const [draft, setDraft] = useState(loadDraft());
  const [toast, setToast] = useState<string | null>(null);
  const percent = useMemo(() => (draft ? checklistPercent(draft.checklist) : 0), [draft]);
  const grouped = useMemo(() => (draft ? groupChecklist(draft.checklist) : []), [draft]);

  if (!draft) {
    return (
      <>
        <AppHeader subtitle="Create or open a draft before tying checklist status to a work order package." title="Planning Checklist" />
        <PageContainer>
          <EmptyState
            action={<Link className="btn" to="/intake">Create Draft</Link>}
            description="Checklist progress is saved against the current draft in browser local storage."
            title="No current draft"
          />
        </PageContainer>
      </>
    );
  }

  const persistChecklist = (items: ChecklistItem[]) => {
    const nextPercent = checklistPercent(items);
    const nextDraft = {
      ...draft,
      checklist: items,
      checklistPercent: nextPercent,
      status: deriveDraftStatus(draft.missingInfo, nextPercent),
      updatedAt: new Date().toISOString(),
    };
    saveChecklistForDraft(draft.id, items);
    const saved = upsertDraft(nextDraft);
    setDraft(saved);
  };

  const toggleItem = (id: string, checked: boolean) => {
    persistChecklist(draft.checklist.map((item) => (item.id === id ? { ...item, checked } : item)));
  };

  const resetChecklist = () => {
    persistChecklist(draft.checklist.map((item) => ({ ...item, checked: false })));
    setToast('Checklist reset');
  };

  return (
    <>
      <AppHeader
        actions={
          <>
            <StatusBadge status={draft.status} />
            <Link className="btn-secondary" to={`/draft/${draft.id}`}>Return to Draft Review</Link>
          </>
        }
        subtitle="Checklist progress is local to the current draft and drives Draft / Review Ready status."
        title="Planning Checklist"
      />
      <PageContainer>
        <section className="rounded-panel border border-border-subtle bg-surface-light p-6 shadow-panel dark:bg-surface-dark">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <ChecklistProgress criticalOpen={criticalOpenCount(draft.checklist)} percent={percent} />
            <button className="btn-tertiary" onClick={resetChecklist} type="button">Reset checklist</button>
          </div>
          <p className="mt-4 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
            Review Ready status requires checklist progress of at least 80% and no blocking missing-info items.
          </p>
        </section>
        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.map((group) => (
            <ChecklistGroup items={group.items} key={group.id} onToggle={toggleItem} title={group.title} />
          ))}
        </div>
      </PageContainer>
      <ToastRegion message={toast} />
    </>
  );
}
