import React from 'react';
import { Card, Input } from '../ui';
import { Ticket, TicketStatus, UserRole } from '../../types';

interface TicketInfoProps {
  ticket: Ticket;
  problems: string;
  troubleshoot: string;
  remarks: string;
  isEditingVerified: boolean;
  currentUserRole: UserRole;
  onProblemsChange: (value: string) => void;
  onTroubleshootChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
  onSave: () => void;
}

export const TicketInfo: React.FC<TicketInfoProps> = ({
  ticket,
  problems,
  troubleshoot,
  remarks,
  isEditingVerified,
  currentUserRole,
  onProblemsChange,
  onTroubleshootChange,
  onRemarksChange,
  onSave,
}) => {
  const isVerified = ticket.status === TicketStatus.VERIFIED;
  const canEdit = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.TECHNICIAN;
  const isEditable = canEdit && (!isVerified || isEditingVerified);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ticket Details */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Ticket Details</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{ticket.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <p className="text-sm text-gray-600">{ticket.category}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Requester</label>
              <p className="text-sm text-gray-600">{ticket.requesterName}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned To</label>
              <p className="text-sm text-gray-600">{ticket.assignedToName || 'Unassigned'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Updated</label>
              <p className="text-sm text-gray-600">{new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Technical Details */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Technical Details</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Problems/Issues {isVerified && !isEditingVerified && <span className="text-xs text-gray-500">(Locked)</span>}
            </label>
            {isEditable ? (
              <textarea
                value={problems}
                onChange={(e) => onProblemsChange(e.target.value)}
                onBlur={onSave}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={3}
                placeholder="Describe the problems encountered..."
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{problems || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Troubleshooting Steps {isVerified && !isEditingVerified && <span className="text-xs text-gray-500">(Locked)</span>}
            </label>
            {isEditable ? (
              <textarea
                value={troubleshoot}
                onChange={(e) => onTroubleshootChange(e.target.value)}
                onBlur={onSave}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={3}
                placeholder="Document troubleshooting steps taken..."
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{troubleshoot || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remarks {isVerified && !isEditingVerified && <span className="text-xs text-gray-500">(Locked)</span>}
            </label>
            {isEditable ? (
              <textarea
                value={remarks}
                onChange={(e) => onRemarksChange(e.target.value)}
                onBlur={onSave}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={2}
                placeholder="Additional remarks..."
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{remarks || 'No remarks'}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
