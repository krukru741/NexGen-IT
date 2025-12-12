import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory, User, UserRole } from '../types';
import { 
  Search, Filter, Download, CheckSquare, X, ChevronRight, 
  Calendar, TrendingUp, AlertCircle, Users, Layers
} from 'lucide-react';
import { usePermission } from '../contexts/PermissionContext';

interface AllSystemTicketsProps {
  tickets: Ticket[];
  users: User[];
  currentUser: User;
  onSelectTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticket: Ticket) => void;
}

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  category: string[];
  assignee: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export const AllSystemTickets: React.FC<AllSystemTicketsProps> = ({ 
  tickets, 
  users,
  currentUser,
  onSelectTicket,
  onUpdateTicket 
}) => {
  const { hasPermission } = usePermission();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    category: [],
    assignee: [],
    dateRange: 'all'
  });
  
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter technicians list: if current user is a Technician, exclude them from assignment options
  const technicians = useMemo(() => {
    const techsAndAdmins = users.filter(u => 
      u.role === UserRole.TECHNICIAN || u.role === UserRole.ADMIN
    );
    
    // If current user is a Technician, they cannot assign tickets to themselves
    if (currentUser.role === UserRole.TECHNICIAN) {
      return techsAndAdmins.filter(u => u.id !== currentUser.id);
    }
    
    // Admins can assign to anyone including themselves
    return techsAndAdmins;
  }, [users, currentUser]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(search) ||
        t.id.toLowerCase().includes(search) ||
        t.requesterName.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(t => filters.status.includes(t.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      result = result.filter(t => filters.priority.includes(t.priority));
    }

    // Category filter
    if (filters.category.length > 0) {
      result = result.filter(t => filters.category.includes(t.category));
    }

    // Assignee filter
    if (filters.assignee.length > 0) {
      result = result.filter(t => 
        t.assignedToId && filters.assignee.includes(t.assignedToId)
      );
    }

    // Date range filter
    const now = new Date();
    if (filters.dateRange !== 'all') {
      result = result.filter(t => {
        const ticketDate = new Date(t.createdAt);
        const diffTime = now.getTime() - ticketDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        switch (filters.dateRange) {
          case 'today': return diffDays < 1;
          case 'week': return diffDays < 7;
          case 'month': return diffDays < 30;
          default: return true;
        }
      });
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tickets, filters, sortBy, sortOrder]);

  // Quick stats
  const stats = useMemo(() => {
    return {
      total: filteredTickets.length,
      open: filteredTickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: filteredTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      critical: filteredTickets.filter(t => t.priority === TicketPriority.CRITICAL && 
        t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED).length,
      unassigned: filteredTickets.filter(t => !t.assignedToId).length
    };
  }, [filteredTickets]);

  // Helper functions
  const toggleFilter = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[filterType] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: updated };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      category: [],
      assignee: [],
      dateRange: 'all'
    });
  };

  const toggleSelectAll = () => {
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredTickets.map(t => t.id)));
    }
  };

  const toggleSelectTicket = (ticketId: string) => {
    const newSet = new Set(selectedTickets);
    if (newSet.has(ticketId)) {
      newSet.delete(ticketId);
    } else {
      newSet.add(ticketId);
    }
    setSelectedTickets(newSet);
  };

  const bulkAssign = (technicianId: string) => {
    const technician = users.find(u => u.id === technicianId);
    if (!technician) return;

    // Filter: Only assign unassigned tickets
    const eligibleTickets = Array.from(selectedTickets)
      .map(id => tickets.find(t => t.id === id))
      .filter(ticket => ticket && !ticket.assignedToId);

    if (eligibleTickets.length === 0) {
      alert('No unassigned tickets selected. Only unassigned tickets can be assigned.');
      return;
    }

    eligibleTickets.forEach(ticket => {
      if (ticket) {
        onUpdateTicket({
          ...ticket,
          assignedToId: technicianId,
          assignedToName: technician.name,
          status: TicketStatus.IN_PROGRESS,
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    const skipped = selectedTickets.size - eligibleTickets.length;
    if (skipped > 0) {
      alert(`Assigned ${eligibleTickets.length} ticket(s). Skipped ${skipped} already assigned ticket(s).`);
    }
    
    setSelectedTickets(new Set());
    setShowAssignModal(false);
  };

  const bulkUpdateStatus = (status: TicketStatus) => {
    // Filter based on target status
    const eligibleTickets = Array.from(selectedTickets)
      .map(id => tickets.find(t => t.id === id))
      .filter(ticket => {
        if (!ticket) return false;
        
        // Mark In Progress: Only open or on-hold tickets
        if (status === TicketStatus.IN_PROGRESS) {
          return ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.ON_HOLD;
        }
        
        // Mark Resolved: Only in-progress tickets
        if (status === TicketStatus.RESOLVED) {
          return ticket.status === TicketStatus.IN_PROGRESS;
        }
        
        return true;
      });

    if (eligibleTickets.length === 0) {
      if (status === TicketStatus.IN_PROGRESS) {
        alert('No eligible tickets selected. Only OPEN or ON-HOLD tickets can be marked as In Progress.');
      } else if (status === TicketStatus.RESOLVED) {
        alert('No eligible tickets selected. Only IN-PROGRESS tickets can be marked as Resolved.');
      }
      return;
    }

    eligibleTickets.forEach(ticket => {
      if (ticket) {
        onUpdateTicket({
          ...ticket,
          status,
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    const skipped = selectedTickets.size - eligibleTickets.length;
    if (skipped > 0) {
      const statusName = status.replace('_', ' ');
      alert(`Updated ${eligibleTickets.length} ticket(s) to ${statusName}. Skipped ${skipped} ineligible ticket(s).`);
    }
    
    setSelectedTickets(new Set());
    setShowBulkActions(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Requester', 'Assigned To', 'Created', 'Updated'];
    const rows = filteredTickets.map(t => [
      t.id,
      t.title,
      t.category,
      t.priority,
      t.status,
      t.requesterName,
      t.assignedToName || 'Unassigned',
      new Date(t.createdAt).toLocaleString(),
      new Date(t.updatedAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return 'bg-blue-100 text-blue-800 border-blue-200';
      case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TicketStatus.ON_HOLD: return 'bg-purple-100 text-purple-800 border-purple-200';
      case TicketStatus.RESOLVED: return 'bg-green-100 text-green-800 border-green-200';
      case TicketStatus.CLOSED: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.CRITICAL: return 'text-red-600 font-bold';
      case TicketPriority.HIGH: return 'text-orange-600 font-semibold';
      case TicketPriority.MEDIUM: return 'text-blue-600';
      case TicketPriority.LOW: return 'text-gray-500';
    }
  };

  const activeFilterCount = filters.status.length + filters.priority.length + 
    filters.category.length + filters.assignee.length + 
    (filters.dateRange !== 'all' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All System Tickets</h2>
          <p className="text-gray-500 mt-1">Manage and monitor all support requests</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {selectedTickets.size > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <CheckSquare className="w-4 h-4" />
              Bulk Actions ({selectedTickets.size})
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Layers className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Open</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.open}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgress}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Unassigned</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.unassigned}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID, title, requester, or description..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="relative">
              <select
                className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm min-w-[120px]"
                onChange={(e) => e.target.value && toggleFilter('status', e.target.value)}
                value=""
              >
                <option value="">Status ({filters.status.length})</option>
                {Object.values(TicketStatus).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm min-w-[120px]"
                onChange={(e) => e.target.value && toggleFilter('priority', e.target.value)}
                value=""
              >
                <option value="">Priority ({filters.priority.length})</option>
                {Object.values(TicketPriority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm min-w-[120px]"
                onChange={(e) => e.target.value && toggleFilter('category', e.target.value)}
                value=""
              >
                <option value="">Category ({filters.category.length})</option>
                {Object.values(TicketCategory).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <select
              className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm min-w-[120px]"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Sort */}
            <select
              className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm min-w-[120px]"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as any);
                setSortOrder(order as any);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="priority-desc">High Priority First</option>
              <option value="priority-asc">Low Priority First</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            {filters.status.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                Status: {s.replace('_', ' ')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter('status', s)} />
              </span>
            ))}
            {filters.priority.map(p => (
              <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                Priority: {p}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter('priority', p)} />
              </span>
            ))}
            {filters.category.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                Category: {c}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter('category', c)} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              {selectedTickets.size} ticket{selectedTickets.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-50"
              >
                Assign to Technician
              </button>
              <button
                onClick={() => bulkUpdateStatus(TicketStatus.IN_PROGRESS)}
                className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-50"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => bulkUpdateStatus(TicketStatus.RESOLVED)}
                className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-50"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => setSelectedTickets(new Set())}
                className="px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTickets.size === filteredTickets.length && filteredTickets.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ticket Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTickets.has(ticket.id)}
                      onChange={() => toggleSelectTicket(ticket.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td 
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => onSelectTicket(ticket)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                        {ticket.title}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        #{ticket.id} • {ticket.category} • {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{ticket.requesterName}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {ticket.assignedToName ? (
                      <span className="text-sm text-gray-600">{ticket.assignedToName}</span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs font-bold uppercase tracking-wide ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight 
                      className="w-5 h-5 text-gray-300 group-hover:text-blue-500 cursor-pointer"
                      onClick={() => onSelectTicket(ticket)}
                    />
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Tickets to Technician</h3>
            <p className="text-sm text-gray-600 mb-6">
              Assigning {selectedTickets.size} ticket{selectedTickets.size !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
              {technicians.map(tech => (
                <button
                  key={tech.id}
                  onClick={() => bulkAssign(tech.id)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tech.name}</p>
                      <p className="text-xs text-gray-500">{tech.role}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
