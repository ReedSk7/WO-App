import type {
  AgentReview,
  AppSession,
  AuditEvent,
  ConditionRecord,
  DecisionState,
  EvidenceMatch,
  InsightTone,
  OperationalInsight,
  PlannerAction,
  ReactorFamily,
  RecordType,
  ReadinessCheck,
  SiteOption,
  UserRoleOption,
  WorkRequired,
} from '../types';

export const siteOptions: SiteOption[] = [
  {
    id: 'HATCH-U1',
    label: 'Plant Hatch Unit 1 - BWR',
    plant: 'Plant Hatch',
    unit: 'Unit 1',
    reactorFamily: 'BWR',
    description: 'Baxley, GA fleet context for demo planning reviews.',
  },
  {
    id: 'HATCH-U2',
    label: 'Plant Hatch Unit 2 - BWR',
    plant: 'Plant Hatch',
    unit: 'Unit 2',
    reactorFamily: 'BWR',
    description: 'Baxley, GA fleet context for demo planning reviews.',
  },
  {
    id: 'FARLEY-U1',
    label: 'Plant Farley Unit 1 - PWR',
    plant: 'Plant Farley',
    unit: 'Unit 1',
    reactorFamily: 'PWR',
    description: 'SNC fleet PWR context for demo planning reviews.',
  },
  {
    id: 'FARLEY-U2',
    label: 'Plant Farley Unit 2 - PWR',
    plant: 'Plant Farley',
    unit: 'Unit 2',
    reactorFamily: 'PWR',
    description: 'SNC fleet PWR context for demo planning reviews.',
  },
  {
    id: 'VOGTLE-U1',
    label: 'Plant Vogtle Unit 1 - PWR',
    plant: 'Plant Vogtle',
    unit: 'Unit 1',
    reactorFamily: 'PWR',
    description: 'SNC fleet PWR context for demo planning reviews.',
  },
  {
    id: 'VOGTLE-U2',
    label: 'Plant Vogtle Unit 2 - PWR',
    plant: 'Plant Vogtle',
    unit: 'Unit 2',
    reactorFamily: 'PWR',
    description: 'SNC fleet PWR context for demo planning reviews.',
  },
  {
    id: 'VOGTLE-U3',
    label: 'Plant Vogtle Unit 3 - AP1000',
    plant: 'Plant Vogtle',
    unit: 'Unit 3',
    reactorFamily: 'AP1000',
    description: 'SNC fleet AP1000 context for demo planning reviews.',
  },
  {
    id: 'VOGTLE-U4',
    label: 'Plant Vogtle Unit 4 - AP1000',
    plant: 'Plant Vogtle',
    unit: 'Unit 4',
    reactorFamily: 'AP1000',
    description: 'SNC fleet AP1000 context for demo planning reviews.',
  },
];

export const userRoleOptions: UserRoleOption[] = [
  { id: 'planner', label: 'Planner' },
  { id: 'screening-reviewer', label: 'Screening Reviewer' },
  { id: 'work-week-manager', label: 'Work Week Manager' },
  { id: 'maintenance-supervisor', label: 'Maintenance Supervisor' },
  { id: 'engineering-reviewer', label: 'Engineering Reviewer' },
];

export const recordTypeOptions: Array<{ value: RecordType; label: string; helper: string }> = [
  { value: 'CR', label: 'Condition Report', helper: 'Maximo condition documentation that may require WO generation.' },
  { value: 'WO', label: 'Work Order', helper: 'Existing WO that needs package gap and readiness review.' },
  { value: 'PM', label: 'Preventive Maintenance', helper: 'PM package needing planner search and workability support.' },
];

export const workRequiredOptions: WorkRequired[] = ['Unknown', 'No WO expected', 'WO likely needed', 'Existing WO review', 'PM planning support'];

export const consequenceOptions = ['Unknown', 'Minor equipment issue', 'Potential operational impact', 'Repeat condition', 'Requires engineering review'];

export const planningConstraintOptions = ['Online work', 'Outage window', 'Clearance needed', 'Parts/materials', 'Engineering input', 'Radiological review', 'Access constraint'];

