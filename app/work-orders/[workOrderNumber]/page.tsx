import type { Metadata } from "next";
import { WorkOrderReadiness } from "../../components/WorkOrderReadiness";

export const metadata: Metadata = {
  title: "Readiness Summary",
  description:
    "Synthetic work-order readiness summary with source transparency and next actions.",
};

type WorkOrderPageProps = {
  params: Promise<{ workOrderNumber: string }>;
  searchParams: Promise<{ site?: string; scenario?: string }>;
};

export default async function WorkOrderPage({
  params,
  searchParams,
}: WorkOrderPageProps) {
  const [{ workOrderNumber }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  return (
    <WorkOrderReadiness
      key={`${workOrderNumber}-${query.site ?? "default"}`}
      requestedWorkOrderNumber={decodeURIComponent(workOrderNumber)}
      requestedSite={query.site}
      requestedScenario={query.scenario}
    />
  );
}
