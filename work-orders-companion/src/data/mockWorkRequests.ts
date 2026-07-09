import type { AppSession, ConditionRecord, OperationalInsight, RecordType, SiteOption, UserRoleOption } from '../types';

export const siteOptions: SiteOption[] = [
  { id: 'SITE-A', label: 'Demo Site A', description: 'Generic operating site for prototype review.' },
  { id: 'SITE-B', label: 'Demo Site B', description: 'Generic maintenance planning site.' },
  { id: 'SITE-C', label: 'Demo Site C', description: 'Generic outage and PM planning site.' },
];

export const userRoleOptions: UserRoleOption[] = [
  { id: 'planner', label: 'Planner' },
  { id: 'screening-reviewer', label: 'Screening Reviewer' },
  { id: 'work-week-manager', label: 'Work Week Manager' },
];

export const recordTypeOptions: Array<{ value: RecordType; label: string; helper: string }> = [
  { value: 'CR', label: 'Condition Report', helper: 'CR generated from Maximo condition documentation.' },
  { value: 'WO', label: 'Work Order', helper: 'Existing WO that needs planner gap review.' },
  { value: 'PM', label: 'Preventive Maintenance', helper: 'PM package needing planning support.' },
];

export const demoInputs: Array<{ input: string; recordType: RecordType; label: string }> = [
  { input: 'DEMO-CR-1001', recordType: 'CR', label: 'Corrosion CR' },
  { input: 'DEMO-WO-3001', recordType: 'WO', label: 'Existing WO' },
  { input: 'DEMO-PM-2001', recordType: 'PM', label: 'PM package' },
];

const defaultAgentReview = {
  knownConditions: [
    'Source record text is available in the mock Maximo extract.',
    'Asset and location metadata are present but require planner verification.',
    'No procedure, torque, setpoint, or acceptance criteria are inferred by the prototype.',
  ],
  assumptions: [
    'Planner will confirm source documents before using any generated package text.',
    'Related-record matches are similarity examples only.',
    'The demo does not disposition technical requirements.',
  ],
  nextPlannerChecks: [
    'Confirm record scope and affected asset boundary.',
    'Review related CR, WO, and PM history before packaging work.',
    'Document unresolved gaps before routing to planning.',
  ],
};

function makeInsights({
  confidence,
  criticality,
  findings,
  priority,
  relatedCount,
  summary,
  tone,
  type,
}: {
  confidence: number;
  criticality: string;
  findings: string[];
  priority: string;
  relatedCount: number;
  summary: string;
  tone: 'good' | 'medium' | 'high' | 'neutral';
  type: string;
}): OperationalInsight[] {
  return [
    {
      id: 'classification',
      title: 'Classification Summary',
      status: tone === 'high' ? 'High' : tone === 'good' ? 'Good' : 'Medium',
      tone,
      summary: `Recommended WO type ${type}`,
      metrics: [
        { label: 'Criticality', value: criticality },
        { label: 'Priority', value: priority },
        { label: 'Confidence', value: `${confidence}%` },
      ],
      findings: ['Planner verification required before routing', ...findings],
    },
    {
      id: 'related',
      title: 'Related Records',
      status: relatedCount >= 4 ? 'Good' : 'Medium',
      tone: relatedCount >= 4 ? 'good' : 'medium',
      summary: `${relatedCount} mock records matched in the review index`,
      metrics: [
        { label: 'Matched records', value: String(relatedCount) },
        { label: 'Dispositioned', value: relatedCount > 3 ? '1 / 5' : '0 / 3' },
      ],
      findings: ['Review similar CR, WO, and PM history before package use'],
    },
    {
      id: 'hre',
      title: 'HRE Review',
      status: tone === 'high' ? 'Medium' : 'Low',
      tone: tone === 'high' ? 'medium' : 'neutral',
      summary: 'Human reliability marker requires planner screening only',
      metrics: [{ label: 'Open checks', value: tone === 'high' ? '2' : '1' }],
      findings: ['Confirm field handoff and review requirements from approved sources'],
    },
    {
      id: 'cspv',
      title: 'CSPV Review',
      status: tone === 'high' ? 'High' : 'Medium',
      tone: tone === 'high' ? 'high' : 'medium',
      summary: 'Comparable mock trend data found for review',
      metrics: [{ label: 'Reference documents', value: relatedCount > 3 ? '3' : '1' }],
      findings: ['Do not infer criteria from trend matches'],
    },
  ];
}

