import React, { forwardRef } from 'react';
import { Ticket, User } from '../types';
import { db } from '../services/mockDatabase';

interface TicketPrintProps {
  ticket: Ticket;
  requester?: User;
  printConfig?: {
    companyName: string;
    formTitle: string;
    docCode: string;
    versionNo: string;
    revisionDate: string;
    issueDate: string;
    effectivityDate: string;
    retainedBy: string;
  };
}

const TicketPrint = forwardRef<HTMLDivElement, TicketPrintProps>(({ ticket, requester, printConfig }, ref) => {
  // Load print config from localStorage if not provided
  const config = printConfig || (() => {
    const saved = localStorage.getItem('printFormConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse print config:', e);
      }
    }
    return {
      companyName: 'PHYSICIANS\' DIAGNOSTIC SERVICES CENTER, INC.',
      formTitle: 'M.I.S SERVICE REQUEST',
      docCode: 'MIS-010-F',
      versionNo: 'C',
      revisionDate: '22-Apr-2024',
      issueDate: '22-Apr-2024',
      effectivityDate: '22-Apr-2024',
      retainedBy: 'JCG'
    };
  })();
  
  // Get current user names from database
  const users = db.getUsers();
  const currentRequester = users.find((u: User) => u.id === ticket.requesterId);
  const currentAssignedTo = ticket.assignedToId ? users.find((u: User) => u.id === ticket.assignedToId) : null;
  
  // Use current names from database, fallback to ticket's cached names
  const requesterName = currentRequester?.name || ticket.requesterName;
  const assignedToName = currentAssignedTo?.name || ticket.assignedToName;

  // Reusable form content component
  const FormContent = ({ copyLabel }: { copyLabel: string }) => (
    <div style={{ border: '2px solid black', padding: '8px', marginBottom: '8px', pageBreakInside: 'avoid' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '4px', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
          {config.companyName}
        </h1>
        <h2 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' }}>
          {config.formTitle}
        </h2>
      </div>

      {/* Top Section - Date and Ticket Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Date:</span> {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10px' }}>{ticket.id}</div>
          <div style={{ fontSize: '9px' }}>TICKET NO</div>
        </div>
      </div>

      {/* Request Details */}
      <div style={{ marginBottom: '4px', fontSize: '10px' }}>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>TO:</span>{' '}
          <span style={{ borderBottom: '1px solid black', display: 'inline-block', minWidth: '250px' }}>
            {ticket.assignedToName || 'MAINTENANCE SUPERVISOR'}
          </span>
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Category:</span>{' '}
          <span style={{ borderBottom: '1px solid black', display: 'inline-block', minWidth: '250px' }}>
            {ticket.category}
          </span>
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Priority:</span>{' '}
          <span style={{ borderBottom: '1px solid black', display: 'inline-block', minWidth: '250px' }}>
            {ticket.priority}
          </span>
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Computer Name:</span>{' '}
          <span style={{ borderBottom: '1px solid black', display: 'inline-block', minWidth: '250px' }}>
            CPDSC-MIS25
          </span>
        </div>
      </div>

      {/* Problem Table */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '10px' }}>Requesting the repair of the following:</div>
        <table style={{ width: '100%', border: '2px solid black', borderCollapse: 'collapse', fontSize: '9px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black' }}>
              <th style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>
                Problem Issue
              </th>
              <th style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>
                Troubleshooting
              </th>
              <th style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>
                Report Time
              </th>
              <th style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>
                Status
              </th>
              <th style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>
                Completion<br />Date/Time
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px', verticalAlign: 'top' }}>
                {ticket.description || ticket.title}
              </td>
              <td style={{ border: '1px solid black', padding: '3px', verticalAlign: 'top' }}>
                {ticket.troubleshoot || (ticket.remarks ? ticket.remarks : '-')}
              </td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                {new Date(ticket.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                {ticket.status}
              </td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', verticalAlign: 'top' }}>
                {ticket.status === 'RESOLVED' || ticket.status === 'VERIFIED'
                  ? `${new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n${new Date(ticket.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                  : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
        <div style={{ width: '48%' }}>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Reported by:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '14px', fontSize: '9px' }}>
              {requesterName}
            </div>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>IT Personnel:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '14px', fontSize: '9px' }}>
              {assignedToName || '_________________'}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Verified by:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '14px', fontSize: '9px' }}>
              {ticket.status === 'VERIFIED' ? requesterName : '_________________'}
            </div>
          </div>
        </div>
        <div style={{ width: '48%' }}>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Department / Section:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '14px', fontSize: '9px' }}>
              MANAGEMENT INFORMATION SYSTEM
            </div>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Date:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '14px', fontSize: '9px' }}>
              {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '8px', color: '#666', marginTop: '1px' }}>(Date Reported)</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Date:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '14px', fontSize: '9px' }}>
              {ticket.status === 'RESOLVED' || ticket.status === 'VERIFIED'
                ? new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : '_________________'}
            </div>
            <div style={{ fontSize: '8px', color: '#666', marginTop: '1px' }}>(Date Completed)</div>
          </div>
        </div>
      </div>

      {/* Copy Label */}
      <div style={{ textAlign: 'right', marginBottom: '4px', fontSize: '10px' }}>
        {copyLabel}
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '2px solid black', paddingTop: '3px', display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
        <div>
          <div><span style={{ fontWeight: 'bold' }}>Doc Code:</span> {config.docCode}</div>
          <div><span style={{ fontWeight: 'bold' }}>Ver No:</span> {config.versionNo}</div>
        </div>
        <div>
          <div><span style={{ fontWeight: 'bold' }}>Revision Date:</span> {config.revisionDate}</div>
          <div><span style={{ fontWeight: 'bold' }}>Issue Date:</span> {config.issueDate}</div>
        </div>
        <div>
          <div><span style={{ fontWeight: 'bold' }}>Effectivity Date:</span> {config.effectivityDate}</div>
          <div><span style={{ fontWeight: 'bold' }}>Retained by:</span> {config.retainedBy}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{ padding: '10px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10px' }}>
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 0.3in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      
      {/* Admin Copy */}
      <FormContent copyLabel="Admin Copy" />
      
      {/* Cutting Line */}
      <div style={{ 
        borderTop: '1px dashed #999',
        margin: '10px 0'
      }}></div>
      
      {/* Requisitioning Party Copy */}
      <FormContent copyLabel="Requisitioning Party Copy" />
    </div>
  );
});

TicketPrint.displayName = 'TicketPrint';

export default TicketPrint;
