import type { WorkRequest, WorkRequestStatus } from '../../types';
import { cn } from '../../utils/cn';
import { CriticalityBadge, StatusBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

const columns = ['Ticket Number', 'Description', 'Location', 'Status', 'WO Type', 'Criticality', 'Priority', '% Complete', 'Owner'];

export function WorkRequestTable({
  selectedTicket,
  workRequests,
  onSelect,
}: {
  selectedTicket: string;
  workRequests: WorkRequest[];
  onSelect: (ticketNumber: string) => void;
}) {
  return (
    <section className="panel overflow-hidden" aria-labelledby="work-requests-heading">
      <div className="overflow-x-auto">
        <table className="min-w-[62rem] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-app-line bg-white">
              <th className="w-10 px-3 py-2 text-xs font-bold text-app-muted" aria-label="Selected request" />
              {columns.map((column) => (
                <th className="px-3 py-2 text-xs font-bold text-app-muted" key={column}>
                  <span className="inline-flex items-center gap-1">
                    {column}
                    <span className="text-slate-400" aria-hidden="true">
                      v
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workRequests.map((request) => {
              const selected = request.ticketNumber === selectedTicket;
              return (
                <tr
                  className={cn(
                    'group cursor-pointer border-b border-app-line transition last:border-b-0 hover:bg-app-purpleSoft/45',
                    selected && 'bg-app-purpleSoft/65 shadow-[inset_3px_0_0_#5138b9]',
                  )}
                  key={request.ticketNumber}
                  onClick={() => onSelect(request.ticketNumber)}
                >
                  <td className="px-3 py-2">
                    <button
                      aria-label={`Select ${request.ticketNumber}`}
                      aria-pressed={selected}
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border text-[0.55rem] font-bold transition',
                        selected ? 'border-app-purple bg-app-purple text-white' : 'border-slate-300 bg-white text-transparent group-hover:border-app-purple',
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(request.ticketNumber);
                      }}
                      type="button"
                    >
                      {selected ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-semibold text-app-navy">{request.ticketNumber}</td>
                  <td className="max-w-60 px-3 py-2 text-xs font-semibold leading-4 text-app-navy">
                    <span className="line-clamp-2">{request.description}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-semibold text-app-navy">{request.location}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <StatusBadge status={request.status as WorkRequestStatus} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs font-bold text-app-navy">{request.woType}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <CriticalityBadge value={request.criticality} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs font-bold text-app-navy">{request.priority}</td>
                  <td className="w-28 whitespace-nowrap px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-xs font-semibold text-app-navy">{request.percentComplete}%</span>
                      <ProgressBar value={request.percentComplete} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs font-bold text-app-navy">{request.owner}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
