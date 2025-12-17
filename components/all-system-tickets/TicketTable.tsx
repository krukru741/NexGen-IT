import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import { Badge } from '../ui';

interface TicketTableProps {
  tickets: Ticket[];
  selectedTickets: Set<string>;
  onSelectTicket: (ticketId: string) => void;
  onSelectAll: () => void;
  onTicketClick: (ticket: Ticket) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  selectedTickets,
  onSelectTicket,
  onSelectAll,
  onTicketClick,
}) => {
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return 'bg-blue-100 text-blue-800 border-blue-200';
      case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TicketStatus.ON_HOLD: return 'bg-orange-100 text-orange-800 border-orange-200';
      case TicketStatus.RESOLVED: return 'bg-green-100 text-green-800 border-green-200';
      case TicketStatus.VERIFIED: return 'bg-purple-100 text-purple-800 border-purple-200';
      case TicketStatus.CLOSED: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.CRITICAL: return 'text-red-600 font-bold';
      case TicketPriority.HIGH: return 'text-orange-600 font-semibold';
      case TicketPriority.MEDIUM: return 'text-blue-600';
      case TicketPriority.LOW: return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedTickets.size === tickets.length && tickets.length > 0}
                  onChange={onSelectAll}
                  className="w-3.5 h-3.5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
              </th>
              <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">
                Ticket Details
              </th>
              <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600 hidden md:table-cell">
                Requester
              </th>
              <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600 hidden lg:table-cell">
                Assigned To
              </th>
              <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600 hidden md:table-cell">
                Priority
              </th>
              <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">
                Status
              </th>
              <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr
                key={ticket.id}
                className={`hover:bg-blue-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                onClick={() => onTicketClick(ticket)}
              >
                <td className="px-3 py-2 border border-gray-300 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedTickets.has(ticket.id)}
                    onChange={() => onSelectTicket(ticket.id)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 border border-gray-300">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 truncate max-w-xs block">
                      {ticket.title}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      #{ticket.id} • {ticket.category} • {new Date(ticket.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 border border-gray-300 text-gray-700 hidden md:table-cell">
                  {ticket.requesterName}
                </td>
                <td className="px-3 py-2 border border-gray-300 text-gray-700 hidden lg:table-cell">
                  {ticket.assignedToName ? (
                    ticket.assignedToName
                  ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-3 py-2 border border-gray-300 hidden md:table-cell">
                  <span className={`font-bold uppercase ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-3 py-2 border border-gray-300">
                  <Badge variant="status" value={ticket.status} size="sm" />
                </td>
                <td className="px-3 py-2 border border-gray-300 text-center">
                  <ChevronRight 
                    className="w-4 h-4 text-gray-400"
                  />
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 border border-gray-300">
                  No tickets found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
