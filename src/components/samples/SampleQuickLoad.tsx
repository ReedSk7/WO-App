import type { SampleCR } from '../../types';

type SampleQuickLoadProps = {
  samples: SampleCR[];
  onLoad: (sample: SampleCR) => void;
};

export function SampleQuickLoad({ samples, onLoad }: SampleQuickLoadProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {samples.map((sample) => (
        <button className="btn-secondary min-h-9 px-3 py-1.5 text-xs" key={sample.id} onClick={() => onLoad(sample)} type="button">
          {sample.intake.assetNumber}
        </button>
      ))}
    </div>
  );
}
