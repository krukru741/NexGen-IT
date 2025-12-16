import React from 'react';
import { UserPlus, XCircle, Trash2, FileText, CheckCircle } from 'lucide-react';
import { Ticket, UserRole, TicketStatus } from '../../types';
import { Button } from '../ui';

interface TicketActionsProps {
  ticket: Ticket;
  currentUser: { id: string; role: UserRole };
  isEditingVerified: boolean;
  onGetTicket: () => void;
  onResolve: () => void;
  onVerify: () => void;
  onReject: () => void;
  onDelete: () => void;
  onToggleEdit: () => void;
}

export const TicketActions: React.FC<TicketActionsProps> = ({
  ticket,
  currentUser,
  isEditingVerified,
  onGetTicket,
  onResolve,
  onVerify,
  onReject,
  onDelete,
  onToggleEdit,
}) => {
  const canManage = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TECHNICIAN;
  const isOwnTicket = ticket.requesterId === currentUser.id;
  const isRequester = currentUser.role === UserRole.EMPLOYEE && isOwnTicket;

  // Show verify button for employees on their own tickets, or for admins
  const canVerify = (ticket.status === TicketStatus.RESOLVED) && (isRequester || currentUser.role === UserRole.ADMIN);

  // If employee, only show verify button for their own resolved tickets
  if (currentUser.role === UserRole.EMPLOYEE) {
    if (!canVerify) return null;
    
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={onVerify}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            icon={<CheckCircle className="w-3 h-3" />}
          >
            VERIFY
          </Button>
        </div>
      </div>
    );
  }

  // Admin/Technician view - show all actions
  if (!canManage) return null;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Get Ticket */}
        {ticket.status === TicketStatus.OPEN && (
          <Button
            onClick={onGetTicket}
            disabled={isOwnTicket}
            size="sm"
            icon={<UserPlus className="w-3 h-3" />}
            title={isOwnTicket ? "You cannot assign your own tickets to yourself" : "Assign ticket to me"}
          >
            GET
          </Button>
        )}

        {/* Resolve */}
        {(ticket.status === TicketStatus.IN_PROGRESS || ticket.status === TicketStatus.OPEN) && (
          <Button
            onClick={onResolve}
            disabled={isOwnTicket}
            size="sm"
            variant="secondary"
            icon={<CheckCircle className="w-3 h-3" />}
            title={isOwnTicket ? "You cannot resolve your own tickets" : "Mark as resolved"}
          >
            RESOLVE
          </Button>
        )}

        {/* Verify */}
        {canVerify && (
          <Button
            onClick={onVerify}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            icon={<CheckCircle className="w-3 h-3" />}
          >
            VERIFY
          </Button>
        )}

        {/* Reject */}
        <Button
          onClick={onReject}
          disabled={isOwnTicket || ticket.status === TicketStatus.VERIFIED}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700"
          icon={<XCircle className="w-3 h-3" />}
          title={
            ticket.status === TicketStatus.VERIFIED
              ? "Cannot reject verified tickets"
              : isOwnTicket
              ? "You cannot reject your own tickets"
              : "Reject ticket"
          }
        >
          REJECT
        </Button>

        {/* Delete */}
        <Button
          onClick={onDelete}
          disabled={isOwnTicket}
          size="sm"
          variant="danger"
          icon={<Trash2 className="w-3 h-3" />}
          title={isOwnTicket ? "You cannot delete your own tickets" : "Delete ticket"}
        >
          DELETE
        </Button>

        {/* Edit Verified (Admin only) */}
        {ticket.status === TicketStatus.VERIFIED && currentUser.role === UserRole.ADMIN && (
          <Button
            onClick={onToggleEdit}
            size="sm"
            className={isEditingVerified ? 'bg-gray-600 hover:bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}
            icon={<FileText className="w-3 h-3" />}
            title={isEditingVerified ? "Lock verified ticket" : "Unlock verified ticket for editing"}
          >
            {isEditingVerified ? 'LOCK' : 'UPDATE'}
          </Button>
        )}
      </div>
    </div>
  );
};
