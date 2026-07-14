import type {
  DemoScenarioId,
  EquipmentHistoryDetail,
  OperationalConditionRecord,
  PermitControlRecord,
  PermitControlType,
  ReadinessCategory,
  ReadinessChange,
  ReadinessItem,
  ReadinessScenario,
  Site,
  SupportCoordinationRecord,
} from "./types.ts";

const DEMO_NOTICE =
  "Prototype using demonstration data. Verify all information in the approved source system before work.";

const SOURCE_SYSTEM = "Demonstration Readiness Dataset";
const PACKAGE_SYSTEM = "Demonstration Document Index";
const PERMIT_SYSTEM = "Demonstration Permit Register";
const CONDITION_SYSTEM = "Demonstration Condition Feed";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysFromNow(days: number, hour = 13): string {
  const value = new Date();
  value.setDate(value.getDate() + days);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
}

function sourceUrl(record: string, system: string): string {
  return `/source-placeholder?record=${encodeURIComponent(record)}&system=${encodeURIComponent(system)}`;
}

function recordId(workOrderNumber: string, suffix: string): string {
  return `DEMO-${workOrderNumber.slice(-3)}-${suffix}`;
}

function baseItem(
  workOrderNumber: string,
  category: ReadinessCategory,
  title: string,
  shortResult: string,
  scheduledExecutionDate: string,
): ReadinessItem {
  const sourceRecordLabel = recordId(
    workOrderNumber,
    category.slice(0, 3).toUpperCase(),
  );
  return {
    id: `${workOrderNumber}-${category}`,
    category,
    title,
    shortResult,
    detailedBasis:
      "Synthetic result created only to demonstrate the readiness workflow.",
    status: "complete",
    isExecutionBlocker: false,
    applicability: "required",
    sourceSystem: SOURCE_SYSTEM,
    sourceRecordLabel,
    sourceRecordUrl: sourceUrl(sourceRecordLabel, SOURCE_SYSTEM),
    lastCheckedAt: minutesAgo(18),
    scheduledExecutionDate,
    confidence: "Demonstration scenario",
    verificationMethod: "inferredDemo",
    sourceAvailability: "available",
    requiresSourceVerification: true,
    staleAfterMinutes: 360,
    notes: ["Synthetic demonstration data; not a work authorization."],
  };
}

function makePermit(
  workOrderNumber: string,
  type: PermitControlType,
  applicability: PermitControlRecord["applicability"],
  lifecycleStatus: PermitControlRecord["lifecycleStatus"],
  scheduledExecutionDate: string,
  index: number,
): PermitControlRecord {
  const requestRecordNumber = recordId(
    workOrderNumber,
    `CONTROL-${String(index + 1).padStart(2, "0")}`,
  );
  return {
    id: `${workOrderNumber}-control-${index + 1}`,
    type,
    applicability,
    lifecycleStatus,
    readinessClassification:
      applicability === "Not Required" ? "notApplicable" : "complete",
    responsibleGroup:
      type === "Radiation Work Permit"
        ? "Radiation Protection / Health Physics"
        : type === "Scaffold Request"
          ? "Access Support"
          : "Coordinating Group",
    requestRecordNumber,
    targetReadyDate: daysFromNow(1),
    scheduledExecutionDate,
    prerequisites:
      applicability === "Required"
        ? ["Synthetic advance prerequisite check complete"]
        : [],
    outstandingPrerequisites: [],
    lastVerifiedAt: minutesAgo(16),
    sourceSystem: PERMIT_SYSTEM,
    sourceRecordUrl: sourceUrl(requestRecordNumber, PERMIT_SYSTEM),
    verificationMethod: "inferredDemo",
    sourceAvailability: "available",
    advancePrerequisitesComplete: applicability === "Required",
    requiresDayOfIssuance: false,
    notes: "Capability demonstration; applicability is synthetic.",
  };
}

