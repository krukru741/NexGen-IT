import { Ticket, User, UserRole, TicketStatus, TicketPriority, TicketCategory, TicketLog, Message } from '../types';

const USERS_KEY = 'nexgen_users_v4';
const TICKETS_KEY = 'nexgen_tickets_v4';
const LOGS_KEY = 'nexgen_logs_v4';
const MESSAGES_KEY = 'nexgen_messages_v4';

// Seed Data
const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'CSC Admin', 
    email: 'admin@csc.gov.ph',
    username: 'admin',
    password: 'admin123', 
    role: UserRole.ADMIN, 
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U1ZTdlYiIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjOWNhM2FmIi8+PHBhdGggZD0iTTMwIDEyMGMwLTI1IDIwLTQ1IDQ1LTQ1czQ1IDIwIDQ1IDQ1IiBmaWxsPSIjOWNhM2FmIi8+PC9zdmc+',
    department: 'MIS / IT',
    pcNo: 'CSC-MIS-ADMIN',
    ipAddress: '192.168.1.1',
    equipment: {
      network: true,
      cpu: true,
      printer: true,
      monitor: true,
      keyboard: true,
      antiVirus: true,
      upsAvr: true,
      defragment: true,
      signaturePad: false,
      webCamera: true,
      barcodeScanner: false,
      barcodePrinter: false,
      fingerPrintScanner: false,
      mouse: true
    }
  }
];

const MOCK_TICKETS: Ticket[] = [];

const MOCK_LOGS: TicketLog[] = [];

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
    if (!localStorage.getItem(MESSAGES_KEY)) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
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
    const now = new Date();
    
    // Format: T20251211-01
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Find tickets created today
    const todayPrefix = `T${dateStr}-`;
    const todayTickets = tickets.filter(t => t.id.startsWith(todayPrefix));
    
    // Get next sequential number for today
    const nextNum = todayTickets.length + 1;
    const ticketId = `${todayPrefix}${String(nextNum).padStart(2, '0')}`;
    
    const newTicket: Ticket = {
      ...ticket,
      id: ticketId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
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
      id: `u-${Date.now()}`
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  updateUser(updatedUser: User): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (filteredUsers.length < users.length) {
      localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
      return true;
    }
    return false;
  }

  deleteTicket(id: string): boolean {
    console.log('Attempting to delete ticket:', id);
    const tickets = this.getTickets();
    console.log('Current tickets:', tickets.map(t => t.id));
    const filteredTickets = tickets.filter(t => t.id !== id);
    
    if (filteredTickets.length === tickets.length) {
      console.log('Ticket not found in database');
      return false; // Ticket not found
    }
    
    localStorage.setItem(TICKETS_KEY, JSON.stringify(filteredTickets));
    
    // Also delete associated logs
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]') as TicketLog[];
    const filteredLogs = logs.filter(l => l.ticketId !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(filteredLogs));
    
    console.log('Ticket deleted successfully');
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
