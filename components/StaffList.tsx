import React, { useState, useMemo } from 'react';
import { UserRole, User } from '../types';
import { db } from '../services/mockDatabase';
import { Shield, Wrench, User as UserIcon, Mail, LayoutGrid, List, Filter, Search, ArrowRight, Lock, UserPlus, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateStaffModal } from './modals/CreateStaffModal';
import { StaffDetailsModal } from './modals/StaffDetailsModal';
import { MessageITSupportModal } from './modals/MessageITSupportModal';

interface StaffListProps {
  currentUser: User;
}

export const StaffList: React.FC<StaffListProps> = ({ currentUser }) => {
  const users = db.getUsers();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STAFF' | 'EMPLOYEE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

      // 2. Search by name
      const matchesName = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 3. Search by email
      const matchesEmail = emailFilter === '' || user.email.toLowerCase().includes(emailFilter.toLowerCase());
      
      // 4. Toolbar Filter
      let matchesRole = true;
      if (!isEmployee) {
        matchesRole = roleFilter === 'ALL' 
          ? true 
          : roleFilter === 'STAFF' 
            ? (user.role === UserRole.ADMIN || user.role === UserRole.TECHNICIAN)
            : (user.role === UserRole.EMPLOYEE);
      }

      return matchesName && matchesEmail && matchesRole;
    });
  }, [users, searchQuery, emailFilter, roleFilter, isEmployee]);

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
      onClick={() => {
        setSelectedUser(user);
        setShowDetailsModal(true);
      }}
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
        <div className="space-y-1.5">
          <div className="flex items-center text-xs text-gray-600">
            <Building2 className="w-3.5 h-3.5 mr-2 text-gray-400" />
            <span className="truncate font-medium">IT Department</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-3.5 h-3.5 mr-2 text-gray-400 font-bold flex items-center justify-center">PC</span>
            <span className="truncate">CPDSC-MIS01</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span className="w-3.5 h-3.5 mr-2 text-gray-400 font-bold flex items-center justify-center">IP</span>
            <span className="truncate">192.168.1.100</span>
          </div>
        </div>
      </div>
    </div>
  );

  const UserRow: React.FC<{ user: User }> = ({ user }) => (
    <div 
      onClick={() => {
        setSelectedUser(user);
        setShowDetailsModal(true);
      }}
      className="bg-white p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors last:border-0"
    >
        <div className="flex items-center space-x-4 w-1/3">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">{user.name}</h3>
            </div>
        </div>
        
        <div className="w-1/4">
            <div className="text-sm text-gray-700 font-medium">IT Department</div>
        </div>

        <div className="w-1/4">
            <div className="text-sm text-gray-600 font-medium">CPDSC-MIS01</div>
        </div>

        <div className="w-1/4">
            <div className="text-sm text-gray-500">192.168.1.100</div>
        </div>

        <div className="flex items-center justify-end w-1/4 gap-4">
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

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Search Filters</h3>
            {currentUser.role === UserRole.ADMIN && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                Create Staff
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Employee Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by name..." 
                  className="pl-10 pr-4 py-2 text-sm w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by email..." 
                  className="pl-10 pr-4 py-2 text-sm w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  disabled={isEmployee}
                  className="pl-10 pr-4 py-2 text-sm w-full border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer disabled:bg-gray-100"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STAFF">IT Staff Only</option>
                  <option value="EMPLOYEE">Employees Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Filter by department..." 
                  className="pl-10 pr-4 py-2 text-sm w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowDetailsModal(true)}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Showing <span className="font-semibold">{filteredUsers.length}</span> {filteredUsers.length === 1 ? 'user' : 'users'}
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button 
              onClick={() => setViewMode('detailed')}
              className={`p-2 rounded-md transition-all ${viewMode === 'detailed' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-md transition-all ${viewMode === 'compact' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
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
                        <div className="w-1/4 pl-14">User</div>
                        <div className="w-1/4">Department</div>
                        <div className="w-1/4">PC No.</div>
                        <div className="w-1/4">IP Address</div>
                        <div className="w-1/4 text-right pr-12">Role</div>
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

      <CreateStaffModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {isEmployee ? (
        <MessageITSupportModal 
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          supportStaff={selectedUser || filteredUsers[0]}
          currentUser={currentUser}
        />
      ) : (
        <StaffDetailsModal 
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          users={selectedUser ? [selectedUser] : filteredUsers}
          title="Staff Details"
        />
      )}
     </div>
  );
};
