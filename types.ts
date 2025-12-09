export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  RESOLVED = 'RESOLVED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TicketCategory {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
  ACCESS = 'ACCESS',
  OTHER = 'OTHER'
}

export interface TicketLog {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'COMMENT' | 'STATUS_CHANGE' | 'SYSTEM';
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  requesterId: string;
  requesterName: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  attachments?: string[];
  troubleshoot?: string;
  remarks?: string;
}

export interface Message {
  id: string;
  from: string; // user ID
  fromName: string;
  to: string; // support staff ID
  toName: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface DashboardStats {
  total: number;
  open: number;
  resolved: number;
  avgResolutionTimeHours: number;
}