export const demoInputs: Array<{ input: string; recordType: RecordType; label: string; siteId: string }> = [
  { input: 'DEMO-CR-1001', recordType: 'CR', label: 'Hatch corrosion CR', siteId: 'HATCH-U1' },
  { input: 'DEMO-WO-3001', recordType: 'WO', label: 'Vogtle WO review', siteId: 'VOGTLE-U1' },
  { input: 'DEMO-PM-2001', recordType: 'PM', label: 'Vogtle PM package', siteId: 'VOGTLE-U3' },
];

const defaultAgentReview: AgentReview = {
  knownConditions: [
    'Source record text is available in the mock Maximo extract.',
    'Asset and location metadata are present but require planner verification.',
    'No procedure, torque, setpoint, or acceptance criteria are inferred by the prototype.',
  ],
  assumptions: [
    'Planner confirms approved source documents before using any generated package text.',
    'Related-record matches are similarity examples only.',
    'The demo does not disposition technical requirements.',
  ],
  plannerGaps: ['Confirm record scope and affected asset boundary.', 'Document unresolved gaps before routing.'],
  dataSearchFindings: ['Mock source-system data is available for the selected record.', 'Vector matches are demo-only and not production evidence.'],
  nextPlannerChecks: [
    'Confirm record scope and affected asset boundary.',
    'Review related CR, WO, and PM history before packaging work.',
    'Document unresolved gaps before routing to planning.',
  ],
};

function siteContext(siteId: string) {
  return siteOptions.find((site) => site.id === siteId) ?? siteOptions[0];
}

function decisionTone(decisionState: DecisionState): InsightTone {
  if (decisionState === 'Ready for Planning' || decisionState === 'No WO') return 'good';
  if (decisionState === 'Engineering Review' || decisionState === 'Planning Hold') return 'medium';
  return 'neutral';
}

function buildReadinessChecks(gaps: string[], readinessScore: number): ReadinessCheck[] {
  return [
    {
      label: 'Source record',
      status: readinessScore >= 45 ? 'Ready' : 'Review',
      detail: 'Mock Maximo-style source text is available for screening.',
    },
    {
      label: 'Asset and location',
      status: gaps.some((gap) => gap.toLowerCase().includes('asset') || gap.toLowerCase().includes('boundary')) ? 'Gap' : 'Ready',
      detail: 'Planner must verify affected boundary before package use.',
    },
    {
      label: 'Related history',
      status: readinessScore >= 65 ? 'Ready' : 'Review',
      detail: 'Similar CR, WO, and PM records are available for review.',
    },
    {
      label: 'Workability',
      status: gaps.some((gap) => gap.toLowerCase().includes('clearance') || gap.toLowerCase().includes('parts')) ? 'Gap' : 'Review',
      detail: 'Clearance, parts, access, and schedule constraints remain planner-owned.',
    },
    {
      label: 'Review packet',
      status: readinessScore >= 80 ? 'Ready' : 'Review',
      detail: 'Export is demo-only and requires approved source-system data before production.',
    },
  ];
}

function buildEvidenceMatches(references: ConditionRecord['references']): EvidenceMatch[] {
  return references.map((reference, index) => ({
    ...reference,
    sourceType: reference.id.includes('-WO-') ? 'WO' : reference.id.includes('-PM-') ? 'PM' : reference.id.includes('-OE-') ? 'OE' : 'CR',
    whyMatched:
      index === 0
        ? 'High text similarity plus location or asset-family language.'
        : index === 1
          ? 'Similar work package terms and planning history.'
          : 'Supporting history match for planner review.',
    reviewed: index === 0,
  }));
}

