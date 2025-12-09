import { Ticket, User, UserRole, TicketStatus, TicketPriority, TicketCategory, TicketLog, Message } from '../types';

const USERS_KEY = 'nexgen_users';
const TICKETS_KEY = 'nexgen_tickets';
const LOGS_KEY = 'nexgen_logs';
const MESSAGES_KEY = 'nexgen_messages';

// Seed Data
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Employee', email: 'alice@corp.com', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/id/101/200/200' },
  { id: 'u2', name: 'Bob Technician', email: 'bob@corp.com', role: UserRole.TECHNICIAN, avatar: 'https://picsum.photos/id/102/200/200' },
  { id: 'u3', name: 'Charlie Admin', email: 'charlie@corp.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/103/200/200' },
];

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'T-1001',
    title: 'Cannot access VPN',
    description: 'I am getting a connection timeout error when trying to connect to the corporate VPN from home.',
    category: TicketCategory.NETWORK,
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    requesterId: 'u1',
    requesterName: 'Alice Employee',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['vpn', 'remote']
  },
  {
    id: 'T-1002',
    title: 'Printer jamming on 2nd floor',
    description: 'The HP LaserJet is repeatedly jamming paper.',
    category: TicketCategory.HARDWARE,
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.IN_PROGRESS,
    requesterId: 'u3',
    requesterName: 'Charlie Admin',
    assignedToId: 'u2',
    assignedToName: 'Bob Technician',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ['printer', 'hardware']
  }
];

const MOCK_LOGS: TicketLog[] = [
  {
    id: 'l1',
    ticketId: 'T-1002',
    userId: 'u2',
    userName: 'Bob Technician',
    message: 'Checked the rollers, they seem worn out. Ordering replacements.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'COMMENT'
  }
];

// Service
class MockDatabase {
  constructor() {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem(TICKETS_KEY)) {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(MOCK_TICKETS));
    }
    if (!localStorage.getItem(LOGS_KEY)) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(MOCK_LOGS));
    }
  }

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  getTickets(): Ticket[] {
    return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]');
  }

  getLogs(ticketId: string): TicketLog[] {
    const allLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]') as TicketLog[];
    return allLogs.filter(l => l.ticketId === ticketId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Ticket {
    const tickets = this.getTickets();
    const newTicket: Ticket = {
      ...ticket,
      id: `T-${1000 + tickets.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tickets.push(newTicket);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    return newTicket;
  }

  updateTicket(id: string, updates: Partial<Ticket>): Ticket {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    
    const updatedTicket = { ...tickets[index], ...updates, updatedAt: new Date().toISOString() };
    tickets[index] = updatedTicket;
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    return updatedTicket;
  }

  addLog(log: Omit<TicketLog, 'id' | 'timestamp'>): TicketLog {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]') as TicketLog[];
    const newLog: TicketLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    return newLog;
  }

  addUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `u${users.length + 1}`
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  deleteTicket(id: string): boolean {
    const tickets = this.getTickets();
    const filteredTickets = tickets.filter(t => t.id !== id);
    
    if (filteredTickets.length === tickets.length) {
      return false; // Ticket not found
    }
    
    localStorage.setItem(TICKETS_KEY, JSON.stringify(filteredTickets));
    
    // Also delete associated logs
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]') as TicketLog[];
    const filteredLogs = logs.filter(l => l.ticketId !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(filteredLogs));
    
    return true;
  }

  // Message Methods
  getMessages(): Message[] {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
  }

  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const messages = this.getMessages();
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return newMessage;
  }

  markAsRead(id: string): boolean {
    const messages = this.getMessages();
    const message = messages.find(m => m.id === id);
    if (!message) return false;
    
    message.read = true;
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return true;
  }

  deleteMessage(id: string): boolean {
    const messages = this.getMessages();
    const filteredMessages = messages.filter(m => m.id !== id);
    
    if (filteredMessages.length === messages.length) {
      return false; // Message not found
    }
    
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
    return true;
  }
}

export const db = new MockDatabase();
