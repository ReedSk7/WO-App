/**
 * Normalized application models for the Work Order Readiness prototype.
 *
 * All records in this prototype are synthetic. Source-specific adapters should
 * map their payloads into these types before the UI consumes them.
 */

export const READINESS_CATEGORIES = [
  "safety-and-job-hazards",
  "clearance-and-energy-control",
  "equipment-history-and-impact",
  "operational-risk-and-plant-conditions",
  "permits-and-special-controls",
  "scaffolding-and-access",
  "parts-and-materials",
  "tools-and-test-equipment",
  "work-package-and-procedures",
  "walkdown-and-task-preview",
  "support-group-coordination",
  "operational-experience",
  "workforce-readiness",
  "testing-and-restoration",
] as const;

export type ReadinessCategory = (typeof READINESS_CATEGORIES)[number];

export const READINESS_CATEGORY_LABELS: Record<ReadinessCategory, string> = {
  "safety-and-job-hazards": "Safety and Job Hazards",
  "clearance-and-energy-control": "Clearance and Energy Control",
  "equipment-history-and-impact": "Equipment History and Impact",
  "operational-risk-and-plant-conditions":
    "Operational Risk and Plant Conditions",
  "permits-and-special-controls": "Permits & Special Controls",
  "scaffolding-and-access": "Scaffolding and Access",
  "parts-and-materials": "Parts and Materials",
  "tools-and-test-equipment": "Tools and Test Equipment",
  "work-package-and-procedures": "Work Package and Procedures",
  "walkdown-and-task-preview": "Walkdown and Task Preview",
  "support-group-coordination": "Support Group Coordination",
  "operational-experience": "Operational Experience",
  "workforce-readiness": "Workforce Readiness",
  "testing-and-restoration": "Testing and Restoration",
};

export const READINESS_STATUSES = [
  "complete",
  "blocker",
  "review",
  "pending",
  "dayOfAction",
  "notApplicable",
  "unableToVerify",
] as const;

export type ReadinessStatus = (typeof READINESS_STATUSES)[number];

export const READINESS_STATUS_LABELS: Record<ReadinessStatus, string> = {
  complete: "Complete",
  blocker: "Blocker",
  review: "Review Required",
  pending: "Pending",
  dayOfAction: "Day-of Action",
  notApplicable: "Not Applicable",
  unableToVerify: "Unable to Verify",
};

export type OverallReadinessState =
  | "BLOCKED"
  | "NOT READY"
  | "REVIEW REQUIRED"
  | "READY WITH DAY-OF ACTIONS"
  | "READY"
  | "UNABLE TO VERIFY";

export type ReadinessApplicability =
  | "required"
  | "notRequired"
  | "undetermined"
  | "notYetEvaluated"
  | "conditional";

export type VerificationMethod =
  | "sourceConfirmed"
  | "userConfirmed"
  | "inferredDemo"
  | "unableToVerify";

export const VERIFICATION_METHOD_LABELS: Record<VerificationMethod, string> = {
  sourceConfirmed: "Source Confirmed",
  userConfirmed: "User Confirmed",
  inferredDemo: "Inferred from demonstration data",
  unableToVerify: "Unable to Verify",
};

export type SourceAvailability = "available" | "partial" | "unavailable";
export type StaleBehavior = "refreshRecommended" | "unableToVerify";

export type Site = "Hatch" | "Farley" | "Vogtle 1 & 2" | "Vogtle 3 & 4";
export type WorkMode = "Outage" | "Online";

export type DemoScenarioId =
  | "ready"
  | "blocked"
  | "review-required"
  | "ready-day-of"
  | "unable-to-verify";

export interface RelatedReadinessItem {
  id: string;
  label: string;
  relationship?: string;
}

export interface ReadinessHistoryEntry {
  timestamp: string;
  previousState?: string;
  newState: string;
  explanation: string;
  actorRole?: string;
}

export interface GenericDetailField {
  label: string;
  value?: string;
  status?: ReadinessStatus;
  note?: string;
}

export interface GenericDetailSection {
  title: string;
  emptyState?: string;
  fields?: GenericDetailField[];
}

export const PERMIT_CONTROL_TYPES = [
  "Hot Work Permit",
  "Transient Combustible Permit",
  "Confined Space",
  "Radiation Work Permit",
  "Scaffold Request",
  "Temporary Power",
  "Rigging Evaluation",
  "FME Controls",
  "Fire Watch",
  "Insulation Removal or Environmental Review",
] as const;

