import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketStatus, TicketPriority, UserRole } from '../types';
import { useAuth, useTickets, useUsers } from '../hooks';
import { TicketFilters } from './all-system-tickets/TicketFilters';
import { TicketTable } from './all-system-tickets/TicketTable';
import { BulkActions } from './all-system-tickets/BulkActions';

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  category: string[];
  assignee: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export const AllSystemTickets: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tickets, updateTicket } = useTickets();
  const { users } = useUsers();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    category: [],
    assignee: [],
    dateRange: 'all'
  });
  
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());

  if (!currentUser) {
    return null;
  }

  // Filter technicians list
  const technicians = useMemo(() => {
    const techsAndAdmins = users.filter(u => 
      u.role === UserRole.TECHNICIAN || u.role === UserRole.ADMIN
    );
    
    // Technicians cannot assign to themselves
    if (currentUser.role === UserRole.TECHNICIAN) {
      return techsAndAdmins.filter(u => u.id !== currentUser.id);
    }
    
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
      result = result.filter(t => {
        if (filters.assignee.includes('unassigned')) {
          return !t.assignedToId;
        }
        return t.assignedToId && filters.assignee.includes(t.assignedToId);
      });
    }

    // Date range filter
    const now = new Date();
    if (filters.dateRange !== 'all') {
      result = result.filter(t => {
        const ticketDate = new Date(t.createdAt);
        const diffTime = Math.abs(now.getTime() - ticketDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (filters.dateRange === 'today') return diffDays <= 1;
        if (filters.dateRange === 'week') return diffDays <= 7;
        if (filters.dateRange === 'month') return diffDays <= 30;
        return true;
      });
    }

    return result;
  }, [tickets, filters]);

  // Selection handlers
  const toggleSelectTicket = (ticketId: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredTickets.map(t => t.id)));
    }
  };

  // Bulk actions
  const handleBulkAssign = (technicianId: string) => {
    const technician = users.find(u => u.id === technicianId);
    if (!technician) return;

    const eligibleTickets = Array.from(selectedTickets)
      .map(id => tickets.find(t => t.id === id))
      .filter(ticket => ticket && !ticket.assignedToId);

    if (eligibleTickets.length === 0) {
      alert('No unassigned tickets selected. Only unassigned tickets can be assigned.');
      return;
    }

    eligibleTickets.forEach(ticket => {
      if (ticket) {
        updateTicket(ticket.id, {
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
  };

  const handleBulkUpdateStatus = (status: TicketStatus) => {
    const eligibleTickets = Array.from(selectedTickets)
      .map(id => tickets.find(t => t.id === id))
      .filter(ticket => {
        if (!ticket) return false;
        
        if (status === TicketStatus.IN_PROGRESS) {
          return ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.ON_HOLD;
        }
        
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
        updateTicket(ticket.id, {
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
  };

  // Export to CSV
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <TicketFilters
        filters={filters}
        onFiltersChange={setFilters}
        technicians={technicians}
        onExport={exportToCSV}
        ticketCount={filteredTickets.length}
      />

      <TicketTable
        tickets={filteredTickets}
        selectedTickets={selectedTickets}
        onSelectTicket={toggleSelectTicket}
        onSelectAll={toggleSelectAll}
        onTicketClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
      />

      <BulkActions
        selectedCount={selectedTickets.size}
        technicians={technicians}
        onBulkAssign={handleBulkAssign}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onClearSelection={() => setSelectedTickets(new Set())}
      />
    </div>
  );
};
