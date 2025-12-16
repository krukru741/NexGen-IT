import React, { useState, useMemo } from 'react';
import { Ticket } from '../../types';
import { db } from '../../services/mockDatabase';
import { Badge } from '../ui';

interface TicketReportTabProps {
  tickets: Ticket[];
  users: any[];
  onTicketDoubleClick: (ticket: Ticket) => void;
}

export const TicketReportTab: React.FC<TicketReportTabProps> = ({
  tickets,
  users,
  onTicketDoubleClick
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter tickets based on selected filters
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(ticket => new Date(ticket.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(ticket => new Date(ticket.createdAt) <= new Date(endDate));
    }

    return filtered;
  }, [tickets, startDate, endDate]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-3">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Tip:</span> Double-click any row to print individual ticket. 
          Showing {filteredTickets.length} of {tickets.length} tickets.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">Ticket No</th>
                <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">PC No.</th>
                <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">Category</th>
                <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">Employee</th>
                <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">Status</th>
                <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">Created</th>
                <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">Problem/Issue</th>
                <th className="px-3 py-2 text-xs font-bold uppercase border border-gray-600">Troubleshooting</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.slice(0, 10).map((ticket, index) => (
                <tr 
                  key={ticket.id} 
                  className={`hover:bg-blue-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  onDoubleClick={() => onTicketDoubleClick(ticket)}
                >
                  <td className="px-3 py-2 text-xs font-medium text-gray-900 border border-gray-300">{ticket.id}</td>
                  <td className="px-3 py-2 text-xs text-gray-700 border border-gray-300">
                    {users.find(u => u.id === ticket.requesterId)?.pcNo || 'N/A'}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700 border border-gray-300">{ticket.category}</td>
                  <td className="px-3 py-2 text-xs text-gray-700 border border-gray-300">
                    {users.find(u => u.id === ticket.requesterId)?.name || 'N/A'}
                  </td>
                  <td className="px-3 py-2 text-xs border border-gray-300">
                    <Badge variant="status" value={ticket.status} />
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700 border border-gray-300">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700 border border-gray-300">
                    <div className="max-w-xs truncate">{ticket.description}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700 border border-gray-300">
                    <div className="max-w-xs truncate">{ticket.troubleshoot || 'N/A'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
