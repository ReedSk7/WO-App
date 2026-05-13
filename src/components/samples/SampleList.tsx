import type { SampleCR } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

type SampleListProps = {
  samples: SampleCR[];
  onLoad: (sample: SampleCR) => void;
};

export function SampleList({ samples, onLoad }: SampleListProps) {
  return (
    <div className="divide-y divide-border-subtle rounded-panel border border-border-subtle bg-surface-light dark:bg-surface-dark">
      {samples.map((sample) => (
        <article className="grid gap-4 p-4 md:grid-cols-[1fr_auto]" key={sample.id}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold">{sample.name}</h2>
              <StatusBadge status="Draft" />
            </div>
            <p className="mt-1 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">{sample.summary}</p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="label">CR</dt>
                <dd className="font-mono font-semibold">{sample.intake.crNumber}</dd>
              </div>
              <div>
                <dt className="label">Asset</dt>
                <dd className="font-mono font-semibold">{sample.intake.assetNumber}</dd>
              </div>
              <div>
                <dt className="label">Discipline</dt>
                <dd className="font-semibold">{sample.intake.discipline}</dd>
              </div>
            </dl>
          </div>
          <div className="flex items-start md:justify-end">
            <button className="btn" onClick={() => onLoad(sample)} type="button">
              Load into Intake
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
