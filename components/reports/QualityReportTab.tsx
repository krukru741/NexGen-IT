import React, { useState, useRef } from 'react';
import { Printer, Plus, X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Ticket } from '../../types';
import { useReactToPrint } from 'react-to-print';
import { QOPrint } from '../QOPrint';
import { Button, Modal, Select, Card, Badge } from '../ui';

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
          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={() => setShowQualityModal(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => handleQualityPrint()} icon={<Printer className="w-4 h-4" />}>
                Print All
              </Button>
              <div className="h-9 w-px bg-gray-200 mx-1"></div>
              <Button onClick={() => handleQualityHardwarePrint()} variant="secondary" size="sm">
                Hardware
              </Button>
              <Button onClick={() => handleQualitySoftwarePrint()} variant="secondary" size="sm">
                Software
              </Button>
            </div>
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
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{qualityExcludedTickets.length}</span>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
              {qualityExcludedTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <Check className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-500">All tickets included</p>
                </div>
              ) : (
                qualityExcludedTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => handleQualityTransferToIncluded(ticket)}
                    className="group bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-green-300 hover:shadow-md transition-all flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-500">#{ticket.id}</span>
                        <Badge variant="status" value={ticket.category} size="sm" className="bg-gray-100 text-gray-600 border-gray-200" />
                      </div>
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">{ticket.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="status" value={ticket.priority} size="sm" />
                        <span className="text-[10px] text-gray-400 border-l border-gray-200 pl-2">
                           {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
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
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{qualityIncludedTickets.length}</span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
              {qualityIncludedTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Plus className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs font-medium text-blue-800">No tickets selected</p>
                </div>
              ) : (
                qualityIncludedTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => handleQualityTransferToExcluded(ticket)}
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
                        <Badge variant="status" value={ticket.category} size="sm" className="bg-blue-50 text-blue-600 border-blue-100" />
                      </div>
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">{ticket.title}</p>
                       <div className="flex items-center gap-2 mt-1">
                        <Badge variant="status" value={ticket.priority} size="sm" />
                      </div>
                    </div>
                  </div>
                ))
              )}
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
