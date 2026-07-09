import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import type { DensityPreference, ThemePreference } from '../../types';
import { cn } from '../../utils/cn';
import { Icon } from '../ui/Icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/intake', label: 'CR Intake', icon: 'intake' },
  { to: '/draft', label: 'Draft Review', icon: 'draft' },
  { to: '/fields', label: 'Maximo Field Builder', icon: 'fields' },
  { to: '/checklist', label: 'Planning Checklist', icon: 'checklist' },
  { to: '/samples', label: 'Sample CR Library', icon: 'samples' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
] as const;

type SidebarProps = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  density: DensityPreference;
};

export function Sidebar({ theme, setTheme, density }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const nav = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-semibold uppercase text-white/60">Local demo</p>
        <h1 className="mt-2 text-lg font-semibold leading-6 text-white">Work Order Agent Companion</h1>
      </div>
      <nav aria-label="Primary navigation" className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-white',
                isActive && 'bg-white text-[#161616] hover:bg-white hover:text-[#161616]',
              )
            }
            end={item.to === '/'}
            key={item.to}
            onClick={() => setOpen(false)}
            to={item.to}
          >
            <Icon className="h-4 w-4" name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3 border-t border-white/10 p-4">
        <button className="w-full rounded-md border border-white/20 px-3 py-2 text-left text-sm font-semibold text-white hover:bg-white/10" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type="button">
          {theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
        </button>
        <p className="text-xs leading-5 text-white/55">Density: {density}. Demo-only local storage.</p>
      </div>
    </div>
  );

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="Open navigation"
        className="fixed left-3 top-3 z-50 rounded-md bg-[#262626] p-2 text-white shadow-panel lg:hidden no-print"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Icon className="h-5 w-5" name="menu" />
      </button>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-[#262626] text-white lg:block no-print">{nav}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <button aria-label="Close navigation backdrop" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} type="button" />
          <aside className="relative h-full w-80 max-w-[85vw] bg-[#262626] text-white shadow-panel">
            <button aria-label="Close navigation" className="absolute right-3 top-3 rounded-md p-2 text-white hover:bg-white/10" onClick={() => setOpen(false)} type="button">
              <Icon className="h-5 w-5" name="close" />
            </button>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