export type PermitControlType = (typeof PERMIT_CONTROL_TYPES)[number];
export type PermitApplicability = "Required" | "Not Required" | "Undetermined";
export type PermitLifecycleStatus =
  | "Not Started"
  | "Requested"
  | "Under Review"
  | "Ready for Issuance"
  | "Issued / Active"
  | "Blocked"
  | "Expired"
  | "Canceled";

export interface PermitControlRecord {
  id: string;
  type: PermitControlType;
  applicability: PermitApplicability;
  lifecycleStatus: PermitLifecycleStatus;
  /** Normalized by the evaluation utility; source payloads may supply a hint. */
  readinessClassification: ReadinessStatus;
  responsibleGroup?: string;
  requestRecordNumber?: string;
  targetReadyDate?: string;
  scheduledExecutionDate?: string;
  prerequisites?: string[];
  outstandingPrerequisites?: string[];
  blockingIssue?: string;
  lastVerifiedAt?: string;
  sourceSystem?: string;
  sourceRecordUrl?: string;
  verificationMethod?: VerificationMethod;
  sourceAvailability?: SourceAvailability;
  sourceStatus?: string;
  advancePrerequisitesComplete?: boolean;
  requiresDayOfIssuance?: boolean;
  notes?: string;
}

export type EnergySourceType =
  | "Electrical"
  | "Hydraulic"
  | "Pneumatic"
  | "Mechanical"
  | "Other";

export interface EnergySourceRecord {
  type: EnergySourceType;
  identified: boolean | "Undetermined";
  note?: string;
}

export interface ClearanceEnergyControlDetail {
  isolationRequired: "Required" | "Not Required" | "Undetermined";
  clearanceRequestStatus?: string;
  energySources: EnergySourceRecord[];
  localIsolationAvailability?: "Available" | "Unavailable" | "Undetermined";
  personalDangerTagApplicability?: "Required" | "Not Required" | "Undetermined";
  drainingOrVentingRequirement?: "Required" | "Not Required" | "Undetermined";
  conflicts?: string[];
  lastSourceSystemCheck?: string;
  unableToVerify?: boolean;
  basis?: string;
}

export type HistoryFindingClassification =
  | "Informational"
  | "Review Required"
  | "Potential Impact"
  | "Confirmed Blocker";

export type HistoryRecordType =
  | "Work Order"
  | "Condition Report"
  | "Task Evaluation"
  | "Feedback Item";

export interface EquipmentHistoryFinding {
  id: string;
  section:
    | "Changes Since Planning"
    | "Open or Unresolved Records"
    | "Recent Work"
    | "Recurring Issues"
    | "Related Work Orders"
    | "Prior Support Needs"
    | "Full History";
  recordType: HistoryRecordType;
  recordLabel: string;
  title: string;
  summary: string;
  classification: HistoryFindingClassification;
  date?: string;
  relationship?: string;
  sourceRecordUrl?: string;
}

export interface EquipmentHistoryDetail {
  changesSincePlanning: EquipmentHistoryFinding[];
  openOrUnresolvedRecords: EquipmentHistoryFinding[];
  recentWork: EquipmentHistoryFinding[];
  recurringIssues: EquipmentHistoryFinding[];
  relatedWorkOrders: EquipmentHistoryFinding[];
  priorSupportNeeds: EquipmentHistoryFinding[];
  fullHistory: EquipmentHistoryFinding[];
}

export type OperationalConditionType =
  | "RAS"
  | "FAS"
  | "LCO"
  | "Protected Train Swap"
  | "Other";

export interface OperationalConditionRecord {
  id: string;
  type: OperationalConditionType;
  conditionFound: boolean | "Unable to Verify";
  relationshipToWorkOrder: string;
  humanReviewRequired: boolean;
  source?: string;
  lastCheckedAt?: string;
  verificationMethod: VerificationMethod;
  notes?: string;
}

export interface OperationalConditionsDetail {
  conditions: OperationalConditionRecord[];
  decisionSupportOnly: true;
}

export interface OperationalExperienceRecord {
  id: string;
  title: string;
  shortSummary: string;
  whyMatched: string;
  equipmentTaskRelationship: string;
  sourceType: string;
  date: string;
  reviewAcknowledged: boolean;
  potentialWorkOrderImpact?: string;
  sourceRecordUrl?: string;
}

export interface OperationalExperienceDetail {
  results: OperationalExperienceRecord[];
  noResultsMessage?: string;
}

