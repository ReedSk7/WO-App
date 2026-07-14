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

export interface ProviderQuery {
  workOrderNumber?: string;
  scenarioId?: DemoScenarioId;
  site?: Site;
}

export interface WorkOrderDataProvider {
  getWorkOrder(query: ProviderQuery): Promise<WorkOrderSummary | null>;
  listRecentWorkOrders(site?: Site): Promise<WorkOrderSummary[]>;
  refreshWorkOrder(
    query: ProviderQuery,
    refreshedAt?: Date,
  ): Promise<WorkOrderSummary | null>;
}

export interface ReadinessDataProvider {
  getReadinessItems(query: ProviderQuery): Promise<ReadinessItem[]>;
}

export interface PermitDataProvider {
  getPermitControls(query: ProviderQuery): Promise<PermitControlRecord[]>;
}

export interface EquipmentHistoryProvider {
  getEquipmentHistory(
    query: ProviderQuery,
  ): Promise<EquipmentHistoryDetail | null>;
}

export interface ClearanceDataProvider {
  getClearance(
    query: ProviderQuery,
  ): Promise<ClearanceEnergyControlDetail | null>;
}

export interface OperationalConditionProvider {
  getOperationalConditions(
    query: ProviderQuery,
  ): Promise<OperationalConditionsDetail | null>;
}

export interface PartsDataProvider {
  getPartsAndMaterials(
    query: ProviderQuery,
  ): Promise<PartsMaterialsDetail | null>;
}

export interface SupportCoordinationProvider {
  getSupportCoordination(
    query: ProviderQuery,
  ): Promise<SupportCoordinationDetail | null>;
}

/**
 * Aggregate snapshot support keeps the UI from stitching source-specific
 * payloads together. A future integration can compose the specialized provider
 * interfaces above and return the same normalized scenario model.
 */
export interface ScenarioDataProvider {
  getScenario(query: ProviderQuery): Promise<ReadinessScenario | null>;
  refreshScenario(
    query: ProviderQuery,
    refreshedAt?: Date,
  ): Promise<ReadinessScenario | null>;
}

export type WorkOrderReadinessProvider = WorkOrderDataProvider &
  ReadinessDataProvider &
  PermitDataProvider &
  EquipmentHistoryProvider &
  ClearanceDataProvider &
  OperationalConditionProvider &
  PartsDataProvider &
  SupportCoordinationProvider &
  ScenarioDataProvider;
