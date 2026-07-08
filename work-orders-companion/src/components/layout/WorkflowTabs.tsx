import type { WorkflowStep } from '../../types';
import { Icon, type IconName } from '../ui/Icon';
import { cn } from '../../utils/cn';

const iconByStep: Record<WorkflowStep, IconName> = {
  Intake: 'intake',
  Screening: 'screening',
  Planning: 'planning',
  Scheduling: 'calendar',
  'Weekly Review': 'list',
  Completion: 'completion',
};

const steps: WorkflowStep[] = ['Intake', 'Screening', 'Planning', 'Scheduling', 'Weekly Review', 'Completion'];

export function WorkflowTabs({ activeStep, onStepChange }: { activeStep: WorkflowStep; onStepChange: (step: WorkflowStep) => void }) {
  return (
    <div className="sticky top-0 z-20 border-b border-app-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-dashboard overflow-x-auto px-4 lg:px-6">
        {steps.map((step) => {
          const active = step === activeStep;
          return (
            <button
              aria-pressed={active}
              className={cn(
                'flex min-h-14 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition',
                active ? 'border-app-purple bg-app-purpleSoft/70 text-app-purple' : 'border-transparent text-app-navy hover:bg-app-soft',
              )}
              key={step}
              onClick={() => onStepChange(step)}
              type="button"
            >
              <Icon className="h-5 w-5" name={iconByStep[step]} />
              {step}
            </button>
          );
        })}
      </div>
    </div>
  );
}
