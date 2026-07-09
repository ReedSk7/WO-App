import { Icon } from '../ui/Icons';
import { Toolbar } from '../ui/Toolbar';

type DraftToolbarProps = {
  onSave: () => void;
  onCopy: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onPrint: () => void;
};

export function DraftToolbar({ onSave, onCopy, onExportMarkdown, onExportJson, onPrint }: DraftToolbarProps) {
  return (
    <Toolbar label="Draft review actions">
      <button className="btn" onClick={onSave} type="button">
        <Icon className="h-4 w-4" name="save" />
        Save Draft
      </button>
      <button className="btn-secondary" onClick={onCopy} type="button">
        <Icon className="h-4 w-4" name="copy" />
        Copy Full Draft
      </button>
      <button className="btn-secondary" onClick={onExportMarkdown} type="button">
        <Icon className="h-4 w-4" name="download" />
        Export Markdown
      </button>
      <button className="btn-secondary" onClick={onExportJson} type="button">
        <Icon className="h-4 w-4" name="download" />
        Export JSON
      </button>
      <button className="btn-tertiary" onClick={onPrint} type="button">
        <Icon className="h-4 w-4" name="print" />
        Print Review Package
      </button>
    </Toolbar>
  );
}
