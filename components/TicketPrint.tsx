import React, { forwardRef } from 'react';
import { Ticket, User } from '../types';

interface TicketPrintProps {
  ticket: Ticket;
  requester?: User;
}

const TicketPrint = forwardRef<HTMLDivElement, TicketPrintProps>(({ ticket, requester }, ref) => {
  // Reusable form content component
  const FormContent = ({ copyLabel }: { copyLabel: string }) => (
    <div style={{ border: '2px solid black', padding: '20px', marginBottom: '20px', pageBreakAfter: copyLabel === 'Admin Copy' ? 'auto' : 'avoid' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '15px' }}>
        <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase' }}>
          PHYSICIANS' DIAGNOSTIC SERVICES CENTER, INC.
        </h1>
        <h2 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' }}>
          M.I.S SERVICE REQUEST
        </h2>
      </div>

      {/* Top Section - Date and Ticket Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11px' }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Date:</span> {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{ticket.id}</div>
          <div style={{ fontSize: '9px' }}>TICKET NO</div>
        </div>
      </div>

      {/* Request Details */}
      <div style={{ marginBottom: '12px', fontSize: '11px' }}>
        <div style={{ marginBottom: '6px' }}>
          <span style={{ fontWeight: 'bold' }}>TO:</span>{' '}
          <span style={{ borderBottom: '1px solid black', display: 'inline-block', minWidth: '300px' }}>
            {ticket.assignedToName || 'MAINTENANCE SUPERVISOR'}
          </span>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <span style={{ fontWeight: 'bold' }}>Category:</span>{' '}
          <span style={{ borderBottom: '1px solid black', display: 'inline-block', minWidth: '300px' }}>
            {ticket.category}
          </span>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <span style={{ fontWeight: 'bold' }}>Priority:</span>{' '}
          <span style={{ borderBottom: '1px solid black', display: 'inline-block', minWidth: '300px' }}>
            {ticket.priority}
          </span>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <span style={{ fontWeight: 'bold' }}>Computer Name:</span>{' '}
          <span style={{ borderBottom: '1px solid black', display: 'inline-block', minWidth: '300px' }}>
            CPDSC-MIS25
          </span>
        </div>
      </div>

      {/* Problem Table */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>Requesting the repair of the following:</div>
        <table style={{ width: '100%', border: '2px solid black', borderCollapse: 'collapse', fontSize: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black' }}>
              <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                Problem Issue
              </th>
              <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                Troubleshooting
              </th>
              <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                Report Time
              </th>
              <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                Status
              </th>
              <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                Completion<br />Date/Time
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid black', padding: '6px', verticalAlign: 'top' }}>
                {ticket.description || ticket.title}
              </td>
              <td style={{ border: '1px solid black', padding: '6px', verticalAlign: 'top' }}>
                {ticket.troubleshoot || (ticket.remarks ? ticket.remarks : '-')}
              </td>
              <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', verticalAlign: 'top' }}>
                {new Date(ticket.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </td>
              <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', verticalAlign: 'top' }}>
                {ticket.status}
              </td>
              <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', verticalAlign: 'top' }}>
                {ticket.status === 'RESOLVED' || ticket.status === 'VERIFIED'
                  ? `${new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n${new Date(ticket.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                  : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11px' }}>
        <div style={{ width: '48%' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Reported by:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '18px' }}>
              {ticket.requesterName}
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>IT Personnel:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '18px' }}>
              {ticket.assignedToName || '_________________'}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Verified by:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '18px' }}>
              {ticket.status === 'VERIFIED' ? 'ADMIN' : '_________________'}
            </div>
          </div>
        </div>
        <div style={{ width: '48%' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Department / Section:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '18px' }}>
              MANAGEMENT INFORMATION SYSTEM
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Date:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '18px' }}>
              {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '8px', color: '#666', marginTop: '1px' }}>(Date Reported)</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Date:</div>
            <div style={{ borderBottom: '1px solid black', minHeight: '18px' }}>
              {ticket.status === 'RESOLVED' || ticket.status === 'VERIFIED'
                ? new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : '_________________'}
            </div>
            <div style={{ fontSize: '8px', color: '#666', marginTop: '1px' }}>(Date Completed)</div>
          </div>
        </div>
      </div>

      {/* Copy Label */}
      <div style={{ textAlign: 'right', marginBottom: '10px', fontSize: '11px' }}>
        {copyLabel}
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '2px solid black', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
        <div>
          <div><span style={{ fontWeight: 'bold' }}>Doc Code:</span> MIS-010-F</div>
          <div><span style={{ fontWeight: 'bold' }}>Ver No:</span> C</div>
        </div>
        <div>
          <div><span style={{ fontWeight: 'bold' }}>Revision Date:</span> 22-Apr-2024</div>
          <div><span style={{ fontWeight: 'bold' }}>Issue Date:</span> 22-Apr-2024</div>
        </div>
        <div>
          <div><span style={{ fontWeight: 'bold' }}>Effectivity Date:</span> 22-Apr-2024</div>
          <div><span style={{ fontWeight: 'bold' }}>Retained by:</span> JCG</div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{ padding: '30px', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
      {/* Admin Copy */}
      <FormContent copyLabel="Admin Copy" />
      
      {/* Requisitioning Party Copy */}
      <FormContent copyLabel="Requisitioning Party Copy" />
    </div>
  );
});

TicketPrint.displayName = 'TicketPrint';

export default TicketPrint;
