import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Bell, Save, Lock, Globe, Check, AlertCircle, LayoutTemplate } from 'lucide-react';

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

const DEFAULT_RBAC = {
  [UserRole.ADMIN]: PERMISSIONS.map(p => p.id),
  [UserRole.TECHNICIAN]: ['view_dashboard', 'view_staff_directory', 'view_employee_profiles', 'create_ticket', 'view_all_tickets', 'edit_ticket', 'assign_ticket', 'view_reports'],
  [UserRole.EMPLOYEE]: ['create_ticket', 'view_dashboard', 'view_staff_directory']
};

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'rbac' | 'notifications'>('rbac');
  const [rbacConfig, setRbacConfig] = useState<Record<UserRole, string[]>>(DEFAULT_RBAC);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const togglePermission = (role: UserRole, permissionId: string) => {
    // Prevent removing Admin permissions to avoid lockout
    if (role === UserRole.ADMIN) return;

    setRbacConfig(prev => {
      const rolePermissions = prev[role];
      const hasPermission = rolePermissions.includes(permissionId);
      
      if (hasPermission) {
        return { ...prev, [role]: rolePermissions.filter(id => id !== permissionId) };
      } else {
        return { ...prev, [role]: [...rolePermissions, permissionId] };
      }
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSavedMessage('Settings saved successfully');
      setTimeout(() => setSavedMessage(null), 3000);
    }, 1000);
  };

  const Tabs = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
      <button
        onClick={() => setActiveTab('general')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${
          activeTab === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Globe className="w-4 h-4 mr-2" />
        General
      </button>
      <button
        onClick={() => setActiveTab('rbac')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${
          activeTab === 'rbac' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Shield className="w-4 h-4 mr-2" />
        Access Control (RBAC)
      </button>
      <button
        onClick={() => setActiveTab('notifications')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${
          activeTab === 'notifications' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Bell className="w-4 h-4 mr-2" />
        Notifications
      </button>
    </div>
  );

  // Group permissions by category
  const categories = Array.from(new Set(PERMISSIONS.map(p => p.category)));

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500">Manage global configurations and permissions.</p>
      </div>

      <Tabs />

      {activeTab === 'rbac' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
          </div>

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
      )}

      {activeTab === 'general' && (
        <div className="space-y-6 animate-fade-in">
          {/* System Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">System Configuration</h2>
              <p className="text-sm text-gray-500">Basic system information and settings</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    System Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue="NexGen IT Support"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Support Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    defaultValue="support@nexgen.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                    <option>UTC+8 (Philippine Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC-5 (EST)</option>
                    <option>UTC-8 (PST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                    <option>English (US)</option>
                    <option>Filipino</option>
                    <option>Spanish</option>
                    <option>Chinese</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Maintenance Mode</h2>
              <p className="text-sm text-gray-500">Temporarily disable access for system updates</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable Maintenance Mode</span>
                  <p className="text-xs text-gray-500">Only admins will be able to access the system</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in">
          {/* Email Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Email Notifications
              </h2>
              <p className="text-sm text-gray-500">Configure email alerts for various events</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">New Ticket Created</span>
                  <p className="text-xs text-gray-500">Receive email when a new ticket is submitted</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">Ticket Assigned to Me</span>
                  <p className="text-xs text-gray-500">Get notified when a ticket is assigned to you</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">Ticket Status Changed</span>
                  <p className="text-xs text-gray-500">Email when ticket status is updated</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">New Message Received</span>
                  <p className="text-xs text-gray-500">Alert when you receive a new support message</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">Ticket Comment Added</span>
                  <p className="text-xs text-gray-500">Notify when someone comments on your ticket</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* System Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">In-App Notifications</h2>
              <p className="text-sm text-gray-500">Control browser notifications and alerts</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">Desktop Notifications</span>
                  <p className="text-xs text-gray-500">Show browser notifications for important events</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">Sound Alerts</span>
                  <p className="text-xs text-gray-500">Play sound when receiving notifications</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">Badge Counters</span>
                  <p className="text-xs text-gray-500">Show unread count badges in navigation</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Frequency */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Notification Frequency</h2>
              <p className="text-sm text-gray-500">Control how often you receive notifications</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Digest
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                  <option>Real-time (Immediate)</option>
                  <option>Hourly Digest</option>
                  <option>Daily Digest</option>
                  <option>Weekly Digest</option>
                  <option>Disabled</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Group multiple notifications into a single email</p>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Do Not Disturb</span>
                  <p className="text-xs text-gray-500">Pause all notifications temporarily</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Admin Alerts</h2>
              <p className="text-sm text-gray-500">System-wide notifications for administrators</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">System Errors</span>
                  <p className="text-xs text-gray-500">Alert on critical system errors</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">New User Registrations</span>
                  <p className="text-xs text-gray-500">Notify when new users sign up</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">High Priority Tickets</span>
                  <p className="text-xs text-gray-500">Alert for critical/high priority tickets</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-4">
        {savedMessage && (
          <div className="bg-green-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center animate-fade-in">
            <Check className="w-4 h-4 mr-2" />
            {savedMessage}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl hover:bg-black transition-all flex items-center font-medium disabled:opacity-70"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};