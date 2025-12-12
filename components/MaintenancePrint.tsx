import React, { forwardRef } from 'react';
import { db } from '../services/mockDatabase';

interface MaintenancePrintProps {
  month: string;
  year: string;
  includedTickets: any[];
  users: any[];
}

const MaintenancePrint = forwardRef<HTMLDivElement, MaintenancePrintProps>(({ month, year, includedTickets, users }, ref) => {
  // Fetch all users from database to ensure we have current data
  const allUsers = db.getUsers();
  
  // Load PM Report configuration from localStorage
  const config = (() => {
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
      retainedBy: 'JCG',
      // PM Report specific fields
      pmReportTitle: 'MONTHLY PREVENTIVE MAINTENANCE RECORD',
      pmDepartment: 'MIS Department',
      pmIsoStandard: 'ISO 9001:2015',
      pmSite: 'CEBU',
      pmInstructions: 'This document shall be used to record Monthly Preventive Maintenance activities. The MIS Department shall be in charge of monitoring the overall health of the Computer Equipments',
      pmPreparedBy: 'Prepared by:',
      pmReviewedBy: 'Reviewed by:',
      pmApprovedBy: 'Approved by:'
    };
  })();
  
  // Helper function to get PC number from user data (using current database data)
  const getPcNumber = (requesterId: string) => {
    const user = allUsers.find(u => u.id === requesterId);
    return user?.pcNo || 'N/A';
  };
  
  // Helper function to get user name from database
  const getUserName = (requesterId: string) => {
    const user = allUsers.find(u => u.id === requesterId);
    return user?.name || 'N/A';
  };
  
  // Helper function to get department
  const getDepartment = (requesterId: string) => {
    const user = allUsers.find(u => u.id === requesterId);
    return user?.department || 'N/A';
  };
  return (
    <div ref={ref} style={{ padding: '20px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10px' }}>
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '60px', height: '60px', border: '2px solid black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {config.logoBase64 ? (
              <img src={config.logoBase64} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '8px', fontWeight: 'bold' }}>LOGO</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{config.companyName}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{config.pmReportTitle || 'MONTHLY PREVENTIVE MAINTENANCE RECORD'}</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>{config.pmDepartment || 'MIS Department'}</div>
          <div style={{ fontSize: '9px' }}>{config.pmIsoStandard || 'ISO 9001:2015'}</div>
        </div>
      </div>

      {/* Site and Month Info */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', border: '1px solid black', padding: '5px' }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Site:</span> {config.pmSite || 'CEBU'}
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>Month:</span> {month}
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>Year:</span> {year}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ border: '1px solid black', padding: '5px', marginBottom: '10px' }}>
        <div style={{ fontSize: '9px' }}>
          {config.pmInstructions || 'This document shall be used to record Monthly Preventive Maintenance activities. The MIS Department shall be in charge of monitoring the overall health of the Computer Equipments'}
        </div>
        <div style={{ fontSize: '9px', marginTop: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Instructions:</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ fontSize: '8px', marginBottom: '5px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Legend:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <span><strong>N</strong> - Network</span>
          <span><strong>C</strong> - CPU</span>
          <span><strong>P</strong> - PRINTER</span>
          <span><strong>M</strong> - MONITOR</span>
          <span><strong>Mo</strong> - MOUSE</span>
          <span><strong>K</strong> - KEYBOARD</span>
          <span><strong>S</strong> - ANTIVIRUS</span>
          <span><strong>NA</strong> - NOT APPLICABLE</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '2px' }}>
          <span><strong>U</strong> - UPS/AVR</span>
          <span><strong>D</strong> - DEFRAGMENT</span>
          <span><strong>FS</strong> - FINGER PRINT SCANNER</span>
          <span><strong>WC</strong> - WEBCAM</span>
          <span><strong>BS</strong> - BARCODE SCANNER</span>
          <span><strong>SP</strong> - SIGNATURE PAD</span>
          <span><strong>BP</strong> - BARCODE PRINTER</span>
          <span><strong>SC</strong> - SCANNING</span>
        </div>
      </div>

      {/* Main Table */}
      <table style={{ width: '100%', border: '2px solid black', borderCollapse: 'collapse', fontSize: '8px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th rowSpan={2} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>COMPUTER<br/>NAME</th>
            <th rowSpan={2} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>USER</th>
            <th colSpan={17} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>CHECK CABLE CONNECTION</th>
            <th colSpan={2} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>PRINT<br/>TEST<br/>PAGE</th>
            <th rowSpan={2} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>PROBLEM</th>
            <th rowSpan={2} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>DATE<br/>CREATED</th>
            <th rowSpan={2} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>STATUS</th>
            <th rowSpan={2} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>USER<br/>SIGNATURE</th>
          </tr>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>N</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>C</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>P</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>M</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>Mo</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>K</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>S</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>U</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>Sc</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>D</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>Fs</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>Wc</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>Bs</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>Sp</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>Bp</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>A/S</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>SPEC</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>N</th>
            <th style={{ border: '1px solid black', padding: '2px', fontSize: '7px' }}>C</th>
          </tr>
        </thead>
        <tbody>
          {allUsers.map((user, index) => {
            // Find if this user has any tickets in the included tickets
            const userTicket = includedTickets.find(t => t.requesterId === user.id);
            
            return (
              <tr key={user.id}>
                <td style={{ border: '1px solid black', padding: '3px', fontSize: '8px' }}>{user.pcNo || 'N/A'}</td>
                <td style={{ border: '1px solid black', padding: '3px', fontSize: '8px' }}>{user.name}</td>
                {/* N - Network */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.network ? '✓' : 'NA'}</td>
                {/* C - CPU */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.cpu ? '✓' : 'NA'}</td>
                {/* P - Printer */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.printer ? '✓' : 'NA'}</td>
                {/* M - Monitor */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.monitor ? '✓' : 'NA'}</td>
                {/* Mo - Mouse */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.mouse ? '✓' : 'NA'}</td>
                {/* K - Keyboard */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.keyboard ? '✓' : 'NA'}</td>
                {/* S - Antivirus */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.antiVirus ? '✓' : 'NA'}</td>
                {/* U - UPS/AVR */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.upsAvr ? '✓' : 'NA'}</td>
                {/* Sc - Scanning (not in equipment type, leave empty) */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
                {/* D - Defragment */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.defragment ? '✓' : 'NA'}</td>
                {/* Fs - Fingerprint Scanner */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.fingerPrintScanner ? '✓' : 'NA'}</td>
                {/* Wc - Webcam */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.webCamera ? '✓' : 'NA'}</td>
                {/* Bs - Barcode Scanner */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.barcodeScanner ? '✓' : 'NA'}</td>
                {/* Sp - Signature Pad */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.signaturePad ? '✓' : 'NA'}</td>
                {/* Bp - Barcode Printer */}
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>{user.equipment?.barcodePrinter ? '✓' : 'NA'}</td>
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
                <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
                <td style={{ border: '1px solid black', padding: '4px', fontSize: '8px', minWidth: '150px', maxWidth: '200px', wordWrap: 'break-word' }}>
                  {includedTickets
                    .filter(t => t.requesterId === user.id)
                    .map((ticket, idx) => (
                      <div key={ticket.id} style={{ marginBottom: idx < includedTickets.filter(t => t.requesterId === user.id).length - 1 ? '8px' : '0' }}>
                        {ticket.description || ticket.title || ''}
                      </div>
                    ))
                  }
                </td>
                <td style={{ border: '1px solid black', padding: '4px', fontSize: '8px', minWidth: '80px', textAlign: 'center' }}>
                  {includedTickets
                    .filter(t => t.requesterId === user.id)
                    .map((ticket, idx) => (
                      <div key={ticket.id} style={{ marginBottom: idx < includedTickets.filter(t => t.requesterId === user.id).length - 1 ? '8px' : '0' }}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    ))
                  }
                </td>
                <td style={{ border: '1px solid black', padding: '4px', fontSize: '8px', minWidth: '80px', textAlign: 'center' }}>
                  {includedTickets
                    .filter(t => t.requesterId === user.id)
                    .map((ticket, idx) => (
                      <div key={ticket.id} style={{ marginBottom: idx < includedTickets.filter(t => t.requesterId === user.id).length - 1 ? '8px' : '0' }}>
                        {ticket.status}
                      </div>
                    ))
                  }
                </td>
                <td style={{ border: '1px solid black', padding: '3px', fontSize: '8px', minWidth: '80px' }}></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '8px' }}>
        <div>
          <div><strong>Doc No:</strong> {config.docCode || 'MIS-004-F'}</div>
          <div><strong>Ver No:</strong> {config.versionNo || '6'}</div>
        </div>
        <div>
          <div><strong>Revision Date:</strong> {config.revisionDate || '16-Jan-2024'}</div>
          <div><strong>Issue Date:</strong> {config.issueDate || '16-Jan-2024'}</div>
        </div>
        <div>
          <div><strong>Effectivity Date:</strong> {config.effectivityDate || '17-Jan-2024'}</div>
          <div><strong>Retained by:</strong> {config.retainedBy || 'JCG'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>
            <span className="screen-only">Page 1 of 1</span>
            <span className="print-only">Page <span className="page-number"></span> of <span className="page-count"></span></span>
          </div>
          <div>Paper: {config.paperSize || 'Long Bond'}</div>
        </div>
      </div>
      
      {/* Auto page numbering script */}
      <style>{`
        .screen-only {
          display: inline;
        }
        .print-only {
          display: none;
        }
        
        @media print {
          .screen-only {
            display: none;
          }
          .print-only {
            display: inline;
          }
          .page-number::after {
            content: counter(page);
          }
          .page-count::after {
            content: counter(pages);
          }
        }
      `}</style>
    </div>
  );
});

MaintenancePrint.displayName = 'MaintenancePrint';

export default MaintenancePrint;
