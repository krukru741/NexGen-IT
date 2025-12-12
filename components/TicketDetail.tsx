import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TicketLog, UserRole, TicketStatus } from '../types';
import { db } from '../services/mockDatabase';
import { suggestSolution } from '../services/geminiService';
import { Send, Lightbulb, Loader2, ArrowLeft, FileText, Image as ImageIcon, Download, X, UserPlus, XCircle, Trash2, CheckCircle } from 'lucide-react';
import { usePermission } from '../contexts/PermissionContext';
import { useAuth, useTickets } from '../hooks';

export const TicketDetail: React.FC = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const { currentUser } = useAuth();
  const { tickets, updateTicket, deleteTicket } = useTickets();

  const ticket = tickets.find(t => t.id === ticketId);

  if (!currentUser || !ticket) {
    return (
      <div className="p-8 text-center text-gray-500">
        {!ticket ? 'Ticket not found.' : 'Loading...'}
      </div>
    );
  }

  const onClose = () => navigate(-1);
  const onUpdate = (updatedTicket: any) => {
    updateTicket(updatedTicket.id, updatedTicket);
  };
  const { hasPermission } = usePermission();
  const [logs, setLogs] = React.useState<TicketLog[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [aiSuggestion, setAiSuggestion] = React.useState<string | null>(null);
  const [isGettingSuggestion, setIsGettingSuggestion] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = React.useState(false);
  const [problems, setProblems] = React.useState(ticket.problems || '');
  const [troubleshoot, setTroubleshoot] = React.useState(ticket.troubleshoot || '');
  const [remarks, setRemarks] = React.useState(ticket.remarks || '');
  const [isEditingVerified, setIsEditingVerified] = React.useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(db.getLogs(ticket.id));
    setAiSuggestion(null);
    setProblems(ticket.problems || '');
    setTroubleshoot(ticket.troubleshoot || '');
    setRemarks(ticket.remarks || '');
  }, [ticket.id, ticket.problems, ticket.troubleshoot, ticket.remarks]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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

  const handleStatusChange = (newStatus: TicketStatus) => {
    const updated = db.updateTicket(ticket.id, { status: newStatus });
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: `Changed status to ${newStatus}`,
      type: 'STATUS_CHANGE'
    });
    
    setLogs([...logs, log]);
    onUpdate(updated);
  };

  const handleGetAiHelp = async () => {
    setIsGettingSuggestion(true);
    const suggestion = await suggestSolution(ticket.description, logs.map(l => l.message));
    setAiSuggestion(suggestion);
    setIsGettingSuggestion(false);
  };

  const handleGetTicket = () => {
    const updated = db.updateTicket(ticket.id, {
      assignedToId: currentUser.id,
      assignedToName: currentUser.name,
      status: TicketStatus.IN_PROGRESS
    });
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: `Assigned ticket to ${currentUser.name} and marked as In Progress`,
      type: 'STATUS_CHANGE'
    });
    
    setLogs([...logs, log]);
    onUpdate(updated);
  };

  const handleRejectTicket = () => {
    const updated = db.updateTicket(ticket.id, {
      status: 'CLOSED' as TicketStatus
    });
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: 'Ticket rejected and closed',
      type: 'STATUS_CHANGE'
    });
    
    setLogs([...logs, log]);
    onUpdate(updated);
    setShowRejectConfirm(false);
  };

  const handleDeleteTicket = () => {
    // Delete the ticket from the database
    const deleted = db.deleteTicket(ticket.id);
    
    if (deleted) {
      setShowDeleteConfirm(false);
      // Force refresh by getting updated tickets from database
      window.location.reload(); // Reload to refresh the ticket list
    } else {
      alert('Failed to delete ticket. Please try again.');
    }
  };

  const handleSaveProblems = () => {
    const updated = db.updateTicket(ticket.id, { problems });
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: 'Updated Problems section',
      type: 'SYSTEM'
    });
    
    setLogs([...logs, log]);
    onUpdate(updated);
  };

  const handleSaveTroubleshoot = () => {
    const updated = db.updateTicket(ticket.id, { troubleshoot });
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: 'Updated Troubleshoot Steps',
      type: 'SYSTEM'
    });
    
    setLogs([...logs, log]);
    onUpdate(updated);
  };

  const handleSaveRemarks = () => {
    const updated = db.updateTicket(ticket.id, { remarks });
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: 'Updated Technician Remarks',
      type: 'SYSTEM'
    });
    
    setLogs([...logs, log]);
    onUpdate(updated);
  };

  const handleVerifyTicket = () => {
    const updated = db.updateTicket(ticket.id, {
      status: TicketStatus.VERIFIED
    });
    
    const log = db.addLog({
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      message: 'Employee verified the resolution',
      type: 'STATUS_CHANGE'
    });
    
    setLogs([...logs, log]);
    onUpdate(updated);
  };

  // Permissions
  const canEdit = hasPermission(currentUser.role, 'edit_ticket');
  const canAssign = hasPermission(currentUser.role, 'assign_ticket');
  const canDelete = hasPermission(currentUser.role, 'delete_ticket');
  
  const isRequester = ticket.requesterId === currentUser.id;
  const canVerify = isRequester && ticket.status === TicketStatus.RESOLVED;
  
  // Fields are only editable if:
  // 1. Ticket is assigned to current user (they clicked GET)
  // 2. Ticket is not VERIFIED (locked state) OR user is editing a verified ticket
  const isFieldsEditable = ticket.assignedToId === currentUser.id && (ticket.status !== TicketStatus.VERIFIED || isEditingVerified);

  const isImageFile = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'file';
  };

  return (
    <div className="bg-white h-[calc(100vh-100px)] flex flex-col">
      {/* Compact Header */}
      <div className="bg-blue-900 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 hover:bg-blue-800 rounded transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold uppercase tracking-wide">Ticket Details</h2>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleGetTicket}
              disabled={
                ticket.assignedToId === currentUser.id || 
                (currentUser.role === UserRole.TECHNICIAN && ticket.requesterId === currentUser.id) ||
                ticket.status === TicketStatus.VERIFIED
              }
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                ticket.status === TicketStatus.VERIFIED
                  ? "Cannot reassign verified tickets"
                  : currentUser.role === UserRole.TECHNICIAN && ticket.requesterId === currentUser.id 
                    ? "You cannot assign your own tickets to yourself" 
                    : "Assign ticket to me"
              }
            >
              <UserPlus className="w-3 h-3" />
              GET
            </button>
            <button
              onClick={() => setShowRejectConfirm(true)}
              disabled={currentUser.role === UserRole.TECHNICIAN && ticket.requesterId === currentUser.id || ticket.status === TicketStatus.VERIFIED}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                ticket.status === TicketStatus.VERIFIED 
                  ? "Cannot reject verified tickets" 
                  : currentUser.role === UserRole.TECHNICIAN && ticket.requesterId === currentUser.id 
                    ? "You cannot reject your own tickets" 
                    : "Reject ticket"
              }
            >
              <XCircle className="w-3 h-3" />
              REJECT
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={currentUser.role === UserRole.TECHNICIAN && ticket.requesterId === currentUser.id}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={currentUser.role === UserRole.TECHNICIAN && ticket.requesterId === currentUser.id ? "You cannot delete your own tickets" : "Delete ticket"}
            >
              <Trash2 className="w-3 h-3" />
              DELETE
            </button>
            {ticket.status === TicketStatus.VERIFIED && currentUser.role === UserRole.ADMIN && (
              <button
                onClick={() => setIsEditingVerified(!isEditingVerified)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  isEditingVerified 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                title={isEditingVerified ? "Lock verified ticket" : "Unlock verified ticket for editing"}
              >
                <FileText className="w-3 h-3" />
                {isEditingVerified ? 'LOCK' : 'UPDATE'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4">
          {/* Compact Form Grid - 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3">
            {/* Row 1 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ticket No</label>
              <input
                type="text"
                value={ticket.id}
                readOnly
                className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <input
                type="text"
                value={ticket.category}
                readOnly
                className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
              <input
                type="text"
                value={ticket.priority}
                readOnly
                className={`w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-semibold ${
                  ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-700' :
                  ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-700' :
                  ticket.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-gray-50 text-gray-700'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
              {canEdit ? (
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  disabled={currentUser.role === UserRole.TECHNICIAN && ticket.requesterId === currentUser.id || ticket.status === TicketStatus.VERIFIED}
                  className={`w-full px-2 py-1.5 border-2 rounded text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                    ticket.status === 'OPEN' ? 'border-blue-400 bg-blue-50 text-blue-700' :
                    ticket.status === 'IN_PROGRESS' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' :
                    ticket.status === 'RESOLVED' ? 'border-green-400 bg-green-50 text-green-700' :
                    ticket.status === 'VERIFIED' ? 'border-green-600 bg-green-100 text-green-800' :
                    'border-gray-400 bg-gray-50 text-gray-700'
                  }`}
                >
                  {Object.values(TicketStatus).map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={ticket.status.replace('_', ' ')}
                  readOnly
                  className={`w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-semibold ${
                    ticket.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'RESOLVED' ? 'bg-green-50 text-green-700' :
                    'bg-gray-50'
                  }`}
                />
              )}
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Requester</label>
              <input
                type="text"
                value={ticket.requesterName}
                readOnly
                className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned To</label>
              <input
                type="text"
                value={ticket.assignedToName || 'Unassigned'}
                readOnly
                className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date Created</label>
              <input
                type="text"
                value={new Date(ticket.createdAt).toLocaleDateString()}
                readOnly
                className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Last Updated</label>
              <input
                type="text"
                value={new Date(ticket.updatedAt).toLocaleDateString()}
                readOnly
                className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs"
              />
            </div>

            {/* Issue Title - Full Width */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Issue</label>
              <input
                type="text"
                value={ticket.title}
                readOnly
                className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs font-medium"
              />
            </div>

            {/* Description - Full Width */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea
                value={ticket.description}
                readOnly
                rows={3}
                className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs resize-none"
              />
            </div>

            {/* Problems - Full Width (Admin/Technician Only) */}
            {canEdit && (
              <div className="md:col-span-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-600">Problems</label>
                  <button
                    onClick={handleSaveProblems}
                    disabled={!isFieldsEditable}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
                <textarea
                  value={problems}
                  onChange={(e) => setProblems(e.target.value)}
                  disabled={!isFieldsEditable}
                  rows={3}
                  placeholder="Enter problems identified..."
                  className="w-full px-2 py-1.5 border-2 border-orange-300 rounded bg-white text-xs resize-none focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            )}

            {/* Troubleshoot - Full Width (Admin/Technician Only) */}
            {canEdit && (
              <div className="md:col-span-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-600">Troubleshoot Steps</label>
                  <button
                    onClick={handleSaveTroubleshoot}
                    disabled={!isFieldsEditable}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
                <textarea
                  value={troubleshoot}
                  onChange={(e) => setTroubleshoot(e.target.value)}
                  disabled={!isFieldsEditable}
                  rows={3}
                  placeholder="Enter troubleshooting steps taken..."
                  className="w-full px-2 py-1.5 border-2 border-blue-300 rounded bg-white text-xs resize-none focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            )}

            {/* Remarks - Full Width (Admin/Technician Only) */}
            {canEdit && (
              <div className="md:col-span-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-600">Technician Remarks</label>
                  <button
                    onClick={handleSaveRemarks}
                    disabled={!isFieldsEditable}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={!isFieldsEditable}
                  rows={3}
                  placeholder="Enter additional remarks or notes..."
                  className="w-full px-2 py-1.5 border-2 border-blue-300 rounded bg-white text-xs resize-none focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            )}

            {/* Attachments - Full Width */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Attachments</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ticket.attachments.map((url, index) => (
                    <div key={index} className="relative group">
                      {isImageFile(url) ? (
                        <div 
                          className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors relative"
                          onClick={() => setSelectedImage(url)}
                        >
                          <img 
                            src={url} 
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                              <ImageIcon className="w-8 h-8 text-white" />
                              <span className="text-white text-xs font-semibold bg-blue-600 px-2 py-1 rounded">Preview</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <a
                          href={url}
                          download
                          className="aspect-square rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center p-2 text-center"
                        >
                          <FileText className="w-8 h-8 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-600 truncate w-full">{getFileName(url)}</span>
                          <Download className="w-3 h-3 text-gray-400 mt-1" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remarks - Full Width */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Activity Log</label>
              <div className="border border-gray-300 rounded bg-gray-50 p-2 max-h-40 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className={`text-xs p-2 rounded ${
                        log.type === 'STATUS_CHANGE' 
                          ? 'bg-yellow-50 border border-yellow-200' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="font-bold text-gray-900">{log.userName}</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{log.message}</p>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Comment Section */}
          <div className="mt-4 border-t-2 border-gray-200 pt-4">
            {/* Verification Button for Employees */}
            {canVerify && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-green-900 mb-1">Ticket Resolved</h4>
                    <p className="text-xs text-green-700">Has your issue been resolved? Please verify the solution.</p>
                  </div>
                  <button
                    onClick={handleVerifyTicket}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm shadow-md"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verify Resolution
                  </button>
                </div>
              </div>
            )}

            <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase">Add Comment / Update</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                disabled={!isFieldsEditable}
                placeholder="Type a message or update..."
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button 
                onClick={handlePostComment}
                disabled={!newComment.trim() || !isFieldsEditable}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size attachment"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reject Ticket?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to reject this ticket? This will close the ticket and mark it as rejected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectTicket}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
              >
                Reject Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Ticket?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete this ticket? <strong>This action cannot be undone.</strong>
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Ticket #{ticket.id} - {ticket.title}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTicket}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SparklesIcon = ({ className }: {className?: string}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