function buildPlannerActions({
  decisionState,
  owner,
  readinessGaps,
}: {
  decisionState: DecisionState;
  owner: string;
  readinessGaps: string[];
}): PlannerAction[] {
  const firstGap = readinessGaps[0] ?? 'Confirm source documents and package scope.';
  const decisionOwner = decisionState === 'Engineering Review' ? 'Engineering Reviewer' : owner;

  return [
    {
      id: 'ACT-1',
      title: firstGap,
      owner,
      due: 'Next screening meeting',
      status: readinessGaps.length ? 'Open' : 'Ready',
      tone: readinessGaps.length ? 'medium' : 'good',
    },
    {
      id: 'ACT-2',
      title: 'Disposition related-record matches before package use.',
      owner: 'Screening Reviewer',
      due: 'Before route to planning',
      status: 'In progress',
      tone: 'neutral',
    },
    {
      id: 'ACT-3',
      title: decisionState === 'Ready for Planning' ? 'Package is ready for planner handoff review.' : 'Confirm final CR-to-WO decision path.',
      owner: decisionOwner,
      due: 'Planner handoff',
      status: decisionState === 'Ready for Planning' ? 'Ready' : 'Open',
      tone: decisionTone(decisionState),
    },
  ];
}

function buildAgentRun(recordNumber: string): ConditionRecord['agentRun'] {
  return {
    runId: `DBX-${recordNumber.replace(/[^A-Z0-9]/g, '')}`,
    mode: 'Read-only planner support',
    dataFreshness: 'Mock Maximo/vector index snapshot',
    completedAt: 'Jul 09, 2026 19:55 ET',
    modelVersion: 'Demo governed-agent profile',
    guardrail: 'No chat prompt, no invented technical criteria',
  };
}

function buildAuditTrail(recordNumber: string, decisionState: DecisionState): AuditEvent[] {
  return [
    { label: 'Source captured', detail: `${recordNumber} loaded into demo review queue.`, timestamp: 'Jul 09, 2026 19:52 ET' },
    { label: 'Agent run complete', detail: 'Mock Databricks search and gap review completed.', timestamp: 'Jul 09, 2026 19:55 ET' },
    { label: 'Decision state set', detail: `Current path: ${decisionState}.`, timestamp: 'Jul 09, 2026 19:56 ET' },
  ];
}

function makeInsights({
  confidence,
  criticality,
  decisionState,
  priority,
  readinessGaps,
  readinessScore,
  relatedCount,
  type,
}: {
  confidence: number;
  criticality: string;
  decisionState: DecisionState;
  priority: string;
  readinessGaps: string[];
  readinessScore: number;
  relatedCount: number;
  type: string;
}): OperationalInsight[] {
  const highRisk = criticality.includes('1');
  const blocked = decisionState === 'Planning Hold' || decisionState === 'Engineering Review';

  return [
    {
      id: 'classification',
      title: 'Classification Summary',
      status: highRisk ? 'High' : confidence >= 80 ? 'Good' : 'Review',
      tone: highRisk ? 'high' : confidence >= 80 ? 'good' : 'medium',
      summary: `Recommended WO type ${type}`,
      metrics: [
        { label: 'Criticality', value: criticality },
        { label: 'Priority', value: priority },
        { label: 'Confidence', value: `${confidence}%` },
      ],
      findings: ['Planner verification required before routing', `Decision path: ${decisionState}`],
    },
    {
      id: 'related',
      title: 'Related Records',
      status: relatedCount >= 4 ? 'Good' : 'Review',
      tone: relatedCount >= 4 ? 'good' : 'medium',
      summary: `${relatedCount} mock records matched in the review index`,
      metrics: [
        { label: 'Matched records', value: String(relatedCount) },
        { label: 'Reviewed', value: relatedCount > 3 ? '1 / 5' : '1 / 3' },
      ],
      findings: ['Review similar CR, WO, and PM history before package use'],
    },
    {
      id: 'workability',
      title: 'Workability Review',
      status: readinessScore >= 75 ? 'Ready' : 'Open',
      tone: readinessScore >= 75 ? 'good' : 'medium',
      summary: `${readinessGaps.length} planner gap${readinessGaps.length === 1 ? '' : 's'} open`,
      metrics: [
        { label: 'Readiness', value: `${readinessScore}%` },
        { label: 'Open gaps', value: String(readinessGaps.length) },
      ],
      findings: [readinessGaps[0] ?? 'Workability checks are ready for planner review'],
    },
    {
      id: 'ops-risk',
      title: 'Risk / Operations Impact',
      status: highRisk ? 'High' : blocked ? 'Review' : 'Medium',
      tone: highRisk ? 'high' : blocked ? 'medium' : 'neutral',
      summary: highRisk ? 'Elevated review marker from mock classification' : 'No operating impact is inferred by demo data',
      metrics: [{ label: 'Decision path', value: decisionState }],
      findings: ['Operations impact requires approved source-system confirmation'],
    },
    {
      id: 'materials',
      title: 'Materials / Parts',
      status: readinessGaps.some((gap) => gap.toLowerCase().includes('parts')) ? 'Open' : 'Review',
      tone: readinessGaps.some((gap) => gap.toLowerCase().includes('parts')) ? 'medium' : 'neutral',
      summary: 'Parts readiness is a planner-owned check',
      metrics: [{ label: 'Material gaps', value: readinessGaps.some((gap) => gap.toLowerCase().includes('parts')) ? '1' : '0' }],
      findings: ['No material equivalency or technical substitution is generated'],
    },
    {
      id: 'hre',
      title: 'HRE Review',
      status: highRisk ? 'Medium' : 'Low',
      tone: highRisk ? 'medium' : 'neutral',
      summary: 'Human reliability marker requires planner screening only',
      metrics: [{ label: 'Open checks', value: highRisk ? '2' : '1' }],
      findings: ['Confirm field handoff and review requirements from approved sources'],
    },
    {
      id: 'cspv',
      title: 'CSPV Review',
      status: highRisk || relatedCount >= 4 ? 'Review' : 'Medium',
      tone: highRisk ? 'high' : 'medium',
      summary: 'Comparable mock trend data found for review',
      metrics: [{ label: 'Reference documents', value: relatedCount > 3 ? '3' : '1' }],
      findings: ['Do not infer criteria from trend matches'],
    },
  ];
}

