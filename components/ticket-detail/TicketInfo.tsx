import React from 'react';
import { Card } from '../ui';
import { Ticket, TicketStatus, UserRole } from '../../types';
import { 
  User, 
  Tag, 
  Calendar, 
  UserCircle, 
  FileText, 
  Wrench, 
  Activity, 
  MessageSquare 
} from 'lucide-react';

interface TicketInfoProps {
  ticket: Ticket;
  problems: string;
  troubleshoot: string;
  remarks: string;
  isEditingVerified: boolean;
  currentUserRole: UserRole;
  onProblemsChange: (value: string) => void;
  onTroubleshootChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
  onSave: () => void;
}

export const TicketInfo: React.FC<TicketInfoProps> = ({
  ticket,
  problems,
  troubleshoot,
  remarks,
  isEditingVerified,
  currentUserRole,
  onProblemsChange,
  onTroubleshootChange,
  onRemarksChange,
  onSave,
}) => {
  const isVerified = ticket.status === TicketStatus.VERIFIED;
  const canEdit = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.TECHNICIAN;
  const isEditable = canEdit && (!isVerified || isEditingVerified);

  const InfoItem = ({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string, subValue?: string }) => (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm mt-0.5">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Ticket Details */}
      <Card variant="bordered" className="h-full">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Ticket Information</h3>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Main Description */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Description
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem 
              icon={Tag} 
              label="Category" 
              value={ticket.category} 
            />
            <InfoItem 
              icon={Calendar} 
              label="Last Updated" 
              value={new Date(ticket.updatedAt).toLocaleDateString()} 
              subValue={new Date(ticket.updatedAt).toLocaleTimeString()}
            />
            <InfoItem 
              icon={UserCircle} 
              label="Requester" 
              value={ticket.requesterName} 
            />
            <InfoItem 
              icon={User} 
              label="Assigned To" 
              value={ticket.assignedToName || 'Unassigned'} 
              subValue={ticket.assignedToName ? 'Technician' : 'Pending Assignment'}
            />
          </div>
        </div>
      </Card>

      {/* Technical Details */}
      <Card variant="bordered" className="h-full">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Technical Assessment</h3>
          {isVerified && !isEditingVerified && (
            <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full border border-gray-200 uppercase">
              Locked
            </span>
          )}
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              Identified Problems / Issues
            </label>
            {isEditable ? (
              <textarea
                value={problems}
                onChange={(e) => onProblemsChange(e.target.value)}
                onBlur={onSave}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-white min-h-[80px]"
                placeholder="List the specific technical issues found..."
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 min-h-[60px]">
                {problems || <span className="text-gray-400 italic">No problems recorded</span>}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
              Troubleshooting Steps Taken
            </label>
            {isEditable ? (
              <textarea
                value={troubleshoot}
                onChange={(e) => onTroubleshootChange(e.target.value)}
                onBlur={onSave}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-white min-h-[80px]"
                placeholder="Step-by-step troubleshooting actions..."
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 min-h-[60px]">
                {troubleshoot || <span className="text-gray-400 italic">No steps recorded</span>}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-green-500" />
              Additional Remarks
            </label>
            {isEditable ? (
              <textarea
                value={remarks}
                onChange={(e) => onRemarksChange(e.target.value)}
                onBlur={onSave}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-white font-medium text-gray-700"
                rows={2}
                placeholder="Any final notes or observations..."
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600">
                {remarks || <span className="text-gray-400 italic">No remarks</span>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
