import React, { useState, useRef } from 'react';
import { Printer, Calendar, Plus, X } from 'lucide-react';
import { Ticket } from '../../types';
import { useReactToPrint } from 'react-to-print';
import MaintenancePrint from '../MaintenancePrint';
import { Button, Modal, Select, Card } from '../ui';

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
      
      return ticketMonth === monthNum && ticketYear === yearNum && ticket.category === 'PREVENTIVE_MAINTENANCE';
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Excluded Tickets</h4>
            <div className="border rounded-lg p-2 max-h-96 overflow-y-auto">
              {excludedTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="p-2 mb-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => handleTransferToIncluded(ticket)}
                >
                  <div className="text-sm font-medium">{ticket.id}</div>
                  <div className="text-xs text-gray-600 truncate">{ticket.title}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Included Tickets ({includedTickets.length})</h4>
            <div className="border rounded-lg p-2 max-h-96 overflow-y-auto">
              {includedTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="p-2 mb-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100"
                  onClick={() => handleTransferToExcluded(ticket)}
                >
                  <div className="text-sm font-medium">{ticket.id}</div>
                  <div className="text-xs text-gray-600 truncate">{ticket.title}</div>
                </div>
              ))}
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
