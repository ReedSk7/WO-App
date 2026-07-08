import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
};

const variants = {
  primary: 'border-transparent bg-app-purple text-white shadow-soft hover:bg-app-purpleDark',
  secondary: 'border-app-line bg-white text-app-navy hover:border-app-purple/40 hover:bg-app-purpleSoft/60',
  ghost: 'border-transparent bg-transparent text-app-purple hover:bg-app-purpleSoft',
};

export function Button({ children, className, type = 'button', variant = 'secondary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
