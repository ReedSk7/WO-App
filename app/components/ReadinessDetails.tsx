"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  VERIFICATION_METHOD_LABELS,
  type ReadinessItem,
  type VerificationMethod,
} from "@/app/lib/readiness/types";
import { StatusBadge, type StatusValue } from "./StatusBadge";

export type ReadinessDetailsProps = {
  item: ReadinessItem;
  reviewedOperationalExperienceIds?: ReadonlySet<string> | readonly string[];
  onMarkReviewed?: (resultId: string) => void;
  className?: string;
};

type UnknownRecord = Record<string, unknown>;

type FieldDefinition = {
  label: string;
  value: unknown;
  mono?: boolean;
};

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function hasRecordValues(record: UnknownRecord) {
  return Object.keys(record).length > 0;
}

function read(record: UnknownRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: UnknownRecord, keys: string[], fallback = "") {
  const value = read(record, keys);
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function truthy(record: UnknownRecord, keys: string[]) {
  const value = read(record, keys);
  return value === true;
}

function listOfRecords(record: UnknownRecord, keys: string[]) {
  const value = read(record, keys);
  if (!Array.isArray(value)) return [];
  return value.map(asRecord).filter(hasRecordValues);
}

function withNested(record: UnknownRecord, keys: string[]) {
  const nested = asRecord(read(record, keys));
  return hasRecordValues(nested) ? { ...record, ...nested } : record;
}

function displayValue(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => {
        if (typeof entry === "string" || typeof entry === "number") {
          return String(entry);
        }
        const record = asRecord(entry);
        return text(record, ["label", "name", "title", "type"]);
      })
      .filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }
  return null;
}

function formatDetailDisplay(label: string, value: string | null) {
  if (!value) return value;
  if (
    !/(date|checked|verified|timestamp|execution|target)/i.test(label) ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value)
  ) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function verificationDisplay(value: unknown) {
  if (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(VERIFICATION_METHOD_LABELS, value)
  ) {
    return VERIFICATION_METHOD_LABELS[value as VerificationMethod];
  }
  return value;
}

function safeRecordHref(value: string) {
  if (!value || value === "#") return null;
  try {
    const parsed = new URL(value, "https://prototype.invalid");
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? value
      : null;
  } catch {
    return null;
  }
}

function SourceRecordLink({ url, label }: { url: string; label: string }) {
  const href = safeRecordHref(url);
  if (!href) {
    return <span className="record-link-unavailable">Record link unavailable</span>;
  }
  return (
    <a
      className="button button--tertiary source-record-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open demonstration source record for ${label}`}
    >
      Open source record
    </a>
  );
}

