import { useState } from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

type AddWorkRequestValues = {
  description: string;
  location: string;
  owner: string;
};

export function AddWorkRequestModal({
  onAdd,
  onClose,
}: {
  onAdd: (values: AddWorkRequestValues) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<AddWorkRequestValues>({
    description: 'New screening item from demo intake',
    location: 'AREA-F-DEMO-02',
    owner: 'Unassigned',
  });

  function updateField(field: keyof AddWorkRequestValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-navy/45 p-4" role="presentation">
      <section className="w-full max-w-lg rounded-xl border border-app-line bg-white p-5 shadow-panel" role="dialog" aria-modal="true" aria-labelledby="add-wr-heading">
        <div className="flex items-start justify-between gap-4 border-b border-app-line pb-4">
          <div>
            <h2 className="text-xl font-bold text-app-navy" id="add-wr-heading">
              Add WR
            </h2>
            <p className="mt-1 text-sm text-app-muted">Creates a local mock work request for demo screening.</p>
          </div>
          <button aria-label="Close add work request" className="rounded-lg p-2 text-app-muted hover:bg-app-soft hover:text-app-navy" onClick={onClose} type="button">
            <Icon className="h-4 w-4" name="close" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="field-label">Description</span>
            <textarea
              className="field mt-2 min-h-24 resize-y"
              onChange={(event) => updateField('description', event.target.value)}
              value={values.description}
            />
          </label>
          <label className="block">
            <span className="field-label">Location</span>
            <input className="field mt-2" onChange={(event) => updateField('location', event.target.value)} value={values.location} />
          </label>
          <label className="block">
            <span className="field-label">Owner</span>
            <input className="field mt-2" onChange={(event) => updateField('owner', event.target.value)} value={values.owner} />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-app-line pt-4 sm:flex-row sm:justify-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              onAdd(values);
            }}
            variant="primary"
          >
            <Icon className="h-4 w-4" name="plus" />
            Add demo WR
          </Button>
        </div>
      </section>
    </div>
  );
}

export type { AddWorkRequestValues };
