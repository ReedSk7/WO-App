import type { SVGProps } from 'react';

export type IconName =
  | 'actions'
  | 'admin'
  | 'analytics'
  | 'arrow'
  | 'audit'
  | 'calendar'
  | 'check'
  | 'chevron'
  | 'close'
  | 'completion'
  | 'export'
  | 'home'
  | 'info'
  | 'intake'
  | 'integrations'
  | 'list'
  | 'logo'
  | 'planning'
  | 'plus'
  | 'refresh'
  | 'reports'
  | 'screening'
  | 'search'
  | 'shield'
  | 'spark'
  | 'warning'
  | 'workflows';

const paths: Record<IconName, string[]> = {
  actions: ['M4 7h16', 'M4 12h10', 'M4 17h16', 'M17 10l3 2-3 2'],
  admin: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M4 12h2', 'M18 12h2', 'M12 4v2', 'M12 18v2', 'M6.6 6.6l1.4 1.4', 'M16 16l1.4 1.4', 'M17.4 6.6 16 8', 'M8 16l-1.4 1.4'],
  analytics: ['M4 19V5', 'M4 19h16', 'M7 15l3-3 3 2 5-7'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  audit: ['M7 4h10l3 3v13H7z', 'M17 4v4h4', 'M10 12h7', 'M10 16h5'],
  calendar: ['M5 5h14v15H5z', 'M8 3v4', 'M16 3v4', 'M5 9h14'],
  check: ['M5 12l4 4L19 6'],
  chevron: ['M9 6l6 6-6 6'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  completion: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M8 12l3 3 5-6'],
  export: ['M7 4h8l4 4v12H7z', 'M15 4v5h5', 'M11 13h6', 'M14 10v6'],
  home: ['M4 11 12 4l8 7', 'M6 10v10h12V10'],
  info: ['M12 7h.01', 'M11 11h1v6h1', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z'],
  intake: ['M6 4h9l4 4v12H6z', 'M15 4v5h4', 'M9 13h6', 'M9 17h6'],
  integrations: ['M7 8a3 3 0 1 0 0 6h3', 'M17 8a3 3 0 1 1 0 6h-3', 'M10 12h4'],
  list: ['M8 6h12', 'M8 12h12', 'M8 18h12', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01'],
  logo: ['M12 3 4 7v10l8 4 8-4V7z', 'M8 9l4 2 4-2', 'M8 13l4 2 4-2'],
  planning: ['M5 4h14v16H5z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
  plus: ['M12 5v14', 'M5 12h14'],
  refresh: ['M20 7v5h-5', 'M4 17v-5h5', 'M18 12a6 6 0 0 0-10-4.4L4 12', 'M6 12a6 6 0 0 0 10 4.4L20 12'],
  reports: ['M6 4h12v16H6z', 'M9 8h6', 'M9 12h6', 'M9 16h3'],
  screening: ['M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z', 'M9 12l2 2 4-5'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'M16 16l4 4'],
  shield: ['M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z'],
  spark: ['M12 3l1.4 5.1L18 10l-4.6 1.9L12 17l-1.4-5.1L6 10l4.6-1.9z', 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'],
  warning: ['M12 4l9 16H3z', 'M12 9v5', 'M12 17h.01'],
  workflows: ['M5 6h6v6H5z', 'M13 12h6v6h-6z', 'M11 9h4v3'],
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ className, name, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name].map((path, index) => (
        <path d={path} key={`${name}-${index}`} />
      ))}
    </svg>
  );
}
