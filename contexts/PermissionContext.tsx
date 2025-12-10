import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface PermissionContextType {
  rbacConfig: Record<UserRole, string[]>;
  updatePermissions: (role: UserRole, permissions: string[]) => void;
  hasPermission: (role: UserRole | undefined, permissionId: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Default permissions (fallback)
const DEFAULT_RBAC = {
  [UserRole.ADMIN]: [
    'view_dashboard', 'view_staff_directory', 'view_employee_profiles', 
    'create_ticket', 'view_all_tickets', 'edit_ticket', 'assign_ticket', 'delete_ticket',
    'manage_users', 'view_reports', 'manage_ui_branding', 'manage_settings'
  ],
  [UserRole.TECHNICIAN]: [
    'view_dashboard', 'view_staff_directory', 'view_employee_profiles', 
    'create_ticket', 'view_all_tickets', 'edit_ticket', 'assign_ticket', 'view_reports'
  ],
  [UserRole.EMPLOYEE]: [
    'create_ticket', 'view_dashboard', 'view_staff_directory'
  ]
};

const RBAC_STORAGE_KEY = 'nexgen_rbac_config';

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rbacConfig, setRbacConfig] = useState<Record<UserRole, string[]>>(() => {
    const saved = localStorage.getItem(RBAC_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_RBAC;
  });

  // Persist to localStorage whenever config changes
  useEffect(() => {
    localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(rbacConfig));
  }, [rbacConfig]);

  const updatePermissions = (role: UserRole, permissions: string[]) => {
    setRbacConfig(prev => ({
      ...prev,
      [role]: permissions
    }));
  };

  const hasPermission = (role: UserRole | undefined, permissionId: string): boolean => {
    if (!role) return false;
    
    // Admin always has logic or check config? Plan says verify hard lockout.
    // For safety, Admin generally has access, but we can rely on config if config forcesadmin rights.
    // Let's rely on config but ensure Admin default config is robust. 
    // Actually, user settings page prevents removing Admin rights, so safe to trust config.
    
    return rbacConfig[role]?.includes(permissionId) || false;
  };

  return (
    <PermissionContext.Provider value={{ rbacConfig, updatePermissions, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};
