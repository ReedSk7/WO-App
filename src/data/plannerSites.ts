import type { PlannerSiteDefinition } from '../types';

export const UNKNOWN_PLANNER_SITE: PlannerSiteDefinition = {
  id: 'site-not-captured',
  label: 'Site not captured',
};

export const PLANNER_SITES: PlannerSiteDefinition[] = [
  { id: 'plant-farley', label: 'Plant Farley' },
  { id: 'vogtle-1-2', label: 'Vogtle 1 and 2' },
  { id: 'vogtle-3-4', label: 'Vogtle 3 and 4' },
  { id: 'hatch', label: 'Hatch' },
];

export function findPlannerSite(siteId: string | null | undefined) {
  return PLANNER_SITES.find((site) => site.id === siteId) ?? UNKNOWN_PLANNER_SITE;
}