function DetailGrid({
  fields,
  emptyMessage = "Additional demonstration details were not provided.",
}: {
  fields: FieldDefinition[];
  emptyMessage?: string;
}) {
  const visibleFields = fields
    .map((field) => ({
      ...field,
      display: formatDetailDisplay(field.label, displayValue(field.value)),
    }))
    .filter((field) => field.display !== null);

  if (visibleFields.length === 0) {
    return <p className="empty-state empty-state--inline">{emptyMessage}</p>;
  }

  return (
    <dl className="detail-grid">
      {visibleFields.map((field) => (
        <div className="detail-grid__item" key={field.label}>
          <dt>{field.label}</dt>
          <dd className={field.mono ? "mono" : undefined}>{field.display}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`detail-section ${className}`.trim()}>
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function GenericDetails({ source }: { source: UnknownRecord }) {
  const prerequisites = read(source, [
    "outstandingPrerequisites",
    "prerequisites",
  ]);
  const relatedItems = read(source, ["relatedItems"]);

  const genericSections = listOfRecords(source, ["genericSections"]);

  return (
    <>
      <DetailSection title="Readiness basis">
        <DetailGrid
          fields={[
          {
            label: "Detailed basis",
            value: read(source, ["detailedBasis", "basis"]),
          },
          { label: "Applicability", value: read(source, ["applicability"]) },
          {
            label: "Verification method",
            value: verificationDisplay(
              read(source, ["verificationMethod", "confidence"]),
            ),
          },
          { label: "Outstanding prerequisites", value: prerequisites },
          { label: "Next action", value: read(source, ["nextAction"]) },
          { label: "Related items", value: relatedItems },
          { label: "Notes", value: read(source, ["notes"]) },
          ]}
          emptyMessage="No additional readiness basis was returned. Verify this check in the approved source system."
        />
      </DetailSection>
      {genericSections.map((section, sectionIndex) => {
        const title = text(
          section,
          ["title"],
          `Additional detail ${sectionIndex + 1}`,
        );
        const fields = listOfRecords(section, ["fields"]);
        return (
          <DetailSection title={title} key={`${title}-${sectionIndex}`}>
            <DetailGrid
              fields={fields.map((field, fieldIndex) => ({
                label: text(field, ["label"], `Field ${fieldIndex + 1}`),
                value: read(field, ["value", "note"]),
              }))}
              emptyMessage={text(
                section,
                ["emptyState"],
                "No additional demonstration details were returned.",
              )}
            />
          </DetailSection>
        );
      })}
    </>
  );
}

function permitRecordStatus(record: UnknownRecord): StatusValue {
  const explicit = text(record, ["readinessClassification", "readinessStatus"]);
  if (explicit) return explicit;

  const applicability = text(record, ["applicability"]).toLowerCase();
  const lifecycle = text(record, ["lifecycleStatus", "status"]).toLowerCase();
  const blockingIssue = text(record, ["blockingIssue"]);

  if (applicability === "not required") return "notApplicable";
  if (!applicability || applicability === "undetermined") return "unableToVerify";
  if (blockingIssue || lifecycle === "blocked" || lifecycle === "expired") {
    return "blocker";
  }
  if (lifecycle.includes("ready for issuance")) return "dayOfAction";
  if (lifecycle.includes("issued") || lifecycle.includes("active")) {
    return "complete";
  }
  // A created/requested record is still pending; existence alone is not readiness.
  return "pending";
}

function permitRecordPriority(record: UnknownRecord) {
  const normalized = String(permitRecordStatus(record))
    .replace(/[\s_-]/g, "")
    .toLowerCase();
  return (
    {
      blocker: 0,
      unabletoverify: 1,
      review: 2,
      pending: 3,
      dayofaction: 4,
      complete: 5,
      notapplicable: 6,
    }[normalized] ?? 7
  );
}

function PermitRecordCard({
  record,
  index,
}: {
  record: UnknownRecord;
  index: number;
}) {
  const type = text(
    record,
    ["type", "title", "controlType"],
    "Permit or special control",
  );
  const recordId = text(
    record,
    ["id", "requestNumber", "recordNumber"],
    `${type}-${index}`,
  );
  const prerequisites = read(record, ["prerequisites"]);
  const outstandingPrerequisites = read(record, [
    "outstandingPrerequisites",
  ]);
  const blockingIssue = text(record, ["blockingIssue"]);
  const recordUrl = text(record, [
    "sourceRecordUrl",
    "recordUrl",
    "url",
  ]);

  return (
    <article className="detail-record" key={recordId}>
      <div className="detail-record__heading">
        <div>
          <p className="detail-record__eyebrow">Permit / control</p>
          <h5>{type}</h5>
        </div>
        <StatusBadge status={permitRecordStatus(record)} compact />
      </div>
      <DetailGrid
        fields={[
          {
            label: "Applicability",
            value: read(record, ["applicability"]),
          },
          {
            label: "Lifecycle status",
            value: read(record, ["lifecycleStatus", "status"]),
          },
          {
            label: "Responsible group",
            value: read(record, ["responsibleGroup", "owner"]),
          },
          {
            label: "Request / record",
            value: read(record, [
              "requestRecordNumber",
              "requestNumber",
              "recordNumber",
              "sourceRecordLabel",
            ]),
            mono: true,
          },
          {
            label: "Target-ready date",
            value: read(record, ["targetReadyDate"]),
          },
          {
            label: "Execution date",
            value: read(record, ["scheduledExecutionDate", "executionDate"]),
          },
          {
            label: "Outstanding prerequisites",
            value: outstandingPrerequisites,
          },
          { label: "Prerequisites / basis", value: prerequisites },
          { label: "Blocking issue", value: blockingIssue },
          {
            label: "Advance prerequisites complete",
            value: read(record, ["advancePrerequisitesComplete"]),
          },
          {
            label: "Requires day-of issuance",
            value: read(record, ["requiresDayOfIssuance"]),
          },
          {
            label: "Last verified",
            value: read(record, ["lastVerifiedAt", "lastCheckedAt"]),
          },
        ]}
      />
      <SourceRecordLink url={recordUrl} label={type} />
    </article>
  );
}

function PermitsDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "permitsAndSpecialControls",
    "permitDetails",
  ]);
  const records = listOfRecords(detail, [
    "permitRecords",
    "permits",
    "controls",
    "records",
  ]);
  const activeRecords = records
    .filter((record) => text(record, ["applicability"]) !== "Not Required")
    .sort((left, right) => permitRecordPriority(left) - permitRecordPriority(right));
  const notRequiredRecords = records.filter(
    (record) => text(record, ["applicability"]) === "Not Required",
  );

  return (
    <DetailSection title="Permit and control records">
      <p className="detail-section__context">
        These records demonstrate UI capability. A listed control is not proof
        that it is required for every job.
      </p>
      {records.length === 0 ? (
        <p className="empty-state empty-state--caution">
          No permit or control records were returned. This does not mean no
          permits or special controls are required.
        </p>
      ) : (
        <>
          {activeRecords.length > 0 ? (
            <div className="detail-record-list">
              {activeRecords.map((record, index) => (
                <PermitRecordCard
                  index={index}
                  key={text(record, ["id"], `active-control-${index}`)}
                  record={record}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state empty-state--inline">
              No permits or special controls are required in this synthetic
              scenario. Each returned record was explicitly evaluated.
            </p>
          )}

          {notRequiredRecords.length > 0 ? (
            <details className="permit-records-not-required">
              <summary>
                Show {notRequiredRecords.length} explicitly Not Required
                {notRequiredRecords.length === 1 ? " control" : " controls"}
              </summary>
              <div className="detail-record-list">
                {notRequiredRecords.map((record, index) => (
                  <PermitRecordCard
                    index={activeRecords.length + index}
                    key={text(record, ["id"], `not-required-control-${index}`)}
                    record={record}
                  />
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </DetailSection>
  );
}

function ClearanceDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "clearance",
    "clearanceDetails",
    "energyControl",
  ]);
  const energySources = listOfRecords(detail, ["energySources"]);
  return (
    <DetailSection title="Clearance and energy-control detail">
      <p className="detail-section__context">
        Decision-support information only. This prototype does not calculate or
        recommend a clearance boundary.
      </p>
      <DetailGrid
        fields={[
          {
            label: "Isolation required",
            value: read(detail, ["isolationRequired", "isolationDetermination"]),
          },
          {
            label: "Clearance number",
            value: read(detail, [
              "clearanceRequestNumber",
              "requestRecordNumber",
              "clearanceNumber",
              "sourceRecordLabel",
            ]),
            mono: true,
          },
          {
            label: "Clearance request status",
            value: read(detail, ["clearanceRequestStatus", "requestStatus"]),
          },
          {
            label: "Energy sources",
            value: read(detail, ["energySources"]),
          },
          {
            label: "Local isolation availability",
            value: read(detail, ["localIsolationAvailability"]),
          },
          {
            label: "Personal danger tag applicability",
            value: read(detail, ["personalDangerTagApplicability"]),
          },
          {
            label: "Draining or venting requirement",
            value: read(detail, [
              "drainingOrVentingRequirement",
              "drainingVentingRequirement",
            ]),
          },
          {
            label: "Clearance / tagging conflicts",
            value: read(detail, ["conflicts", "clearanceTaggingConflicts"]),
          },
          {
            label: "Last source-system check",
            value: read(detail, ["lastSourceSystemCheck", "lastCheckedAt"]),
          },
          {
            label: "Verification state",
            value: read(detail, ["verificationState", "unableToVerify"]),
          },
        ]}
        emptyMessage="Clearance data was not returned. Isolation requirements remain undetermined until verified in an approved source system."
      />
      {energySources.length > 0 ? (
        <ul className="energy-source-list" aria-label="Energy sources">
          {energySources.map((energy, index) => (
            <li key={text(energy, ["type"], `energy-${index}`)}>
              <strong>{text(energy, ["type"], "Other")}</strong>
              <span>{displayValue(read(energy, ["identified"])) ?? "Undetermined"}</span>
              {text(energy, ["note"]) ? <small>{text(energy, ["note"])}</small> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </DetailSection>
  );
}

const HISTORY_SECTIONS = [
  ["Changes Since Planning", ["changesSincePlanning"]],
  [
    "Open or Unresolved Records",
    ["openOrUnresolvedRecords", "openRecords", "unresolvedRecords"],
  ],
  ["Recent Work", ["recentWork"]],
  ["Recurring Issues", ["recurringIssues"]],
  ["Related Work Orders", ["relatedWorkOrders"]],
  ["Prior Support Needs", ["priorSupportNeeds"]],
  ["Full History", ["fullHistory", "findings"]],
] as const;

function FindingLabel({ classification }: { classification: string }) {
  const normalized = classification.toLowerCase();
  const tone = normalized.includes("blocker")
    ? "negative"
    : normalized.includes("review") || normalized.includes("potential")
      ? "warning"
      : "info";
  const glyph = tone === "negative" || tone === "warning" ? "!" : "i";
  return (
    <span className={`finding-label finding-label--${tone}`}>
      <span aria-hidden="true">{glyph}</span>
      {classification}
    </span>
  );
}

function HistoryFinding({
  finding,
  index,
}: {
  finding: UnknownRecord;
  index: number;
}) {
  const title = text(
    finding,
    ["title", "recordLabel", "summary"],
    `History finding ${index + 1}`,
  );
  const classification = text(
    finding,
    ["classification", "impactClassification"],
    "Informational",
  );
  const url = text(finding, ["sourceRecordUrl", "url"]);

  return (
    <article className="detail-record detail-record--history">
      <div className="detail-record__heading">
        <div>
          <p className="detail-record__eyebrow">
            {text(finding, ["recordType", "type"], "History record")}
          </p>
          <h5>{title}</h5>
        </div>
        <FindingLabel classification={classification} />
      </div>
      <DetailGrid
        fields={[
          { label: "Summary", value: read(finding, ["summary", "description"]) },
          { label: "Relationship", value: read(finding, ["relationship"]) },
          { label: "Potential impact", value: read(finding, ["impact"]) },
          { label: "Record date", value: read(finding, ["date", "recordDate"]) },
          {
            label: "Record identifier",
            value: read(finding, [
              "recordLabel",
              "recordNumber",
              "sourceRecordLabel",
            ]),
            mono: true,
          },
        ]}
      />
      {url ? <SourceRecordLink url={url} label={title} /> : null}
    </article>
  );
}

function EquipmentHistoryDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, ["equipmentHistory", "historyDetails"]);
  const historySections = HISTORY_SECTIONS.map(([title, keys]) => ({
    title,
    records: listOfRecords(detail, [...keys]),
  }));

  return (
    <DetailSection title="Equipment history and impact">
      <p className="detail-section__context">
        Historical findings are classified individually; finding history does
        not automatically block execution.
      </p>
      {historySections.map((section) => (
        <section className="detail-subsection" key={section.title}>
          <h5>{section.title}</h5>
          {section.records.length === 0 ? (
            <p className="empty-state empty-state--inline">
              No relevant synthetic records in this section.
            </p>
          ) : (
            <div className="detail-record-list">
              {section.records.map((finding, index) => (
                <HistoryFinding
                  finding={finding}
                  index={index}
                  key={text(finding, ["id", "recordNumber"], `${section.title}-${index}`)}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </DetailSection>
  );
}

function OperationalExperienceDetails({
  source,
  reviewed,
  markReviewed,
}: {
  source: UnknownRecord;
  reviewed: Set<string>;
  markReviewed: (id: string) => void;
}) {
  const detail = withNested(source, [
    "operationalExperience",
    "operationalExperienceDetails",
  ]);
  const records = listOfRecords(detail, [
    "oeResults",
    "results",
    "records",
    "operationalExperienceRecords",
  ]);

  return (
    <DetailSection title="Operational experience results">
      {records.length === 0 ? (
        <p className="empty-state">
          {text(
            detail,
            ["noResultsMessage"],
            "No operational experience results were returned for this demonstration scenario.",
          )}
        </p>
      ) : (
        <div className="detail-record-list">
          {records.map((record, index) => {
            const id = text(record, ["id", "recordNumber"], `oe-${index}`);
            const title = text(record, ["title"], `OE result ${index + 1}`);
            const acknowledged = reviewed.has(id) || truthy(record, ["reviewAcknowledged"]);
            const url = text(record, ["sourceRecordUrl", "url"]);
            return (
              <article className="detail-record" key={id}>
                <div className="detail-record__heading">
                  <div>
                    <p className="detail-record__eyebrow">
                      {text(record, ["sourceType"], "Operational experience")}
                    </p>
                    <h5>{title}</h5>
                  </div>
                  <StatusBadge
                    status={acknowledged ? "complete" : "review"}
                    label={acknowledged ? "Reviewed locally" : "Review Required"}
                    compact
                  />
                </div>
                <DetailGrid
                  fields={[
                    {
                      label: "Short summary",
                      value: read(record, ["shortSummary", "summary"]),
                    },
                    {
                      label: "Why it matched",
                      value: read(record, ["whyMatched", "matchReason"]),
                    },
                    {
                      label: "Equipment / task relationship",
                      value: read(record, ["relationship", "equipmentTaskRelationship"]),
                    },
                    { label: "Source type", value: read(record, ["sourceType"]) },
                    { label: "Date", value: read(record, ["date"]) },
                    {
                      label: "Potential work-order impact",
                      value: read(record, [
                        "potentialWorkOrderImpact",
                        "potentialImpact",
                        "workOrderImpact",
                      ]),
                    },
                  ]}
                />
                <div className="detail-record__actions">
                  <button
                    className="button button--tertiary"
                    type="button"
                    onClick={() => markReviewed(id)}
                    disabled={acknowledged}
                  >
                    {acknowledged ? "Reviewed in this prototype" : "Mark Reviewed"}
                  </button>
                  {url ? <SourceRecordLink url={url} label={title} /> : null}
                </div>
                <p className="prototype-state-note">
                  Review acknowledgment is stored only in local prototype state.
                </p>
              </article>
            );
          })}
        </div>
      )}
    </DetailSection>
  );
}

function OperationalConditionsDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "operationalConditions",
    "operationalConditionDetails",
  ]);
  const records = listOfRecords(detail, [
    "conditions",
    "checks",
    "records",
    "operationalConditionRecords",
  ]);

  return (
    <DetailSection title="Operational risk and plant conditions">
      <p className="detail-section__context">
        The prototype displays demonstration checks and does not make an
        operational decision.
      </p>
      {records.length === 0 ? (
        <p className="empty-state empty-state--caution">
          Operational-condition data was not returned. Do not interpret missing
          data as no condition found.
        </p>
      ) : (
        <div className="detail-record-list detail-record-list--compact">
          {records.map((record, index) => {
            const title = text(
              record,
              ["type", "title", "conditionType"],
              `Operational check ${index + 1}`,
            );
            return (
              <article className="detail-record" key={text(record, ["id"], `${title}-${index}`)}>
                <h5>{title}</h5>
                <DetailGrid
                  fields={[
                    {
                      label: "Condition found",
                      value: read(record, ["conditionFound", "found"]),
                    },
                    {
                      label: "Relationship to work order",
                      value: read(record, ["relationshipToWorkOrder", "relationship"]),
                    },
                    {
                      label: "Human review requirement",
                      value: read(record, ["humanReviewRequired", "reviewRequirement"]),
                    },
                    { label: "Source", value: read(record, ["source", "sourceSystem"]) },
                    {
                      label: "Last checked",
                      value: read(record, ["lastCheckedAt"]),
                    },
                    {
                      label: "Verification state",
                      value: read(record, ["verificationState", "verificationMethod"]),
                    },
                  ]}
                />
              </article>
            );
          })}
        </div>
      )}
    </DetailSection>
  );
}

function PartsDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, ["parts", "partsAndMaterials", "partsDetails"]);
  const materials = listOfRecords(detail, ["materials"]);
  return (
    <DetailSection title="Parts and materials detail">
      <DetailGrid
        fields={[
          {
            label: "Required parts identified",
            value: read(detail, ["requiredPartsIdentified"]),
          },
          { label: "Reserved", value: read(detail, ["reserved"]) },
          { label: "Available on site", value: read(detail, ["onSite", "available"]) },
          { label: "Picked", value: read(detail, ["picked"]) },
          { label: "Staged", value: read(detail, ["staged"]) },
          { label: "Verified", value: read(detail, ["verified"]) },
          {
            label: "Shelf life valid through execution",
            value: read(detail, ["shelfLifeValidThroughExecution", "shelfLifeStatus"]),
          },
          {
            label: "Like-for-like / equivalency review",
            value: read(detail, ["equivalencyReviewStatus", "likeForLikeStatus"]),
          },
          { label: "Material hold", value: read(detail, ["materialHold"]) },
          { label: "Outstanding issue", value: read(detail, ["outstandingIssue"]) },
        ]}
        emptyMessage="Parts and material status was not returned. Missing data is not a verified pass."
      />
      {materials.length > 0 ? (
        <div className="detail-record-list detail-record-list--compact">
          {materials.map((material, index) => {
            const label = text(
              material,
              ["syntheticPartLabel", "label"],
              `Synthetic material ${index + 1}`,
            );
            return (
              <article className="detail-record" key={text(material, ["id"], `${label}-${index}`)}>
                <h5>{label}</h5>
                <DetailGrid
                  fields={[
                    { label: "Required", value: read(material, ["required"]) },
                    { label: "Progress", value: read(material, ["progress"]) },
                    { label: "Reserved", value: read(material, ["reserved"]) },
                    { label: "On site", value: read(material, ["onSite"]) },
                    { label: "Picked", value: read(material, ["picked"]) },
                    { label: "Staged", value: read(material, ["staged"]) },
                    { label: "Verified", value: read(material, ["verified"]) },
                    {
                      label: "Shelf life valid through execution",
                      value: read(material, ["shelfLifeValidThroughExecution"]),
                    },
                    {
                      label: "Like-for-like / equivalency review",
                      value: read(material, ["equivalencyReviewStatus"]),
                    },
                    { label: "Material hold", value: read(material, ["materialHold"]) },
                    {
                      label: "Outstanding issue",
                      value: read(material, ["outstandingIssue"]),
                    },
                  ]}
                />
              </article>
            );
          })}
        </div>
      ) : null}
    </DetailSection>
  );
}

function ScaffoldingDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "scaffolding",
    "scaffoldingAndAccess",
    "scaffoldDetails",
  ]);
  return (
    <DetailSection title="Scaffolding and access detail">
      <DetailGrid
        fields={[
          { label: "Scaffold required", value: read(detail, ["scaffoldRequired"]) },
          {
            label: "Determination method / basis",
            value: read(detail, ["determinationMethod", "notRequiredBasis"]),
          },
          { label: "Request submitted", value: read(detail, ["requestSubmitted"]) },
          { label: "Design status", value: read(detail, ["designStatus"]) },
          { label: "Build status", value: read(detail, ["buildStatus"]) },
          {
            label: "Inspection / acceptance status",
            value: read(detail, [
              "inspectionAcceptanceStatus",
              "inspectionStatus",
              "acceptanceStatus",
            ]),
          },
          { label: "Ready for use", value: read(detail, ["readyForUse"]) },
          { label: "Access constraints", value: read(detail, ["accessConstraints"]) },
          {
            label: "Interference removal",
            value: read(detail, ["interferenceRemoval"]),
          },
          {
            label: "Ladder / alternate access",
            value: read(detail, [
              "ladderOrAlternateAccess",
              "alternateAccess",
              "ladderAccess",
            ]),
          },
          { label: "Target-ready date", value: read(detail, ["targetReadyDate"]) },
        ]}
        emptyMessage="No scaffold record or evaluation was returned. A missing record is not proof that scaffolding is not required."
      />
    </DetailSection>
  );
}

function WalkdownDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, ["walkdownAndTaskPreview", "walkdownDetails"]);
  return (
    <DetailSection title="Walkdown and task preview detail">
      <DetailGrid
        fields={[
          { label: "Walkdown level", value: read(detail, ["walkdownLevel"]) },
          { label: "Walkdown required", value: read(detail, ["walkdownRequired"]) },
          { label: "Walkdown status", value: read(detail, ["walkdownStatus"]) },
          { label: "Completed date", value: read(detail, ["completedDate"]) },
          {
            label: "Completed by role",
            value: read(detail, ["completedByRole"]),
          },
          { label: "Questions remaining", value: read(detail, ["questionsRemaining"]) },
          { label: "Constraints found", value: read(detail, ["constraintsFound"]) },
          {
            label: "Planner feedback submitted",
            value: read(detail, ["plannerFeedbackSubmitted"]),
          },
          {
            label: "Task preview completed",
            value: read(detail, ["taskPreviewCompleted"]),
          },
          {
            label: "Supervisor engagement",
            value: read(detail, ["supervisorEngagementStatus"]),
          },
        ]}
        emptyMessage="Walkdown and task-preview requirements are not determined in the returned demonstration data."
      />
    </DetailSection>
  );
}

function WorkPackageDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "workPackage",
    "workPackageAndProcedures",
    "packageDetails",
  ]);
  const packageUrl = text(detail, [
    "electronicPackageLink",
    "documentUrl",
    "electronicPackageUrl",
  ]);
  return (
    <DetailSection title="Work package and procedures detail">
      <p className="detail-section__context">
        This prototype does not independently approve package adequacy.
      </p>
      <DetailGrid
        fields={[
          {
            label: "Work package available",
            value: read(detail, ["workPackageAvailable", "packageAvailable"]),
          },
          {
            label: "Referenced documents present",
            value: read(detail, ["referencedDocumentsPresent"]),
          },
          {
            label: "Current revision verification",
            value: read(detail, [
              "currentRevisionVerified",
              "currentRevisionVerification",
              "revisionStatus",
            ]),
          },
          { label: "Drawings available", value: read(detail, ["drawingsAvailable"]) },
          {
            label: "Engineering documents available",
            value: read(detail, ["engineeringDocumentsAvailable"]),
          },
          {
            label: "Outstanding package feedback",
            value: read(detail, ["outstandingPackageFeedback"]),
          },
          {
            label: "Verification state",
            value: read(detail, ["verificationState", "unableToVerify"]),
          },
        ]}
        emptyMessage="Work-package data was not returned. Package readiness remains unverified."
      />
      {packageUrl ? <SourceRecordLink url={packageUrl} label="work package" /> : null}
    </DetailSection>
  );
}

function SupportDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "supportCoordination",
    "supportGroupCoordination",
    "supportDetails",
  ]);
  const records = listOfRecords(detail, ["supportItems", "groups", "records"]);
  return (
    <DetailSection title="Support group coordination">
      {records.length === 0 ? (
        <p className="empty-state empty-state--caution">
          Support requirements were not returned. Missing coordination data is
          not evidence that support is unnecessary.
        </p>
      ) : (
        <div className="detail-record-list detail-record-list--compact">
          {records.map((record, index) => {
            const group = text(
              record,
              ["group", "name", "type"],
              `Support group ${index + 1}`,
            );
            return (
              <article className="detail-record" key={text(record, ["id"], `${group}-${index}`)}>
                <h5>{group}</h5>
                <DetailGrid
                  fields={[
                    {
                      label: "Applicability",
                      value: read(record, ["requirement", "applicability", "required"]),
                    },
                    { label: "Requested", value: read(record, ["requested"]) },
                    {
                      label: "Accepted / acknowledged",
                      value: read(record, [
                        "acceptedOrAcknowledged",
                        "accepted",
                        "acknowledged",
                      ]),
                    },
                    { label: "Scheduled", value: read(record, ["scheduled"]) },
                    { label: "Ready", value: read(record, ["ready"]) },
                    { label: "Owner group", value: read(record, ["owner", "ownerGroup"]) },
                    { label: "Timing", value: read(record, ["timing"]) },
                    {
                      label: "Outstanding issue",
                      value: read(record, ["outstandingIssue"]),
                    },
                  ]}
                />
              </article>
            );
          })}
        </div>
      )}
    </DetailSection>
  );
}

function ToolsDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "tools",
    "toolsAndTestEquipment",
    "toolsDetails",
  ]);
  return (
    <DetailSection title="Tools and test equipment detail">
      <DetailGrid
        fields={[
          {
            label: "Special tools required",
            value: read(detail, ["specialToolsRequired"]),
          },
          { label: "Tool availability", value: read(detail, ["toolAvailability"]) },
          { label: "Reservation", value: read(detail, ["reservationStatus", "reservation"]) },
          { label: "Staging", value: read(detail, ["stagingStatus", "staged"]) },
          {
            label: "Measuring / test equipment required",
            value: read(detail, [
              "measuringAndTestEquipmentRequired",
              "testEquipmentRequired",
              "mAndTERequired",
            ]),
          },
          {
            label: "Calibration valid through execution",
            value: read(detail, ["calibrationValidThroughExecution"]),
          },
          { label: "Outstanding issue", value: read(detail, ["outstandingIssue"]) },
        ]}
        emptyMessage="Tool and test-equipment data was not returned."
      />
    </DetailSection>
  );
}

function WorkforceDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "workforce",
    "workforceReadiness",
    "workforceDetails",
  ]);
  const crewAssigned = read(detail, ["assignedCrewStatus", "crewAssigned"]);
  return (
    <DetailSection title="Workforce readiness detail">
      <DetailGrid
        fields={[
          {
            label: "Required discipline",
            value: read(detail, ["requiredDiscipline"]),
          },
          {
            label: "Minimum crew size",
            value: read(detail, ["minimumCrewSizePlaceholder", "minimumCrewSize"]),
          },
          {
            label: "Special qualification required",
            value: read(detail, ["specialQualificationRequired"]),
          },
          { label: "Assigned crew status", value: crewAssigned },
          {
            label: "Qualifications verification",
            value: read(detail, ["qualificationsVerified", "qualificationStatus"]),
          },
          {
            label: "Proficiency review required",
            value: read(detail, ["proficiencyReviewRequired"]),
          },
          {
            label: "Just-in-time training",
            value: read(detail, ["justInTimeTrainingRequired"]),
          },
          {
            label: "Supervisor oversight",
            value: read(detail, ["supervisorOversightRequirement"]),
          },
        ]}
        emptyMessage="Not evaluated — crew not assigned or workforce data was not returned."
      />
      {crewAssigned === false || String(crewAssigned).toLowerCase().includes("not assigned") ? (
        <p className="empty-state empty-state--inline">
          Not evaluated — crew not assigned.
        </p>
      ) : null}
    </DetailSection>
  );
}

