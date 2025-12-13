import React from 'react';
import { TicketStatus, TicketPriority } from '../../types';

export interface BadgeProps {
  variant: 'status' | 'priority';
  value: TicketStatus | TicketPriority | string;
  className?: string;
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700 border border-blue-200',
  IN_PROGRESS: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  PENDING: 'bg-orange-50 text-orange-700 border border-orange-200',
  RESOLVED: 'bg-green-50 text-green-700 border border-green-200',
  VERIFIED: 'bg-green-100 text-green-800 border border-green-300',
  CLOSED: 'bg-gray-50 text-gray-700 border border-gray-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-50 text-gray-700 border border-gray-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  HIGH: 'bg-orange-50 text-orange-700 border border-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 border border-red-200',
};

export const Badge: React.FC<BadgeProps> = ({ variant, value, className = '' }) => {
  const colors = variant === 'status' ? statusColors : priorityColors;
  const colorClass = colors[value] || 'bg-gray-50 text-gray-700 border border-gray-200';
  
  const displayValue = value.toString().replace(/_/g, ' ');
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass} ${className}`}>
      {displayValue}
    </span>
  );
};
