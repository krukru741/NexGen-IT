import React, { useState, useRef } from 'react';
import { Printer, Plus, X } from 'lucide-react';
import { Ticket } from '../../types';
import { useReactToPrint } from 'react-to-print';
import { QOPrint } from '../QOPrint';
import { Button, Modal, Select, Card } from '../ui';

interface QualityReportTabProps {
  tickets: Ticket[];
}

export const QualityReportTab: React.FC<QualityReportTabProps> = ({ tickets }) => {
  const qoPrintRef = useRef<HTMLDivElement>(null);
  const qoHardwarePrintRef = useRef<HTMLDivElement>(null);
  const qoSoftwarePrintRef = useRef<HTMLDivElement>(null);
  
  const [qualitySelectedMonth, setQualitySelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth() + 1;
    return currentMonth.toString();
  });
  
  const [qualitySelectedYear, setQualitySelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });
  
  const [qualityAddedMonths, setQualityAddedMonths] = useState<Array<{month: string, year: string}>>(() => {
    const saved = localStorage.getItem('qualityMonths');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse quality months:', e);
      }
    }
    return [];
  });
  
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedQualityMonth, setSelectedQualityMonth] = useState<{month: string, year: string} | null>(null);
  const [qualityExcludedTickets, setQualityExcludedTickets] = useState<Ticket[]>([]);
  const [qualityIncludedTickets, setQualityIncludedTickets] = useState<Ticket[]>([]);

  React.useEffect(() => {
    localStorage.setItem('qualityMonths', JSON.stringify(qualityAddedMonths));
  }, [qualityAddedMonths]);

  const handleQualityPrint = useReactToPrint({
    contentRef: qoPrintRef,
    documentTitle: selectedQualityMonth 
      ? `Quality-${selectedQualityMonth.month}-${selectedQualityMonth.year}` 
      : 'Quality-Report',
  });

  const handleQualityHardwarePrint = useReactToPrint({
    contentRef: qoHardwarePrintRef,
    documentTitle: selectedQualityMonth 
      ? `Quality-Hardware-${selectedQualityMonth.month}-${selectedQualityMonth.year}` 
      : 'Quality-Hardware-Report',
  });

  const handleQualitySoftwarePrint = useReactToPrint({
    contentRef: qoSoftwarePrintRef,
    documentTitle: selectedQualityMonth 
      ? `Quality-Software-${selectedQualityMonth.month}-${selectedQualityMonth.year}` 
      : 'Quality-Software-Report',
  });

  const handleAddQualityMonth = () => {
    const exists = qualityAddedMonths.some(m => m.month === qualitySelectedMonth && m.year === qualitySelectedYear);
    if (!exists) {
      setQualityAddedMonths([...qualityAddedMonths, { month: qualitySelectedMonth, year: qualitySelectedYear }]);
    }
  };

  const handleRemoveQualityMonth = (month: {month: string, year: string}) => {
    setQualityAddedMonths(qualityAddedMonths.filter(m => !(m.month === month.month && m.year === month.year)));
  };

  const handleQualityMonthDoubleClick = (month: {month: string, year: string}) => {
    setSelectedQualityMonth(month);
    
    const monthNum = parseInt(month.month);
    const yearNum = parseInt(month.year);
    
    const ticketsInMonth = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      const ticketMonth = ticketDate.getMonth() + 1;
      const ticketYear = ticketDate.getFullYear();
      
      return ticketMonth === monthNum && ticketYear === yearNum;
    });
    
    setQualityExcludedTickets(ticketsInMonth);
    setQualityIncludedTickets([]);
    setShowQualityModal(true);
  };

  const handleQualityTransferToIncluded = (ticket: Ticket) => {
    setQualityExcludedTickets(qualityExcludedTickets.filter(t => t.id !== ticket.id));
    setQualityIncludedTickets([...qualityIncludedTickets, ticket]);
  };

  const handleQualityTransferToExcluded = (ticket: Ticket) => {
    setQualityIncludedTickets(qualityIncludedTickets.filter(t => t.id !== ticket.id));
    setQualityExcludedTickets([...qualityExcludedTickets, ticket]);
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
            value={qualitySelectedMonth}
            onChange={(e) => setQualitySelectedMonth(e.target.value)}
          />
          <Select
            label="Year"
            options={yearOptions}
            value={qualitySelectedYear}
            onChange={(e) => setQualitySelectedYear(e.target.value)}
          />
          <Button onClick={handleAddQualityMonth} icon={<Plus className="w-4 h-4" />}>
            Add Month
          </Button>
        </div>
      </Card>

      {/* Added Months List */}
      <Card variant="bordered">
        <h3 className="text-lg font-semibold mb-4">Quality Objectives Reports</h3>
        {qualityAddedMonths.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No months added yet. Add a month to generate reports.</p>
        ) : (
          <div className="space-y-2">
            {qualityAddedMonths.map((month, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onDoubleClick={() => handleQualityMonthDoubleClick(month)}
              >
                <span className="font-medium">
                  {getMonthName(month.month)} {month.year}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveQualityMonth(month);
                  }}
                  icon={<X className="w-4 h-4" />}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        {qualityAddedMonths.length > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            <span className="font-semibold">Tip:</span> Double-click any month to configure and print
          </p>
        )}
      </Card>

      {/* Quality Modal */}
      <Modal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        title={`Quality Objectives - ${selectedQualityMonth ? `${getMonthName(selectedQualityMonth.month)} ${selectedQualityMonth.year}` : ''}`}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowQualityModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleQualityPrint()} icon={<Printer className="w-4 h-4" />}>
              Print All
            </Button>
            <Button onClick={() => handleQualityHardwarePrint()} variant="secondary">
              Print Hardware
            </Button>
            <Button onClick={() => handleQualitySoftwarePrint()} variant="secondary">
              Print Software
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Excluded Tickets</h4>
            <div className="border rounded-lg p-2 max-h-96 overflow-y-auto">
              {qualityExcludedTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="p-2 mb-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => handleQualityTransferToIncluded(ticket)}
                >
                  <div className="text-sm font-medium">{ticket.id}</div>
                  <div className="text-xs text-gray-600 truncate">{ticket.title}</div>
                  <div className="text-xs text-gray-500">{ticket.category}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Included Tickets ({qualityIncludedTickets.length})</h4>
            <div className="border rounded-lg p-2 max-h-96 overflow-y-auto">
              {qualityIncludedTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="p-2 mb-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100"
                  onClick={() => handleQualityTransferToExcluded(ticket)}
                >
                  <div className="text-sm font-medium">{ticket.id}</div>
                  <div className="text-xs text-gray-600 truncate">{ticket.title}</div>
                  <div className="text-xs text-gray-500">{ticket.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Hidden Print Components */}
      <div style={{ display: 'none' }}>
        {selectedQualityMonth && (
          <>
            <QOPrint 
              ref={qoPrintRef}
              month={selectedQualityMonth.month}
              year={selectedQualityMonth.year}
              includedTickets={qualityIncludedTickets}
            />
            <QOPrint 
              ref={qoHardwarePrintRef}
              month={selectedQualityMonth.month}
              year={selectedQualityMonth.year}
              includedTickets={qualityIncludedTickets}
              category="HARDWARE"
            />
            <QOPrint 
              ref={qoSoftwarePrintRef}
              month={selectedQualityMonth.month}
              year={selectedQualityMonth.year}
              includedTickets={qualityIncludedTickets}
              category="SOFTWARE"
            />
          </>
        )}
      </div>
    </div>
  );
};
