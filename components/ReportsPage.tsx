import React, { useState } from 'react';
import { Printer, FileText, Download, Calendar, Filter, Users, Ticket as TicketIcon, BarChart3 } from 'lucide-react';
import { User, Ticket } from '../types';
import { db } from '../services/mockDatabase';

interface ReportsPageProps {
  currentUser: User;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ currentUser }) => {
  const [reportType, setReportType] = useState<'tickets' | 'staff'>('tickets');
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);

  const tickets = db.getTickets();
  const users = db.getUsers();

  const handlePrint = () => {
    setShowPrintConfirm(true);
  };

  const confirmPrint = () => {
    setShowPrintConfirm(false);
    window.print();
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

      {/* Report Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-2 print:border-black">
        {/* Print Form Layout */}
        <style>{`
          @media print {
            @page {
              size: portrait;
              margin: 0.5in;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        <div className="p-6 print:p-8">
          {reportType === 'tickets' && (
            <div>
              {/* Screen Preview Message */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg no-print">
                <p className="text-sm text-blue-800">
                  <strong>Preview Mode:</strong> Double-click any row below to print. The printed form will match the service request layout.
                </p>
              </div>

              {/* Print Form - Hidden on screen, visible on print */}
              <div className="hidden print:block">
                {tickets.slice(0, 1).map((ticket) => {
                  const requester = users.find(u => u.id === ticket.requesterId);
                  return (
                    <div key={ticket.id} className="border-2 border-black p-6">
                      {/* Header */}
                      <div className="text-center border-b-2 border-black pb-3 mb-4">
                        <h1 className="text-lg font-bold uppercase">PHYSICIANS' DIAGNOSTIC SERVICES CENTER, INC.</h1>
                        <h2 className="text-base font-bold uppercase">M.I.S SERVICE REQUEST</h2>
                      </div>

                      {/* Top Section - Date and Ticket Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p><span className="font-semibold">Date:</span> {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{ticket.id}</p>
                          <p className="text-xs">TICKET NO</p>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="mb-4 text-sm space-y-2">
                        <p><span className="font-semibold">TO:</span> <span className="border-b border-black inline-block min-w-[300px]">MAINTENANCE SUPERVISOR</span></p>
                        <p><span className="font-semibold">Category:</span> <span className="border-b border-black inline-block min-w-[300px]">{ticket.category}</span></p>
                        <p><span className="font-semibold">Computer Name:</span> <span className="border-b border-black inline-block min-w-[300px]">CPDSC-MIS25</span></p>
                      </div>

                      {/* Problem Table */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">Requesting the repair of the following:</p>
                        <table className="w-full border-2 border-black text-xs">
                          <thead>
                            <tr className="border-b-2 border-black">
                              <th className="border-r border-black p-2 text-center font-bold">Problem Issue</th>
                              <th className="border-r border-black p-2 text-center font-bold">Troubleshooting</th>
                              <th className="border-r border-black p-2 text-center font-bold">Report Time</th>
                              <th className="border-r border-black p-2 text-center font-bold">Status</th>
                              <th className="p-2 text-center font-bold">Completion<br/>Date/Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border-r border-black p-2 align-top">{ticket.description || ticket.title}</td>
                              <td className="border-r border-black p-2 align-top">{ticket.troubleshoot || 'REPLACE NEW PC SET'}</td>
                              <td className="border-r border-black p-2 text-center align-top">
                                {new Date(ticket.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </td>
                              <td className="border-r border-black p-2 text-center align-top">{ticket.status}</td>
                              <td className="p-2 text-center align-top">
                                {ticket.status === 'RESOLVED' || ticket.status === 'VERIFIED' 
                                  ? new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '\n' + new Date(ticket.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                                  : ''}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Signatures Section */}
                      <div className="grid grid-cols-2 gap-8 mb-4 text-sm">
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold">Reported by:</p>
                            <p className="border-b border-black inline-block w-full">{requester?.name || 'BELTRAN, ANJUN PATANYAG'}</p>
                          </div>
                          <div>
                            <p className="font-semibold">IT Personnel:</p>
                            <p className="border-b border-black inline-block w-full">{requester?.name || 'BELTRAN, ANJUN PATANYAG'}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Verified by:</p>
                            <p className="border-b border-black inline-block w-full">{requester?.name || 'BELTRAN, ANJUN PATANYAG'}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold">Department / Section:</p>
                            <p className="border-b border-black inline-block w-full">MANAGEMENT INFORMATION SYSTEM</p>
                          </div>
                          <div>
                            <p className="font-semibold">Date:</p>
                            <p className="border-b border-black inline-block w-full">{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Date:</p>
                            <p className="border-b border-black inline-block w-full">{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>

                      {/* Admin Copy Label */}
                      <div className="text-right text-sm">
                        <p>Admin Copy</p>
                      </div>

                      {/* Footer Info */}
                      <div className="border-t-2 border-black mt-4 pt-2 grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p><span className="font-semibold">Doc Code:</span> MIS-010-F</p>
                          <p><span className="font-semibold">Ver No:</span> C</p>
                        </div>
                        <div>
                          <p><span className="font-semibold">Revision Date:</span> 22-Apr-2024</p>
                          <p><span className="font-semibold">Issue Date:</span> 22-Apr-2024</p>
                        </div>
                        <div>
                          <p><span className="font-semibold">Effectivity Date:</span> 22-Apr-2024</p>
                          <p><span className="font-semibold">Retained by:</span> JCG</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Screen Table View */}
              <div className="overflow-x-auto print:hidden">
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
                        onDoubleClick={handlePrint}
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
              </div>

              <div className="mt-4 text-sm text-gray-500 no-print">
                Showing {Math.min(10, tickets.length)} of {tickets.length} tickets • Double-click any row to print
              </div>
            </div>
          )}

          {reportType === 'staff' && (
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Staff Directory Report</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'TECHNICIAN' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">IT Department</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Total Staff: {users.length}
              </div>
            </div>
          )}
        </div>
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
