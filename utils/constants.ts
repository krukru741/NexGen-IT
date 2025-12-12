/**
 * Application-wide constants
 */

// LocalStorage Keys
export const STORAGE_KEYS = {
  USERS: 'nexgen_users_v4',
  TICKETS: 'nexgen_tickets_v4',
  LOGS: 'nexgen_logs_v4',
  MESSAGES: 'nexgen_messages_v4',
  DRAFT: 'nexgen_ticket_draft',
  AUTH_USER: 'nexgen_auth_user',
  PERMISSIONS: 'nexgen_permissions',
  SETTINGS: 'nexgen_settings',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  FILE_SIZE_MAX: 10 * 1024 * 1024, // 10MB
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
} as const;

// File Upload Configuration
export const FILE_UPLOAD = {
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt'],
  MAX_FILES: 5,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Timeouts and Delays
export const TIMEOUTS = {
  TOAST_DURATION: 3000, // 3 seconds
  DEBOUNCE_DELAY: 1000, // 1 second
  AUTO_SAVE_DELAY: 1000, // 1 second
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// API Configuration (for future backend integration)
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Application Metadata
export const APP_INFO = {
  NAME: 'NexGen-IT Support',
  VERSION: '1.0.0',
  DESCRIPTION: 'IT Ticketing and Service Request Management System',
} as const;

// Default Values
export const DEFAULTS = {
  AVATAR_PLACEHOLDER: 'https://ui-avatars.com/api/?name=User&background=random',
  DEPARTMENT: 'General',
  PC_NO: 'N/A',
  IP_ADDRESS: 'N/A',
} as const;

// Equipment Default State
export const DEFAULT_EQUIPMENT = {
  network: false,
  cpu: false,
  printer: false,
  monitor: false,
  keyboard: false,
  antiVirus: false,
  upsAvr: false,
  defragment: false,
  signaturePad: false,
  webCamera: false,
  barcodeScanner: false,
  barcodePrinter: false,
  fingerPrintScanner: false,
  mouse: false,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY',
  WITH_TIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  LOGIN_FAILED: 'Invalid username or password',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TICKET_CREATED: 'Ticket created successfully',
  TICKET_UPDATED: 'Ticket updated successfully',
  TICKET_DELETED: 'Ticket deleted successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;
