import type { DensityPreference, TemplateSettings, ThemePreference } from '../../types';
import { DeploymentInfo } from './DeploymentInfo';

type SettingsFormProps = {
  templates: TemplateSettings;
  onTemplatesChange: (templates: TemplateSettings) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  density: DensityPreference;
  onDensityChange: (density: DensityPreference) => void;
};

export function SettingsForm({ templates, onTemplatesChange, theme, onThemeChange, density, onDensityChange }: SettingsFormProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-panel border border-border-subtle bg-surface-light p-6 shadow-panel dark:bg-surface-dark">
        <h2 className="text-xl font-semibold leading-7">Template phrases</h2>
        <p className="mt-1 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
          These phrases are saved locally and inserted into deterministic draft sections.
        </p>
        <div className="mt-5 grid gap-4">
          {Object.entries(templates).map(([key, value]) => (
            <label className="space-y-1.5" key={key}>
              <span className="label">{key}</span>
              <textarea
                className="input min-h-24 resize-y leading-6"
                onChange={(event) => onTemplatesChange({ ...templates, [key]: event.target.value })}
                value={value}
              />
            </label>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <DeploymentInfo />

        <section className="rounded-panel border border-border-subtle bg-surface-light p-6 shadow-panel dark:bg-surface-dark">
          <h2 className="text-xl font-semibold leading-7">Appearance</h2>
          <div className="mt-5 space-y-4">
            <fieldset>
              <legend className="label">Theme</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['light', 'dark'] as ThemePreference[]).map((option) => (
                  <button className={theme === option ? 'btn' : 'btn-secondary'} key={option} onClick={() => onThemeChange(option)} type="button">
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">Density</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['comfortable', 'compact'] as DensityPreference[]).map((option) => (
                  <button className={density === option ? 'btn' : 'btn-secondary'} key={option} onClick={() => onDensityChange(option)} type="button">
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section className="rounded-panel border border-border-subtle bg-surface-light p-6 shadow-panel dark:bg-surface-dark">
          <h2 className="text-xl font-semibold leading-7">Future Integrations</h2>
          <p className="mt-1 text-sm font-semibold text-status-caution">Future integration, not active</p>
          <div className="mt-5 grid gap-3">
            {['Copilot Studio agent URL placeholder', 'Power Automate webhook placeholder', 'Maximo API endpoint placeholder', 'Authentication placeholder', 'Environment name placeholder'].map((label) => (
              <label className="space-y-1.5" key={label}>
                <span className="label">{label}</span>
                <input className="input opacity-70" disabled value="Future integration, not active" readOnly />
              </label>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
