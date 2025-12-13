import React from 'react';
import { UserRole } from '../../types';
import { Lock, AlertCircle } from 'lucide-react';
import { usePermission } from '../../contexts/PermissionContext';
import { Card } from '../ui';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'General' | 'Ticket Management' | 'Administration';
}

const PERMISSIONS: Permission[] = [
  // General
  { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to the main analytics dashboard', category: 'General' },
  { id: 'view_staff_directory', name: 'View Staff Directory', description: 'Access to the employee and staff list', category: 'General' },
  { id: 'view_employee_profiles', name: 'View Employee Profiles', description: 'View general staff profiles (Uncheck to restrict to IT Staff only)', category: 'General' },
  
  // Ticket Management
  { id: 'create_ticket', name: 'Create Tickets', description: 'Ability to submit new support requests', category: 'Ticket Management' },
  { id: 'view_all_tickets', name: 'View All Tickets', description: 'View tickets submitted by other users', category: 'Ticket Management' },
  { id: 'edit_ticket', name: 'Edit Tickets', description: 'Modify ticket details and status', category: 'Ticket Management' },
  { id: 'assign_ticket', name: 'Assign Tickets', description: 'Assign tickets to technicians', category: 'Ticket Management' },
  { id: 'delete_ticket', name: 'Delete Tickets', description: 'Permanently remove tickets from the system', category: 'Ticket Management' },
  
  // Administration
  { id: 'manage_users', name: 'Manage Users', description: 'Add, edit, or remove user accounts', category: 'Administration' },
  { id: 'view_reports', name: 'View Reports', description: 'Access detailed system reports and exports', category: 'Administration' },
  { id: 'manage_ui_branding', name: 'Manage UI & Branding', description: 'Customize logos, colors, and portal announcements', category: 'Administration' },
  { id: 'manage_settings', name: 'System Settings', description: 'Access and modify global configuration', category: 'Administration' },
];

export const RBACTab: React.FC = () => {
  const { rbacConfig, updatePermissions } = usePermission();

  const togglePermission = (role: UserRole, permissionId: string) => {
    // Prevent removing Admin permissions to avoid lockout
    if (role === UserRole.ADMIN) return;

    const rolePermissions = rbacConfig[role] || [];
    const hasPermission = rolePermissions.includes(permissionId);
    
    let newPermissions: string[];
    if (hasPermission) {
      newPermissions = rolePermissions.filter(id => id !== permissionId);
    } else {
      newPermissions = [...rolePermissions, permissionId];
    }
    
    updatePermissions(role, newPermissions);
  };

  const categories = Array.from(new Set(PERMISSIONS.map(p => p.category)));

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Role-Based Access Control</h2>
            <p className="text-sm text-gray-500">Define what each role can do within the application.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 flex items-center">
            <Lock className="w-3 h-3 mr-1" /> Admin permissions are locked for security
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Permission</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Admin</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Technician</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(category => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-gray-50/80">
                    <td colSpan={4} className="px-6 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {category}
                    </td>
                  </tr>
                  {/* Permission Rows */}
                  {PERMISSIONS.filter(p => p.category === category).map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-50 transition-colors bg-white">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                          <span className="text-xs text-gray-500">{permission.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center bg-gray-50/30">
                        <input 
                          type="checkbox" 
                          checked={true} 
                          disabled 
                          className="w-4 h-4 text-gray-400 border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={rbacConfig[UserRole.TECHNICIAN].includes(permission.id)} 
                          onChange={() => togglePermission(UserRole.TECHNICIAN, permission.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={rbacConfig[UserRole.EMPLOYEE].includes(permission.id)} 
                          onChange={() => togglePermission(UserRole.EMPLOYEE, permission.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-yellow-800">Important Security Note</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Changes to access control policies take effect immediately. Ensure you do not accidentally remove critical access rights from Technicians.
          </p>
        </div>
      </div>
    </div>
  );
};
