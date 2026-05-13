export type Discipline = 'Electrical'|'Mechanical'|'I&C'|'Civil/Structural'|'Operations Support'|'Generic';
export type WorkType = 'Corrective Maintenance'|'Preventive Maintenance'|'Generic Work'|'Troubleshooting'|'Inspection';
export type Priority = 'Low'|'Normal'|'High'|'Emergent';
export type DraftStatus = 'Draft'|'Needs Info'|'Review Ready';

export interface CRIntake { crNumber:string; crTitle:string; assetNumber:string; componentDescription:string; location:string; problemStatement:string; discoveredCondition:string; requestedAction:string; discipline:Discipline; workType:WorkType; priority:Priority; safetySignificance:boolean; requiresClearance:boolean; requiresEngineeringInput:boolean; requiresParts:boolean; requiresScaffoldOrLift:boolean; notes:string; }
export interface DraftSection { id:string; title:string; content:string; }
export interface ChecklistItem { id:string; group:string; label:string; checked:boolean; }
export interface TemplateSettings { draftDisclaimer:string; safetyNote:string; missingInfoWarning:string; oraNote:string; clearanceNote:string; pmtPlaceholder:string; acceptanceCriteriaPlaceholder:string; reviewerNote:string; }
export interface WorkOrderDraft { id:string; title:string; crIntake:CRIntake; sections:DraftSection[]; missingInfo:string[]; status:DraftStatus; checklist:ChecklistItem[]; createdAt:string; updatedAt:string; }
export interface SampleCR { id:string; name:string; intake:CRIntake; }
