/**
 * Custom error classes for better error handling
 */

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public errors?: string[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends Error {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} "${value}" already exists`);
    this.name = 'DuplicateError';
  }
}

export class MigrationError extends Error {
  constructor(message: string, public fromVersion?: number, public toVersion?: number) {
    super(message);
    this.name = 'MigrationError';
  }
}
