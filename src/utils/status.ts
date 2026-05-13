import type { DraftStatus, MissingInfoItem } from '../types';

export const REVIEW_READY_THRESHOLD = 80;

export function hasBlockingMissingInfo(missingInfo: MissingInfoItem[]) {
  return missingInfo.some((item) => item.severity === 'blocking');
}

export function deriveDraftStatus(
  missingInfo: MissingInfoItem[],
  checklistPercent: number,
  threshold = REVIEW_READY_THRESHOLD,
): DraftStatus {
  if (hasBlockingMissingInfo(missingInfo)) return 'Needs Info';
  if (checklistPercent >= threshold) return 'Review Ready';
  return 'Draft';
}