function TestingDetails({ source }: { source: UnknownRecord }) {
  const detail = withNested(source, [
    "testingRestoration",
    "testingAndRestoration",
    "testingDetails",
  ]);
  return (
    <DetailSection title="Testing and restoration detail">
      <p className="detail-section__context">
        This prototype does not generate test instructions or acceptance
        criteria.
      </p>
      <DetailGrid
        fields={[
          {
            label: "Post-maintenance test identified",
            value: read(detail, ["postMaintenanceTestIdentified"]),
          },
          { label: "Test prerequisites", value: read(detail, ["testPrerequisites"]) },
          { label: "Required support", value: read(detail, ["requiredSupport"]) },
          { label: "Test equipment", value: read(detail, ["testEquipment"]) },
          {
            label: "Restoration steps identified",
            value: read(detail, ["restorationStepsIdentified"]),
          },
          {
            label: "Outstanding dependency",
            value: read(detail, ["outstandingDependency"]),
          },
        ]}
        emptyMessage="Testing and restoration data was not returned."
      />
    </DetailSection>
  );
}

function CategoryDetails({
  source,
  category,
  reviewed,
  markReviewed,
}: {
  source: UnknownRecord;
  category: string;
  reviewed: Set<string>;
  markReviewed: (id: string) => void;
}) {
  const normalized = category.replace(/[-_]/g, " ").toLowerCase();

  if (normalized.includes("permit") || normalized.includes("special control")) {
    return <PermitsDetails source={source} />;
  }
  if (normalized.includes("clearance") || normalized.includes("energy control")) {
    return <ClearanceDetails source={source} />;
  }
  if (normalized.includes("equipment history")) {
    return <EquipmentHistoryDetails source={source} />;
  }
  if (normalized.includes("operational risk") || normalized.includes("plant condition")) {
    return <OperationalConditionsDetails source={source} />;
  }
  if (normalized.includes("operational experience")) {
    return (
      <OperationalExperienceDetails
        source={source}
        reviewed={reviewed}
        markReviewed={markReviewed}
      />
    );
  }
  if (normalized.includes("parts") || normalized.includes("material")) {
    return <PartsDetails source={source} />;
  }
  if (normalized.includes("scaffold") || normalized.includes("access")) {
    return <ScaffoldingDetails source={source} />;
  }
  if (normalized.includes("walkdown") || normalized.includes("task preview")) {
    return <WalkdownDetails source={source} />;
  }
  if (normalized.includes("work package") || normalized.includes("procedure")) {
    return <WorkPackageDetails source={source} />;
  }
  if (normalized.includes("support group") || normalized.includes("coordination")) {
    return <SupportDetails source={source} />;
  }
  if (normalized.includes("tools") || normalized.includes("test equipment")) {
    return <ToolsDetails source={source} />;
  }
  if (normalized.includes("workforce")) {
    return <WorkforceDetails source={source} />;
  }
  if (normalized.includes("testing") || normalized.includes("restoration")) {
    return <TestingDetails source={source} />;
  }
  return null;
}