type RecordInput = {
  recordNumber: string;
  recordType?: RecordType;
  description: string;
  location: string;
  status: ConditionRecord['status'];
  woType: string;
  priority: number;
  percentComplete: number;
  owner: string;
  siteId: string;
  date: string;
  recordId: string;
  assetNumber: string;
  detailDescription: string;
  classification: ConditionRecord['classification'];
  references: ConditionRecord['references'];
  keyFactors: string[];
  decisionState: DecisionState;
  readinessScore: number;
  readinessGaps: string[];
  agentReview?: Partial<AgentReview>;
  evidenceMatches?: EvidenceMatch[];
  plannerActions?: PlannerAction[];
  sourceSystem?: string;
  sourceAge?: string;
  recordAgeDays?: number;
};

function record(input: RecordInput): ConditionRecord {
  const recordType = input.recordType ?? 'CR';
  const site = siteContext(input.siteId);
  const evidenceMatches = input.evidenceMatches ?? buildEvidenceMatches(input.references);
  const agentReview = {
    ...defaultAgentReview,
    ...input.agentReview,
  };

  return {
    recordNumber: input.recordNumber,
    aliases: [input.recordNumber, input.recordNumber.replace(/-/g, ''), ...(recordType === 'CR' ? [input.recordNumber.replace('DEMO-', '')] : [])],
    recordType,
    description: input.description,
    location: input.location,
    status: input.status,
    woType: input.woType,
    criticality: input.classification.criticality,
    priority: input.priority,
    percentComplete: input.percentComplete,
    owner: input.owner,
    siteId: input.siteId,
    plant: site.plant,
    unit: site.unit,
    reactorFamily: site.reactorFamily,
    date: input.date,
    recordId: input.recordId,
    assetNumber: input.assetNumber,
    detailDescription: input.detailDescription,
    sourceSystem: input.sourceSystem ?? 'Mock Maximo extract',
    sourceAge: input.sourceAge ?? 'Demo snapshot',
    recordAgeDays: input.recordAgeDays ?? 3,
    decisionState: input.decisionState,
    readinessScore: input.readinessScore,
    readinessGaps: input.readinessGaps,
    readinessChecks: buildReadinessChecks(input.readinessGaps, input.readinessScore),
    classification: input.classification,
    references: input.references,
    evidenceMatches,
    keyFactors: input.keyFactors,
    plannerActions: input.plannerActions ?? buildPlannerActions({ decisionState: input.decisionState, owner: input.owner, readinessGaps: input.readinessGaps }),
    agentRun: buildAgentRun(input.recordNumber),
    auditTrail: buildAuditTrail(input.recordNumber, input.decisionState),
    insights: makeInsights({
      confidence: input.classification.confidence,
      criticality: input.classification.criticality,
      decisionState: input.decisionState,
      priority: input.classification.priority,
      readinessGaps: input.readinessGaps,
      readinessScore: input.readinessScore,
      relatedCount: evidenceMatches.length,
      type: input.classification.woType,
    }),
    agentReview,
  };
}