function record({
  agentReview,
  assetNumber,
  classification,
  date,
  description,
  detailDescription,
  keyFactors,
  location,
  owner,
  percentComplete,
  priority,
  recordId,
  recordNumber,
  recordType = 'CR',
  references,
  siteId,
  status,
  woType,
}: Omit<ConditionRecord, 'aliases' | 'criticality' | 'insights'> & { aliases?: string[] }): ConditionRecord {
  return {
    recordNumber,
    aliases: [recordNumber, recordNumber.replace(/-/g, ''), ...(recordType === 'CR' ? [recordNumber.replace('DEMO-', '')] : [])],
    recordType,
    description,
    location,
    status,
    woType,
    criticality: classification.criticality,
    priority,
    percentComplete,
    owner,
    siteId,
    date,
    recordId,
    assetNumber,
    detailDescription,
    classification,
    references,
    keyFactors,
    insights: makeInsights({
      confidence: classification.confidence,
      criticality: classification.criticality,
      findings: keyFactors.slice(0, 2),
      priority: classification.priority,
      relatedCount: references.length,
      summary: description,
      tone: classification.criticality === 'Crit Cat 1' ? 'high' : 'medium',
      type: classification.woType,
    }),
    agentReview,
  };
}

// TODO: Replace this mock data with governed Maximo, Databricks vector-search,
// and approved data-search outputs after backend, auth, and audit requirements are defined.
export const mockConditionRecords: ConditionRecord[] = [
  record({
    recordNumber: 'DEMO-CR-1001',
    recordType: 'CR',
    description: 'Corroded pipe fitting identified during routine walkdown',
    location: 'AREA-A-PUMP-01',
    status: 'REVIEW',
    woType: 'DN',
    priority: 3,
    percentComplete: 15,
    owner: 'Demo Planner',
    siteId: 'SITE-A',
    date: 'May 15, 2026',
    recordId: 'RID-8F3J2C',
    assetNumber: 'AST-DEMO-007',
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
      'Equipment match in mock asset index',
      'Description similarity from vector search',
      'Location match in Maximo-style data',
      'Recent similar CR history found',
      'Planner source-document verification required',
    ],
    agentReview: {
      ...defaultAgentReview,
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
    percentComplete: 0,
    owner: 'Demo Scheduler',
    siteId: 'SITE-A',
    date: 'May 13, 2026',
    recordId: 'RID-1K7P9M',
    assetNumber: 'VAL-DEMO-441',
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
    keyFactors: ['Schedule variance', 'Open planner action', 'Related PM package exists', 'No direct CR condition text', 'Planning window available'],
    agentReview: {
      ...defaultAgentReview,
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
    percentComplete: 30,
    owner: 'Demo Reviewer',
    siteId: 'SITE-B',
    date: 'May 10, 2026',
    recordId: 'RID-4C9L1Q',
    assetNumber: 'TNK-DEMO-204',
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
    keyFactors: ['Inspection failure language', 'High priority marker', 'Source-document verification required', 'Mock area match', 'Owner assigned'],
    agentReview: {
      ...defaultAgentReview,
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
    percentComplete: 5,
    owner: 'Demo Planner',
    siteId: 'SITE-C',
    date: 'May 08, 2026',
    recordId: 'RID-2A8R6S',
    assetNumber: 'INS-DEMO-118',
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
    ],
    keyFactors: ['Instrument location match', 'Calibration work language', 'Low package progress', 'Potential grouping opportunity'],
    agentReview: {
      ...defaultAgentReview,
      plannerGaps: ['Validate package scope against the current WO.', 'Check whether calibration work can be grouped with related records.'],
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
    percentComplete: 0,
    owner: 'Unassigned',
    siteId: 'SITE-C',
    date: 'May 06, 2026',
    recordId: 'RID-9N5V3H',
    assetNumber: 'PIP-DEMO-502',
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
    keyFactors: ['Leak language match', 'Generic flange component', 'New CR status', 'Similar work exists'],
    agentReview: {
      ...defaultAgentReview,
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
    detailDescription: `Demo-only ${recordLabel} review created from controlled intake input: "${session.input.trim()}". Replace this path with governed Maximo and Databricks data before production use.`,
    classification: {
      woType: 'UN - Unclassified',
      criticality: 'Crit Cat 3',
      priority: '4 - Routine',
      confidence: 54,
      rationale: 'New local demo item requires planner verification before routing or work package use.',
    },
    references: [
      { id: 'DEMO-CR-0101', title: 'Generic intake comparison', similarity: 62 },
      { id: 'DEMO-WO-0102', title: 'Planning placeholder reference', similarity: 58 },
    ],
    keyFactors: ['Controlled intake item', 'No source system confirmation', 'Needs planner review', 'Mock record only'],
    agentReview: {
      ...defaultAgentReview,
      plannerGaps: ['No matching fake source record was found.', 'Planner must confirm asset, scope, priority, and source documents.'],
      dataSearchFindings: ['Input was captured locally only.', 'The demo cannot confirm current Maximo state.'],
    },
  });
}

export function createMockConditionRecord(index: number): ConditionRecord {
  return {
    ...createSessionConditionRecord(
      {
        siteId: 'SITE-A',
        siteLabel: 'Demo Site A',
        userRoleId: 'screening-reviewer',
        userRoleLabel: 'Screening Reviewer',
        recordType: 'CR',
        input: `DEMO-CR-04${30 + index}`,
        startedAt: new Date().toISOString(),
      },
      index,
    ),
    description: 'New condition report from demo intake',
    detailDescription:
      'Demo-only condition report created locally. Replace this path with governed intake and Maximo/API data after integration requirements are approved.',
  };
}
