/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format a date as a localized date string (e.g., "12/12/2025")
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

/**
 * Format a date as a localized date and time string (e.g., "12/12/2025, 12:58 PM")
 */
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString();
};

/**
 * Format a date as relative time (e.g., "2 hours ago", "just now")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Check if a date is today
 */
export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getFullYear() === checkDate.getFullYear() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getDate() === checkDate.getDate();
};

/**
 * Get month name from month number (1-12)
 */
export const getMonthName = (monthNum: string | number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const index = typeof monthNum === 'string' ? parseInt(monthNum, 10) - 1 : monthNum - 1;
  return months[index] || 'Invalid Month';
};

/**
 * Get short month name from month number (1-12)
 */
export const getShortMonthName = (monthNum: string | number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const index = typeof monthNum === 'string' ? parseInt(monthNum, 10) - 1 : monthNum - 1;
  return months[index] || 'Invalid';
};

/**
 * Format date for display in ticket lists (e.g., "Dec 12, 2025")
 */
export const formatTicketDate = (date: string | Date): string => {
  const d = new Date(date);
  const month = getShortMonthName(d.getMonth() + 1);
  const day = d.getDate();
  const year = d.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

/**
 * Get the number of days between two dates
 */
export const getDaysBetween = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