function makePermitRecords(
  workOrderNumber: string,
  scheduledExecutionDate: string,
): PermitControlRecord[] {
  const rows: Array<
    [
      PermitControlType,
      PermitControlRecord["applicability"],
      PermitControlRecord["lifecycleStatus"],
    ]
  > = [
    ["Hot Work Permit", "Not Required", "Not Started"],
    ["Transient Combustible Permit", "Required", "Issued / Active"],
    ["Confined Space", "Not Required", "Not Started"],
    ["Radiation Work Permit", "Required", "Issued / Active"],
    ["Scaffold Request", "Not Required", "Not Started"],
    ["Temporary Power", "Not Required", "Not Started"],
    ["Rigging Evaluation", "Not Required", "Not Started"],
    ["FME Controls", "Required", "Issued / Active"],
    ["Fire Watch", "Not Required", "Not Started"],
    [
      "Insulation Removal or Environmental Review",
      "Not Required",
      "Not Started",
    ],
  ];

  return rows.map(([type, applicability, lifecycleStatus], index) =>
    makePermit(
      workOrderNumber,
      type,
      applicability,
      lifecycleStatus,
      scheduledExecutionDate,
      index,
    ),
  );
}

function makeEquipmentHistory(
  workOrderNumber: string,
): EquipmentHistoryDetail {
  const recentLabel = recordId(workOrderNumber, "HIST-01");
  const relatedLabel = recordId(workOrderNumber, "RELATED-WO");
  const recent = {
    id: `${workOrderNumber}-history-recent`,
    section: "Recent Work" as const,
    recordType: "Work Order" as const,
    recordLabel: recentLabel,
    title: "Synthetic prior inspection record",
    summary: "Demonstration history item with no identified readiness impact.",
    classification: "Informational" as const,
    date: daysFromNow(-14),
    relationship: "Similar task type in demonstration history",
    sourceRecordUrl: sourceUrl(recentLabel, SOURCE_SYSTEM),
  };
  const related = {
    id: `${workOrderNumber}-history-related`,
    section: "Related Work Orders" as const,
    recordType: "Work Order" as const,
    recordLabel: relatedLabel,
    title: "Synthetic related work record",
    summary: "Related demonstration record is closed with no open dependency.",
    classification: "Informational" as const,
    date: daysFromNow(-30),
    relationship: "Shared synthetic task grouping",
    sourceRecordUrl: sourceUrl(relatedLabel, SOURCE_SYSTEM),
  };

  return {
    changesSincePlanning: [],
    openOrUnresolvedRecords: [],
    recentWork: [recent],
    recurringIssues: [],
    relatedWorkOrders: [related],
    priorSupportNeeds: [],
    fullHistory: [recent, related],
  };
}

function makeOperationalConditions(
  workOrderNumber: string,
): OperationalConditionRecord[] {
  const types: OperationalConditionRecord["type"][] = [
    "RAS",
    "FAS",
    "LCO",
    "Protected Train Swap",
    "Other",
  ];
  return types.map((type, index) => ({
    id: `${workOrderNumber}-condition-${index + 1}`,
    type,
    conditionFound: false,
    relationshipToWorkOrder:
      "No relationship found in the synthetic demonstration dataset.",
    humanReviewRequired: false,
    source: CONDITION_SYSTEM,
    lastCheckedAt: minutesAgo(12),
    verificationMethod: "inferredDemo",
    notes: "The prototype does not make an operational decision.",
  }));
}

function makeSupportItems(workOrderNumber: string): SupportCoordinationRecord[] {
  const groups: SupportCoordinationRecord["group"][] = [
    "Operations",
    "Radiation Protection / Health Physics",
    "Quality Control",
    "Engineering",
    "Chemistry",
    "Security",
    "Fire Protection",
    "Other maintenance groups",
    "Crane or rigging",
    "Vendor support",
    "FME monitor",
    "Fire watch",
    "Decontamination",
    "Insulation support",
  ];
  const required = new Set<SupportCoordinationRecord["group"]>([
    "Operations",
    "Quality Control",
  ]);

  return groups.map((group, index) => ({
    id: `${workOrderNumber}-support-${index + 1}`,
    group,
    requirement: required.has(group) ? "Required" : "Not Required",
    requested: required.has(group),
    acceptedOrAcknowledged: required.has(group),
    scheduled: required.has(group),
    ready: required.has(group) ? true : undefined,
    ownerGroup: required.has(group) ? group : undefined,
    timing: required.has(group) ? "Synthetic execution window" : undefined,
  }));
}

