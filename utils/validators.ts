/**
 * Reusable validation functions
 */

import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`);
  }

  // Optional: Add more password rules
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string = 'Field'): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate string length
 */
export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string = 'Field'
): string | null => {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must be ${max} characters or less`;
  }
  return null;
};

/**
 * Validate username
 */
export const validateUsername = (username: string): string | null => {
  if (!username || !username.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }

  if (username.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
    return `Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`;
  }

  if (username.length > VALIDATION_RULES.USERNAME_MAX_LENGTH) {
    return `Username must be ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters or less`;
  }

  // Only allow alphanumeric and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }

  return null;
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File): string | null => {
  if (file.size > VALIDATION_RULES.FILE_SIZE_MAX) {
    const maxSizeMB = VALIDATION_RULES.FILE_SIZE_MAX / (1024 * 1024);
    return `File "${file.name}" exceeds ${maxSizeMB}MB limit`;
  }
  return null;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, allowedExtensions: string[]): string | null => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return `File type "${extension}" is not allowed. Allowed: ${allowedExtensions.join(', ')}`;
  }
  return null;
};

/**
 * Validate ticket title
 */
export const validateTicketTitle = (title: string): string | null => {
  const requiredError = validateRequired(title, 'Title');
  if (requiredError) return requiredError;

  return validateLength(title, 1, VALIDATION_RULES.TITLE_MAX_LENGTH, 'Title');
};

/**
 * Validate ticket description
 */
export const validateTicketDescription = (description: string): string | null => {
  const requiredError = validateRequired(description, 'Description');
  if (requiredError) return requiredError;

  return validateLength(description, 10, VALIDATION_RULES.DESCRIPTION_MAX_LENGTH, 'Description');
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
  if (password !== confirmation) {
    return ERROR_MESSAGES.PASSWORD_MISMATCH;
  }
  return null;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: Record<string, string | null>): string[] => {
  return Object.values(errors).filter((error): error is string => error !== null);
};

/**
 * Check if form has errors
 */
export const hasValidationErrors = (errors: Record<string, string | null>): boolean => {
  return Object.values(errors).some(error => error !== null);
};
