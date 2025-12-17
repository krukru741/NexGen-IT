import React from 'react';
import { Ticket, TicketStatus, TicketPriority, User, UserRole } from '../types';
import { Search, Filter, ChevronRight, CheckCircle, XCircle, AlertOctagon, UserPlus, MoreHorizontal } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { useAuth, useTickets } from '../hooks';
import { useNavigate } from 'react-router-dom';

export const TicketList: React.FC = () => {
  const { currentUser } = useAuth();
  const { tickets: allTickets, updateTicket } = useTickets();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  // Safety check
  if (!currentUser) {
    return null;
  }

  // Filter tickets for current user
  const userTickets = React.useMemo(() => {
    if (!allTickets || !Array.isArray(allTickets)) {
      return [];
    }
    return allTickets.filter(t => t.requesterId === currentUser.id);
  }, [allTickets, currentUser.id]);

  const filteredTickets = React.useMemo(() => {
    return userTickets.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [userTickets, searchTerm, statusFilter]);

  const handleQuickAction = (e: React.MouseEvent, ticket: Ticket, action: 'CLAIM' | 'RESOLVE' | 'CLOSE' | 'ESCALATE') => {
    e.stopPropagation(); // Prevent row click

    let updates: Partial<Ticket> = {};
    let logMessage = '';

    switch (action) {
      case 'CLAIM':
        updates = { 
          assignedToId: currentUser.id, 
          assignedToName: currentUser.name, 
          status: TicketStatus.IN_PROGRESS 
        };
        logMessage = `Ticket claimed by ${currentUser.name}`;
        break;
      case 'RESOLVE':
        updates = { status: TicketStatus.RESOLVED };
        logMessage = `Ticket marked as Resolved by ${currentUser.name}`;
        break;
      case 'CLOSE':
        updates = { status: TicketStatus.CLOSED };
        logMessage = `Ticket closed/rejected by ${currentUser.name}`;
        break;
      case 'ESCALATE':
        updates = { priority: TicketPriority.CRITICAL };
        logMessage = `Ticket escalated to CRITICAL by ${currentUser.name}`;
        break;
    }

    // Update ticket
    updateTicket(ticket.id, updates);
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return 'bg-blue-100 text-blue-800 border-blue-200';
      case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TicketStatus.RESOLVED: return 'bg-green-100 text-green-800 border-green-200';
      case TicketStatus.CLOSED: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.CRITICAL: return 'text-red-600 font-bold';
      case TicketPriority.HIGH: return 'text-orange-600 font-semibold';
      case TicketPriority.MEDIUM: return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  const canManage = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.TECHNICIAN;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">My Tickets</h2>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <select 
                className="pl-9 pr-8 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-0">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-gray-800 text-white sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 font-bold uppercase border border-gray-600">Ticket Details</th>
              <th className="px-3 py-2 font-bold uppercase border border-gray-600 hidden md:table-cell">Requester</th>
              <th className="px-3 py-2 font-bold uppercase border border-gray-600 hidden md:table-cell">Priority</th>
              <th className="px-3 py-2 font-bold uppercase border border-gray-600">Status</th>
              {canManage && <th className="px-3 py-2 font-bold uppercase border border-gray-600 text-right">Quick Actions</th>}
              <th className="px-3 py-2 font-bold uppercase border border-gray-600 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTickets.map((ticket, index) => (
              <tr 
                key={ticket.id} 
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className={`hover:bg-blue-50 cursor-pointer transition-colors group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-2 border border-gray-300">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 group-hover:text-blue-600 truncate max-w-xs">{ticket.title}</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">#{ticket.id} • {ticket.category} • {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-3 py-2 border border-gray-300 text-gray-700 hidden md:table-cell">
                  {ticket.requesterName}
                </td>
                <td className="px-3 py-2 border border-gray-300 hidden md:table-cell">
                  <span className={`font-bold uppercase ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-3 py-2 border border-gray-300">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                
                {canManage && (
                  <td className="px-3 py-2 border border-gray-300 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Claim Button */}
                      {ticket.status === TicketStatus.OPEN && (
                         <button 
                            onClick={(e) => handleQuickAction(e, ticket, 'CLAIM')}
                            className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                            title="Claim Ticket"
                         >
                           <UserPlus className="w-3.5 h-3.5" />
                         </button>
                      )}
                      
                      {/* Resolve Button */}
                      {(ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS) && (
                         <button 
                            onClick={(e) => handleQuickAction(e, ticket, 'RESOLVE')}
                            className="p-1 text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
                            title="Quick Resolve"
                         >
                           <CheckCircle className="w-3.5 h-3.5" />
                         </button>
                      )}

                      {/* Escalate Button */}
                      {ticket.priority !== TicketPriority.CRITICAL && ticket.status !== TicketStatus.CLOSED && (
                          <button 
                            onClick={(e) => handleQuickAction(e, ticket, 'ESCALATE')}
                            className="p-1 text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded transition-colors"
                            title="Escalate Priority"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>
                      )}

                      {/* Reject/Close Button */}
                      {ticket.status !== TicketStatus.CLOSED && ticket.status !== TicketStatus.RESOLVED && (
                          <button 
                            onClick={(e) => handleQuickAction(e, ticket, 'CLOSE')}
                            className="p-1 text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded transition-colors"
                            title="Reject/Close"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                      )}
                    </div>
                  </td>
                )}

                <td className="px-3 py-2 border border-gray-300 text-center w-10">
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={canManage ? 6 : 5} className="px-6 py-12 text-center text-gray-500 border border-gray-300">
                  No tickets found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};