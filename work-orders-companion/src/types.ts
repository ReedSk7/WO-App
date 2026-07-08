export type WorkflowStep = 'Intake' | 'Screening' | 'Planning' | 'Scheduling' | 'Weekly Review' | 'Completion';

export type WorkRequestStatus = 'REVIEW' | 'OPEN' | 'NEW' | 'PLANNING';

export type InsightTone = 'good' | 'medium' | 'high' | 'neutral';

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

export type WorkRequest = {
  ticketNumber: string;
  description: string;
  location: string;
  status: WorkRequestStatus;
  woType: string;
  criticality: string;
  priority: number;
  percentComplete: number;
  owner: string;
  siteId: string;
  date: string;
  ticketId: string;
  assetNumber: string;
  detailDescription: string;
  classification: ClassificationRecommendation;
  references: ReferenceMatch[];
  keyFactors: string[];
  insights: OperationalInsight[];
  movedToPlanning?: boolean;
};
