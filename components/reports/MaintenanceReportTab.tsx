import React, { useState, useRef } from 'react';
import { Printer, Calendar, Plus, X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Ticket } from '../../types';
import { useReactToPrint } from 'react-to-print';
import MaintenancePrint from '../MaintenancePrint';
import { Button, Modal, Select, Card, Badge } from '../ui';

interface MaintenanceReportTabProps {
  tickets: Ticket[];
}

export const MaintenanceReportTab: React.FC<MaintenanceReportTabProps> = ({ tickets }) => {
  const maintenancePrintRef = useRef<HTMLDivElement>(null);
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth() + 1;
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

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem('maintenanceMonths', JSON.stringify(addedMonths));
  }, [addedMonths]);

  const handleMaintenancePrint = useReactToPrint({
    contentRef: maintenancePrintRef,
    documentTitle: selectedMaintenanceMonth 
      ? `Maintenance-${selectedMaintenanceMonth.month}-${selectedMaintenanceMonth.year}` 
      : 'Maintenance-Report',
  });

  const handleAddMonth = () => {
    const exists = addedMonths.some(m => m.month === selectedMonth && m.year === selectedYear);
    if (!exists) {
      setAddedMonths([...addedMonths, { month: selectedMonth, year: selectedYear }]);
    }
  };

  const handleRemoveMonth = (month: {month: string, year: string}) => {
    setAddedMonths(addedMonths.filter(m => !(m.month === month.month && m.year === month.year)));
  };

  const handleMonthDoubleClick = (month: {month: string, year: string}) => {
    setSelectedMaintenanceMonth(month);
    
    const monthNum = parseInt(month.month);
    const yearNum = parseInt(month.year);
    
    const ticketsInMonth = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      const ticketMonth = ticketDate.getMonth() + 1;
      const ticketYear = ticketDate.getFullYear();
      
      return ticketMonth === monthNum && ticketYear === yearNum;
    });
    
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

  const getMonthName = (monthNum: string) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthNum) - 1] || '';
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName((i + 1).toString())
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="space-y-6">
      {/* Month Selection */}
      <Card variant="bordered">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select
            label="Month"
            options={monthOptions}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <Select
            label="Year"
            options={yearOptions}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          />
          <Button onClick={handleAddMonth} icon={<Plus className="w-4 h-4" />}>
            Add Month
          </Button>
        </div>
      </Card>

      {/* Added Months List */}
      <Card variant="bordered">
        <h3 className="text-lg font-semibold mb-4">Maintenance Reports</h3>
        {addedMonths.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No months added yet. Add a month to generate reports.</p>
        ) : (
          <div className="space-y-2">
            {addedMonths.map((month, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onDoubleClick={() => handleMonthDoubleClick(month)}
              >
                <span className="font-medium">
                  {getMonthName(month.month)} {month.year}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMonth(month);
                  }}
                  icon={<X className="w-4 h-4" />}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        {addedMonths.length > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            <span className="font-semibold">Tip:</span> Double-click any month to configure and print
          </p>
        )}
      </Card>

      {/* Maintenance Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title={`Maintenance Report - ${selectedMaintenanceMonth ? `${getMonthName(selectedMaintenanceMonth.month)} ${selectedMaintenanceMonth.year}` : ''}`}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowMaintenanceModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleMaintenancePrint()} icon={<Printer className="w-4 h-4" />}>
              Print Report
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-6 h-[500px]">
          {/* Excluded Section */}
          <div className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Available Tickets</h4>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{excludedTickets.length}</span>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
              {excludedTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <Check className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-500">All tickets included</p>
                </div>
              ) : (
                excludedTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => handleTransferToIncluded(ticket)}
                    className="group bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-green-300 hover:shadow-md transition-all flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-500">#{ticket.id}</span>
                        <Badge variant="status" value={ticket.status} size="sm" />
                      </div>
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">{ticket.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">{ticket.requesterName}</p>
                    </div>
                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Included Section */}
          <div className="flex flex-col h-full bg-blue-50/50 rounded-xl border border-blue-100 overflow-hidden">
            <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Included in Report</h4>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{includedTickets.length}</span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
              {includedTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Plus className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs font-medium text-blue-800">No tickets selected</p>
                </div>
              ) : (
                includedTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => handleTransferToExcluded(ticket)}
                    className="group bg-white p-3 rounded-lg border border-blue-200 shadow-sm cursor-pointer hover:border-red-300 hover:shadow-md transition-all flex items-start gap-3"
                  >
                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity order-first">
                      <div className="w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-blue-600">#{ticket.id}</span>
                        <Badge variant="status" value={ticket.status} size="sm" />
                      </div>
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">{ticket.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">{ticket.requesterName}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        {selectedMaintenanceMonth && (
          <MaintenancePrint 
            ref={maintenancePrintRef}
            month={selectedMaintenanceMonth.month}
            year={selectedMaintenanceMonth.year}
            includedTickets={includedTickets}
          />
        )}
      </div>
    </div>
  );
};
