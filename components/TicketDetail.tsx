import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TicketLog, TicketStatus } from '../types';
import { db } from '../services/mockDatabase';
import { suggestSolution } from '../services/geminiService';
import { useAuth, useTickets } from '../hooks';
import { ConfirmDialog } from './ui';
import { TicketHeader } from './ticket-detail/TicketHeader';
import { TicketActions } from './ticket-detail/TicketActions';
import { TicketInfo } from './ticket-detail/TicketInfo';
import { TicketComments } from './ticket-detail/TicketComments';

export const TicketDetail: React.FC = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const { currentUser } = useAuth();
  const { tickets, updateTicket, deleteTicket } = useTickets();

  const ticket = tickets.find(t => t.id === ticketId);

  const [logs, setLogs] = React.useState<TicketLog[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [aiSuggestion, setAiSuggestion] = React.useState<string | null>(null);
  const [isGettingSuggestion, setIsGettingSuggestion] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = React.useState(false);
  const [problems, setProblems] = React.useState(ticket?.problems || '');
  const [troubleshoot, setTroubleshoot] = React.useState(ticket?.troubleshoot || '');
  const [remarks, setRemarks] = React.useState(ticket?.remarks || '');
  const [isEditingVerified, setIsEditingVerified] = React.useState(false);

  useEffect(() => {
    if (ticket) {
      setLogs(db.getLogs(ticket.id));
      setAiSuggestion(null);
      setProblems(ticket.problems || '');
      setTroubleshoot(ticket.troubleshoot || '');
      setRemarks(ticket.remarks || '');
    }
  }, [ticket?.id, ticket?.problems, ticket?.troubleshoot, ticket?.remarks]);

  if (!currentUser || !ticket) {
    return (
      <div className="p-8 text-center text-gray-500">
        {!ticket ? 'Ticket not found.' : 'Loading...'}
      </div>
    );
  }

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newComment,
      type: 'COMMENT'
    });
    
    setLogs([...logs, log]);
    setNewComment('');
  };

  const handleStatusChange = (newStatus: TicketStatus, message: string) => {
    const updated = db.updateTicket(ticket.id, { status: newStatus });
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message,
      type: 'STATUS_CHANGE'
    });
    
    setLogs([...logs, log]);
    updateTicket(updated.id, updated);
  };

  const handleGetAiHelp = async () => {
    setIsGettingSuggestion(true);
    const suggestion = await suggestSolution(ticket.description, logs.map(l => l.message));
    setAiSuggestion(suggestion);
    setIsGettingSuggestion(false);
  };

  const handleGetTicket = () => {
    try {
      const updated = db.updateTicket(ticket.id, {
        assignedToId: currentUser.id,
        assignedToName: currentUser.name,
        status: TicketStatus.IN_PROGRESS
      });
      
      const log = db.addLog({
        ticketId: ticket.id,
        userId: currentUser.id,
        userName: currentUser.name,
        message: `Ticket assigned to ${currentUser.name}`,
        type: 'SYSTEM'
      });
      
      setLogs([...logs, log]);
      updateTicket(updated.id, updated);
    } catch (error) {
      console.error('Error claiming ticket:', error);
      alert('Failed to claim ticket. It may have been deleted or is invalid.');
      navigate('/my-tickets');
    }
  };

  const handleResolve = () => {
    handleStatusChange(TicketStatus.RESOLVED, `Ticket marked as Resolved by ${currentUser.name}`);
  };

  const handleVerify = () => {
    handleStatusChange(TicketStatus.VERIFIED, `Ticket verified by ${currentUser.name}`);
  };

  const handleRejectTicket = () => {
    handleStatusChange(TicketStatus.CLOSED, `Ticket rejected by ${currentUser.name}`);
    setShowRejectConfirm(false);
  };

  const handleDeleteTicket = () => {
    deleteTicket(ticket.id);
    setShowDeleteConfirm(false);
    navigate(-1);
  };

  const handleSaveDetails = () => {
    db.updateTicket(ticket.id, {
      problems,
      troubleshoot,
      remarks
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TicketHeader
        ticket={ticket}
        currentUserRole={currentUser.role}
        onBack={() => navigate(-1)}
      />

      <TicketActions
        ticket={ticket}
        currentUser={currentUser}
        isEditingVerified={isEditingVerified}
        onGetTicket={handleGetTicket}
        onResolve={handleResolve}
        onVerify={handleVerify}
        onReject={() => setShowRejectConfirm(true)}
        onDelete={() => setShowDeleteConfirm(true)}
        onToggleEdit={() => setIsEditingVerified(!isEditingVerified)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <TicketInfo
            ticket={ticket}
            problems={problems}
            troubleshoot={troubleshoot}
            remarks={remarks}
            isEditingVerified={isEditingVerified}
            currentUserRole={currentUser.role}
            onProblemsChange={setProblems}
            onTroubleshootChange={setTroubleshoot}
            onRemarksChange={setRemarks}
            onSave={handleSaveDetails}
          />

          <TicketComments
            logs={logs}
            newComment={newComment}
            aiSuggestion={aiSuggestion}
            isGettingSuggestion={isGettingSuggestion}
            onCommentChange={setNewComment}
            onPostComment={handlePostComment}
            onGetAiHelp={handleGetAiHelp}
          />
        </div>
      </div>

      {/* Reject Confirmation */}
      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleRejectTicket}
        title="Reject Ticket?"
        message="Are you sure you want to reject this ticket? This will close the ticket and mark it as rejected."
        variant="warning"
        confirmText="Reject Ticket"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTicket}
        title="Delete Ticket?"
        message={`Are you sure you want to delete this ticket? This action cannot be undone. Ticket #${ticket.id} - ${ticket.title}`}
        variant="danger"
        confirmText="Delete Permanently"
      />
    </div>
  );
};
