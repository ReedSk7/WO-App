import type {
  ChecklistItem,
  CRIntake,
  DensityPreference,
  MaximoTabId,
  MissingInfoItem,
  PlannerPackage,
  PlannerRefinementLogEntry,
  PlannerReviewSession,
  TemplateSettings,
  ThemePreference,
  WorkOrderDraft,
} from '../types';
import { UNKNOWN_PLANNER_SITE } from '../data/plannerSites';
import { defaultTemplates } from '../templates/defaults';
import { createDefaultChecklist } from '../utils/checklist';
import { detectMissingInfo } from '../utils/draft';
import { deriveDraftStatus } from '../utils/status';

export const STORAGE_KEYS = {
  theme: 'woac:v1:theme',
  templates: 'woac:v1:template-settings',
  drafts: 'woac:v1:drafts',
  currentCR: 'woac:v1:current-cr',
  currentDraftId: 'woac:v1:current-draft-id',
  checklists: 'woac:v1:checklists',
  density: 'woac:v1:ui-density',
  plannerReviewSessions: 'woac:v1:planner-review-sessions',
  currentPlannerReviewSessionId: 'woac:v1:current-planner-review-session-id',
  plannerRefinementLogs: 'woac:v1:planner-refinement-logs',
} as const;

const REFINEMENT_LOG_LIMIT = 50;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeMissingInfo(value: unknown, intake: CRIntake): MissingInfoItem[] {
  if (Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null && 'severity' in item)) {
    return value as MissingInfoItem[];
  }
  return detectMissingInfo(intake);
}

function normalizeDraft(draft: WorkOrderDraft): WorkOrderDraft {
  const checklist = Array.isArray(draft.checklist) && draft.checklist.length > 0 ? draft.checklist : createDefaultChecklist();
  const missingInfo = normalizeMissingInfo(draft.missingInfo, draft.crIntake);
  const checklistPercent = typeof draft.checklistPercent === 'number' ? draft.checklistPercent : 0;
  return {
    ...draft,
    checklist,
    missingInfo,
    checklistPercent,
    status: deriveDraftStatus(missingInfo, checklistPercent),
  };
}

export const loadDrafts = (): WorkOrderDraft[] => readJson<WorkOrderDraft[]>(STORAGE_KEYS.drafts, []).map(normalizeDraft);

export const saveDrafts = (drafts: WorkOrderDraft[]) => writeJson(STORAGE_KEYS.drafts, drafts.map(normalizeDraft));

export const loadDraft = (id?: string | null) => {
  const drafts = loadDrafts();
  if (id) return drafts.find((draft) => draft.id === id);
  const currentId = loadCurrentDraftId();
  return drafts.find((draft) => draft.id === currentId) ?? drafts[0];
};

export const upsertDraft = (draft: WorkOrderDraft) => {
  const normalized = normalizeDraft({ ...draft, updatedAt: new Date().toISOString() });
  const all = loadDrafts();
  const index = all.findIndex((item) => item.id === normalized.id);
  if (index >= 0) all[index] = normalized;
  else all.unshift(normalized);
  saveDrafts(all);
  saveCurrentDraftId(normalized.id);
  return normalized;
};

export const loadTemplates = (): TemplateSettings => ({ ...defaultTemplates, ...readJson<Partial<TemplateSettings>>(STORAGE_KEYS.templates, {}) });

export const saveTemplates = (templates: TemplateSettings) => writeJson(STORAGE_KEYS.templates, templates);

export const loadTheme = (): ThemePreference => readJson<ThemePreference>(STORAGE_KEYS.theme, 'light');

export const saveTheme = (value: ThemePreference) => writeJson(STORAGE_KEYS.theme, value);

export const loadDensity = (): DensityPreference => readJson<DensityPreference>(STORAGE_KEYS.density, 'comfortable');

export const saveDensity = (value: DensityPreference) => writeJson(STORAGE_KEYS.density, value);

export const loadCurrentCR = (): CRIntake | null => readJson<CRIntake | null>(STORAGE_KEYS.currentCR, null);

export const saveCurrentCR = (value: CRIntake) => writeJson(STORAGE_KEYS.currentCR, value);

export const loadCurrentDraftId = () => readJson<string | null>(STORAGE_KEYS.currentDraftId, null);

export const saveCurrentDraftId = (id: string) => writeJson(STORAGE_KEYS.currentDraftId, id);

export const loadChecklistMap = () => readJson<Record<string, ChecklistItem[]>>(STORAGE_KEYS.checklists, {});

