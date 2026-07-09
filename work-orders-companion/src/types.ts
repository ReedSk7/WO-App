export type WorkflowStep = 'Intake' | 'Screening' | 'Planning' | 'Scheduling' | 'Weekly Review' | 'Completion';

export type RecordStatus = 'REVIEW' | 'OPEN' | 'NEW' | 'PLANNING';

export type RecordType = 'CR' | 'WO' | 'PM';

export type InsightTone = 'good' | 'medium' | 'high' | 'neutral';

export type SiteOption = {
  id: string;
  label: string;
  description: string;
};

export type UserRoleOption = {
  id: string;
  label: string;
};

export type AppSession = {
  siteId: string;
  siteLabel: string;
  userRoleId: string;
  userRoleLabel: string;
  recordType: RecordType;
  input: string;
  startedAt: string;
};

export type ReferenceMatch = {
  id: string;
  title: string;
  similarity: number;
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
  date: string;
  recordId: string;
  assetNumber: string;
  detailDescription: string;
  classification: ClassificationRecommendation;
  references: ReferenceMatch[];
  keyFactors: string[];
  insights: OperationalInsight[];
  agentReview: AgentReview;
  movedToPlanning?: boolean;
};