function createReadyItems(
  workOrderNumber: string,
  scheduledExecutionDate: string,
): ReadinessItem[] {
  const safety = {
    ...baseItem(
      workOrderNumber,
      "safety-and-job-hazards",
      "Safety and Job Hazards",
      "Synthetic hazard review is recorded as complete.",
      scheduledExecutionDate,
    ),
    owner: "Maintenance Supervisor",
    details: {
      genericSections: [
        {
          title: "Demonstration hazard review",
          fields: [
            {
              label: "Review state",
              value: "Recorded complete in demonstration data",
              status: "complete" as const,
            },
            {
              label: "Field verification",
              value: "Required before work under approved processes",
            },
          ],
        },
      ],
    },
  } satisfies ReadinessItem;

  const clearance = {
    ...baseItem(
      workOrderNumber,
      "clearance-and-energy-control",
      "Clearance and Energy Control",
      "Synthetic isolation determination and coordination are complete.",
      scheduledExecutionDate,
    ),
    owner: "Operations",
    isCriticalData: true,
    details: {
      clearance: {
        isolationRequired: "Required" as const,
        clearanceRequestStatus: "Synthetic request coordinated",
        energySources: [
          { type: "Electrical" as const, identified: true },
          { type: "Hydraulic" as const, identified: false },
          { type: "Pneumatic" as const, identified: false },
          { type: "Mechanical" as const, identified: true },
          { type: "Other" as const, identified: false },
        ],
        localIsolationAvailability: "Available" as const,
        personalDangerTagApplicability: "Not Required" as const,
        drainingOrVentingRequirement: "Not Required" as const,
        conflicts: [],
        lastSourceSystemCheck: minutesAgo(15),
        unableToVerify: false,
        basis:
          "Synthetic demonstration determinations are recorded as not required; no isolation boundary is calculated or suggested.",
      },
    },
  } satisfies ReadinessItem;

  const equipmentHistory = {
    ...baseItem(
      workOrderNumber,
      "equipment-history-and-impact",
      "Equipment History and Impact",
      "Synthetic history was reviewed; no readiness impact is identified.",
      scheduledExecutionDate,
    ),
    owner: "Work Readiness",
    details: { equipmentHistory: makeEquipmentHistory(workOrderNumber) },
  } satisfies ReadinessItem;

  const operationalRisk = {
    ...baseItem(
      workOrderNumber,
      "operational-risk-and-plant-conditions",
      "Operational Risk and Plant Conditions",
      "No related condition is found in the demonstration dataset.",
      scheduledExecutionDate,
    ),
    owner: "Operations",
    isCriticalData: true,
    sourceSystem: CONDITION_SYSTEM,
    details: {
      operationalConditions: {
        conditions: makeOperationalConditions(workOrderNumber),
        decisionSupportOnly: true as const,
      },
    },
  } satisfies ReadinessItem;

  const permits = {
    ...baseItem(
      workOrderNumber,
      "permits-and-special-controls",
      "Permits & Special Controls",
      "Applicable synthetic controls have completed advance readiness checks.",
      scheduledExecutionDate,
    ),
    owner: "Work Readiness Coordinator",
    sourceSystem: PERMIT_SYSTEM,
    sourceRecordLabel: recordId(workOrderNumber, "CONTROL-SET"),
    sourceRecordUrl: sourceUrl(
      recordId(workOrderNumber, "CONTROL-SET"),
      PERMIT_SYSTEM,
    ),
    details: { permits: makePermitRecords(workOrderNumber, scheduledExecutionDate) },
  } satisfies ReadinessItem;

  const scaffolding = {
    ...baseItem(
      workOrderNumber,
      "scaffolding-and-access",
      "Scaffolding and Access",
      "Scaffolding was explicitly evaluated as not required.",
      scheduledExecutionDate,
    ),
    status: "notApplicable" as const,
    applicability: "notRequired" as const,
    owner: "Access Support",
    detailedBasis:
      "Explicitly evaluated as not required in synthetic demonstration data; absence of a scaffold record was not used as the basis.",
    details: {
      scaffolding: {
        scaffoldRequired: "Not Required" as const,
        determinationMethod: "Synthetic documented access review",
        readyForUse: true,
        accessConstraints: [],
        ladderOrAlternateAccess: "Existing synthetic access path",
        basis: "Explicitly evaluated as not required.",
      },
    },
  } satisfies ReadinessItem;

  const parts = {
    ...baseItem(
      workOrderNumber,
      "parts-and-materials",
      "Parts and Materials",
      "Synthetic required material is staged and separately verified.",
      scheduledExecutionDate,
    ),
    owner: "Materials",
    details: {
      parts: {
        requiredPartsIdentified: true,
        materials: [
          {
            id: `${workOrderNumber}-material-1`,
            syntheticPartLabel: "DEMO PART A",
            required: true,
            progress: "Verified" as const,
            reserved: true,
            onSite: true,
            picked: true,
            staged: true,
            verified: true,
            shelfLifeValidThroughExecution: true,
            equivalencyReviewStatus: "Not Required" as const,
            materialHold: false,
          },
        ],
      },
    },
  } satisfies ReadinessItem;

  const tools = {
    ...baseItem(
      workOrderNumber,
      "tools-and-test-equipment",
      "Tools and Test Equipment",
      "Synthetic special tools and test equipment checks are complete.",
      scheduledExecutionDate,
    ),
    owner: "Maintenance",
    details: {
      tools: {
        specialToolsRequired: "Required" as const,
        toolAvailability: "Available in demonstration inventory",
        reservationStatus: "Reserved",
        stagingStatus: "Staged",
        measuringAndTestEquipmentRequired: "Required" as const,
        calibrationValidThroughExecution: true,
      },
    },
  } satisfies ReadinessItem;

  const workPackage = {
    ...baseItem(
      workOrderNumber,
      "work-package-and-procedures",
      "Work Package and Procedures",
      "Synthetic package documents are present and revision checks are recorded.",
      scheduledExecutionDate,
    ),
    owner: "Work Management",
    isCriticalData: true,
    sourceSystem: PACKAGE_SYSTEM,
    sourceRecordLabel: recordId(workOrderNumber, "PACKAGE"),
    sourceRecordUrl: sourceUrl(
      recordId(workOrderNumber, "PACKAGE"),
      PACKAGE_SYSTEM,
    ),
    details: {
      workPackage: {
        workPackageAvailable: true,
        electronicPackageLink: sourceUrl(
          recordId(workOrderNumber, "PACKAGE"),
          PACKAGE_SYSTEM,
        ),
        referencedDocumentsPresent: true,
        currentRevisionVerified: true,
        drawingsAvailable: "Not Required" as const,
        engineeringDocumentsAvailable: "Not Required" as const,
        outstandingPackageFeedback: [],
        adequacyApprovedByPrototype: false as const,
      },
    },
  } satisfies ReadinessItem;

  const walkdown = {
    ...baseItem(
      workOrderNumber,
      "walkdown-and-task-preview",
      "Walkdown and Task Preview",
      "Synthetic walkdown and task preview are recorded complete.",
      scheduledExecutionDate,
    ),
    owner: "Maintenance Supervisor",
    details: {
      walkdown: {
        walkdownLevel: "Demonstration Level 1",
        walkdownRequired: "Required" as const,
        walkdownStatus: "Complete",
        completedDate: daysFromNow(-2),
        completedByRole: "Maintenance craft role",
        questionsRemaining: [],
        constraintsFound: [],
        plannerFeedbackSubmitted: true,
        taskPreviewCompleted: true,
        supervisorEngagementStatus: "Acknowledged",
      },
    },
  } satisfies ReadinessItem;

  const support = {
    ...baseItem(
      workOrderNumber,
      "support-group-coordination",
      "Support Group Coordination",
      "Required synthetic support groups are acknowledged and scheduled.",
      scheduledExecutionDate,
    ),
    owner: "Work Readiness Coordinator",
    details: {
      supportCoordination: { supportItems: makeSupportItems(workOrderNumber) },
    },
  } satisfies ReadinessItem;

  const operationalExperience = {
    ...baseItem(
      workOrderNumber,
      "operational-experience",
      "Operational Experience",
      "No relevant OE is found in the demonstration dataset.",
      scheduledExecutionDate,
    ),
    owner: "Maintenance Supervisor",
    details: {
      operationalExperience: {
        results: [],
        noResultsMessage: "No relevant history found in demonstration data.",
      },
    },
  } satisfies ReadinessItem;

  const workforce = {
    ...baseItem(
      workOrderNumber,
      "workforce-readiness",
      "Workforce Readiness",
      "Synthetic role-based crew readiness checks are complete.",
      scheduledExecutionDate,
    ),
    owner: "Maintenance Supervisor",
    details: {
      workforce: {
        requiredDiscipline: "Synthetic maintenance discipline",
        minimumCrewSizePlaceholder: "Demonstration staffing placeholder",
        specialQualificationRequired: "Not Required" as const,
        assignedCrewStatus: "Synthetic crew assigned",
        qualificationsVerified: true,
        proficiencyReviewRequired: false,
        justInTimeTrainingRequired: false,
        supervisorOversightRequirement: "Verify using approved processes",
      },
    },
  } satisfies ReadinessItem;

  const testing = {
    ...baseItem(
      workOrderNumber,
      "testing-and-restoration",
      "Testing and Restoration",
      "Synthetic test and restoration dependencies are identified.",
      scheduledExecutionDate,
    ),
    owner: "Work Management",
    details: {
      testingRestoration: {
        postMaintenanceTestIdentified: true,
        testPrerequisites: ["Synthetic prerequisite reference recorded"],
        requiredSupport: ["Synthetic support role recorded"],
        testEquipment: ["Synthetic test equipment reference recorded"],
        restorationStepsIdentified: true,
        testInstructionsGeneratedByPrototype: false as const,
      },
    },
  } satisfies ReadinessItem;

  return [
    safety,
    clearance,
    equipmentHistory,
    operationalRisk,
    permits,
    scaffolding,
    parts,
    tools,
    workPackage,
    walkdown,
    support,
    operationalExperience,
    workforce,
    testing,
  ];
}

