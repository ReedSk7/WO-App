// @ts-expect-error -- Node's direct TypeScript runner requires an explicit extension.
import { cloneScenario, MOCK_SCENARIOS } from "../readiness/mock-scenarios.ts";
import type {
  ClearanceEnergyControlDetail,
  DemoScenarioId,
  EquipmentHistoryDetail,
  OperationalConditionsDetail,
  PartsMaterialsDetail,
  PermitControlRecord,
  ReadinessItem,
  ReadinessScenario,
  Site,
  SupportCoordinationDetail,
  WorkOrderSummary,
} from "../readiness/types.ts";
import type {
  ProviderQuery,
  WorkOrderReadinessProvider,
} from "./contracts.ts";

function copy<T>(value: T): T {
  return structuredClone(value);
}

/**
 * In-memory demonstration adapter. It deliberately retains unavailable states
 * during refresh; a new timestamp must never manufacture successful source data.
 */
export class MockWorkOrderReadinessProvider
  implements WorkOrderReadinessProvider
{
  private readonly scenarios = new Map<DemoScenarioId, ReadinessScenario>(
    MOCK_SCENARIOS.map((scenario) => [scenario.id, cloneScenario(scenario)]),
  );

  private findScenarioId(query: ProviderQuery): DemoScenarioId | undefined {
    if (query.scenarioId && this.scenarios.has(query.scenarioId)) {
      return query.scenarioId;
    }

    const workOrderNumber = query.workOrderNumber?.trim().toUpperCase();
    if (!workOrderNumber) return undefined;
    for (const [id, scenario] of this.scenarios) {
      if (scenario.workOrder.workOrderNumber === workOrderNumber) return id;
    }
    return undefined;
  }

  private withRequestedSite(
    scenario: ReadinessScenario,
    site?: Site,
  ): ReadinessScenario {
    const result = cloneScenario(scenario);
    if (site) result.workOrder.site = site;
    return result;
  }

  async getScenario(query: ProviderQuery): Promise<ReadinessScenario | null> {
    const id = this.findScenarioId(query);
    if (!id) return null;
    const scenario = this.scenarios.get(id);
    return scenario ? this.withRequestedSite(scenario, query.site) : null;
  }

  async getWorkOrder(query: ProviderQuery): Promise<WorkOrderSummary | null> {
    const scenario = await this.getScenario(query);
    return scenario ? copy(scenario.workOrder) : null;
  }

  async listRecentWorkOrders(site?: Site): Promise<WorkOrderSummary[]> {
    return [...this.scenarios.values()]
      .filter((scenario) => !site || scenario.workOrder.site === site)
      .map((scenario) => copy(scenario.workOrder));
  }

  async getReadinessItems(query: ProviderQuery): Promise<ReadinessItem[]> {
    const scenario = await this.getScenario(query);
    return scenario ? copy(scenario.items) : [];
  }

  async getPermitControls(query: ProviderQuery): Promise<PermitControlRecord[]> {
    const items = await this.getReadinessItems(query);
    return copy(
      items.find((item) => item.category === "permits-and-special-controls")
        ?.details?.permits ?? [],
    );
  }

  async getEquipmentHistory(
    query: ProviderQuery,
  ): Promise<EquipmentHistoryDetail | null> {
    const items = await this.getReadinessItems(query);
    const detail = items.find(
      (item) => item.category === "equipment-history-and-impact",
    )?.details?.equipmentHistory;
    return detail ? copy(detail) : null;
  }

  async getClearance(
    query: ProviderQuery,
  ): Promise<ClearanceEnergyControlDetail | null> {
    const items = await this.getReadinessItems(query);
    const detail = items.find(
      (item) => item.category === "clearance-and-energy-control",
    )?.details?.clearance;
    return detail ? copy(detail) : null;
  }

  async getOperationalConditions(
    query: ProviderQuery,
  ): Promise<OperationalConditionsDetail | null> {
    const items = await this.getReadinessItems(query);
    const detail = items.find(
      (item) => item.category === "operational-risk-and-plant-conditions",
    )?.details?.operationalConditions;
    return detail ? copy(detail) : null;
  }

  async getPartsAndMaterials(
    query: ProviderQuery,
  ): Promise<PartsMaterialsDetail | null> {
    const items = await this.getReadinessItems(query);
    const detail = items.find(
      (item) => item.category === "parts-and-materials",
    )?.details?.parts;
    return detail ? copy(detail) : null;
  }

  async getSupportCoordination(
    query: ProviderQuery,
  ): Promise<SupportCoordinationDetail | null> {
    const items = await this.getReadinessItems(query);
    const detail = items.find(
      (item) => item.category === "support-group-coordination",
    )?.details?.supportCoordination;
    return detail ? copy(detail) : null;
  }

  async refreshScenario(
    query: ProviderQuery,
    refreshedAt = new Date(),
  ): Promise<ReadinessScenario | null> {
    const id = this.findScenarioId(query);
    if (!id) return null;
    const existing = this.scenarios.get(id);
    if (!existing) return null;

    const timestamp = refreshedAt.toISOString();
    const refreshed = cloneScenario(existing);
    refreshed.workOrder.lastDataRefreshAt = timestamp;
    refreshed.items = refreshed.items.map((item) => {
      const itemUnavailable =
        item.status === "unableToVerify" ||
        item.verificationMethod === "unableToVerify" ||
        item.sourceAvailability === "unavailable";
      if (itemUnavailable) return item;

      const permits = item.details?.permits?.map((record) => {
        const recordUnavailable =
          record.readinessClassification === "unableToVerify" ||
          record.verificationMethod === "unableToVerify" ||
          record.sourceAvailability === "unavailable";
        return recordUnavailable
          ? record
          : { ...record, lastVerifiedAt: timestamp };
      });
      const operationalConditions = item.details?.operationalConditions
        ? {
            ...item.details.operationalConditions,
            conditions: item.details.operationalConditions.conditions.map(
              (condition) =>
                condition.verificationMethod === "unableToVerify"
                  ? condition
                  : { ...condition, lastCheckedAt: timestamp },
            ),
          }
        : undefined;
      const clearance = item.details?.clearance
        ? { ...item.details.clearance, lastSourceSystemCheck: timestamp }
        : undefined;

      return {
        ...item,
        lastCheckedAt: timestamp,
        details: item.details
          ? {
              ...item.details,
              permits,
              operationalConditions,
              clearance,
            }
          : undefined,
      };
    });

    this.scenarios.set(id, refreshed);
    return this.withRequestedSite(refreshed, query.site);
  }

  async refreshWorkOrder(
    query: ProviderQuery,
    refreshedAt?: Date,
  ): Promise<WorkOrderSummary | null> {
    const scenario = await this.refreshScenario(query, refreshedAt);
    return scenario ? copy(scenario.workOrder) : null;
  }
}

export function createMockWorkOrderReadinessProvider(): MockWorkOrderReadinessProvider {
  return new MockWorkOrderReadinessProvider();
}

export const mockWorkOrderReadinessProvider =
  createMockWorkOrderReadinessProvider();
