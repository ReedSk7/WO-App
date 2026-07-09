import { Icon, type IconName } from '../ui/Icon';
import { cn } from '../../utils/cn';

type NavItem = {
  label: string;
  icon?: IconName;
  active?: boolean;
};

const workflowItems: NavItem[] = [
  { label: 'Intake' },
  { label: 'Screening', active: true },
  { label: 'Planning' },
  { label: 'Scheduling' },
  { label: 'Weekly Review' },
  { label: 'Completion' },
];

const primaryItems: NavItem[] = [
  { label: 'Reports', icon: 'reports' },
  { label: 'Analytics', icon: 'analytics' },
  { label: 'Actions Hub', icon: 'actions' },
  { label: 'Work Order Audit', icon: 'audit' },
  { label: 'Integrations', icon: 'integrations' },
  { label: 'Admin', icon: 'admin' },
];

export function Sidebar({ userRoleLabel = 'Planner' }: { userRoleLabel?: string }) {
  return (
    <aside className="hidden border-r border-app-line bg-app-rail lg:sticky lg:top-0 lg:block lg:h-screen">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-3 border-b border-app-line px-4 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-purple text-white">
            <Icon className="h-5 w-5" name="logo" />
          </span>
          <div>
            <p className="text-base font-bold leading-5 text-app-navy">CR Planning</p>
            <p className="text-base font-bold leading-5 text-app-navy">Companion</p>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          <a className="nav-item" href="#screening">
            <Icon className="h-4 w-4" name="home" />
            Home
          </a>

          <div className="pt-2">
            <div className="nav-item text-app-purple">
              <Icon className="h-4 w-4" name="workflows" />
              <span className="flex-1">Workflows</span>
              <Icon className="h-4 w-4 rotate-90" name="chevron" />
            </div>
            <div className="mt-1 space-y-1 border-l border-app-line pl-4">
              {workflowItems.map((item) => (
                <a
                  className={cn(
                    'flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold text-app-muted transition hover:bg-app-purpleSoft hover:text-app-purple',
                    item.active && 'bg-app-purpleSoft text-app-purple shadow-[inset_3px_0_0_#5138b9]',
                  )}
                  href="#screening"
                  key={item.label}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-3">
            {primaryItems.map((item) => (
              <a className="nav-item" href="#screening" key={item.label}>
                {item.icon ? <Icon className="h-4 w-4" name={item.icon} /> : null}
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="border-t border-app-line p-4">
          <div className="flex items-center gap-3 rounded-lg border border-app-line bg-white p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app-purple text-sm font-bold text-white">DU</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-app-navy">Demo User</p>
              <p className="text-xs text-app-muted">{userRoleLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