function updateItem(
  items: ReadinessItem[],
  category: ReadinessCategory,
  update: (item: ReadinessItem) => ReadinessItem,
): ReadinessItem[] {
  return items.map((item) => (item.category === category ? update(item) : item));
}

function change(
  id: string,
  category: ReadinessCategory,
  previousState: string,
  newState: string,
  explanation: string,
  ageMinutes: number,
): ReadinessChange {
  return {
    id,
    timestamp: minutesAgo(ageMinutes),
    category,
    previousState,
    newState,
    explanation,
  };
}

const COMMON_CHANGES: ReadinessChange[] = [
  change(
    "change-permit",
    "permits-and-special-controls",
    "Requested",
    "Under Review",
    "A synthetic permit lifecycle status changed.",
    42,
  ),
  change(
    "change-condition",
    "operational-risk-and-plant-conditions",
    "No matching record",
    "New condition record found",
    "A demonstration condition record was added for human review.",
    55,
  ),
  change(
    "change-material",
    "parts-and-materials",
    "Picked",
    "Staged",
    "Synthetic material progress changed; staging remains distinct from verification.",
    70,
  ),
  change(
    "change-scaffold",
    "scaffolding-and-access",
    "Requested",
    "Build in progress",
    "The synthetic scaffold request was updated.",
    88,
  ),
  change(
    "change-package",
    "work-package-and-procedures",
    "Prior document index",
    "Document index updated",
    "A demonstration package document reference changed.",
    105,
  ),
  change(
    "change-ora",
    "operational-risk-and-plant-conditions",
    "Available",
    "Unable to Verify",
    "A synthetic operational-condition source check became unavailable.",
    125,
  ),
];

