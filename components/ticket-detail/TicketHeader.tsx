import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Ticket, UserRole } from '../../types';
import { Badge, Button } from '../ui';

interface TicketHeaderProps {
  ticket: Ticket;
  currentUserRole: UserRole;
  onBack: () => void;
}

export const TicketHeader: React.FC<TicketHeaderProps> = ({ ticket, currentUserRole, onBack }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
              <Badge variant="status" value={ticket.status} />
              <Badge variant="priority" value={ticket.priority} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ticket #{ticket.id} • Created {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
