import type { SVGProps } from 'react';

type IconName =
  | 'dashboard'
  | 'intake'
  | 'draft'
  | 'fields'
  | 'checklist'
  | 'samples'
  | 'settings'
  | 'copy'
  | 'download'
  | 'print'
  | 'save'
  | 'warning'
  | 'info'
  | 'check'
  | 'arrow'
  | 'menu'
  | 'close';

const paths: Record<IconName, string[]> = {
  dashboard: ['M4 5h7v6H4z', 'M13 5h7v4h-7z', 'M13 11h7v8h-7z', 'M4 13h7v6H4z'],
  intake: ['M7 3h7l5 5v13H7z', 'M14 3v6h5', 'M10 13h6', 'M10 17h6'],
  draft: ['M6 3h9l3 3v15H6z', 'M9 10h6', 'M9 14h6', 'M9 18h4'],
  fields: ['M4 5h16', 'M4 12h16', 'M4 19h16', 'M7 3v4', 'M14 10v4', 'M11 17v4'],
  checklist: ['M5 7l2 2 4-4', 'M13 7h7', 'M5 14l2 2 4-4', 'M13 14h7'],
  samples: ['M5 4h14v14H5z', 'M8 8h8', 'M8 12h8', 'M5 20h14'],
  settings: ['M12 8a4 4 0 100 8 4 4 0 000-8z', 'M4 12h2', 'M18 12h2', 'M12 4v2', 'M12 18v2', 'M6.5 6.5l1.4 1.4', 'M16.1 16.1l1.4 1.4', 'M17.5 6.5l-1.4 1.4', 'M7.9 16.1l-1.4 1.4'],
  copy: ['M8 8h10v12H8z', 'M6 16H4V4h10v2'],
  download: ['M12 4v10', 'M8 10l4 4 4-4', 'M5 20h14'],
  print: ['M7 8V4h10v4', 'M6 18H4v-7h16v7h-2', 'M7 14h10v7H7z'],
  save: ['M5 4h12l2 2v14H5z', 'M8 4v6h8', 'M8 17h8'],
  warning: ['M12 4l9 16H3z', 'M12 9v5', 'M12 17h.01'],
  info: ['M12 7h.01', 'M11 11h1v6h1', 'M12 21a9 9 0 100-18 9 9 0 000 18z'],
  check: ['M5 12l4 4L19 6'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
};

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {paths[name].map((path, index) => (
        <path d={path} key={`${name}-${index}`} />
      ))}
    </svg>
  );
}