// TODO: Replace this mock data with governed Maximo, Databricks vector-search,
// approved document/OE search, and action-routing outputs after backend, auth,
// audit, and data-classification requirements are defined.
export const mockConditionRecords: ConditionRecord[] = [
  record({
    recordNumber: 'DEMO-CR-1001',
    recordType: 'CR',
    description: 'Corroded pipe fitting identified during routine walkdown',
    location: 'AREA-A-PUMP-01',
    status: 'REVIEW',
    woType: 'DN',
    priority: 3,
    percentComplete: 35,
    owner: 'Demo Planner',
    siteId: 'HATCH-U1',
    date: 'May 15, 2026',
    recordId: 'RID-8F3J2C',
    assetNumber: 'AST-DEMO-007',
    sourceAge: 'Synced 12 minutes ago',
    recordAgeDays: 4,
    decisionState: 'WO Needed',
    readinessScore: 68,
    readinessGaps: ['Confirm affected boundary and required work scope.', 'Verify parts and clearance assumptions before package handoff.'],
    detailDescription:
      'A condition report documents visible corrosion on a generic pipe fitting. Planner review is needed to determine whether a corrective work order is required and which source documents govern the work scope.',
    classification: {
      woType: 'DN - Deficient Maintenance',
      criticality: 'Crit Cat 2',
      priority: '3 - Moderate',
      confidence: 82,
      rationale:
        'Recommended as deficient maintenance because the CR describes an observable equipment condition that may require corrective work after planner verification.',
    },
    references: [
      { id: 'DEMO-CR-0921', title: 'Leak on generic pump support piping', similarity: 92 },
      { id: 'DEMO-WO-2214', title: 'Prior corrosion walkdown package', similarity: 88 },
      { id: 'DEMO-CR-0887', title: 'Similar pitting condition report', similarity: 85 },
      { id: 'DEMO-PM-1440', title: 'Routine inspection follow-up', similarity: 78 },
    ],
    keyFactors: [
      'BWR fleet context selected at intake',
      'Equipment match in mock asset index',
      'Description similarity from vector search',
      'Recent similar CR history found',
      'Planner source-document verification required',
    ],
    agentReview: {
      plannerGaps: ['Confirm whether a WO is required from the CR disposition.', 'Verify affected boundary and work package classification.'],
      dataSearchFindings: ['Mock asset history contains prior corrosion terms.', 'No approved acceptance criteria are available in demo data.'],
    },
  }),
  record({
    recordNumber: 'DEMO-PM-2001',
    recordType: 'PM',
    description: 'Missed milestone on preventive maintenance activity',
    location: 'AREA-B-VALVE-12',
    status: 'OPEN',
    woType: 'DL',
    priority: 4,
    percentComplete: 20,
    owner: 'Demo Scheduler',
    siteId: 'VOGTLE-U3',
    date: 'May 13, 2026',
    recordId: 'RID-1K7P9M',
    assetNumber: 'VAL-DEMO-441',
    sourceAge: 'Synced 31 minutes ago',
    recordAgeDays: 6,
    decisionState: 'Planning Hold',
    readinessScore: 57,
    readinessGaps: ['Confirm required completion date.', 'Resolve schedule recovery path before bundling related work.'],
    detailDescription:
      'A preventive maintenance planning item has a schedule variance. The planner needs help identifying package gaps, related records, and required review actions before recovery planning.',
    classification: {
      woType: 'DL - Delinquent Maintenance',
      criticality: 'Crit Cat 3',
      priority: '4 - Routine',
      confidence: 76,
      rationale:
        'Recommended as delinquent maintenance because the source record centers on schedule recovery and package completeness rather than a new equipment condition.',
    },
    references: [
      { id: 'DEMO-PM-1840', title: 'PM milestone recovery package', similarity: 86 },
      { id: 'DEMO-WO-2202', title: 'Valve PM planning review', similarity: 81 },
      { id: 'DEMO-CR-0715', title: 'Calendar variance screening note', similarity: 72 },
    ],
    keyFactors: ['AP1000 fleet context selected at intake', 'Schedule variance', 'Open planner action', 'Related PM package exists', 'Planning window available'],
    agentReview: {
      plannerGaps: ['Confirm required completion date.', 'Check whether related PM work can be bundled without changing scope.'],
      dataSearchFindings: ['Mock schedule data contains a missed milestone marker.', 'Related work package history is present but not dispositioned.'],
    },
  }),
  record({
    recordNumber: 'DEMO-CR-1002',
    recordType: 'CR',
    description: 'Failed generic inspection result requires screening',
    location: 'AREA-C-TANK-04',
    status: 'REVIEW',
    woType: 'CC',
    priority: 1,
    percentComplete: 45,
    owner: 'Demo Reviewer',
    siteId: 'FARLEY-U2',
    date: 'May 10, 2026',
    recordId: 'RID-4C9L1Q',
    assetNumber: 'TNK-DEMO-204',
    sourceAge: 'Synced 18 minutes ago',
    recordAgeDays: 9,
    decisionState: 'Engineering Review',
    readinessScore: 52,
    readinessGaps: ['Identify controlling inspection source before planning.', 'Confirm required independent reviews before routing.'],
    detailDescription:
      'A condition report was generated from a generic inspection result. The prototype intentionally omits acceptance criteria and directs the planner to approved source documents.',
    classification: {
      woType: 'CC - Corrective Condition',
      criticality: 'Crit Cat 1',
      priority: '1 - High',
      confidence: 89,
      rationale:
        'Recommended as corrective condition because the CR includes inspection-failure language and needs controlled source-document review before planning.',
    },
    references: [
      { id: 'DEMO-CR-0841', title: 'Inspection follow-up condition report', similarity: 91 },
      { id: 'DEMO-WO-2610', title: 'Corrective work package review', similarity: 84 },
      { id: 'DEMO-CR-0772', title: 'Inspection documentation review', similarity: 79 },
    ],
    keyFactors: ['PWR fleet context selected at intake', 'Inspection failure language', 'High priority marker', 'Source-document verification required', 'Owner assigned'],
    agentReview: {
      plannerGaps: ['Identify controlling inspection source before planning.', 'Confirm required independent reviews before routing.'],
      dataSearchFindings: ['Mock related records include prior corrective work.', 'Demo data cannot determine acceptance criteria.'],
    },
  }),
  record({
    recordNumber: 'DEMO-WO-3001',
    recordType: 'WO',
    description: 'Existing work order needs planner package gap review',
    location: 'AREA-D-INSTR-07',
    status: 'OPEN',
    woType: 'IM',
    priority: 4,
    percentComplete: 72,
    owner: 'Demo Planner',
    siteId: 'VOGTLE-U1',
    date: 'May 08, 2026',
    recordId: 'RID-2A8R6S',
    assetNumber: 'INS-DEMO-118',
    sourceAge: 'Synced 8 minutes ago',
    recordAgeDays: 11,
    decisionState: 'Ready for Planning',
    readinessScore: 84,
    readinessGaps: [],
    detailDescription:
      'An existing work order needs a planning review. The agent output identifies missing package context, related mock records, and next planner checks without creating procedure content.',
    classification: {
      woType: 'IM - Instrument Maintenance',
      criticality: 'Crit Cat 3',
      priority: '4 - Routine',
      confidence: 71,
      rationale:
        'Instrument maintenance is recommended because the source record identifies calibration-style work and a defined generic instrument location.',
    },
    references: [
      { id: 'DEMO-WO-1907', title: 'Instrument calibration review', similarity: 82 },
      { id: 'DEMO-PM-1165', title: 'Calibration grouping package', similarity: 77 },
      { id: 'DEMO-CR-0442', title: 'Prior instrument cabinet condition note', similarity: 69 },
    ],
    keyFactors: ['PWR fleet context selected at intake', 'Instrument location match', 'Calibration work language', 'Package progress is above readiness threshold'],
    agentReview: {
      plannerGaps: ['No blocking planner gaps are shown in demo data.'],
      dataSearchFindings: ['Mock WO history includes calibration language.', 'No approved calibration limits are included in demo output.'],
    },
  }),
  record({
    recordNumber: 'DEMO-CR-1003',
    recordType: 'CR',
    description: 'Leak observed at generic flange joint',
    location: 'AREA-E-PIPE-15',
    status: 'NEW',
    woType: 'DN',
    priority: 2,
    percentComplete: 12,
    owner: 'Unassigned',
    siteId: 'HATCH-U2',
    date: 'May 06, 2026',
    recordId: 'RID-9N5V3H',
    assetNumber: 'PIP-DEMO-502',
    sourceAge: 'Not synced in demo',
    recordAgeDays: 13,
    decisionState: 'Screen',
    readinessScore: 39,
    readinessGaps: ['Assign screening owner.', 'Confirm whether this CR should generate a corrective WO.', 'Verify clearance and access constraints.'],
    detailDescription:
      'A new condition report documents minor leakage at a generic flange joint. Screening must confirm owner assignment, classification, and whether WO generation is needed.',
    classification: {
      woType: 'DN - Deficient Maintenance',
      criticality: 'Crit Cat 2',
      priority: '2 - Elevated',
      confidence: 80,
      rationale:
        'Deficient maintenance is recommended because the CR describes an observed component condition that may require corrective planning.',
    },
    references: [
      { id: 'DEMO-CR-1044', title: 'Flange leak screening package', similarity: 89 },
      { id: 'DEMO-WO-2462', title: 'Pipe joint leak follow-up', similarity: 83 },
      { id: 'DEMO-CR-0985', title: 'Gasket replacement planning review', similarity: 73 },
    ],
    keyFactors: ['BWR fleet context selected at intake', 'Leak language match', 'Generic flange component', 'New CR status', 'Similar work exists'],
    agentReview: {
      plannerGaps: ['Assign screening owner.', 'Confirm whether this CR should generate a corrective WO.'],
      dataSearchFindings: ['Mock related records include repeated leak terminology.', 'No technical leakage threshold is inferred.'],
    },
  }),
];