export type MaterialProgressState =
  | "Not Started"
  | "Reserved"
  | "Available"
  | "Picked"
  | "Staged"
  | "Verified"
  | "Unable to Verify";

export interface MaterialRecord {
  id: string;
  syntheticPartLabel: string;
  required: boolean | "Undetermined";
  progress: MaterialProgressState;
  reserved: boolean | "Unable to Verify";
  onSite: boolean | "Unable to Verify";
  picked: boolean | "Unable to Verify";
  staged: boolean | "Unable to Verify";
  verified: boolean | "Unable to Verify";
  shelfLifeValidThroughExecution?: boolean | "Unable to Verify";
  equivalencyReviewStatus?: "Not Required" | "Pending" | "Complete" | "Undetermined";
  materialHold?: boolean | "Unable to Verify";
  outstandingIssue?: string;
}

export interface PartsMaterialsDetail {
  requiredPartsIdentified: boolean | "Unable to Verify";
  materials: MaterialRecord[];
}

export interface ScaffoldingAccessDetail {
  scaffoldRequired: "Required" | "Not Required" | "Undetermined";
  determinationMethod?: string;
  requestSubmitted?: boolean | "Undetermined";
  designStatus?: string;
  buildStatus?: string;
  inspectionAcceptanceStatus?: string;
  readyForUse?: boolean | "Unable to Verify";
  accessConstraints?: string[];
  interferenceRemoval?: string;
  ladderOrAlternateAccess?: string;
  targetReadyDate?: string;
  basis?: string;
}

export interface WalkdownTaskPreviewDetail {
  walkdownLevel: string | "Not Determined";
  walkdownRequired: "Required" | "Not Required" | "Undetermined";
  walkdownStatus?: string;
  completedDate?: string;
  completedByRole?: string;
  questionsRemaining?: string[];
  constraintsFound?: string[];
  plannerFeedbackSubmitted?: boolean | "Undetermined";
  taskPreviewCompleted?: boolean | "Undetermined";
  supervisorEngagementStatus?: string;
}

export interface WorkPackageProceduresDetail {
  workPackageAvailable: boolean | "Unable to Verify";
  electronicPackageLink?: string;
  referencedDocumentsPresent: boolean | "Unable to Verify";
  currentRevisionVerified: boolean | "Unable to Verify";
  drawingsAvailable: boolean | "Not Required" | "Unable to Verify";
  engineeringDocumentsAvailable: boolean | "Not Required" | "Unable to Verify";
  outstandingPackageFeedback?: string[];
  adequacyApprovedByPrototype: false;
}

export type SupportRequirement = "Required" | "Not Required" | "Undetermined";

export interface SupportCoordinationRecord {
  id: string;
  group:
    | "Operations"
    | "Radiation Protection / Health Physics"
    | "Quality Control"
    | "Engineering"
    | "Chemistry"
    | "Security"
    | "Fire Protection"
    | "Other maintenance groups"
    | "Crane or rigging"
    | "Vendor support"
    | "FME monitor"
    | "Fire watch"
    | "Decontamination"
    | "Insulation support";
  requirement: SupportRequirement;
  requested?: boolean;
  acceptedOrAcknowledged?: boolean;
  scheduled?: boolean;
  ready?: boolean | "Unable to Verify";
  ownerGroup?: string;
  timing?: string;
  outstandingIssue?: string;
}

export interface SupportCoordinationDetail {
  supportItems: SupportCoordinationRecord[];
}

export interface ToolsTestEquipmentDetail {
  specialToolsRequired: "Required" | "Not Required" | "Undetermined";
  toolAvailability?: string;
  reservationStatus?: string;
  stagingStatus?: string;
  measuringAndTestEquipmentRequired: "Required" | "Not Required" | "Undetermined";
  calibrationValidThroughExecution?: boolean | "Unable to Verify";
  outstandingIssue?: string;
}

export interface WorkforceReadinessDetail {
  requiredDiscipline?: string;
  minimumCrewSizePlaceholder?: string;
  specialQualificationRequired: "Required" | "Not Required" | "Undetermined";
  assignedCrewStatus: string;
  qualificationsVerified: boolean | "Unable to Verify" | "Not evaluated — crew not assigned.";
  proficiencyReviewRequired: boolean | "Undetermined";
  justInTimeTrainingRequired: boolean | "Undetermined";
  supervisorOversightRequirement: string;
}

