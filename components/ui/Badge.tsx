import React from 'react';
import { TicketStatus, TicketPriority } from '../../types';

export interface BadgeProps {
  variant?: 'default' | 'status' | 'priority';
  value: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  // Status
  OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
  RESOLVED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  VERIFIED: 'bg-teal-50 text-teal-700 border-teal-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  
  // Priority
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', value, className = '' }) => {
  const colorClass = colorMap[value] || 'bg-slate-100 text-slate-700 border-slate-200';
  
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${colorClass}
      ${className}
    `}>
      {value}
    </span>
  );
};
