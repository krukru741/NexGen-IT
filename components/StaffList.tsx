import React, { useState, useMemo } from 'react';
import { UserRole, User } from '../types';
import { db } from '../services/mockDatabase';
import { Shield, Wrench, User as UserIcon, Mail, LayoutGrid, List, Filter, Search, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StaffListProps {
  currentUser: User;
}

export const StaffList: React.FC<StaffListProps> = ({ currentUser }) => {
  const users = db.getUsers();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STAFF' | 'EMPLOYEE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // RBAC Check: Employees can only see Admin and Technicians
  const isEmployee = currentUser.role === UserRole.EMPLOYEE;

  // Filter and Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 1. RBAC Restriction
      if (isEmployee) {
        if (user.role === UserRole.EMPLOYEE) {
          return false; // Hide other employees
        }
      }

      // 2. Search
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 3. Toolbar Filter (Only apply if not already restricted by RBAC)
      let matchesRole = true;
      if (!isEmployee) {
        matchesRole = roleFilter === 'ALL' 
          ? true 
          : roleFilter === 'STAFF' 
            ? (user.role === UserRole.ADMIN || user.role === UserRole.TECHNICIAN)
            : (user.role === UserRole.EMPLOYEE);
      }

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter, isEmployee]);

  // Grouping logic
  const staffMembers = filteredUsers.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.TECHNICIAN);
  const employees = filteredUsers.filter(u => u.role === UserRole.EMPLOYEE);

  const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    switch (role) {
      case UserRole.ADMIN:
        return <span className="px-2.5 py-0.5 text-xs font-bold text-purple-700 bg-purple-100 rounded-full flex items-center w-fit border border-purple-200"><Shield className="w-3 h-3 mr-1.5"/> Admin</span>;
      case UserRole.TECHNICIAN:
        return <span className="px-2.5 py-0.5 text-xs font-bold text-blue-700 bg-blue-100 rounded-full flex items-center w-fit border border-blue-200"><Wrench className="w-3 h-3 mr-1.5"/> Technician</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-full flex items-center w-fit border border-gray-200"><UserIcon className="w-3 h-3 mr-1.5"/> Employee</span>;
    }
  };

  const UserCard: React.FC<{ user: User }> = ({ user }) => (
    <div 
      onClick={() => navigate(`/staff/${user.id}`)}
      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300 flex items-start space-x-4 group h-full"
    >
      <div className="relative">
        <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors" />
        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            user.role === UserRole.EMPLOYEE ? 'bg-gray-400' : 'bg-green-500'
        }`} title="Status"></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</h3>
        <div className="mb-3 mt-1">
          <RoleBadge role={user.role} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-xs text-gray-500">
            <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const UserRow: React.FC<{ user: User }> = ({ user }) => (
    <div 
      onClick={() => navigate(`/staff/${user.id}`)}
      className="bg-white p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors last:border-0"
    >
        <div className="flex items-center space-x-4 w-1/3">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">{user.name}</h3>
            </div>
        </div>
        
        <div className="w-1/3">
            <div className="text-sm text-gray-500 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                {user.email}
            </div>
        </div>

        <div className="flex items-center justify-end w-1/3 gap-4">
            <RoleBadge role={user.role} />
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
        </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{isEmployee ? 'IT Support Directory' : 'Staff Directory'}</h2>
              <p className="text-gray-500">
                {isEmployee 
                  ? 'Contact our technical support team for assistance.' 
                  : 'View and manage team members, assignments, and roles.'}
              </p>
            </div>
            {isEmployee && (
              <div className="hidden md:flex items-center px-3 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100">
                <Shield className="w-3 h-3 mr-1" /> IT Staff Only View
              </div>
            )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="pl-10 pr-4 py-2 text-sm w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-4">
                {/* Role Filter (Hide for Employees) */}
                {!isEmployee && (
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Filter className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value as any)}
                          className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:bg-white transition-colors"
                      >
                          <option value="ALL">All Roles</option>
                          <option value="STAFF">IT Staff Only</option>
                          <option value="EMPLOYEE">Employees Only</option>
                      </select>
                  </div>
                )}

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                    <button 
                        onClick={() => setViewMode('detailed')}
                        className={`p-2 rounded-md transition-all flex items-center justify-center ${viewMode === 'detailed' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                        title="Detailed Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="sr-only">Grid</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('compact')}
                        className={`p-2 rounded-md transition-all flex items-center justify-center ${viewMode === 'compact' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                        title="Compact List View"
                    >
                        <List className="w-4 h-4" />
                        <span className="sr-only">List</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Content Rendering */}
      {viewMode === 'detailed' ? (
           <div className="space-y-8 animate-fade-in">
                {/* IT Staff Section */}
                {staffMembers.length > 0 && (
                     <div>
                        {(!isEmployee || roleFilter === 'ALL') && (
                           <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center">
                             <Shield className="w-4 h-4 mr-2"/> IT Administration & Support
                           </h3>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {staffMembers.map(user => <UserCard key={user.id} user={user} />)}
                        </div>
                     </div>
                )}
                
                {/* Employee Section (Hidden for Employees) */}
                {employees.length > 0 && (
                     <div>
                        {(!isEmployee || roleFilter === 'ALL') && (
                           <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 mt-8 flex items-center">
                             <UserIcon className="w-4 h-4 mr-2"/> General Staff
                           </h3>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {employees.map(user => <UserCard key={user.id} user={user} />)}
                        </div>
                     </div>
                )}

                {filteredUsers.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No users found matching your search.</p>
                    </div>
                )}
           </div>
      ) : (
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
               <div className="overflow-x-auto">
                    {/* Compact List Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                        <div className="w-1/3 pl-14">User</div>
                        <div className="w-1/3">Contact</div>
                        <div className="w-1/3 text-right pr-12">Role & Action</div>
                    </div>
                    
                    {filteredUsers.map(user => <UserRow key={user.id} user={user} />)}
                    
                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No users found matching your criteria.
                        </div>
                    )}
               </div>
           </div>
      )}
    </div>
  );
};