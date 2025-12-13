import React, { useState, useRef } from 'react';
import { FileText, Wrench, Target } from 'lucide-react';
import { Ticket } from '../types';
import { db } from '../services/mockDatabase';
import { useReactToPrint } from 'react-to-print';
import TicketPrint from './TicketPrint';
import { useAuth } from '../hooks';
import { Tabs } from './ui';
import { TicketReportTab } from './reports/TicketReportTab';
import { MaintenanceReportTab } from './reports/MaintenanceReportTab';
import { QualityReportTab } from './reports/QualityReportTab';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!currentUser) {
    return null;
  }

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
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const tabs = [
    {
      id: 'tickets',
      label: 'Ticket Reports',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <TicketReportTab
          tickets={tickets}
          users={users}
          onTicketDoubleClick={handleTicketDoubleClick}
        />
      ),
    },
    {
      id: 'maintenance',
      label: 'Preventive Maintenance',
      icon: <Wrench className="w-4 h-4" />,
      content: <MaintenanceReportTab tickets={tickets} />,
    },
    {
      id: 'quality',
      label: 'Quality Objectives',
      icon: <Target className="w-4 h-4" />,
      content: <QualityReportTab tickets={tickets} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Print & Reports</h2>
          <p className="text-gray-500">Generate and export system reports</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="tickets" />

      {/* Hidden Ticket Print Component */}
      <div style={{ display: 'none' }}>
        {selectedTicket && (
          <TicketPrint ref={printRef} ticket={selectedTicket} />
        )}
      </div>
    </div>
  );
};