function normalizeRecordNumber(input: string, recordType: RecordType) {
  const cleaned = input.trim().toUpperCase();
  const match = cleaned.match(/(?:DEMO-)?(?:CR|WO|PM|MPL)-?\d{3,5}/);
  if (match) {
    const normalized = match[0].replace(/^DEMO-?/, '').replace(/^(CR|WO|PM|MPL)(\d)/, '$1-$2');
    const typeAdjusted = normalized.startsWith(recordType) ? normalized : `${recordType}-${normalized.replace(/^(CR|WO|PM|MPL)-?/, '')}`;
    return `DEMO-${typeAdjusted}`;
  }

  return `DEMO-${recordType}-NEW`;
}

function sessionDecision(session: AppSession): DecisionState {
  if (session.workRequired === 'No WO expected') return 'No WO';
  if (session.workRequired === 'WO likely needed') return 'WO Needed';
  if (session.workRequired === 'Existing WO review' || session.workRequired === 'PM planning support') return 'Planning Hold';
  if (session.consequence === 'Requires engineering review') return 'Engineering Review';
  return 'Screen';
}

function sessionReadiness(session: AppSession) {
  let score = session.input.length > 30 ? 48 : 42;
  if (session.immediateAction.trim()) score += 8;
  if (session.workRequired !== 'Unknown') score += 8;
  if (session.constraints.length) score += 5;
  if (session.consequence !== 'Unknown') score += 6;
  return Math.min(score, 76);
}