export interface TestingRestorationDetail {
  postMaintenanceTestIdentified: boolean | "Undetermined";
  testPrerequisites?: string[];
  requiredSupport?: string[];
  testEquipment?: string[];
  restorationStepsIdentified: boolean | "Undetermined";
  outstandingDependency?: string;
  testInstructionsGeneratedByPrototype: false;
}

export interface ReadinessItemDetails {
  genericSections?: GenericDetailSection[];
  permits?: PermitControlRecord[];
  clearance?: ClearanceEnergyControlDetail;
  equipmentHistory?: EquipmentHistoryDetail;
  operationalConditions?: OperationalConditionsDetail;
  operationalExperience?: OperationalExperienceDetail;
  parts?: PartsMaterialsDetail;
  scaffolding?: ScaffoldingAccessDetail;
  walkdown?: WalkdownTaskPreviewDetail;
  workPackage?: WorkPackageProceduresDetail;
  supportCoordination?: SupportCoordinationDetail;
  tools?: ToolsTestEquipmentDetail;
  workforce?: WorkforceReadinessDetail;
  testingRestoration?: TestingRestorationDetail;
}

export interface ReadinessItem {
  id: string;
  category: ReadinessCategory;
  title: string;
  shortResult: string;
  detailedBasis?: string;
  status: ReadinessStatus;
  isExecutionBlocker: boolean;
  applicability?: ReadinessApplicability;
  sourceSystem?: string;
  sourceRecordLabel?: string;
  sourceRecordUrl?: string;
  lastCheckedAt?: string;
  owner?: string;
  responsibleGroup?: string;
  nextAction?: string;
  targetReadyDate?: string;
  scheduledExecutionDate?: string;
  outstandingPrerequisites?: string[];
  confidence?: string;
  verificationMethod?: VerificationMethod;
  sourceAvailability?: SourceAvailability;
  relatedItems?: RelatedReadinessItem[];
  history?: ReadinessHistoryEntry[];
  notes?: string[];
  details?: ReadinessItemDetails;
  isCriticalData?: boolean;
  requiresSourceVerification?: boolean;
  staleAfterMinutes?: number;
  staleBehavior?: StaleBehavior;
}

export interface WorkOrderSummary {
  workOrderNumber: string;
  site: Site;
  taskDescription: string;
  equipmentOrLocation: string;
  scheduledExecutionDate: string;
  workMode: WorkMode;
  lastDataRefreshAt: string;
  crew?: string;
  department?: string;
  demoScenarioId: DemoScenarioId;
  isSynthetic: true;
}

export interface ReadinessChange {
  id: string;
  timestamp: string;
  category: ReadinessCategory;
  previousState: string;
  newState: string;
  explanation: string;
}

export interface ReadinessScenario {
  id: DemoScenarioId;
  label: string;
  description: string;
  workOrder: WorkOrderSummary;
  items: ReadinessItem[];
  changes: ReadinessChange[];
  dataNotice: string;
  sourceAvailability?: SourceAvailability;
}

export const READINESS_FILTERS = [
  "action-needed",
  "blockers",
  "review",
  "pending",
  "complete",
  "all",
] as const;

export type ReadinessFilter = (typeof READINESS_FILTERS)[number];

export interface ReadinessActionItem {
  id: string;
  readinessItemId: string;
  description: string;
  category: ReadinessCategory;
  owner?: string;
  dueDate?: string;
  impact: "blocking" | "nonBlocking";
  status: ReadinessStatus;
  sourceRecordLabel?: string;
  sourceRecordUrl?: string;
}

export type StatusCounts = Record<ReadinessStatus, number> & {
  total: number;
  actionNeeded: number;
  completedChecks: number;
  confirmedBlockers: number;
  reviewRequired: number;
  unableToVerifyCount: number;
};

export type FilterCounts = Record<ReadinessFilter, number>;

export interface ReadinessEvaluation {
  overallStatus: OverallReadinessState;
  overallReason: string;
  normalizedItems: ReadinessItem[];
  sortedItems: ReadinessItem[];
  actions: ReadinessActionItem[];
  counts: StatusCounts;
  filterCounts: FilterCounts;
  defaultFilter: ReadinessFilter;
  evaluatedAt: string;
}

export interface EvaluationOptions {
  now?: Date | string;
  defaultStaleAfterMinutes?: number;
  /** Defaults to true so a missing category snapshot cannot produce READY. */
  requireCompleteCategoryCoverage?: boolean;
}

export interface ReadinessViewModel {
  scenario: ReadinessScenario;
  workOrder: WorkOrderSummary;
  evaluation: ReadinessEvaluation;
}
