import React from 'react';
import { Card, Button } from '../ui';
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
  currentUserId: string;
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
  currentUserId,
  onProblemsChange,
  onTroubleshootChange,
  onRemarksChange,
  onSave,
}) => {
  const isVerified = ticket.status === TicketStatus.VERIFIED;
  const isAssignedTechnician = ticket.assignedToId === currentUserId;
  const canEdit = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.TECHNICIAN || isAssignedTechnician;
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-600">
          <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Ticket Information
          </h3>
        </div>
        
        <div className="p-0">
          <table className="w-full text-xs text-left">
            <tbody className="divide-y divide-gray-200">
              <tr className="divide-x divide-gray-200">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 w-1/3 border-r border-gray-200">Description</td>
                <td className="px-3 py-2 text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </td>
              </tr>
              <tr className="divide-x divide-gray-200">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Category</td>
                <td className="px-3 py-2 text-gray-900 flex items-center gap-2">
                  <Tag className="w-3 h-3 text-gray-400" />
                  {ticket.category}
                </td>
              </tr>
              <tr className="divide-x divide-gray-200">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Last Updated</td>
                <td className="px-3 py-2 text-gray-900 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                  <span className="text-gray-500 text-[10px]">({new Date(ticket.updatedAt).toLocaleTimeString()})</span>
                </td>
              </tr>
              <tr className="divide-x divide-gray-200">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Requester</td>
                <td className="px-3 py-2 text-gray-900 flex items-center gap-2">
                  <UserCircle className="w-3 h-3 text-gray-400" />
                  {ticket.requesterName}
                </td>
              </tr>
              <tr className="divide-x divide-gray-200">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Assigned To</td>
                <td className="px-3 py-2 text-gray-900 flex items-center gap-2">
                  <User className="w-3 h-3 text-gray-400" />
                  <div>
                    {ticket.assignedToName || <span className="text-gray-400 italic">Unassigned</span>}
                    {ticket.assignedToName && <span className="text-gray-500 text-[10px] ml-1">(Technician)</span>}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-400" />
            Technical Assessment
          </h3>
          {isVerified && !isEditingVerified && (
            <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] font-bold rounded border border-gray-600 uppercase">
              Locked
            </span>
          )}
        </div>
        
        <div className="p-0">
          <table className="w-full text-xs text-left">
            <tbody className="divide-y divide-gray-200">
              <tr className="divide-x divide-gray-200">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 w-1/3 border-r border-gray-200 align-top">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-red-500" />
                    Identified Problems
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-900">
                  {isEditable ? (
                    <div className="space-y-2">
                      <textarea
                        value={problems}
                        onChange={(e) => onProblemsChange(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-white min-h-[60px]"
                        placeholder="List the specific technical issues found..."
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={onSave} 
                          className="h-6 text-[10px] px-2"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-900 whitespace-pre-wrap min-h-[20px]">
                      {problems || <span className="text-gray-400 italic">No problems recorded</span>}
                    </div>
                  )}
                </td>
              </tr>
              <tr className="divide-x divide-gray-200">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200 align-top">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-blue-500" />
                    Troubleshooting Steps
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-900">
                  {isEditable ? (
                    <div className="space-y-2">
                      <textarea
                        value={troubleshoot}
                        onChange={(e) => onTroubleshootChange(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-white min-h-[60px]"
                        placeholder="Step-by-step troubleshooting actions..."
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={onSave} 
                          className="h-6 text-[10px] px-2"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-900 whitespace-pre-wrap min-h-[20px]">
                      {troubleshoot || <span className="text-gray-400 italic">No steps recorded</span>}
                    </div>
                  )}
                </td>
              </tr>
              <tr className="divide-x divide-gray-200">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200 align-top">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                    Remarks
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-900">
                  {isEditable ? (
                    <div className="space-y-2">
                      <textarea
                        value={remarks}
                        onChange={(e) => onRemarksChange(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-white"
                        rows={2}
                        placeholder="Any final notes or observations..."
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={onSave} 
                          className="h-6 text-[10px] px-2"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-900 whitespace-pre-wrap min-h-[20px]">
                      {remarks || <span className="text-gray-400 italic">No remarks</span>}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
