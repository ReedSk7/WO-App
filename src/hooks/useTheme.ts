import { useEffect } from 'react';
import type { DensityPreference, ThemePreference } from '../types';
import { STORAGE_KEYS } from '../storage/local';
import { useLocalStorage } from './useLocalStorage';

export function applyThemePreference(theme: ThemePreference) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function applyDensityPreference(density: DensityPreference) {
  document.documentElement.dataset.density = density;
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<ThemePreference>(STORAGE_KEYS.theme, 'light');
  const [density, setDensity] = useLocalStorage<DensityPreference>(STORAGE_KEYS.density, 'comfortable');

  useEffect(() => applyThemePreference(theme), [theme]);
  useEffect(() => applyDensityPreference(density), [density]);

  return { theme, setTheme, density, setDensity };
}
