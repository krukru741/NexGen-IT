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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTickets.size === tickets.length && tickets.length > 0}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ticket Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTickets.has(ticket.id)}
                    onChange={() => onSelectTicket(ticket.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td 
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => onTicketClick(ticket)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                      {ticket.title}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      #{ticket.id} • {ticket.category} • {new Date(ticket.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-gray-600">{ticket.requesterName}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  {ticket.assignedToName ? (
                    <span className="text-sm text-gray-600">{ticket.assignedToName}</span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`text-xs font-bold uppercase tracking-wide ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight 
                    className="w-5 h-5 text-gray-300 group-hover:text-blue-500 cursor-pointer"
                    onClick={() => onTicketClick(ticket)}
                  />
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