export function findRecordByInput(input: string, records: ConditionRecord[] = mockConditionRecords) {
  const normalizedInput = input.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!normalizedInput) return undefined;

  return records.find((candidate) =>
    candidate.aliases.some((alias) => normalizedInput.includes(alias.toUpperCase()) || normalizedInput.includes(alias.toUpperCase().replace(/-/g, ''))),
  );
}

export function createSessionConditionRecord(session: AppSession, index: number): ConditionRecord {
  const recordNumber = normalizeRecordNumber(session.input, session.recordType);
  const recordLabel = session.recordType === 'CR' ? 'condition report' : session.recordType === 'WO' ? 'work order' : 'PM package';
  const decisionState = sessionDecision(session);
  const readinessScore = sessionReadiness(session);
  const readinessGaps = [
    'No matching source record was found in mock data.',
    'Planner must confirm asset, scope, priority, and source documents.',
    ...(session.constraints.includes('Clearance needed') ? ['Verify clearance boundary before planning.'] : []),
    ...(session.constraints.includes('Parts/materials') ? ['Confirm parts availability before routing.'] : []),
  ];

  return record({
    recordNumber,
    recordType: session.recordType,
    description: `Planner review generated from ${recordLabel} input`,
    location: 'AREA-DEMO-INPUT',
    status: 'NEW',
    woType: 'UN',
    priority: 4,
    percentComplete: 0,
    owner: session.userRoleLabel,
    siteId: session.siteId,
    date: 'May 20, 2026',
    recordId: `RID-DEMO-${index}`,
    assetNumber: 'AST-DEMO-INPUT',
    sourceAge: 'Local intake only',
    recordAgeDays: 0,
    decisionState,
    readinessScore,
    readinessGaps,
    detailDescription: `Demo-only ${recordLabel} review created from controlled intake input: "${session.input.trim()}". Consequence marker: ${session.consequence}. Work-needed marker: ${session.workRequired}. Replace this path with governed Maximo and Databricks data before production use.`,
    classification: {
      woType: 'UN - Unclassified',
      criticality: session.consequence === 'Requires engineering review' ? 'Crit Cat 2' : 'Crit Cat 3',
      priority: session.consequence === 'Potential operational impact' ? '2 - Elevated' : '4 - Routine',
      confidence: 54,
      rationale: 'New local demo item requires planner verification before routing or work package use.',
    },
    references: [
      { id: 'DEMO-CR-0101', title: 'Generic intake comparison', similarity: 62 },
      { id: 'DEMO-WO-0102', title: 'Planning placeholder reference', similarity: 58 },
    ],
    keyFactors: [
      `${session.reactorFamily} fleet context selected at intake`,
      `Work-needed marker: ${session.workRequired}`,
      session.immediateAction.trim() ? 'Immediate action text captured' : 'Immediate action not entered',
      session.constraints.length ? `Constraints selected: ${session.constraints.join(', ')}` : 'No constraints selected',
      'Mock record only',
    ],
    agentReview: {
      knownConditions: [
        `Controlled intake created a demo ${recordLabel} review for ${session.plant} ${session.unit}.`,
        `Consequence marker: ${session.consequence}.`,
        `Immediate action marker: ${session.immediateAction.trim() || 'Not entered'}.`,
      ],
      plannerGaps: readinessGaps,
      dataSearchFindings: ['Input was captured locally only.', 'The demo cannot confirm current Maximo state.'],
      nextPlannerChecks: ['Confirm source-system record exists.', 'Verify affected asset, scope, priority, and required reviews.', 'Document final CR-to-WO decision path.'],
    },
  });
}

export function createMockConditionRecord(index: number): ConditionRecord {
  return {
    ...createSessionConditionRecord(
      {
        siteId: 'HATCH-U1',
        siteLabel: 'Plant Hatch Unit 1 - BWR',
        plant: 'Plant Hatch',
        unit: 'Unit 1',
        reactorFamily: 'BWR' as ReactorFamily,
        userRoleId: 'screening-reviewer',
        userRoleLabel: 'Screening Reviewer',
        recordType: 'CR',
        input: `DEMO-CR-04${30 + index}`,
        consequence: 'Unknown',
        immediateAction: 'Not entered in local demo.',
        constraints: [],
        workRequired: 'Unknown',
        startedAt: new Date().toISOString(),
      },
      index,
    ),
    description: 'New condition report from demo intake',
    detailDescription:
      'Demo-only condition report created locally. Replace this path with governed intake and Maximo/API data after integration requirements are approved.',
  };
}
