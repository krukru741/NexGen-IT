/**
 * Data migration utilities for localStorage schema versioning
 */

import { STORAGE_KEYS } from '../utils/constants';
import { DatabaseError, MigrationError } from './errors';

const CURRENT_VERSION = 4;
const VERSION_KEY = 'nexgen_data_version';

interface MigrationFunction {
  (data: any): any;
}

// Migration functions for each version upgrade
const migrations: Record<number, MigrationFunction> = {
  // Example: Migrate from v1 to v2
  1: (data) => {
    // Add any schema changes from v1 to v2
    return data;
  },
  // Example: Migrate from v2 to v3
  2: (data) => {
    // Add any schema changes from v2 to v3
    return data;
  },
  // Example: Migrate from v3 to v4
  3: (data) => {
    // Add any schema changes from v3 to v4
    return data;
  },
};

/**
 * Get current data version from localStorage
 */
export const getCurrentVersion = (): number => {
  const version = localStorage.getItem(VERSION_KEY);
  return version ? parseInt(version, 10) : 1;
};

/**
 * Set data version in localStorage
 */
export const setVersion = (version: number): void => {
  localStorage.setItem(VERSION_KEY, version.toString());
};

/**
 * Check if migration is needed
 */
export const needsMigration = (): boolean => {
  const currentVersion = getCurrentVersion();
  return currentVersion < CURRENT_VERSION;
};

/**
 * Migrate data from old version to current version
 */
export const migrateData = (): void => {
  const currentVersion = getCurrentVersion();
  
  if (currentVersion === CURRENT_VERSION) {
    console.log('Data is up to date, no migration needed');
    return;
  }

  if (currentVersion > CURRENT_VERSION) {
    throw new MigrationError(
      'Data version is newer than application version. Please update the application.',
      currentVersion,
      CURRENT_VERSION
    );
  }

  console.log(`Migrating data from version ${currentVersion} to ${CURRENT_VERSION}`);

  try {
    // Backup current data before migration
    backupData();

    // Apply migrations sequentially
    for (let version = currentVersion; version < CURRENT_VERSION; version++) {
      const migrationFn = migrations[version];
      if (migrationFn) {
        console.log(`Applying migration ${version} -> ${version + 1}`);
        
        // Migrate each data store
        migrateStore(STORAGE_KEYS.USERS, migrationFn);
        migrateStore(STORAGE_KEYS.TICKETS, migrationFn);
        migrateStore(STORAGE_KEYS.LOGS, migrationFn);
        migrateStore(STORAGE_KEYS.MESSAGES, migrationFn);
      }
    }

    // Update version
    setVersion(CURRENT_VERSION);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw new MigrationError(
      `Failed to migrate data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      currentVersion,
      CURRENT_VERSION
    );
  }
};

/**
 * Migrate a specific localStorage store
 */
const migrateStore = (key: string, migrationFn: MigrationFunction): void => {
  const rawData = localStorage.getItem(key);
  if (!rawData) return;

  try {
    const data = JSON.parse(rawData);
    const migratedData = migrationFn(data);
    localStorage.setItem(key, JSON.stringify(migratedData));
  } catch (error) {
    throw new DatabaseError(`Failed to migrate store "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Backup all data to a separate key
 */
export const backupData = (): void => {
  const timestamp = new Date().toISOString();
  const backupKey = `nexgen_backup_${timestamp}`;
  
  const backup = {
    version: getCurrentVersion(),
    timestamp,
    data: {
      users: localStorage.getItem(STORAGE_KEYS.USERS),
      tickets: localStorage.getItem(STORAGE_KEYS.TICKETS),
      logs: localStorage.getItem(STORAGE_KEYS.LOGS),
      messages: localStorage.getItem(STORAGE_KEYS.MESSAGES),
    },
  };

  localStorage.setItem(backupKey, JSON.stringify(backup));
  console.log(`Data backed up to ${backupKey}`);
};

/**
 * Restore data from a backup
 */
export const restoreFromBackup = (backupKey: string): void => {
  const backupData = localStorage.getItem(backupKey);
  if (!backupData) {
    throw new DatabaseError(`Backup "${backupKey}" not found`);
  }

  try {
    const backup = JSON.parse(backupData);
    
    if (backup.data.users) localStorage.setItem(STORAGE_KEYS.USERS, backup.data.users);
    if (backup.data.tickets) localStorage.setItem(STORAGE_KEYS.TICKETS, backup.data.tickets);
    if (backup.data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, backup.data.logs);
    if (backup.data.messages) localStorage.setItem(STORAGE_KEYS.MESSAGES, backup.data.messages);
    
    setVersion(backup.version);
    console.log(`Data restored from backup ${backupKey}`);
  } catch (error) {
    throw new DatabaseError(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * List all available backups
 */
export const listBackups = (): string[] => {
  const backups: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('nexgen_backup_')) {
      backups.push(key);
    }
  }
  return backups.sort().reverse(); // Most recent first
};

/**
 * Export all data as JSON string
 */
export const exportData = (): string => {
  const data = {
    version: getCurrentVersion(),
    exportedAt: new Date().toISOString(),
    users: localStorage.getItem(STORAGE_KEYS.USERS),
    tickets: localStorage.getItem(STORAGE_KEYS.TICKETS),
    logs: localStorage.getItem(STORAGE_KEYS.LOGS),
    messages: localStorage.getItem(STORAGE_KEYS.MESSAGES),
    permissions: localStorage.getItem(STORAGE_KEYS.PERMISSIONS),
  };

  return JSON.stringify(data, null, 2);
};

/**
 * Import data from JSON string
 */
export const importData = (jsonData: string): void => {
  try {
    const data = JSON.parse(jsonData);
    
    // Backup current data before import
    backupData();
    
    // Import data
    if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, data.users);
    if (data.tickets) localStorage.setItem(STORAGE_KEYS.TICKETS, data.tickets);
    if (data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, data.logs);
    if (data.messages) localStorage.setItem(STORAGE_KEYS.MESSAGES, data.messages);
    if (data.permissions) localStorage.setItem(STORAGE_KEYS.PERMISSIONS, data.permissions);
    
    // Set version if provided
    if (data.version) {
      setVersion(data.version);
    }
    
    console.log('Data imported successfully');
  } catch (error) {
    throw new DatabaseError(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Clear all data (with confirmation)
 */
export const clearAllData = (): void => {
  // Backup before clearing
  backupData();
  
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.TICKETS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  
  console.log('All data cleared');
};
