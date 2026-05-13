import { useId } from 'react';
import type { DraftSection, MissingInfoItem } from '../../types';
import { InlineFlagChip } from '../ui/InlineFlagChip';
import { Icon } from '../ui/Icons';

type DraftSectionEditorProps = {
  section: DraftSection;
  flags: MissingInfoItem[];
  open: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onChange: (content: string) => void;
};

export function DraftSectionEditor({ section, flags, open, onToggle, onCopy, onChange }: DraftSectionEditorProps) {
  const panelId = useId();
  return (
    <section className="rounded-panel border border-border-subtle bg-surface-light shadow-sm dark:bg-surface-dark" id={section.id}>
      <div className="flex flex-col gap-3 border-b border-border-subtle p-4 md:flex-row md:items-start md:justify-between">
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className="group flex min-w-0 flex-1 items-start gap-3 text-left"
          onClick={onToggle}
          type="button"
        >
          <span className="mt-1 text-brand-700 transition group-aria-expanded:rotate-90 dark:text-brand-400">
            <Icon className="h-4 w-4" name="arrow" />
          </span>
          <span>
            <span className="block text-base font-semibold">{section.title}</span>
            <span className="mt-1 block text-xs text-texttone-secondaryLight dark:text-texttone-secondaryDark">
              {flags.length} flag{flags.length === 1 ? '' : 's'} linked to this section
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button className="btn-secondary min-h-9 px-3 py-1.5 text-xs" onClick={onCopy} type="button">
            <Icon className="h-4 w-4" name="copy" />
            Copy
          </button>
          <button className="btn-tertiary min-h-9 px-3 py-1.5 text-xs" onClick={onToggle} type="button">
            {open ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      {flags.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-b border-border-subtle px-4 py-3">
          {flags.map((flag) => (
            <InlineFlagChip item={flag} key={flag.id} />
          ))}
        </div>
      ) : null}
      <div className={open ? 'block p-4' : 'hidden'} id={panelId}>
        <textarea
          aria-label={`${section.title} content`}
          className="input min-h-52 resize-y whitespace-pre-wrap font-sans leading-6"
          onChange={(event) => onChange(event.target.value)}
          value={section.content}
        />
      </div>
    </section>
  );
}
