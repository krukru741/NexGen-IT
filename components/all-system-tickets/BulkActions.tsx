import React, { useState } from 'react';
import { Users, CheckSquare, X } from 'lucide-react';
import { User, TicketStatus } from '../../types';
import { Button, Modal } from '../ui';

interface BulkActionsProps {
  selectedCount: number;
  technicians: User[];
  onBulkAssign: (technicianId: string) => void;
  onBulkUpdateStatus: (status: TicketStatus) => void;
  onClearSelection: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  technicians,
  onBulkAssign,
  onBulkUpdateStatus,
  onClearSelection,
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);

  const handleAssign = (technicianId: string) => {
    onBulkAssign(technicianId);
    setShowAssignModal(false);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              {selectedCount} ticket{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<Users className="w-4 h-4" />}
              onClick={() => setShowAssignModal(true)}
            >
              Assign
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onBulkUpdateStatus(TicketStatus.IN_PROGRESS)}
            >
              Mark In Progress
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onBulkUpdateStatus(TicketStatus.RESOLVED)}
            >
              Mark Resolved
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Tickets"
        size="md"
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Select a technician to assign {selectedCount} ticket{selectedCount !== 1 ? 's' : ''} to:
          </p>
          <div className="space-y-2">
            {technicians.map(tech => (
              <button
                key={tech.id}
                onClick={() => handleAssign(tech.id)}
                className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{tech.role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};
