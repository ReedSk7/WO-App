import { useEffect, useMemo, useState } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { TextAreaField, TextField, SelectField, ToggleField } from '../components/forms/FormField';
import { SectionCard } from '../components/ui/SectionCard';
import { ToastRegion } from '../components/ui/ToastRegion';
import { useClipboard } from '../hooks/useClipboard';
import type { Discipline, WorkType } from '../types';

const disciplines: Discipline[] = ['Electrical', 'Mechanical', 'I&C', 'Civil/Structural', 'Operations Support', 'Generic'];
const workTypes: WorkType[] = ['Corrective Maintenance', 'Preventive Maintenance', 'Generic Work', 'Troubleshooting', 'Inspection'];

function buildOutputs(values: {
  asset: string;
  problem: string;
  requestedAction: string;
  discipline: Discipline;
  workType: WorkType;
  clearanceRequired: boolean;
  partsRequired: boolean;
}) {
  const asset = values.asset || '[fake asset required]';
  const problem = values.problem || '[problem statement required]';
  const action = values.requestedAction || '[requested action required]';
  return {
    'Long Description': [
      'Draft only. Not approved for execution. Requires qualified planner review and applicable organizational approvals.',
      `Asset: ${asset}`,
      `Problem: ${problem}`,
      `Requested action: ${action}`,
      'Use approved procedures and verified technical data only. Do not infer setpoints, torque values, acceptance criteria, or PMT values.',
    ].join('\n'),
    'Work Order Task Description': `${values.workType} planning draft for ${asset}. Planner to verify scope, boundaries, prerequisites, and approved source documents.`,
    'Craft Notes': `${values.discipline} craft support is expected based on the demo intake. Planner to validate labor/craft assignment.`,
    'Material Request Notes': values.partsRequired
      ? 'Parts/materials are required. Material details, part numbers, substitutions, and approvals must be verified before final package release.'
      : 'No parts selected in this field build. Planner to verify material need.',
    'Tool Notes': 'Tool and test equipment list is a placeholder. Planner to add verified tools and calibrated test equipment requirements.',
    'Clearance Notes': values.clearanceRequired
      ? 'This is not a clearance boundary. Potential isolation points are listed for review only. Qualified operations/electrical review required. Clearance scope must align with final approved work instructions. This app does not create or approve clearance boundaries.'
      : 'This is not a clearance boundary. Potential isolation points are listed for review only. Qualified operations/electrical review required. Clearance scope must align with final approved work instructions. This app does not create or approve clearance boundaries. No clearance selected; planner to verify whether clearance review is required.',
    'PMT Notes': 'Use approved procedure, engineering direction, or qualified test guidance. This demo does not define acceptance criteria.',
    'Reviewer Notes': 'Reviewer must confirm missing information, ORA/risk review need, source documents, and closeout expectations before use.',
  };
}

export default function FieldBuilderPage() {
  const [toast, setToast] = useState<string | null>(null);
  const { copyText, copiedLabel } = useClipboard(setToast);
  const [values, setValues] = useState({
    asset: '',
    problem: '',
    requestedAction: '',
    discipline: 'Generic' as Discipline,
    workType: 'Generic Work' as WorkType,
    clearanceRequired: false,
    partsRequired: false,
  });
  const generatedOutputs = useMemo(() => buildOutputs(values), [values]);
  const [outputs, setOutputs] = useState(generatedOutputs);

  useEffect(() => {
    setOutputs(generatedOutputs);
  }, [generatedOutputs]);

  const setValue = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((current) => ({ ...current, [key]: value }));
  const copyAll = () => copyText(Object.entries(outputs).map(([label, content]) => `## ${label}\n${content}`).join('\n\n'), 'All planning notes copied');

  return (
    <>
      <AppHeader
        actions={<button className="btn-secondary" onClick={copyAll} type="button">Copy all planning notes</button>}
        subtitle="Build conservative Maximo-style text fields from fake/demo inputs. Outputs remain editable through copy/paste review."
        title="Maximo-Style Field Builder"
      />
      <PageContainer>
        <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <SectionCard description="Enter only fake/demo data. Generated text does not connect to Maximo." title="Inputs">
            <div className="grid gap-4">
              <TextField label="Equipment / asset" onChange={(value) => setValue('asset', value)} value={values.asset} />
              <TextAreaField label="Problem" onChange={(value) => setValue('problem', value)} value={values.problem} />
              <TextAreaField label="Requested action" onChange={(value) => setValue('requestedAction', value)} value={values.requestedAction} />
              <SelectField label="Discipline" onChange={(value) => setValue('discipline', value as Discipline)} options={disciplines} value={values.discipline} />
              <SelectField label="Work type" onChange={(value) => setValue('workType', value as WorkType)} options={workTypes} value={values.workType} />
              <ToggleField checked={values.clearanceRequired} id="clearanceRequired" label="Clearance required" onChange={(value) => setValue('clearanceRequired', value)} />
              <ToggleField checked={values.partsRequired} id="partsRequired" label="Parts required" onChange={(value) => setValue('partsRequired', value)} />
            </div>
          </SectionCard>

          <div className="grid gap-4">
            {Object.entries(outputs).map(([label, content]) => (
              <SectionCard
                actions={<button className="btn-secondary min-h-9 px-3 py-1.5 text-xs" onClick={() => copyText(content, `${label} copied`)} type="button">Copy</button>}
                description={`Editable/copyable ${label.toLowerCase()} placeholder for planner review.`}
                key={label}
                title={label}
              >
                <textarea
                  className="input min-h-32 resize-y leading-6"
                  onChange={(event) => setOutputs((current) => ({ ...current, [label]: event.target.value }))}
                  value={content}
                />
              </SectionCard>
            ))}
          </div>
        </div>
      </PageContainer>
      <ToastRegion message={toast ?? copiedLabel} />
    </>
  );
}
