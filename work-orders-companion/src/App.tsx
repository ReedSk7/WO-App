import { useMemo, useState } from 'react';
import {
  createMockConditionRecord,
  createSessionConditionRecord,
  findRecordByInput,
  mockConditionRecords,
  siteOptions,
  userRoleOptions,
} from './data/mockWorkRequests';
import type { AppSession, ConditionRecord, EditableClassificationField, RecordStatus, WorkflowStep } from './types';
import { downloadScreeningReport } from './utils/exportReport';
import { EntranceScreen, type EntranceValues } from './components/entrance/EntranceScreen';
import { Sidebar } from './components/layout/Sidebar';
import { WorkflowTabs } from './components/layout/WorkflowTabs';
import { OperationalInsights } from './components/insights/OperationalInsights';
import { Icon } from './components/ui/Icon';
import { AddConditionReportModal, type AddConditionReportValues } from './components/workRequests/AddWorkRequestModal';
import { DetailsPanel, type DetailTab } from './components/workRequests/DetailsPanel';
import { FiltersBar } from './components/workRequests/FiltersBar';
import { ScreeningToolbar } from './components/workRequests/ScreeningToolbar';
import { ConditionRecordTable } from './components/workRequests/WorkRequestTable';

function recordMatchesSearch(record: ConditionRecord, search: string) {
  if (!search.trim()) return true;
  const needle = search.trim().toLowerCase();
  return [record.recordNumber, record.recordType, record.description, record.location, record.status, record.woType, record.owner]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

function getSiteLabel(siteId: string) {
  return siteOptions.find((site) => site.id === siteId)?.label ?? siteId;
}

function getRoleLabel(roleId: string) {
  return userRoleOptions.find((role) => role.id === roleId)?.label ?? 'Planner';
}

export default function App() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [activeStep, setActiveStep] = useState<WorkflowStep>('Screening');
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('Classification');
  const [records, setRecords] = useState<ConditionRecord[]>(mockConditionRecords);
  const [selectedRecordNumber, setSelectedRecordNumber] = useState(mockConditionRecords[0].recordNumber);
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('All Sites');
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'All Status'>('All Status');
  const [toast, setToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selectedRecord = records.find((record) => record.recordNumber === selectedRecordNumber) ?? records[0];

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const siteMatches = siteFilter === 'All Sites' || record.siteId === siteFilter;
        const statusMatches = statusFilter === 'All Status' || record.status === statusFilter;
        return siteMatches && statusMatches && recordMatchesSearch(record, search);
      }),
    [search, siteFilter, statusFilter, records],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 2200);
  }

  function analyzeEntrance(values: EntranceValues) {
    if (!values.siteId) return 'Select a site before analyzing a CR, WO, PM, or condition note.';
    if (!values.input.trim()) return 'Enter a CR, WO, PM, or condition note.';

    const nextSession: AppSession = {
      siteId: values.siteId,
      siteLabel: getSiteLabel(values.siteId),
      userRoleId: values.userRoleId,
      userRoleLabel: getRoleLabel(values.userRoleId),
      recordType: values.recordType,
      input: values.input.trim(),
      startedAt: new Date().toISOString(),
    };

    const matchedRecord = findRecordByInput(values.input, mockConditionRecords);
    const sessionRecord = matchedRecord ? null : createSessionConditionRecord(nextSession, records.length + 1);
    const nextRecords = sessionRecord ? [sessionRecord, ...mockConditionRecords] : mockConditionRecords;
    const nextSelected = matchedRecord ?? sessionRecord ?? nextRecords[0];

    setSession(nextSession);
    setRecords(nextRecords);
    setSelectedRecordNumber(nextSelected.recordNumber);
    setActiveDetailTab('Classification');
    setActiveStep(values.recordType === 'CR' ? 'Screening' : 'Planning');
    setSearch('');
    setSiteFilter('All Sites');
    setStatusFilter('All Status');
    showToast(`Mock agent output ready for ${nextSelected.recordNumber}`);
    return null;
  }

  function updateSelectedRecord(updater: (record: ConditionRecord) => ConditionRecord) {
    setRecords((current) => current.map((record) => (record.recordNumber === selectedRecordNumber ? updater(record) : record)));
  }

  function updateClassification(field: EditableClassificationField, value: string) {
    updateSelectedRecord((record) => ({
      ...record,
      classification: {
        ...record.classification,
        [field]: value,
      },
    }));
  }

  function addConditionReport(values: AddConditionReportValues) {
    const nextRecord = {
      ...createMockConditionRecord(records.length + 1),
      description: values.description,
      location: values.location,
      owner: values.owner,
      siteId: session?.siteId ?? 'SITE-A',
      detailDescription: `${values.description}. This is a local demo CR and must be replaced with governed Maximo/API data before production use.`,
    };
    setRecords((current) => [nextRecord, ...current]);
    setSelectedRecordNumber(nextRecord.recordNumber);
    setActiveDetailTab('Classification');
    setIsAddOpen(false);
    showToast(`${nextRecord.recordNumber} added locally`);
  }

  function refreshFromMaximo() {
    // TODO: Replace this timer with authenticated Maximo/API refresh logic.
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      showToast('Mock Maximo refresh complete');
    }, 700);
  }

  function exportReport() {
    downloadScreeningReport(records);
    showToast('Mock CR screening report exported');
  }

  function moveToPlanning() {
    updateSelectedRecord((record) => ({
      ...record,
      movedToPlanning: true,
      percentComplete: Math.max(record.percentComplete, 50),
      status: 'PLANNING',
    }));
    showToast(`${selectedRecordNumber} routed to planning queue`);
  }

  if (!session) {
    return <EntranceScreen onAnalyze={analyzeEntrance} siteOptions={siteOptions} userRoleOptions={userRoleOptions} />;
  }

  return (
    <div className="min-h-screen bg-app-bg font-sans text-app-navy">
      <a className="sr-only z-[60] rounded-lg bg-app-purple px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4" href="#screening">
        Skip to main content
      </a>
      <div className="grid min-h-screen lg:grid-cols-[14rem_minmax(0,1fr)]">
        <Sidebar userRoleLabel={session.userRoleLabel} />
        <div className="min-w-0">
          <div className="flex items-center gap-3 border-b border-app-line bg-white px-4 py-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-purple text-white">
              <Icon className="h-5 w-5" name="logo" />
            </span>
            <div>
              <p className="text-base font-bold leading-5 text-app-navy">CR Planning</p>
              <p className="text-base font-bold leading-5 text-app-navy">Companion</p>
            </div>
          </div>
          <WorkflowTabs activeStep={activeStep} onStepChange={setActiveStep} />
          <main className="mx-auto max-w-dashboard px-4 py-5 lg:px-6" id="screening" tabIndex={-1}>
            <section className="mb-4 grid gap-3 rounded-xl border border-app-line bg-white p-3 shadow-soft lg:grid-cols-[1fr_auto]" aria-label="Current planning session">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide text-app-muted">Site</p>
                  <p className="mt-1 text-sm font-bold text-app-navy">{session.siteLabel}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide text-app-muted">User role</p>
                  <p className="mt-1 text-sm font-bold text-app-navy">{session.userRoleLabel}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide text-app-muted">Source type</p>
                  <p className="mt-1 text-sm font-bold text-app-navy">{session.recordType}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide text-app-muted">Input</p>
                  <p className="mt-1 truncate text-sm font-bold text-app-navy">{session.input}</p>
                </div>
              </div>
              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-app-line px-3 text-sm font-bold text-app-purple hover:bg-app-purpleSoft"
                onClick={() => setSession(null)}
                type="button"
              >
                <Icon className="h-4 w-4" name="refresh" />
                Change session
              </button>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_21rem]">
              <div className="min-w-0 space-y-4">
                <ScreeningToolbar
                  isRefreshing={isRefreshing}
                  onAdd={() => setIsAddOpen(true)}
                  onExport={exportReport}
                  onMoveToPlanning={moveToPlanning}
                  onRefresh={refreshFromMaximo}
                />
                <FiltersBar
                  onSearchChange={setSearch}
                  onSiteFilterChange={setSiteFilter}
                  onStatusFilterChange={setStatusFilter}
                  search={search}
                  siteFilter={siteFilter}
                  siteOptions={siteOptions}
                  statusFilter={statusFilter}
                />
                <ConditionRecordTable onSelect={setSelectedRecordNumber} records={filteredRecords} selectedRecordNumber={selectedRecordNumber} />
                <div className="flex flex-col gap-2 text-sm text-app-muted sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing {filteredRecords.length} of {records.length} records
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        className={page === 1 ? 'pagination-button bg-app-purple text-white' : 'pagination-button bg-white text-app-navy'}
                        key={page}
                        type="button"
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
                <DetailsPanel
                  activeTab={activeDetailTab}
                  onClassificationChange={updateClassification}
                  onExport={exportReport}
                  onMoveToPlanning={moveToPlanning}
                  onTabChange={setActiveDetailTab}
                  record={selectedRecord}
                />
              </div>
              <OperationalInsights record={selectedRecord} />
            </div>
          </main>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-app-navy px-4 py-3 text-sm font-semibold text-white shadow-panel" role="status">
          {toast}
        </div>
      ) : null}

      {isAddOpen ? <AddConditionReportModal onAdd={addConditionReport} onClose={() => setIsAddOpen(false)} /> : null}
    </div>
  );
}
