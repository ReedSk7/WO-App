export type Discipline =
  | 'Electrical'
  | 'Mechanical'
  | 'I&C'
  | 'Civil/Structural'
  | 'Operations Support'
  | 'Generic';

export type WorkType =
  | 'Corrective Maintenance'
  | 'Preventive Maintenance'
  | 'Generic Work'
  | 'Troubleshooting'
  | 'Inspection';

export type Priority = 'Low' | 'Normal' | 'High' | 'Emergent';
export type DraftStatus = 'Draft' | 'Needs Info' | 'Review Ready';
export type MissingInfoSeverity = 'blocking' | 'caution' | 'info';
export type ThemePreference = 'light' | 'dark';
export type DensityPreference = 'comfortable' | 'compact';

export interface CRIntake {
  crNumber: string;
  crTitle: string;
  assetNumber: string;
  componentDescription: string;
  location: string;
  problemStatement: string;
  discoveredCondition: string;
  requestedAction: string;
  discipline: Discipline;
  workType: WorkType;
  priority: Priority;
  safetySignificance: boolean;
  requiresClearance: boolean;
  requiresEngineeringInput: boolean;
  requiresParts: boolean;
  requiresScaffoldOrLift: boolean;
  notes: string;
}

export interface MissingInfoItem {
  id: string;
  severity: MissingInfoSeverity;
  message: string;
  field?: keyof CRIntake | string;
  section?: string;
}

export interface DraftSection {
  id: string;
  title: string;
  content: string;
}

export interface ChecklistItem {
  id: string;
  group: string;
  label: string;
  checked: boolean;
  critical?: boolean;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface TemplateSettings {
  draftDisclaimer: string;
  safetyNote: string;
  missingInfoWarning: string;
  oraNote: string;
  clearanceNote: string;
  pmtPlaceholder: string;
  acceptanceCriteriaPlaceholder: string;
  reviewerNote: string;
}

export interface WorkOrderDraft {
  id: string;
  title: string;
  crIntake: CRIntake;
  sections: DraftSection[];
  missingInfo: MissingInfoItem[];
  status: DraftStatus;
  checklist: ChecklistItem[];
  checklistPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface SampleCR {
  id: string;
  name: string;
  summary: string;
  intake: CRIntake;
}

export type PlannerRecordType = 'CR' | 'MPL' | 'WO' | 'Unknown';
export type PlannerMatchType = 'sample' | 'generic';
export type PlannerResponseMode =
  | 'create-work-order-draft'
  | 'review-work-order'
  | 'research-planning-basis'
  | 'general-guidance';
export type PlannerSiteId =
  | 'plant-farley'
  | 'vogtle-1-2'
  | 'vogtle-3-4'
  | 'hatch'
  | 'site-not-captured';

export type MaximoTabId =
  | 'workorder'
  | 'plans'
  | 'reviews'
  | 'engineering'
  | 'scheduling'
  | 'logic'
  | 'related-records'
  | 'actuals'
  | 'safety-plan'
  | 'impact-plans'
  | 'log'
  | 'specifications';

export interface MaximoTabDefinition {
  id: MaximoTabId;
  label: string;
}

export interface PlannerSiteDefinition {
  id: PlannerSiteId;
  label: string;
}

export interface PlannerRelatedRecord {
  recordNumber: string;
  title: string;
  tabId: MaximoTabId;
}

export interface PlannerCopyBlock {
  id: string;
  sequence: number;
  summary: string;
  longDescription: string;
}

export interface PlannerTabContent extends MaximoTabDefinition {
  lines: string[];
  copyBlocks?: PlannerCopyBlock[];
}

export interface PlannerModeDefinition {
  id: PlannerResponseMode;
  label: string;
  summary: string;
  outputSections: string[];
  focus: string[];
}

export interface PlannerAssistantGuidance {
  capabilities: string[];
  operatingPriorities: string[];
  sourcePrecedence: string[];
  outputDiscipline: string[];
  limitations: string[];
}

export interface PlannerPackage {
  input: string;
  normalizedInput: string;
  siteId: PlannerSiteId;
  siteLabel: string;
  matchType: PlannerMatchType;
  mode: PlannerResponseMode;
  modeLabel: string;
  modeSummary: string;
  recordType: PlannerRecordType;
  recordNumber: string;
  title: string;
  asset: string;
  location: string;
  priority: string;
  workType: string;
  discipline: string;
  status: string;
  confidence: number;
  generatedAt: string;
  knownFacts: string[];
  assumptions: string[];
  informationGaps: string[];
  risks: string[];
  plannerNextActions: string[];
  modeOutputSections: string[];
  modeFocus: string[];
  assistantGuidance: PlannerAssistantGuidance;
  relatedRecords: PlannerRelatedRecord[];
  tabs: PlannerTabContent[];
}

export type PlannerTabEdits = Partial<Record<MaximoTabId, string>>;

export interface PlannerReviewSession {
  id: string;
  plannerPackage: PlannerPackage;
  tabEdits: PlannerTabEdits;
  activeTabId: MaximoTabId;
  createdAt: string;
  updatedAt: string;
}

export type RefinementLineChangeType = 'kept' | 'added' | 'removed' | 'edited';

export interface RefinementLineChange {
  type: RefinementLineChangeType;
  lineNumber: number;
  agentGenerated?: string;
  plannerFinal?: string;
}

export interface RefinementTabSummary {
  tabId: MaximoTabId;
  tabLabel: string;
  agentGeneratedBaseline: string;
  plannerFinalText: string;
  kept: number;
  added: number;
  removed: number;
  edited: number;
  changes: RefinementLineChange[];
}

export interface PlannerRefinementReport {
  sessionId: string;
  input: string;
  siteId: PlannerSiteId;
  siteLabel: string;
  mode: PlannerResponseMode;
  modeLabel: string;
  recordNumber: string;
  title: string;
  generatedAt: string;
  exportedAt: string;
  changedTabs: number;
  totals: {
    kept: number;
    added: number;
    removed: number;
    edited: number;
  };
  tabs: RefinementTabSummary[];
}

export interface PlannerRefinementLogEntry {
  id: string;
  sessionId: string;
  revisionId: string;
  savedAt: string;
  siteId: PlannerSiteId;
  siteLabel: string;
  recordNumber: string;
  activeTabId: MaximoTabId;
  report: PlannerRefinementReport;
}
