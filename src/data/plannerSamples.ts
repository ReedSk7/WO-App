import type { MaximoTabDefinition, PlannerRecordType, PlannerRelatedRecord } from '../types';

export const MAXIMO_TABS: MaximoTabDefinition[] = [
  { id: 'workorder', label: 'Workorder' },
  { id: 'plans', label: 'Plans' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'logic', label: 'Logic' },
  { id: 'related-records', label: 'Related Records' },
  { id: 'actuals', label: 'Actuals' },
  { id: 'safety-plan', label: 'Safety Plan' },
  { id: 'impact-plans', label: 'Impact Plans' },
  { id: 'log', label: 'Log' },
  { id: 'specifications', label: 'Specifications' },
];

export type PlannerSample = {
  aliases: string[];
  recordType: PlannerRecordType;
  recordNumber: string;
  title: string;
  asset: string;
  location: string;
  priority: string;
  workType: string;
  discipline: string;
  sourceSummary: string;
  knownFacts: string[];
  informationGaps: string[];
  relatedRecords: PlannerRelatedRecord[];
};

export const plannerSamples: PlannerSample[] = [
  {
    aliases: ['DEMO-CR-1001', 'CR1001', 'CR-1001'],
    recordType: 'CR',
    recordNumber: 'DEMO-CR-1001',
    title: 'Demo pump seal leakage planning review',
    asset: 'FAKE-PMP-101',
    location: 'Demo Unit 1 / Pump Bay',
    priority: 'Needs planner review',
    workType: 'Corrective Maintenance',
    discipline: 'Mechanical',
    sourceSummary:
      'A fictional operations report describes low-rate leakage near a demo pump seal and requests a conservative work order planning package.',
    knownFacts: [
      'Reported condition is leakage near a fictional pump seal.',
      'Affected asset is identified as FAKE-PMP-101 in demo data.',
      'Equipment status and impact require planner confirmation.',
      'Parts applicability is not confirmed by source data.',
    ],
    informationGaps: [
      'Confirm exact leak location and whether walkdown photos exist.',
      'Confirm operating status, tagout needs, and work window.',
      'Confirm approved seal repair guidance and material availability.',
      'Confirm post-maintenance testing source document before planning release.',
    ],
    relatedRecords: [
      {
        recordNumber: 'DEMO-WO-3004',
        title: 'Seal inspection history',
        tabId: 'related-records',
      },
      {
        recordNumber: 'DEMO-MPL-2007',
        title: 'Pump bay walkdown list',
        tabId: 'logic',
      },
    ],
  },
  {
    aliases: ['DEMO-MPL-2001', 'MPL2001', 'MPL-2001'],
    recordType: 'MPL',
    recordNumber: 'DEMO-MPL-2001',
    title: 'Demo breaker inspection planning list item',
    asset: 'FAKE-BRK-4160A',
    location: 'Demo Switchgear Room',
    priority: 'Planning hold',
    workType: 'Inspection',
    discipline: 'Electrical',
    sourceSummary:
      'A fictional maintenance planning list item requests review of a demo breaker condition before a draft work order is created.',
    knownFacts: [
      'Source is a fake maintenance planning list item.',
      'Affected component is a demo breaker asset.',
      'Electrical review is expected before scope is finalized.',
      'No acceptance criteria are defined by this app.',
    ],
    informationGaps: [
      'Confirm source of inspection acceptance criteria.',
      'Confirm clearance and electrical safety review needs.',
      'Confirm whether any parts, test equipment, or support groups are required.',
      'Confirm whether this should become a corrective WO or inspection-only WO.',
    ],
    relatedRecords: [
      {
        recordNumber: 'DEMO-CR-1018',
        title: 'Breaker observation',
        tabId: 'related-records',
      },
      {
        recordNumber: 'DEMO-WO-3031',
        title: 'Prior breaker inspection draft',
        tabId: 'workorder',
      },
    ],
  },
  {
    aliases: ['DEMO-WO-3001', 'WO3001', 'WO-3001'],
    recordType: 'WO',
    recordNumber: 'DEMO-WO-3001',
    title: 'Demo valve actuator slow stroke draft review',
    asset: 'FAKE-VLV-ACT-09',
    location: 'Demo Valve Gallery',
    priority: 'Draft',
    workType: 'Troubleshooting',
    discipline: 'Mechanical',
    sourceSummary:
      'A fictional draft work order shell exists for a slow-stroking demo valve actuator and needs planner package completion.',
    knownFacts: [
      'Draft WO input is associated with a fake valve actuator.',
      'Reported symptom is slow actuator response.',
      'Troubleshooting work type requires conservative review.',
      'As-found and as-left expectations should be included.',
    ],
    informationGaps: [
      'Confirm approved troubleshooting guidance.',
      'Confirm whether engineering review is required before scope expansion.',
      'Confirm clearance boundary through qualified review only.',
      'Confirm PMT and acceptance criteria from approved source documents.',
    ],
    relatedRecords: [
      {
        recordNumber: 'DEMO-CR-1022',
        title: 'Actuator trend note',
        tabId: 'related-records',
      },
      {
        recordNumber: 'DEMO-MPL-2015',
        title: 'Valve gallery follow-up item',
        tabId: 'logic',
      },
    ],
  },
];
