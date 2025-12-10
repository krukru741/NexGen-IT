import React, { useState, useRef } from 'react';
import { Printer, FileText, Download, Calendar, Filter, Users, Ticket as TicketIcon, BarChart3 } from 'lucide-react';
import { User, Ticket } from '../types';
import { db } from '../services/mockDatabase';
import { useReactToPrint } from 'react-to-print';
import TicketPrint from './TicketPrint';

interface ReportsPageProps {
  currentUser: User;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ currentUser }) => {
  const [reportType, setReportType] = useState<'tickets' | 'staff'>('tickets');
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const tickets = db.getTickets();
  const users = db.getUsers();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedTicket ? `Ticket-${selectedTicket.id}` : 'Ticket-Report',
    onAfterPrint: () => {
      setShowPrintConfirm(false);
      setSelectedTicket(null);
    },
  });

  const handleTicketDoubleClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowPrintConfirm(true);
  };

  const confirmPrint = () => {
    if (selectedTicket && handlePrint) {
      handlePrint();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Print & Reports</h2>
          <p className="text-gray-500">Generate and export system reports</p>
        </div>
      </div>

      {/* Report Configuration - Compact */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Report Type */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Report Type</h3>
            <div className="space-y-2">
              <button
                onClick={() => setReportType('tickets')}
                className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                  reportType === 'tickets'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TicketIcon className={`w-5 h-5 ${reportType === 'tickets' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Tickets</h4>
                    <p className="text-xs text-gray-500">All tickets report</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setReportType('staff')}
                className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                  reportType === 'staff'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className={`w-5 h-5 ${reportType === 'staff' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Staff</h4>
                    <p className="text-xs text-gray-500">Staff directory</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Date Filters */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <Filter className="w-4 h-4 mr-1.5" />
              Date Range
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Date From
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Date To
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm">
              <Filter className="w-4 h-4" />
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview - Table for browsing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {reportType === 'tickets' ? 'Ticket Report' : 'Staff Directory Report'}
            </h3>
            <span className="text-sm text-gray-500">
              Double-click any row to print
            </span>
          </div>
        </div>

        <div className="p-6">
          {reportType === 'tickets' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Ticket No</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">PC No.</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Category</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Employee</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Status</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Created</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Problem/Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 10).map((ticket, index) => (
                    <tr 
                      key={ticket.id} 
                      className={`hover:bg-blue-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      onDoubleClick={() => handleTicketDoubleClick(ticket)}
                    >
                      <td className="px-2 py-2 text-xs font-medium text-gray-900 border border-gray-300">{ticket.id}</td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300">CPDSC-MIS25</td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300">{ticket.category}</td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300">
                        {users.find(u => u.id === ticket.requesterId)?.name || 'N/A'}
                      </td>
                      <td className="px-2 py-2 text-xs border border-gray-300">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'VERIFIED' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300 max-w-[200px] truncate">
                        {ticket.description || ticket.title}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-500">
                Showing {Math.min(10, tickets.length)} of {tickets.length} tickets • Double-click any row to print
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        {selectedTicket && (
          <TicketPrint 
            ref={printRef} 
            ticket={selectedTicket} 
            requester={users.find(u => u.id === selectedTicket.requesterId)}
          />
        )}
      </div>

      {/* Print Confirmation Modal */}
      {showPrintConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Printer className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Print Report</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to print this report?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowPrintConfirm(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm text-gray-700"
                >
                  No
                </button>
                <button
                  onClick={confirmPrint}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