interface ScenarioDefinition {
  id: DemoScenarioId;
  label: string;
  description: string;
  workOrderNumber: string;
  site: Site;
  taskDescription: string;
  workMode: "Outage" | "Online";
  mutate?: (items: ReadinessItem[]) => ReadinessItem[];
  sourceAvailability?: ReadinessScenario["sourceAvailability"];
}

function buildScenario(definition: ScenarioDefinition): ReadinessScenario {
  const scheduledExecutionDate = daysFromNow(2);
  const readyItems = createReadyItems(
    definition.workOrderNumber,
    scheduledExecutionDate,
  );
  return {
    id: definition.id,
    label: definition.label,
    description: definition.description,
    workOrder: {
      workOrderNumber: definition.workOrderNumber,
      site: definition.site,
      taskDescription: definition.taskDescription,
      equipmentOrLocation: "DEMO LOCATION — no plant component identifier",
      scheduledExecutionDate,
      workMode: definition.workMode,
      lastDataRefreshAt: minutesAgo(8),
      crew: "Synthetic maintenance crew",
      department: "Maintenance",
      demoScenarioId: definition.id,
      isSynthetic: true,
    },
    items: definition.mutate ? definition.mutate(readyItems) : readyItems,
    changes: COMMON_CHANGES.map((entry) => ({
      ...entry,
      id: `${definition.id}-${entry.id}`,
    })),
    dataNotice: DEMO_NOTICE,
    sourceAvailability: definition.sourceAvailability ?? "available",
  };
}

