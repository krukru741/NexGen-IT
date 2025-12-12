import React, { useState, useRef } from 'react';
import { Printer, FileText, Download, Calendar, Filter, Users, Ticket as TicketIcon, BarChart3, Wrench, Target } from 'lucide-react';
import { User, Ticket } from '../types';
import { db } from '../services/mockDatabase';
import { useReactToPrint } from 'react-to-print';
import TicketPrint from './TicketPrint';
import MaintenancePrint from './MaintenancePrint';

interface ReportsPageProps {
  currentUser: User;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ currentUser }) => {
  const [reportType, setReportType] = useState<'tickets' | 'maintenance' | 'quality'>('tickets');
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const maintenancePrintRef = useRef<HTMLDivElement>(null);
  
  // Maintenance report filters
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1
    return currentMonth.toString();
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });
  const [addedMonths, setAddedMonths] = useState<Array<{month: string, year: string}>>(() => {
    const saved = localStorage.getItem('maintenanceMonths');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse maintenance months:', e);
      }
    }
    return [];
  });
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedMaintenanceMonth, setSelectedMaintenanceMonth] = useState<{month: string, year: string} | null>(null);
  const [excludedTickets, setExcludedTickets] = useState<Ticket[]>([]);
  const [includedTickets, setIncludedTickets] = useState<Ticket[]>([]);

  const tickets = db.getTickets();
  const users = db.getUsers();

  // Save added months to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('maintenanceMonths', JSON.stringify(addedMonths));
  }, [addedMonths]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedTicket ? `Ticket-${selectedTicket.id}` : 'Ticket-Report',
    onAfterPrint: () => {
      setShowPrintConfirm(false);
      setSelectedTicket(null);
    },
  });

  const handleMaintenancePrint = useReactToPrint({
    contentRef: maintenancePrintRef,
    documentTitle: selectedMaintenanceMonth 
      ? `Maintenance-${selectedMaintenanceMonth.month}-${selectedMaintenanceMonth.year}` 
      : 'Maintenance-Report',
    onAfterPrint: () => {
      setShowMaintenanceModal(false);
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

  const handleAddMonth = () => {
    const monthExists = addedMonths.some(
      m => m.month === selectedMonth && m.year === selectedYear
    );
    if (!monthExists) {
      setAddedMonths([...addedMonths, { month: selectedMonth, year: selectedYear }]);
    }
  };

  const handleRemoveMonth = (index: number) => {
    setAddedMonths(addedMonths.filter((_, i) => i !== index));
  };

  const getMonthName = (monthNum: string) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthNum) - 1];
  };

  const handleMonthDoubleClick = (month: {month: string, year: string}) => {
    setSelectedMaintenanceMonth(month);
    
    // Filter tickets created in the selected month and year
    const monthNum = parseInt(month.month);
    const yearNum = parseInt(month.year);
    
    const ticketsInMonth = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      const ticketMonth = ticketDate.getMonth() + 1; // getMonth() returns 0-11
      const ticketYear = ticketDate.getFullYear();
      
      return ticketMonth === monthNum && ticketYear === yearNum;
    });
    
    // Initialize with tickets from that month in excluded, none in included initially
    setExcludedTickets(ticketsInMonth);
    setIncludedTickets([]);
    setShowMaintenanceModal(true);
  };

  const handleTransferToIncluded = (ticket: Ticket) => {
    setExcludedTickets(excludedTickets.filter(t => t.id !== ticket.id));
    setIncludedTickets([...includedTickets, ticket]);
  };

  const handleTransferToExcluded = (ticket: Ticket) => {
    setIncludedTickets(includedTickets.filter(t => t.id !== ticket.id));
    setExcludedTickets([...excludedTickets, ticket]);
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
                onClick={() => setReportType('maintenance')}
                className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                  reportType === 'maintenance'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className={`w-5 h-5 ${reportType === 'maintenance' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Preventive Maintenance</h4>
                    <p className="text-xs text-gray-500">Monthly maintenance</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setReportType('quality')}
                className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                  reportType === 'quality'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className={`w-5 h-5 ${reportType === 'quality' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Quality Objectives</h4>
                    <p className="text-xs text-gray-500">Quality metrics</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Date Filters */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <Filter className="w-4 h-4 mr-1.5" />
              {reportType === 'tickets' ? 'Date Range' : reportType === 'maintenance' ? 'Filter by Month' : 'Filters'}
            </h3>
            
            {reportType === 'tickets' && (
              <>
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
              </>
            )}

            {reportType === 'maintenance' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Month
                    </label>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Year
                    </label>
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleAddMonth}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm"
                >
                  Add
                </button>
              </>
            )}

            {reportType === 'quality' && (
              <div className="text-sm text-gray-500 py-4">
                No filters available for Quality Objectives report
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview - Table for browsing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {reportType === 'tickets' ? 'Ticket Report' : 
               reportType === 'maintenance' ? 'Monthly Preventive Maintenance Report' :
               'Quality Objectives Report'}
            </h3>
            {reportType === 'tickets' && (
              <span className="text-sm text-gray-500">
                Double-click any row to print
              </span>
            )}
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
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Troubleshooting</th>
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
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300">
                        {users.find(u => u.id === ticket.requesterId)?.pcNo || 'N/A'}
                      </td>
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
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300 max-w-[200px] truncate">
                        {ticket.troubleshoot || '-'}
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

          {reportType === 'maintenance' && (
            <div>
              {addedMonths.length > 0 ? (
                <>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 text-white px-4 py-3 border-b border-gray-600">
                      <span className="text-sm font-bold uppercase">MONTH / YEAR</span>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {addedMonths.map((item, index) => (
                        <div 
                          key={index}
                          onDoubleClick={() => handleMonthDoubleClick(item)}
                          className={`px-4 py-3 hover:bg-blue-50 flex items-center justify-between group cursor-pointer ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <span className="text-sm text-gray-900 font-medium">
                            {getMonthName(item.month)} {item.year}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMonth(index);
                            }}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500 text-center">
                    Double-click any month to view details
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">No months added yet</p>
                  <p className="text-xs mt-1">Use the filter above to add months to the list</p>
                </div>
              )}
            </div>
          )}

          {reportType === 'quality' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Objective</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Metric</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Current Value</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Target Value</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Progress</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Due Date</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase border border-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, objective: 'Ticket Resolution Time', metric: 'Average Hours', current: 4.2, target: 4.0, progress: 95, dueDate: '2025-03-31', status: 'On Track' },
                    { id: 2, objective: 'Customer Satisfaction', metric: 'Rating (1-5)', current: 4.5, target: 4.7, progress: 96, dueDate: '2025-03-31', status: 'On Track' },
                    { id: 3, objective: 'First Contact Resolution', metric: 'Percentage', current: 72, target: 80, progress: 90, dueDate: '2025-03-31', status: 'In Progress' },
                    { id: 4, objective: 'System Uptime', metric: 'Percentage', current: 99.8, target: 99.9, progress: 99, dueDate: '2025-03-31', status: 'On Track' },
                    { id: 5, objective: 'Preventive Maintenance', metric: 'Completion Rate', current: 88, target: 95, progress: 93, dueDate: '2025-03-31', status: 'In Progress' },
                    { id: 6, objective: 'Security Incidents', metric: 'Count', current: 2, target: 0, progress: 0, dueDate: '2025-03-31', status: 'At Risk' },
                    { id: 7, objective: 'Training Completion', metric: 'Percentage', current: 100, target: 100, progress: 100, dueDate: '2025-03-31', status: 'Achieved' },
                    { id: 8, objective: 'Documentation Quality', metric: 'Score (1-10)', current: 8.5, target: 9.0, progress: 94, dueDate: '2025-03-31', status: 'On Track' },
                  ].map((item, index) => (
                    <tr key={item.id} className={`hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-2 py-2 text-xs font-medium text-gray-900 border border-gray-300">{item.objective}</td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300">{item.metric}</td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300 text-center">{item.current}</td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300 text-center">{item.target}</td>
                      <td className="px-2 py-2 text-xs border border-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.progress >= 95 ? 'bg-green-500' :
                                item.progress >= 80 ? 'bg-blue-500' :
                                item.progress >= 50 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{item.progress}%</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-700 border border-gray-300">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-2 text-xs border border-gray-300">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.status === 'Achieved' ? 'bg-green-100 text-green-800' :
                          item.status === 'On Track' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-500">
                Showing 8 quality objectives for Q1 2025
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

      {/* Maintenance Month Details Modal */}
      {showMaintenanceModal && selectedMaintenanceMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {getMonthName(selectedMaintenanceMonth.month)} {selectedMaintenanceMonth.year} - Preventive Maintenance
              </h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* EXCLUDED Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Excluded</h4>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 border-b border-gray-300">
                      <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 px-3 py-2">
                        <span className="text-xs font-semibold text-gray-700"></span>
                        <span className="text-xs font-semibold text-gray-700">TICKET NO</span>
                        <span className="text-xs font-semibold text-gray-700">CATEGORY</span>
                        <span className="text-xs font-semibold text-gray-700">PROBLEM</span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {excludedTickets.length > 0 ? (
                        excludedTickets.map((ticket, index) => (
                          <div 
                            key={ticket.id}
                            className={`grid grid-cols-[auto,1fr,1fr,1fr] gap-2 px-3 py-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              onChange={() => handleTransferToIncluded(ticket)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs text-gray-900">{ticket.id}</span>
                            <span className="text-xs text-gray-700">{ticket.category}</span>
                            <span className="text-xs text-gray-700 truncate">{ticket.title}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-8 text-center text-gray-500 text-xs">
                          No excluded tickets
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* INCLUDED Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Included</h4>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 border-b border-gray-300">
                      <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 px-3 py-2">
                        <span className="text-xs font-semibold text-gray-700"></span>
                        <span className="text-xs font-semibold text-gray-700">TICKET NO</span>
                        <span className="text-xs font-semibold text-gray-700">CATEGORY</span>
                        <span className="text-xs font-semibold text-gray-700">PROBLEM</span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {includedTickets.length > 0 ? (
                        includedTickets.map((ticket, index) => (
                          <div 
                            key={ticket.id}
                            className={`grid grid-cols-[auto,1fr,1fr,1fr] gap-2 px-3 py-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked
                              onChange={() => handleTransferToExcluded(ticket)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs text-gray-900">{ticket.id}</span>
                            <span className="text-xs text-gray-700">{ticket.category}</span>
                            <span className="text-xs text-gray-700 truncate">{ticket.title}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-8 text-center text-gray-500 text-xs">
                          No included tickets
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Arrows - Optional, can be removed since checkboxes handle transfers */}
              <div className="flex justify-center mt-6">
                <div className="text-xs text-gray-500 text-center">
                  <p>Check boxes to transfer tickets between sections</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm text-gray-700"
              >
                Close
              </button>
              <button 
                onClick={() => handleMaintenancePrint && handleMaintenancePrint()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Maintenance Print Component */}
      <div style={{ display: 'none' }}>
        {selectedMaintenanceMonth && (
          <MaintenancePrint 
            ref={maintenancePrintRef}
            month={getMonthName(selectedMaintenanceMonth.month)}
            year={selectedMaintenanceMonth.year}
            includedTickets={includedTickets}
            users={users}
          />
        )}
      </div>
    </div>
  );
};
