import { useCallback, useState } from 'react';

export function useClipboard(onMessage?: (message: string) => void) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyText = useCallback(
    async (text: string, label = 'Copied') => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedLabel(label);
        onMessage?.(label);
      } catch {
        const fallback = 'Copy blocked by browser permissions';
        setCopiedLabel(fallback);
        onMessage?.(fallback);
      }
      window.setTimeout(() => setCopiedLabel(null), 1800);
    },
    [onMessage],
  );

  return { copyText, copiedLabel };
}
