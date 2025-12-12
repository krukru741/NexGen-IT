/**
 * Centralized styling utilities for consistent UI across the application
 */

import { TicketStatus, TicketPriority } from '../types';

/**
 * Status color mappings for badges and UI elements
 */
export const statusColors: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-blue-50 text-blue-700 border-blue-400',
  [TicketStatus.IN_PROGRESS]: 'bg-yellow-50 text-yellow-700 border-yellow-400',
  [TicketStatus.ON_HOLD]: 'bg-orange-50 text-orange-700 border-orange-400',
  [TicketStatus.RESOLVED]: 'bg-green-50 text-green-700 border-green-400',
  [TicketStatus.VERIFIED]: 'bg-green-100 text-green-800 border-green-600',
  [TicketStatus.CLOSED]: 'bg-gray-50 text-gray-700 border-gray-400',
};

/**
 * Priority color mappings for badges and UI elements
 */
export const priorityColors: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: 'bg-gray-50 text-gray-700 border-gray-300',
  [TicketPriority.MEDIUM]: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  [TicketPriority.HIGH]: 'bg-orange-50 text-orange-700 border-orange-300',
  [TicketPriority.CRITICAL]: 'bg-red-50 text-red-700 border-red-300',
};

/**
 * Get status color classes for a given status
 */
export const getStatusColor = (status: TicketStatus): string => {
  return statusColors[status] || statusColors[TicketStatus.OPEN];
};

/**
 * Get priority color classes for a given priority
 */
export const getPriorityColor = (priority: TicketPriority): string => {
  return priorityColors[priority] || priorityColors[TicketPriority.LOW];
};

/**
 * Status background colors for input fields
 */
export const statusInputColors: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'border-blue-400 bg-blue-50 text-blue-700',
  [TicketStatus.IN_PROGRESS]: 'border-yellow-400 bg-yellow-50 text-yellow-700',
  [TicketStatus.ON_HOLD]: 'border-orange-400 bg-orange-50 text-orange-700',
  [TicketStatus.RESOLVED]: 'border-green-400 bg-green-50 text-green-700',
  [TicketStatus.VERIFIED]: 'border-green-600 bg-green-100 text-green-800',
  [TicketStatus.CLOSED]: 'border-gray-400 bg-gray-50 text-gray-700',
};

/**
 * Get status input color classes
 */
export const getStatusInputColor = (status: TicketStatus): string => {
  return statusInputColors[status] || statusInputColors[TicketStatus.OPEN];
};

/**
 * Priority background colors for priority selection buttons
 */
export const priorityButtonColors: Record<TicketPriority, { active: string; inactive: string }> = {
  [TicketPriority.LOW]: {
    active: 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500',
    inactive: 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
  },
  [TicketPriority.MEDIUM]: {
    active: 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500',
    inactive: 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
  },
  [TicketPriority.HIGH]: {
    active: 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-500',
    inactive: 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
  },
  [TicketPriority.CRITICAL]: {
    active: 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500',
    inactive: 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
  },
};

/**
 * Get priority button color classes
 */
export const getPriorityButtonColor = (priority: TicketPriority, isActive: boolean): string => {
  const colors = priorityButtonColors[priority] || priorityButtonColors[TicketPriority.LOW];
  return isActive ? colors.active : colors.inactive;
};

/**
 * Utility function to combine class names (simple implementation)
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
