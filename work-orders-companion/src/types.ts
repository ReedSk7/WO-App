export type WorkflowStep = 'Intake' | 'Screening' | 'Planning' | 'Scheduling' | 'Weekly Review' | 'Completion';

export type RecordStatus = 'REVIEW' | 'OPEN' | 'NEW' | 'PLANNING';

export type RecordType = 'CR' | 'WO' | 'PM';

export type InsightTone = 'good' | 'medium' | 'high' | 'neutral';

export type ReactorFamily = 'BWR' | 'PWR' | 'AP1000';

export type DecisionState = 'Screen' | 'No WO' | 'WO Needed' | 'Planning Hold' | 'Engineering Review' | 'Ready for Planning';

export type WorkRequired = 'Unknown' | 'No WO expected' | 'WO likely needed' | 'Existing WO review' | 'PM planning support';

export type PlannerActionStatus = 'Open' | 'In progress' | 'Ready' | 'Blocked' | 'Done';

export type ReadinessCheckStatus = 'Ready' | 'Gap' | 'Review';

export type SiteOption = {
  id: string;
  label: string;
  plant: string;
  unit: string;
  reactorFamily: ReactorFamily;
  description: string;
};

export type UserRoleOption = {
  id: string;
  label: string;
};

export type AppSession = {
  siteId: string;
  siteLabel: string;
  plant: string;
  unit: string;
  reactorFamily: ReactorFamily;
  userRoleId: string;
  userRoleLabel: string;
  recordType: RecordType;
  input: string;
  consequence: string;
  immediateAction: string;
  constraints: string[];
  workRequired: WorkRequired;
  startedAt: string;
};

export type ReferenceMatch = {
  id: string;
  title: string;
  similarity: number;
};

export type EvidenceMatch = ReferenceMatch & {
  sourceType: 'CR' | 'WO' | 'PM' | 'OE' | 'Document';
  whyMatched: string;
  reviewed: boolean;
};

export type ClassificationRecommendation = {
  woType: string;
  criticality: string;
  priority: string;
  confidence: number;
  rationale: string;
};

export type EditableClassificationField = 'woType' | 'criticality' | 'priority';

export type OperationalInsight = {
  id: string;
  title: string;
  status: string;
  tone: InsightTone;
  summary: string;
  metrics: Array<{ label: string; value: string }>;
  findings: string[];
};

export type AgentReview = {
  knownConditions: string[];
  plannerGaps: string[];
  dataSearchFindings: string[];
  assumptions: string[];
  nextPlannerChecks: string[];
};

export type ReadinessCheck = {
  label: string;
  status: ReadinessCheckStatus;
  detail: string;
};

export type PlannerAction = {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: PlannerActionStatus;
  tone: InsightTone;
};

export type AgentRun = {
  runId: string;
  mode: string;
  dataFreshness: string;
  completedAt: string;
  modelVersion: string;
  guardrail: string;
};

export type AuditEvent = {
  label: string;
  detail: string;
  timestamp: string;
};

export type ConditionRecord = {
  recordNumber: string;
  aliases: string[];
  recordType: RecordType;
  description: string;
  location: string;
  status: RecordStatus;
  woType: string;
  criticality: string;
  priority: number;
  percentComplete: number;
  owner: string;
  siteId: string;
  plant: string;
  unit: string;
  reactorFamily: ReactorFamily;
  date: string;
  recordId: string;
  assetNumber: string;
  detailDescription: string;
  sourceSystem: string;
  sourceAge: string;
  recordAgeDays: number;
  decisionState: DecisionState;
  readinessScore: number;
  readinessGaps: string[];
  readinessChecks: ReadinessCheck[];
  classification: ClassificationRecommendation;
  references: ReferenceMatch[];
  evidenceMatches: EvidenceMatch[];
  keyFactors: string[];
  plannerActions: PlannerAction[];
  agentRun: AgentRun;
  auditTrail: AuditEvent[];
  insights: OperationalInsight[];
  agentReview: AgentReview;
  movedToPlanning?: boolean;
};
