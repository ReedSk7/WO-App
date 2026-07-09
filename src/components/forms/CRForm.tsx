import type { CRIntake, Discipline, MissingInfoItem, Priority, WorkType } from '../../types';
import { useCRValidation } from '../../hooks/useCRValidation';
import { SelectField, TextAreaField, TextField, ToggleField } from './FormField';
import { FormSection } from './FormSection';

const disciplines: Discipline[] = ['Electrical', 'Mechanical', 'I&C', 'Civil/Structural', 'Operations Support', 'Generic'];
const workTypes: WorkType[] = ['Corrective Maintenance', 'Preventive Maintenance', 'Generic Work', 'Troubleshooting', 'Inspection'];
const priorities: Priority[] = ['Low', 'Normal', 'High', 'Emergent'];

type SetCRField = <K extends keyof CRIntake>(field: K, value: CRIntake[K]) => void;

type CRFormProps = {
  form: CRIntake;
  validation: ReturnType<typeof useCRValidation>;
  onGenerate: () => void;
  onSave: () => void;
  onClear: () => void;
  setField: SetCRField;
};

function sectionFlags(items: MissingInfoItem[], section: string) {
  return items.filter((item) => item.section === section);
}

export function CRForm({ form, validation, onGenerate, onSave, onClear, setField }: CRFormProps) {
  return (
    <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); onGenerate(); }}>
      <FormSection description="Use only fake/demo identifiers. Keep record IDs readable for review." flags={sectionFlags(validation.missingInfo, 'Work Order Summary')} title="CR basics">
        <TextField error={validation.visibleErrors.crNumber} helper="Demo format example: DEMO-CR-1001." id="crNumber" label="CR number" onBlur={() => validation.setTouched((value) => ({ ...value, crNumber: true }))} onChange={(value) => setField('crNumber', value)} value={form.crNumber} />
        <TextField full id="crTitle" label="CR title" onChange={(value) => setField('crTitle', value)} value={form.crTitle} />
        <SelectField label="Discipline" onChange={(value) => setField('discipline', value as Discipline)} options={disciplines} value={form.discipline} />
        <SelectField label="Work type" onChange={(value) => setField('workType', value as WorkType)} options={workTypes} value={form.workType} />
        <SelectField label="Priority" onChange={(value) => setField('priority', value as Priority)} options={priorities} value={form.priority} />
      </FormSection>

      <FormSection description="Capture enough location and condition detail for a planner to screen the draft." flags={[...sectionFlags(validation.missingInfo, 'Problem Statement'), ...sectionFlags(validation.missingInfo, 'Scope of Work'), ...sectionFlags(validation.missingInfo, 'Planning Basis')]} title="Asset and condition">
        <TextField error={validation.visibleErrors.assetNumber} helper="Fake/demo asset number only." id="assetNumber" label="Equipment / asset number" onBlur={() => validation.setTouched((value) => ({ ...value, assetNumber: true }))} onChange={(value) => setField('assetNumber', value)} value={form.assetNumber} />
        <TextField error={validation.visibleErrors.componentDescription} id="componentDescription" label="Component description" onBlur={() => validation.setTouched((value) => ({ ...value, componentDescription: true }))} onChange={(value) => setField('componentDescription', value)} value={form.componentDescription} />
        <TextField error={validation.visibleErrors.location} full id="location" label="Unit / area / location" onBlur={() => validation.setTouched((value) => ({ ...value, location: true }))} onChange={(value) => setField('location', value)} value={form.location} />
        <TextAreaField error={validation.visibleErrors.problemStatement} full id="problemStatement" label="Problem statement" onBlur={() => validation.setTouched((value) => ({ ...value, problemStatement: true }))} onChange={(value) => setField('problemStatement', value)} value={form.problemStatement} />
        <TextAreaField full id="discoveredCondition" label="Discovered condition" onChange={(value) => setField('discoveredCondition', value)} value={form.discoveredCondition} />
        <TextAreaField error={validation.visibleErrors.requestedAction} full id="requestedAction" label="Requested action" onBlur={() => validation.setTouched((value) => ({ ...value, requestedAction: true }))} onChange={(value) => setField('requestedAction', value)} value={form.requestedAction} />
      </FormSection>

      <FormSection description="These toggles create conservative planning placeholders; they do not establish approved work controls." flags={[...sectionFlags(validation.missingInfo, 'Parts / Materials'), ...sectionFlags(validation.missingInfo, 'Clearance / Tagging Considerations')]} title="Planning needs">
        <ToggleField checked={form.safetySignificance} helper="Requires qualified review before use." id="safetySignificance" label="Safety significance" onChange={(value) => setField('safetySignificance', value)} />
        <ToggleField checked={form.requiresClearance} helper="Boundary remains undefined until approved." id="requiresClearance" label="Requires clearance" onChange={(value) => setField('requiresClearance', value)} />
        <ToggleField checked={form.requiresEngineeringInput} helper="Engineering input is flagged in the draft." id="requiresEngineeringInput" label="Requires engineering input" onChange={(value) => setField('requiresEngineeringInput', value)} />
        <ToggleField checked={form.requiresParts} helper="Material details stay as placeholders." id="requiresParts" label="Requires parts" onChange={(value) => setField('requiresParts', value)} />
        <ToggleField checked={form.requiresScaffoldOrLift} helper="Access support requires review." id="requiresScaffoldOrLift" label="Requires scaffold/lift" onChange={(value) => setField('requiresScaffoldOrLift', value)} />
      </FormSection>

      <FormSection description="Add planner notes without inserting real procedure references or technical values." title="Notes">
        <TextAreaField full id="notes" label="Notes" onChange={(value) => setField('notes', value)} value={form.notes} />
      </FormSection>

      <div className="flex flex-wrap gap-2">
        <button className="btn" type="submit">Generate Draft Work Order</button>
        <button className="btn-secondary" onClick={onSave} type="button">Save Draft</button>
        <button className="btn-tertiary" onClick={onClear} type="button">Clear Form</button>
      </div>
    </form>
  );
}
