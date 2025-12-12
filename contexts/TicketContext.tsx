import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../types';
import { db } from '../services/mockDatabase';

interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  createTicket: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => Ticket;
  updateTicket: (id: string, updates: Partial<Ticket>) => Ticket;
  deleteTicket: (id: string) => boolean;
  getTicketById: (id: string) => Ticket | undefined;
  filterTickets: (criteria: FilterCriteria) => Ticket[];
  refreshTickets: () => void;
}

interface FilterCriteria {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  requesterId?: string;
  assignedToId?: string;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tickets on mount
  useEffect(() => {
    const loadedTickets = db.getTickets();
    setTickets(loadedTickets);
    setLoading(false);
  }, []);

  const refreshTickets = useCallback(() => {
    const loadedTickets = db.getTickets();
    setTickets(loadedTickets);
  }, []);

  const createTicket = useCallback((ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Ticket => {
    const newTicket = db.createTicket(ticketData);
    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  }, []);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>): Ticket => {
    const updatedTicket = db.updateTicket(id, updates);
    setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
    return updatedTicket;
  }, []);

  const deleteTicket = useCallback((id: string): boolean => {
    const success = db.deleteTicket(id);
    if (success) {
      setTickets(prev => prev.filter(t => t.id !== id));
    }
    return success;
  }, []);

  const getTicketById = useCallback((id: string): Ticket | undefined => {
    return tickets.find(t => t.id === id);
  }, [tickets]);

  const filterTickets = useCallback((criteria: FilterCriteria): Ticket[] => {
    return tickets.filter(ticket => {
      if (criteria.status && ticket.status !== criteria.status) return false;
      if (criteria.priority && ticket.priority !== criteria.priority) return false;
      if (criteria.category && ticket.category !== criteria.category) return false;
      if (criteria.requesterId && ticket.requesterId !== criteria.requesterId) return false;
      if (criteria.assignedToId && ticket.assignedToId !== criteria.assignedToId) return false;
      return true;
    });
  }, [tickets]);

  const value: TicketContextType = {
    tickets,
    loading,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    filterTickets,
    refreshTickets,
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};

export const useTickets = (): TicketContextType => {
  const context = React.useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export default TicketContext;
