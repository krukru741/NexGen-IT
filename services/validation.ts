/**
 * Zod validation schemas for runtime type checking
 */

import { z } from 'zod';
import { TicketStatus, TicketPriority, TicketCategory, UserRole } from '../types';

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.nativeEnum(UserRole),
  avatar: z.string().url().optional(),
  department: z.string(),
  pcNo: z.string(),
  ipAddress: z.string(),
  equipment: z.object({
    network: z.boolean(),
    cpu: z.boolean(),
    printer: z.boolean(),
    monitor: z.boolean(),
    keyboard: z.boolean(),
    antiVirus: z.boolean(),
    upsAvr: z.boolean(),
    defragment: z.boolean(),
    signaturePad: z.boolean(),
    webCamera: z.boolean(),
    barcodeScanner: z.boolean(),
    barcodePrinter: z.boolean(),
    fingerPrintScanner: z.boolean(),
    mouse: z.boolean(),
  }),
});

// Ticket Schema
export const TicketSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
  status: z.nativeEnum(TicketStatus),
  requesterId: z.string(),
  requesterName: z.string(),
  assignedToId: z.string().optional(),
  assignedToName: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  troubleshoot: z.string().optional(),
  solution: z.string().optional(),
});

// Ticket Log Schema
export const TicketLogSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  action: z.string(),
  performedBy: z.string(),
  performedByName: z.string(),
  timestamp: z.string().datetime(),
  details: z.string().optional(),
});

// Message Schema
export const MessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  fromName: z.string(),
  to: z.string(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  timestamp: z.string().datetime(),
  read: z.boolean().default(false),
});

// Type exports
export type UserValidation = z.infer<typeof UserSchema>;
export type TicketValidation = z.infer<typeof TicketSchema>;
export type TicketLogValidation = z.infer<typeof TicketLogSchema>;
export type MessageValidation = z.infer<typeof MessageSchema>;

// Validation helper functions
export const validateUser = (data: unknown) => {
  return UserSchema.safeParse(data);
};

export const validateTicket = (data: unknown) => {
  return TicketSchema.safeParse(data);
};

export const validateTicketLog = (data: unknown) => {
  return TicketLogSchema.safeParse(data);
};

export const validateMessage = (data: unknown) => {
  return MessageSchema.safeParse(data);
};

// Array validation helpers
export const validateUsers = (data: unknown) => {
  return z.array(UserSchema).safeParse(data);
};

export const validateTickets = (data: unknown) => {
  return z.array(TicketSchema).safeParse(data);
};

export const validateTicketLogs = (data: unknown) => {
  return z.array(TicketLogSchema).safeParse(data);
};

export const validateMessages = (data: unknown) => {
  return z.array(MessageSchema).safeParse(data);
};
