import { useState } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { SettingsForm } from '../components/settings/SettingsForm';
import { ToastRegion } from '../components/ui/ToastRegion';
import { loadTemplates, saveTemplates } from '../storage/local';
import type { DensityPreference, ThemePreference } from '../types';

type SettingsPageProps = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  density: DensityPreference;
  setDensity: (density: DensityPreference) => void;
};

export default function SettingsPage({ theme, setTheme, density, setDensity }: SettingsPageProps) {
  const [templates, setTemplates] = useState(loadTemplates());
  const [toast, setToast] = useState<string | null>(null);
  const save = () => {
    saveTemplates(templates);
    setToast('Settings saved');
  };

  return (
    <>
      <AppHeader
        actions={<button className="btn" onClick={save} type="button">Save Settings</button>}
        subtitle="Local template wording, theme, density, and inactive future integration placeholders."
        title="Settings / Template Editor"
      />
      <PageContainer>
        <SettingsForm
          density={density}
          onDensityChange={setDensity}
          onTemplatesChange={setTemplates}
          onThemeChange={setTheme}
          templates={templates}
          theme={theme}
        />
      </PageContainer>
      <ToastRegion message={toast} />
    </>
  );
}
