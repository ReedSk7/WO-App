import { useState } from 'react';
import type { RecordType, SiteOption, UserRoleOption } from '../../types';
import { demoInputs, recordTypeOptions } from '../../data/mockWorkRequests';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export type EntranceValues = {
  input: string;
  recordType: RecordType;
  siteId: string;
  userRoleId: string;
};

export function EntranceScreen({
  onAnalyze,
  siteOptions,
  userRoleOptions,
}: {
  onAnalyze: (values: EntranceValues) => string | null;
  siteOptions: SiteOption[];
  userRoleOptions: UserRoleOption[];
}) {
  const [values, setValues] = useState<EntranceValues>({
    input: '',
    recordType: 'CR',
    siteId: '',
    userRoleId: userRoleOptions[0]?.id ?? 'planner',
  });
  const [error, setError] = useState<string | null>(null);

  function updateField<TField extends keyof EntranceValues>(field: TField, value: EntranceValues[TField]) {
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function submit() {
    const nextError = onAnalyze(values);
    setError(nextError);
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-5 text-app-navy sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col justify-center gap-6">
        <header className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-purple text-white shadow-soft">
            <Icon className="h-5 w-5" name="logo" />
          </span>
          <div>
            <p className="text-lg font-bold leading-5">CR Planning Companion</p>
            <p className="text-sm font-semibold text-app-muted">Demo-safe screening and planning workflow</p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <section className="panel p-5 sm:p-6" aria-labelledby="entrance-heading">
            <div className="border-b border-app-line pb-4">
              <h1 className="text-2xl font-bold tracking-normal text-app-navy" id="entrance-heading">
                Select site and source record
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">
                Start from a CR, existing WO, PM package, or short condition note. The agent output is generated once and shown as read-only planning context.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="field-label">Site</span>
                <select className="field mt-2" onChange={(event) => updateField('siteId', event.target.value)} value={values.siteId}>
                  <option value="">Select a site</option>
                  {siteOptions.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="field-label">User role</span>
                <select className="field mt-2" onChange={(event) => updateField('userRoleId', event.target.value)} value={values.userRoleId}>
                  {userRoleOptions.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="field-label">Source type</legend>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                {recordTypeOptions.map((option) => (
                  <label
                    className={
                      values.recordType === option.value
                        ? 'rounded-lg border border-app-purple bg-app-purpleSoft p-3 shadow-soft'
                        : 'rounded-lg border border-app-line bg-white p-3 shadow-soft hover:border-app-purple/40'
                    }
                    key={option.value}
                  >
                    <input
                      checked={values.recordType === option.value}
                      className="sr-only"
                      name="record-type"
                      onChange={() => updateField('recordType', option.value)}
                      type="radio"
                    />
                    <span className="block text-sm font-bold text-app-navy">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-app-muted">{option.helper}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-5 block">
              <span className="field-label">CR, WO, PM, or condition note</span>
              <textarea
                aria-describedby={error ? 'entrance-error' : undefined}
                className="field mt-2 min-h-28 resize-y"
                onChange={(event) => updateField('input', event.target.value)}
                placeholder="Try DEMO-CR-1001, DEMO-WO-3001, DEMO-PM-2001, or describe a condition."
                value={values.input}
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-2" aria-label="Demo input shortcuts">
              {demoInputs.map((item) => (
                <button
                  className="rounded-lg border border-app-line bg-white px-3 py-2 text-xs font-bold text-app-purple shadow-sm hover:bg-app-purpleSoft"
                  key={item.input}
                  onClick={() => {
                    setValues((current) => ({ ...current, input: item.input, recordType: item.recordType }));
                    setError(null);
                  }}
                  type="button"
                >
                  {item.input}
                  <span className="ml-2 font-semibold text-app-muted">{item.label}</span>
                </button>
              ))}
            </div>

            {error ? (
              <p className="mt-4 rounded-lg border border-app-red/25 bg-app-redSoft px-3 py-2 text-sm font-semibold text-app-red" id="entrance-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-app-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-app-muted">Mock data only. No real plant-sensitive data is used in this prototype.</p>
              <Button className="px-4" onClick={submit} variant="primary">
                <Icon className="h-4 w-4" name="spark" />
                Analyze record
              </Button>
            </div>
          </section>

          <aside className="panel p-5 sm:p-6" aria-labelledby="agent-guardrails-heading">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-app-purple" name="shield" />
              <h2 className="text-lg font-bold text-app-navy" id="agent-guardrails-heading">
                Controlled agent run
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              {[
                'One intake action starts the mock Databricks review.',
                'No chat prompt is available after the run.',
                'Planner gaps and search findings are read-only.',
                'Technical criteria must come from approved source documents.',
              ].map((item) => (
                <div className="flex gap-3 rounded-lg border border-app-line bg-app-soft/40 p-3" key={item}>
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-app-green/30 bg-app-greenSoft text-app-green">
                    <Icon className="h-3 w-3" name="check" />
                  </span>
                  <p className="text-sm font-semibold leading-5 text-app-navy">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-app-line bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-app-muted">Expected output</p>
              <dl className="mt-3 grid gap-3 text-sm">
                <div className="grid grid-cols-[8rem_1fr] gap-3">
                  <dt className="font-semibold text-app-muted">CR review</dt>
                  <dd className="font-bold text-app-navy">Classification, related records, planner gaps</dd>
                </div>
                <div className="grid grid-cols-[8rem_1fr] gap-3">
                  <dt className="font-semibold text-app-muted">WO or PM</dt>
                  <dd className="font-bold text-app-navy">Package completeness and next planner checks</dd>
                </div>
                <div className="grid grid-cols-[8rem_1fr] gap-3">
                  <dt className="font-semibold text-app-muted">Searches</dt>
                  <dd className="font-bold text-app-navy">Mock vector and data-search matches only</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
