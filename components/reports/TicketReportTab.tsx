import React, { useState, useRef } from 'react';
import { FileText, Wrench, Target } from 'lucide-react';
import { Ticket } from '../../types';
import { db } from '../../services/mockDatabase';
import { useReactToPrint } from 'react-to-print';
import TicketPrint from '../TicketPrint';
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
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Tip:</span> Double-click any row to print individual ticket
        </p>
      </div>

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
              {tickets.slice(0, 10).map((ticket, index) => (
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
