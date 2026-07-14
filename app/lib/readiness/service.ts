// @ts-expect-error -- Node's direct TypeScript runner requires an explicit extension.
import { evaluateReadiness } from "./evaluate.ts";
import type {
  DemoScenarioId,
  EvaluationOptions,
  ReadinessViewModel,
  Site,
  WorkOrderSummary,
} from "./types.ts";
import type {
  ProviderQuery,
  ScenarioDataProvider,
  WorkOrderDataProvider,
} from "../providers/contracts.ts";
// @ts-expect-error -- Node's direct TypeScript runner requires an explicit extension.
import { createMockWorkOrderReadinessProvider, type MockWorkOrderReadinessProvider } from "../providers/mock.ts";

type ReadinessServiceProvider = ScenarioDataProvider & WorkOrderDataProvider;

/**
 * Application-facing service. UI code receives one normalized/evaluated view
 * model and does not need to know which source adapter supplied each record.
 */
export class ReadinessService {
  constructor(private readonly provider: ReadinessServiceProvider) {}

  async load(
    query: ProviderQuery,
    evaluationOptions: EvaluationOptions = {},
  ): Promise<ReadinessViewModel | null> {
    const normalizedQuery: ProviderQuery = {
      ...query,
      workOrderNumber: query.workOrderNumber?.trim().toUpperCase(),
    };
    if (!normalizedQuery.workOrderNumber && !normalizedQuery.scenarioId) {
      return null;
    }

    const scenario = await this.provider.getScenario(normalizedQuery);
    if (!scenario) return null;
    const evaluation = evaluateReadiness(scenario.items, evaluationOptions);
    return {
      scenario: { ...scenario, items: evaluation.normalizedItems },
      workOrder: scenario.workOrder,
      evaluation,
    };
  }

  async loadScenario(
    scenarioId: DemoScenarioId,
    site?: Site,
    evaluationOptions: EvaluationOptions = {},
  ): Promise<ReadinessViewModel | null> {
    return this.load({ scenarioId, site }, evaluationOptions);
  }

  async refresh(
    query: ProviderQuery,
    refreshedAt = new Date(),
  ): Promise<ReadinessViewModel | null> {
    const scenario = await this.provider.refreshScenario(query, refreshedAt);
    if (!scenario) return null;
    const evaluation = evaluateReadiness(scenario.items, { now: refreshedAt });
    return {
      scenario: { ...scenario, items: evaluation.normalizedItems },
      workOrder: scenario.workOrder,
      evaluation,
    };
  }

  async listRecentWorkOrders(site?: Site): Promise<WorkOrderSummary[]> {
    return this.provider.listRecentWorkOrders(site);
  }
}

export function createMockReadinessService(): ReadinessService {
  return new ReadinessService(createMockWorkOrderReadinessProvider());
}

export type { MockWorkOrderReadinessProvider };