export const saveChecklistForDraft = (draftId: string, checklist: ChecklistItem[]) => {
  const next = { ...loadChecklistMap(), [draftId]: checklist };
  writeJson(STORAGE_KEYS.checklists, next);
};

export const loadChecklistForDraft = (draftId: string) => loadChecklistMap()[draftId] ?? createDefaultChecklist();

function normalizePlannerPackage(plannerPackage: PlannerPackage): PlannerPackage {
  return {
    ...plannerPackage,
    siteId: plannerPackage.siteId ?? UNKNOWN_PLANNER_SITE.id,
    siteLabel: plannerPackage.siteLabel ?? UNKNOWN_PLANNER_SITE.label,
    relatedRecords: Array.isArray(plannerPackage.relatedRecords) ? plannerPackage.relatedRecords : [],
  };
}

function generatedTabText(session: PlannerReviewSession, tabId: MaximoTabId) {
  return normalizePlannerPackage(session.plannerPackage).tabs.find((tab) => tab.id === tabId)?.lines.join('\n') ?? '';
}

function normalizePlannerReviewSession(session: PlannerReviewSession): PlannerReviewSession {
  const plannerPackage = normalizePlannerPackage(session.plannerPackage);
  const tabEdits = plannerPackage.tabs.reduce<PlannerReviewSession['tabEdits']>((current, tab) => {
    current[tab.id] = typeof session.tabEdits?.[tab.id] === 'string' ? session.tabEdits[tab.id] : generatedTabText(session, tab.id);
    return current;
  }, {});

  return {
    ...session,
    plannerPackage,
    tabEdits,
    activeTabId: session.activeTabId ?? plannerPackage.tabs[0]?.id ?? 'workorder',
  };
}

export const loadPlannerReviewSessions = (): PlannerReviewSession[] =>
  readJson<PlannerReviewSession[]>(STORAGE_KEYS.plannerReviewSessions, []).map(normalizePlannerReviewSession);

export const savePlannerReviewSessions = (sessions: PlannerReviewSession[]) =>
  writeJson(STORAGE_KEYS.plannerReviewSessions, sessions.map(normalizePlannerReviewSession));

export const loadCurrentPlannerReviewSessionId = () => readJson<string | null>(STORAGE_KEYS.currentPlannerReviewSessionId, null);

export const saveCurrentPlannerReviewSessionId = (id: string) => writeJson(STORAGE_KEYS.currentPlannerReviewSessionId, id);

export const loadCurrentPlannerReviewSession = () => {
  const sessions = loadPlannerReviewSessions();
  const currentId = loadCurrentPlannerReviewSessionId();
  return sessions.find((session) => session.id === currentId) ?? sessions[0] ?? null;
};

export const upsertPlannerReviewSession = (session: PlannerReviewSession) => {
  const normalized = normalizePlannerReviewSession({ ...session, updatedAt: new Date().toISOString() });
  const sessions = loadPlannerReviewSessions();
  const index = sessions.findIndex((item) => item.id === normalized.id);
  if (index >= 0) sessions[index] = normalized;
  else sessions.unshift(normalized);
  savePlannerReviewSessions(sessions);
  saveCurrentPlannerReviewSessionId(normalized.id);
  return normalized;
};

function normalizePlannerRefinementLogEntry(entry: PlannerRefinementLogEntry): PlannerRefinementLogEntry {
  const siteId = entry.siteId ?? entry.report?.siteId ?? UNKNOWN_PLANNER_SITE.id;
  const siteLabel = entry.siteLabel ?? entry.report?.siteLabel ?? UNKNOWN_PLANNER_SITE.label;
  return {
    ...entry,
    siteId,
    siteLabel,
    report: {
      ...entry.report,
      siteId,
      siteLabel,
    },
  };
}

export const loadPlannerRefinementLogs = (): PlannerRefinementLogEntry[] =>
  readJson<PlannerRefinementLogEntry[]>(STORAGE_KEYS.plannerRefinementLogs, []).map(normalizePlannerRefinementLogEntry);

export const savePlannerRefinementLogs = (entries: PlannerRefinementLogEntry[]) =>
  writeJson(STORAGE_KEYS.plannerRefinementLogs, entries.map(normalizePlannerRefinementLogEntry).slice(0, REFINEMENT_LOG_LIMIT));

export const appendPlannerRefinementLog = (entry: PlannerRefinementLogEntry) => {
  const next = [normalizePlannerRefinementLogEntry(entry), ...loadPlannerRefinementLogs()].slice(0, REFINEMENT_LOG_LIMIT);
  savePlannerRefinementLogs(next);
  return next[0];
};
