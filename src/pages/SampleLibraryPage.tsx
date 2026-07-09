import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sampleCRs } from '../data/sampleCRs';
import { AppHeader } from '../components/layout/AppHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { SampleList } from '../components/samples/SampleList';
import { SectionCard } from '../components/ui/SectionCard';
import { saveCurrentCR } from '../storage/local';
import type { Discipline, SampleCR, WorkType } from '../types';

const allDisciplines = ['All', 'Electrical', 'Mechanical', 'I&C', 'Civil/Structural', 'Operations Support', 'Generic'] as const;
const allWorkTypes = ['All', 'Corrective Maintenance', 'Preventive Maintenance', 'Generic Work', 'Troubleshooting', 'Inspection'] as const;

export default function SampleLibraryPage() {
  const navigate = useNavigate();
  const [discipline, setDiscipline] = useState<(typeof allDisciplines)[number]>('All');
  const [workType, setWorkType] = useState<(typeof allWorkTypes)[number]>('All');
  const samples = useMemo(
    () =>
      sampleCRs.filter((sample) => {
        const disciplineMatch = discipline === 'All' || sample.intake.discipline === (discipline as Discipline);
        const workTypeMatch = workType === 'All' || sample.intake.workType === (workType as WorkType);
        return disciplineMatch && workTypeMatch;
      }),
    [discipline, workType],
  );

  const loadSample = (sample: SampleCR) => {
    saveCurrentCR(sample.intake);
    navigate('/intake');
  };

  return (
    <>
      <AppHeader
        subtitle="Six clearly fake CR records for demo planning workflows. No real plant, equipment, or procedure data is included."
        title="Sample CR Library"
      />
      <PageContainer>
        <SectionCard title="Filters" description="Use filters to quickly find a fake sample by discipline or work type.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="label">Discipline</span>
              <select className="input" onChange={(event) => setDiscipline(event.target.value as (typeof allDisciplines)[number])} value={discipline}>
                {allDisciplines.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="label">Work type</span>
              <select className="input" onChange={(event) => setWorkType(event.target.value as (typeof allWorkTypes)[number])} value={workType}>
                {allWorkTypes.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
        </SectionCard>
        <SampleList onLoad={loadSample} samples={samples} />
      </PageContainer>
    </>
  );
}
