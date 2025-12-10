import React, { forwardRef } from 'react';

interface MaintenancePrintProps {
  month: string;
  year: string;
  includedTickets: any[];
  users: any[];
}

const MaintenancePrint = forwardRef<HTMLDivElement, MaintenancePrintProps>(({ month, year, includedTickets, users }, ref) => {
  // Helper function to get PC number from user data
  const getPcNumber = (requesterId: string) => {
    const user = users.find(u => u.id === requesterId);
    return user?.pcNo || 'N/A';
  };
  return (
    <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
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
          <div style={{ width: '60px', height: '60px', border: '2px solid black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '8px', fontWeight: 'bold' }}>LOGO</span>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>PHYSICIAN'S DIAGNOSTIC</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>SERVICES CENTER, INC</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>MONTHLY PREVENTIVE</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>MAINTENANCE RECORD</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>MIS Department</div>
          <div style={{ fontSize: '9px' }}>ISO 9001:2015</div>
        </div>
      </div>

      {/* Site and Month Info */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', border: '1px solid black', padding: '5px' }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Site:</span> CEBU
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
          This document shall be used to record Monthly Preventive Maintenance activities. The MIS Department shall be in charge of monitoring the overall health of the Computer Equipments
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
          {includedTickets.map((ticket, index) => (
            <tr key={ticket.id}>
              <td style={{ border: '1px solid black', padding: '3px', fontSize: '8px' }}>{getPcNumber(ticket.requesterId)}</td>
              <td style={{ border: '1px solid black', padding: '3px', fontSize: '8px' }}>{ticket.requesterName || 'N/A'}</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>NA</td>
              {/* Print Test Page - N and C */}
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center' }}>✓</td>
              {/* Problem, Status, User Signature */}
              <td style={{ border: '1px solid black', padding: '4px', fontSize: '8px', minWidth: '150px', maxWidth: '200px', wordWrap: 'break-word' }}>{ticket.description || ticket.title || ''}</td>
              <td style={{ border: '1px solid black', padding: '4px', fontSize: '8px', minWidth: '80px', textAlign: 'center' }}>{ticket.status || ''}</td>
              <td style={{ border: '1px solid black', padding: '3px', fontSize: '8px', minWidth: '80px' }}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '8px' }}>
        <div>
          <div><strong>Doc No:</strong> MIS-004-F</div>
          <div><strong>Ver No:</strong> 6</div>
        </div>
        <div>
          <div><strong>Revision Date:</strong> 16-Jan-2024</div>
          <div><strong>Issue Date:</strong> 16-Jan-2024</div>
        </div>
        <div>
          <div><strong>Effectivity Date:</strong> 17-Jan-2024</div>
          <div><strong>Retained by:</strong> JCG</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>Page 1 of 2</div>
          <div>Page: Long Bond</div>
        </div>
      </div>
    </div>
  );
});

MaintenancePrint.displayName = 'MaintenancePrint';

export default MaintenancePrint;
