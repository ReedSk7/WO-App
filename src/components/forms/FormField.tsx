import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type BaseProps = {
  label: string;
  id: string;
  helper?: string;
  error?: string;
  children: ReactNode;
  full?: boolean;
};

export function FieldShell({ label, id, helper, error, children, full }: BaseProps) {
  return (
    <div className={cn('space-y-1.5', full && 'md:col-span-2')}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
      {helper ? <p className="helper">{helper}</p> : null}
      {error ? (
        <p className="text-xs font-semibold leading-5 text-status-danger dark:text-status-dangerDark" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  helper?: string;
  error?: string;
  onChange: (value: string) => void;
  full?: boolean;
};

export function TextField({ label, helper, error, onChange, full, id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell error={error} full={full} helper={helper} id={fieldId} label={label}>
      <input
        aria-describedby={error ? `${fieldId}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={cn('input', error && 'border-status-danger')}
        id={fieldId}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  label: string;
  helper?: string;
  error?: string;
  onChange: (value: string) => void;
  full?: boolean;
};

export function TextAreaField({ label, helper, error, onChange, full, id, ...props }: TextAreaFieldProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell error={error} full={full} helper={helper} id={fieldId} label={label}>
      <textarea
        aria-describedby={error ? `${fieldId}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={cn('input min-h-28 resize-y leading-6', error && 'border-status-danger')}
        id={fieldId}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label: string;
  helper?: string;
  options: string[];
  onChange: (value: string) => void;
  full?: boolean;
};

export function SelectField({ label, helper, options, onChange, full, id, ...props }: SelectFieldProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell full={full} helper={helper} id={fieldId} label={label}>
      <select className="input" id={fieldId} onChange={(event) => onChange(event.target.value)} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

type ToggleFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helper?: string;
};

export function ToggleField({ id, label, checked, onChange, helper }: ToggleFieldProps) {
  return (
    <label className="flex min-h-12 items-start gap-3 rounded-md border border-border-subtle bg-surface-light p-3 hover:border-border-strong dark:bg-surface-dark" htmlFor={id}>
      <input
        checked={checked}
        className="mt-1 h-4 w-4 accent-brand-500"
        id={id}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {helper ? <span className="block text-xs leading-5 text-texttone-secondaryLight dark:text-texttone-secondaryDark">{helper}</span> : null}
      </span>
    </label>
  );
}
