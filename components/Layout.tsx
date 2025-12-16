import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, LayoutDashboard, Ticket, PlusCircle, Settings, Menu, Users, ShieldCheck, MessageSquare, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermission } from '../contexts/PermissionContext';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const { hasPermission } = usePermission();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => {
    // Check if the current path starts with the nav item path (for active state), 
    // but handle root '/' specifically to avoid matching everything.
    const isActive = path === '/' 
      ? location.pathname === '/' 
      : location.pathname.startsWith(path);

    return (
      <button
        onClick={() => {
          navigate(path);
          setMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">NexGen IT</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-slate-800 shadow-xl
      `}>
        <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="p-6 border-b border-slate-800/50">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">NexGen IT</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">SUPPORT PORTAL v2.0</p>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            <NavItem path="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem path="/my-tickets" icon={Ticket} label="My Tickets" />
            <NavItem path="/create-ticket" icon={PlusCircle} label="New Ticket" />
            <NavItem path="/staff" icon={Users} label="Staff Directory" />
            {(hasPermission(user.role, 'view_all_tickets') || hasPermission(user.role, 'view_reports')) && (
              <>
                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Management
                </div>
                {hasPermission(user.role, 'view_all_tickets') && <NavItem path="/messages" icon={MessageSquare} label="Messages" />}
                {hasPermission(user.role, 'view_reports') && <NavItem path="/reports" icon={FileText} label="Print & Reports" />}
                {hasPermission(user.role, 'view_all_tickets') && <NavItem path="/all-tickets" icon={Settings} label="All Tickets (Staff)" />}
              </>
            )}
            {hasPermission(user.role, 'manage_settings') && (
              <>
                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  System
                </div>
                <NavItem path="/settings" icon={ShieldCheck} label="Settings" />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center mb-4 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3 border-2 border-indigo-500 shadow-sm" />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-indigo-300 truncate">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-red-300 bg-red-900/20 hover:bg-red-900/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-900/20 group"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative bg-slate-50 custom-scrollbar">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};