function blockedItems(items: ReadinessItem[]): ReadinessItem[] {
  let result = updateItem(items, "permits-and-special-controls", (item) => {
    const permits = item.details?.permits?.map((record) =>
      record.type === "Radiation Work Permit"
        ? {
            ...record,
            lifecycleStatus: "Blocked" as const,
            readinessClassification: "blocker" as const,
            advancePrerequisitesComplete: false,
            outstandingPrerequisites: [
              "Synthetic prerequisite confirmation is incomplete",
            ],
            blockingIssue:
              "A required synthetic permit prerequisite is unresolved.",
          }
        : record,
    );
    return {
      ...item,
      status: "blocker",
      isExecutionBlocker: true,
      shortResult:
        "A required synthetic permit has an unresolved prerequisite.",
      nextAction:
        "Complete the permit prerequisite and verify the source record before work.",
      targetReadyDate: daysFromNow(1),
      details: { ...item.details, permits },
    };
  });

  result = updateItem(result, "scaffolding-and-access", (item) => ({
    ...item,
    status: "blocker",
    applicability: "required",
    isExecutionBlocker: true,
    shortResult: "Synthetic scaffold build is still in progress.",
    detailedBasis:
      "A scaffold was explicitly determined to be required in this demonstration scenario; the build is incomplete.",
    nextAction:
      "Complete the scaffold build and required inspection/acceptance before use.",
    targetReadyDate: daysFromNow(1),
    details: {
      ...item.details,
      scaffolding: {
        scaffoldRequired: "Required",
        determinationMethod: "Synthetic documented access review",
        requestSubmitted: true,
        designStatus: "Complete",
        buildStatus: "In Progress",
        inspectionAcceptanceStatus: "Not Started",
        readyForUse: false,
        accessConstraints: ["Synthetic elevated access constraint"],
        interferenceRemoval: "No synthetic interference recorded",
        ladderOrAlternateAccess: "Not suitable in demonstration scenario",
        targetReadyDate: daysFromNow(1),
        basis: "Explicitly evaluated as required.",
      },
    },
  }));

  return result;
}