export function ReadinessDetails({
  item,
  reviewedOperationalExperienceIds,
  onMarkReviewed,
  className = "",
}: ReadinessDetailsProps) {
  const [locallyReviewed, setLocallyReviewed] = useState<Set<string>>(
    () => new Set(),
  );
  const source = useMemo(() => {
    const itemRecord = asRecord(item);
    const detail = asRecord(
      read(itemRecord, ["details", "detail", "metadata", "categoryDetails"]),
    );
    return { ...itemRecord, ...detail };
  }, [item]);
  const category = text(source, ["category", "categoryLabel"], "Readiness check");
  const reviewedIds = new Set<string>([
    ...(reviewedOperationalExperienceIds ?? []),
    ...locallyReviewed,
  ]);

  function markReviewed(id: string) {
    setLocallyReviewed((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
    onMarkReviewed?.(id);
  }

  return (
    <div className={`readiness-details ${className}`.trim()}>
      <CategoryDetails
        source={source}
        category={category}
        reviewed={reviewedIds}
        markReviewed={markReviewed}
      />
      <details className="readiness-details__more">
        <summary>More source and history information</summary>
        <GenericDetails source={source} />
      </details>
      <p className="readiness-details__safety-note">
        Verify this information using approved processes and source systems
        before beginning work.
      </p>
    </div>
  );
}
