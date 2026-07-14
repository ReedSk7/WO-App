import type { ReadinessItem } from "@/app/lib/readiness/types";

export type StatusValue = ReadinessItem["status"] | string;

export type StatusBadgeProps = {
  status: StatusValue;
  label?: string;
  compact?: boolean;
  className?: string;
};

type StatusPresentation = {
  glyph: string;
  label: string;
  tone: "positive" | "negative" | "warning" | "info" | "muted";
};

const STATUS_PRESENTATIONS: Record<string, StatusPresentation> = {
  complete: { glyph: "✓", label: "Complete", tone: "positive" },
  ready: { glyph: "✓", label: "Ready", tone: "positive" },
  blocker: { glyph: "!", label: "Blocker", tone: "negative" },
  blocked: { glyph: "!", label: "Blocked", tone: "negative" },
  review: { glyph: "!", label: "Review Required", tone: "warning" },
  reviewrequired: {
    glyph: "!",
    label: "Review Required",
    tone: "warning",
  },
  pending: { glyph: "◷", label: "Pending", tone: "info" },
  notready: { glyph: "◷", label: "Not Ready", tone: "warning" },
  dayofaction: {
    glyph: "◷",
    label: "Day-of Action",
    tone: "info",
  },
  readywithdayofactions: {
    glyph: "◷",
    label: "Ready with Day-of Actions",
    tone: "info",
  },
  notapplicable: {
    glyph: "—",
    label: "Not Applicable",
    tone: "muted",
  },
  unabletoverify: {
    glyph: "?",
    label: "Unable to Verify",
    tone: "muted",
  },
};

function normalizeStatus(status: StatusValue): string {
  return String(status).replace(/[\s_-]/g, "").toLowerCase();
}

export function getStatusPresentation(status: StatusValue): StatusPresentation {
  return (
    STATUS_PRESENTATIONS[normalizeStatus(status)] ?? {
      glyph: "?",
      label: "Status unavailable",
      tone: "muted",
    }
  );
}

export function StatusBadge({
  status,
  label,
  compact = false,
  className = "",
}: StatusBadgeProps) {
  const presentation = getStatusPresentation(status);
  const visibleLabel = label ?? presentation.label;

  return (
    <span
      className={`status-badge status-badge--${presentation.tone}${
        compact ? " status-badge--compact" : ""
      } ${className}`.trim()}
      data-status={normalizeStatus(status)}
      aria-label={`Status: ${visibleLabel}`}
    >
      <span className="status-badge__glyph" aria-hidden="true">
        {presentation.glyph}
      </span>
      <span className="status-badge__label">{visibleLabel}</span>
    </span>
  );
}