function reviewItems(items: ReadinessItem[]): ReadinessItem[] {
  let result = updateItem(items, "equipment-history-and-impact", (item) => {
    const label = recordId("SNC255557", "CR-REVIEW");
    const finding = {
      id: "SNC255557-history-review",
      section: "Open or Unresolved Records" as const,
      recordType: "Condition Report" as const,
      recordLabel: label,
      title: "Synthetic equipment-history finding",
      summary:
        "A related demonstration record needs qualified review; no blocker is confirmed.",
      classification: "Review Required" as const,
      date: daysFromNow(-5),
      relationship: "Synthetic equipment/task keyword relationship",
      sourceRecordUrl: sourceUrl(label, SOURCE_SYSTEM),
    };
    const detail = item.details?.equipmentHistory;
    return {
      ...item,
      status: "review",
      shortResult:
        "Related equipment history was found and requires qualified review.",
      nextAction:
        "Review the related synthetic history and document whether it affects the work order.",
      owner: "Maintenance Supervisor",
      details: {
        ...item.details,
        equipmentHistory: detail
          ? {
              ...detail,
              openOrUnresolvedRecords: [finding],
              fullHistory: [...detail.fullHistory, finding],
            }
          : undefined,
      },
    };
  });

  result = updateItem(result, "operational-experience", (item) => {
    const label = recordId("SNC255557", "OE-01");
    return {
      ...item,
      status: "review",
      shortResult: "Relevant OE Found — Review Required",
      nextAction:
        "Have a qualified reviewer assess the matched OE and acknowledge the review.",
      details: {
        ...item.details,
        operationalExperience: {
          results: [
            {
              id: "SNC255557-oe-1",
              title: "Synthetic operating-experience example",
              shortSummary:
                "Demonstration content used to exercise a review workflow.",
              whyMatched: "Synthetic task keywords matched.",
              equipmentTaskRelationship:
                "Possible relationship requires human confirmation.",
              sourceType: "Demonstration OE index",
              date: daysFromNow(-90),
              reviewAcknowledged: false,
              potentialWorkOrderImpact:
                "Undetermined until a qualified reviewer evaluates it.",
              sourceRecordUrl: sourceUrl(label, "Demonstration OE Index"),
            },
          ],
        },
      },
    };
  });

  return result;
}

function readyDayOfItems(items: ReadinessItem[]): ReadinessItem[] {
  return updateItem(items, "permits-and-special-controls", (item) => {
    const permits = item.details?.permits?.map((record) =>
      record.type === "Radiation Work Permit"
        ? {
            ...record,
            lifecycleStatus: "Ready for Issuance" as const,
            readinessClassification: "dayOfAction" as const,
            advancePrerequisitesComplete: true,
            requiresDayOfIssuance: true,
            outstandingPrerequisites: [],
            blockingIssue: undefined,
          }
        : record,
    );
    return {
      ...item,
      status: "dayOfAction",
      isExecutionBlocker: false,
      shortResult:
        "Advance prerequisites are complete; final synthetic issuance remains a day-of action.",
      nextAction:
        "Verify final permit issuance using the approved process before beginning work.",
      targetReadyDate: item.scheduledExecutionDate,
      details: { ...item.details, permits },
    };
  });
}

