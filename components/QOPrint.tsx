import React from 'react';
import { Ticket } from '../types';

interface QOPrintProps {
  month: string;
  year: string;
  includedTickets: Ticket[];
  category?: string; // Optional: 'HARDWARE' or 'SOFTWARE'
}

export const QOPrint = React.forwardRef<HTMLDivElement, QOPrintProps>(
  ({ month, year, includedTickets, category }, ref) => {
    // Get number of days in the selected month
    const getDaysInMonth = (month: string, year: string) => {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      return new Date(yearNum, monthNum, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(month, year);

    // Convert month number to name
    const getMonthName = (monthNum: string) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
      return months[parseInt(monthNum) - 1];
    };

    // Check if a day is Saturday (6) or Sunday (0)
    const getDayName = (day: number) => {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const date = new Date(yearNum, monthNum - 1, day);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0) return 'SUNDAY';
      if (dayOfWeek === 6) return 'SATURDAY';
      return null;
    };

    // Count tickets for each day
    const getTicketsForDay = (day: number) => {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      return includedTickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        const matchesDate = ticketDate.getDate() === day &&
               ticketDate.getMonth() + 1 === monthNum &&
               ticketDate.getFullYear() === yearNum;
        
        // Filter by category if specified
        if (category) {
          return matchesDate && ticket.category.toUpperCase() === category.toUpperCase();
        }
        return matchesDate;
      }).length;
    };

    const totalTickets = category 
      ? includedTickets.filter(t => t.category.toUpperCase() === category.toUpperCase()).length
      : includedTickets.length;

    return (
      <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
        <style>
          {`
            @media print {
              @page {
                size: portrait;
                margin: 0.5in;
              }
            }
          `}
        </style>
        {/* Header */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Quality Objectives Monitoring Sheet</div>
          <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse', marginTop: '5px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px', width: '20%' }}>Department:</td>
                <td style={{ border: '1px solid black', padding: '2px', width: '30%', fontWeight: 'bold' }}>
                  MIS{category ? ` - ${category.toUpperCase()}` : ''}
                </td>
                <td style={{ border: '1px solid black', padding: '2px', width: '20%' }}>Period Covered:</td>
                <td style={{ border: '1px solid black', padding: '2px', width: '30%', fontWeight: 'bold' }}>
                  {getMonthName(month).toUpperCase()} {year}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* KPI */}
        <div style={{ marginBottom: '10px' }}>
          <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '2px', width: '10%' }}>KPI:</td>
                <td style={{ border: '1px solid black', padding: '2px' }}>
                  100% of hardware service requests within the set target date
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Main Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', border: '1px solid black' }}>
          <thead>
            <tr style={{ borderTop: '1px solid black', borderBottom: '1px solid black' }}>
              <th style={{ padding: '4px', fontWeight: 'bold', textAlign: 'left', borderRight: '1px solid black' }}>Month</th>
              <th colSpan={2} style={{ padding: '4px', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid black' }}>
                No. of {category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'Hardware'} Service Requests Addressed within Set Target Dates
              </th>
              <th colSpan={2} style={{ padding: '4px', fontWeight: 'bold', textAlign: 'center', borderLeft: '1px solid black' }}>
                No. of {category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'Hardware'} Service Requests Received
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayName = getDayName(day);
              const ticketCount = getTicketsForDay(day);
              
              return (
                <tr key={day} style={{ borderBottom: '1px solid black' }}>
                  <td style={{ padding: '2px', textAlign: 'center', borderRight: '1px solid black' }}>{day}</td>
                  <td style={{ padding: '2px', textAlign: 'center' }}>
                    {dayName || ticketCount}
                  </td>
                  <td style={{ padding: '2px', textAlign: 'center' }}></td>
                  <td style={{ padding: '2px', textAlign: 'center', borderLeft: '1px solid black'}}>
                    {dayName || ticketCount}
                  </td>
                  <td style={{ padding: '2px', textAlign: 'center' }}></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: '10px', fontSize: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '33%' }}>Doc. Code: MIS-007-F</td>
                <td style={{ width: '34%', textAlign: 'center' }}>Issue Date: 26-Feb-21</td>
                <td style={{ width: '33%', textAlign: 'right' }}>Page 1 of 1</td>
              </tr>
              <tr>
                <td>Ver. No: 00</td>
                <td style={{ textAlign: 'center' }}>Effectivity Date: 01-Mar-21</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

QOPrint.displayName = 'QOPrint';
