import { useMemo, useState } from 'react';
import type { DraftSection, MissingInfoItem } from '../../types';
import { DraftSectionEditor } from './DraftSectionEditor';

type DraftAccordionProps = {
  sections: DraftSection[];
  flags: MissingInfoItem[];
  onSectionChange: (sectionId: string, content: string) => void;
  onCopySection: (section: DraftSection) => void;
};

export function DraftAccordion({ sections, flags, onSectionChange, onCopySection }: DraftAccordionProps) {
  const defaultOpen = useMemo(() => {
    const flagged = new Set(flags.map((flag) => flag.section).filter(Boolean));
    return new Set(sections.filter((section) => section.id === 'summary' || flagged.has(section.title)).map((section) => section.id));
  }, [flags, sections]);
  const [openSections, setOpenSections] = useState(defaultOpen);

  const toggle = (sectionId: string) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const sectionFlags = flags.filter((flag) => flag.section === section.title);
        return (
          <DraftSectionEditor
            flags={sectionFlags}
            key={section.id}
            onChange={(content) => onSectionChange(section.id, content)}
            onCopy={() => onCopySection(section)}
            onToggle={() => toggle(section.id)}
            open={openSections.has(section.id)}
            section={section}
          />
        );
      })}
    </div>
  );
}