function unableToVerifyItems(items: ReadinessItem[]): ReadinessItem[] {
  let result = updateItem(
    items,
    "operational-risk-and-plant-conditions",
    (item) => ({
      ...item,
      status: "unableToVerify",
      shortResult:
        "Operational condition information could not be verified in the demonstration scenario.",
      verificationMethod: "unableToVerify",
      sourceAvailability: "unavailable",
      sourceRecordUrl: undefined,
      lastCheckedAt: minutesAgo(780),
      isCriticalData: true,
      staleBehavior: "unableToVerify",
      nextAction:
        "Restore the operational-condition source check and obtain qualified review before work.",
      details: {
        ...item.details,
        operationalConditions: {
          conditions: [
            {
              id: "SNC255559-condition-unavailable",
              type: "Other",
              conditionFound: "Unable to Verify",
              relationshipToWorkOrder:
                "Relationship cannot be determined while the demonstration source is unavailable.",
              humanReviewRequired: true,
              source: CONDITION_SYSTEM,
              lastCheckedAt: minutesAgo(780),
              verificationMethod: "unableToVerify",
              notes: "No operational decision is made by the prototype.",
            },
          ],
          decisionSupportOnly: true,
        },
      },
    }),
  );

  result = updateItem(result, "work-package-and-procedures", (item) => ({
    ...item,
    status: "unableToVerify",
    shortResult: "Package revision information is unavailable.",
    verificationMethod: "unableToVerify",
    sourceAvailability: "partial",
    sourceRecordUrl: undefined,
    isCriticalData: true,
    nextAction:
      "Verify package availability and current revisions in the approved source system.",
    details: {
      ...item.details,
      workPackage: {
        workPackageAvailable: "Unable to Verify",
        referencedDocumentsPresent: "Unable to Verify",
        currentRevisionVerified: "Unable to Verify",
        drawingsAvailable: "Unable to Verify",
        engineeringDocumentsAvailable: "Unable to Verify",
        outstandingPackageFeedback: [
          "Demonstration source returned only partial data",
        ],
        adequacyApprovedByPrototype: false,
      },
    },
  }));

  return result;
}

const DEFINITIONS: ScenarioDefinition[] = [
  {
    id: "blocked",
    label: "Blocked",
    description:
      "Scaffold build incomplete and a required permit prerequisite unresolved.",
    workOrderNumber: "SNC255555",
    site: "Hatch",
    taskDescription: "Synthetic field inspection with access support",
    workMode: "Outage",
    mutate: blockedItems,
  },
  {
    id: "ready",
    label: "Ready",
    description: "All required synthetic readiness checks are complete.",
    workOrderNumber: "SNC255556",
    site: "Farley",
    taskDescription: "Synthetic component inspection demonstration",
    workMode: "Online",
  },
  {
    id: "review-required",
    label: "Review Required",
    description:
      "Relevant synthetic equipment history and OE require qualified review.",
    workOrderNumber: "SNC255557",
    site: "Vogtle 1 & 2",
    taskDescription: "Synthetic preventive maintenance demonstration",
    workMode: "Online",
    mutate: reviewItems,
  },
  {
    id: "ready-day-of",
    label: "Ready with Day-of Actions",
    description:
      "Advance prerequisites are complete; final issuance remains for execution day.",
    workOrderNumber: "SNC255558",
    site: "Vogtle 3 & 4",
    taskDescription: "Synthetic field verification demonstration",
    workMode: "Outage",
    mutate: readyDayOfItems,
  },
  {
    id: "unable-to-verify",
    label: "Unable to Verify",
    description:
      "Critical synthetic source checks are unavailable or incomplete.",
    workOrderNumber: "SNC255559",
    site: "Hatch",
    taskDescription: "Synthetic corrective maintenance demonstration",
    workMode: "Online",
    mutate: unableToVerifyItems,
    sourceAvailability: "partial",
  },
];

export const MOCK_SCENARIOS: ReadonlyArray<ReadinessScenario> = DEFINITIONS.map(
  buildScenario,
);

export const MOCK_SCENARIO_BY_ID: Readonly<Record<DemoScenarioId, ReadinessScenario>> =
  Object.freeze(
    Object.fromEntries(
      MOCK_SCENARIOS.map((scenario) => [scenario.id, scenario]),
    ) as Record<DemoScenarioId, ReadinessScenario>,
  );

export function cloneScenario(scenario: ReadinessScenario): ReadinessScenario {
  return structuredClone(scenario);
}

export function getMockScenario(
  scenarioId: DemoScenarioId,
): ReadinessScenario {
  return cloneScenario(MOCK_SCENARIO_BY_ID[scenarioId]);
}

export function findMockScenarioByWorkOrder(
  workOrderNumber: string,
): ReadinessScenario | undefined {
  const normalized = workOrderNumber.trim().toUpperCase();
  const scenario = MOCK_SCENARIOS.find(
    (candidate) => candidate.workOrder.workOrderNumber === normalized,
  );
  return scenario ? cloneScenario(scenario) : undefined;
}
