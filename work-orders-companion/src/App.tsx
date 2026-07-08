import { useMemo, useState } from 'react';
import { mockWorkRequests, createMockWorkRequest } from './data/mockWorkRequests';
import type { EditableClassificationField, WorkRequest, WorkRequestStatus, WorkflowStep } from './types';
import { downloadScreeningReport } from './utils/exportReport';
import { Sidebar } from './components/layout/Sidebar';
import { WorkflowTabs } from './components/layout/WorkflowTabs';
import { OperationalInsights } from './components/insights/OperationalInsights';
import { Icon } from './components/ui/Icon';
import { AddWorkRequestModal, type AddWorkRequestValues } from './components/workRequests/AddWorkRequestModal';
import { DetailsPanel, type DetailTab } from './components/workRequests/DetailsPanel';
import { FiltersBar } from './components/workRequests/FiltersBar';
import { ScreeningToolbar } from './components/workRequests/ScreeningToolbar';
import { WorkRequestTable } from './components/workRequests/WorkRequestTable';

function requestMatchesSearch(request: WorkRequest, search: string) {
  if (!search.trim()) return true;
  const needle = search.trim().toLowerCase();
  return [request.ticketNumber, request.description, request.location, request.status, request.woType, request.owner]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export default function App() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('Screening');
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('Classification');
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>(mockWorkRequests);
  const [selectedTicket, setSelectedTicket] = useState(mockWorkRequests[0].ticketNumber);
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('All Sites');
  const [statusFilter, setStatusFilter] = useState<WorkRequestStatus | 'All Status'>('All Status');
  const [toast, setToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selectedRequest = workRequests.find((request) => request.ticketNumber === selectedTicket) ?? workRequests[0];

  const filteredRequests = useMemo(
    () =>
      workRequests.filter((request) => {
        const siteMatches = siteFilter === 'All Sites' || request.siteId === siteFilter;
        const statusMatches = statusFilter === 'All Status' || request.status === statusFilter;
        return siteMatches && statusMatches && requestMatchesSearch(request, search);
      }),
    [search, siteFilter, statusFilter, workRequests],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 2200);
  }

  function updateSelectedRequest(updater: (request: WorkRequest) => WorkRequest) {
    setWorkRequests((current) => current.map((request) => (request.ticketNumber === selectedTicket ? updater(request) : request)));
  }

  function updateClassification(field: EditableClassificationField, value: string) {
    updateSelectedRequest((request) => ({
      ...request,
      classification: {
        ...request.classification,
        [field]: value,
      },
    }));
  }

  function addWorkRequest(values: AddWorkRequestValues) {
    const nextRequest = {
      ...createMockWorkRequest(workRequests.length + 1),
      description: values.description,
      location: values.location,
      owner: values.owner,
      detailDescription: `${values.description}. This is a local demo record and must be replaced with governed Maximo/API data before production use.`,
    };
    setWorkRequests((current) => [nextRequest, ...current]);
    setSelectedTicket(nextRequest.ticketNumber);
    setActiveDetailTab('Classification');
    setIsAddOpen(false);
    showToast(`${nextRequest.ticketNumber} added locally`);
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
    downloadScreeningReport(workRequests);
    showToast('Mock screening report exported');
  }

  function moveToPlanning() {
    updateSelectedRequest((request) => ({
      ...request,
      movedToPlanning: true,
      percentComplete: Math.max(request.percentComplete, 50),
      status: 'PLANNING',
    }));
    showToast(`${selectedTicket} moved to planning queue`);
  }

  return (
    <div className="min-h-screen bg-app-bg font-sans text-app-navy">
      <a className="sr-only z-[60] rounded-lg bg-app-purple px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4" href="#screening">
        Skip to main content
      </a>
      <div className="grid min-h-screen lg:grid-cols-[14rem_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0">
          <div className="flex items-center gap-3 border-b border-app-line bg-white px-4 py-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-purple text-white">
              <Icon className="h-5 w-5" name="logo" />
            </span>
            <div>
              <p className="text-base font-bold leading-5 text-app-navy">Work Orders</p>
              <p className="text-base font-bold leading-5 text-app-navy">Companion</p>
            </div>
          </div>
          <WorkflowTabs activeStep={activeStep} onStepChange={setActiveStep} />
          <main className="mx-auto max-w-dashboard px-4 py-5 lg:px-6" id="screening" tabIndex={-1}>
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
                  statusFilter={statusFilter}
                />
                <WorkRequestTable onSelect={setSelectedTicket} selectedTicket={selectedTicket} workRequests={filteredRequests} />
                <div className="flex flex-col gap-2 text-sm text-app-muted sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing {filteredRequests.length} of {workRequests.length} WRs
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
                  request={selectedRequest}
                />
              </div>
              <OperationalInsights request={selectedRequest} />
            </div>
          </main>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-app-navy px-4 py-3 text-sm font-semibold text-white shadow-panel" role="status">
          {toast}
        </div>
      ) : null}

      {isAddOpen ? <AddWorkRequestModal onAdd={addWorkRequest} onClose={() => setIsAddOpen(false)} /> : null}
    </div>
  );
}
