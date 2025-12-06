import React, { useEffect, useRef } from 'react';
import { Ticket, TicketLog, User, UserRole, TicketStatus } from '../types';
import { db } from '../services/mockDatabase';
import { suggestSolution } from '../services/geminiService';
import { Send, User as UserIcon, Clock, AlertTriangle, CheckCircle, Lightbulb, Loader2, ArrowLeft } from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  currentUser: User;
  onClose: () => void;
  onUpdate: (updatedTicket: Ticket) => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, currentUser, onClose, onUpdate }) => {
  const [logs, setLogs] = React.useState<TicketLog[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [aiSuggestion, setAiSuggestion] = React.useState<string | null>(null);
  const [isGettingSuggestion, setIsGettingSuggestion] = React.useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(db.getLogs(ticket.id));
    setAiSuggestion(null);
  }, [ticket.id]);

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

  const canEdit = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TECHNICIAN;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
          <button onClick={onClose} className="mr-4 p-2 hover:bg-gray-200 rounded-full text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{ticket.title}</h2>
            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
              <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">#{ticket.id}</span>
              <span>{ticket.category}</span>
              <span>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {canEdit && (
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border"
            >
              {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {!canEdit && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 
              ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
            }`}>
              {ticket.status}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left: Ticket Info & Description */}
        <div className="md:w-1/3 p-6 border-r border-gray-100 overflow-y-auto bg-white">
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-xs font-semibold text-blue-800 uppercase mb-2">Requester</h3>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-3">
                  {ticket.requesterName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900">{ticket.requesterName}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Priority</span>
                  <span className={`font-medium ${
                    ticket.priority === 'CRITICAL' ? 'text-red-600' : 'text-gray-900'
                  }`}>{ticket.priority}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Assignee</span>
                  <span className="text-gray-900">{ticket.assignedToName || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {canEdit && (
               <div className="pt-4">
                  <button 
                    onClick={handleGetAiHelp}
                    disabled={isGettingSuggestion}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    {isGettingSuggestion ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                    Ask Gemini for Solution
                  </button>
                  {aiSuggestion && (
                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg animate-fade-in">
                      <h4 className="text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center">
                        <SparklesIcon className="w-3 h-3 mr-1" /> Gemini Suggestion
                      </h4>
                      <p className="text-sm text-indigo-900 italic">"{aiSuggestion}"</p>
                      <button 
                        onClick={() => setNewComment(aiSuggestion)}
                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 underline"
                      >
                        Use this response
                      </button>
                    </div>
                  )}
               </div>
            )}
          </div>
        </div>

        {/* Right: Activity Log */}
        <div className="md:w-2/3 flex flex-col bg-gray-50">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {logs.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No activity yet.</p>
              </div>
            )}
            {logs.map((log) => (
              <div key={log.id} className={`flex ${log.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${
                  log.type === 'STATUS_CHANGE' 
                    ? 'bg-gray-200 text-gray-600 text-xs italic text-center w-full mx-10'
                    : log.userId === currentUser.id 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  {log.type === 'COMMENT' && (
                    <div className="flex items-center justify-between mb-1 opacity-80 text-xs">
                       <span className="font-bold mr-2">{log.userName}</span>
                       <span>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  )}
                  <p className="text-sm">{log.message}</p>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                placeholder="Type a message or update..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button 
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = ({ className }: {className?: string}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
