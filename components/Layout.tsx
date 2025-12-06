import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, LayoutDashboard, Ticket, PlusCircle, Settings, Menu } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, currentView, onNavigate, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          onNavigate(view);
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">NexGen IT</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">NexGen IT</h1>
          <p className="text-xs text-gray-400 mt-1">Support Portal v1.0</p>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="my-tickets" icon={Ticket} label="My Tickets" />
          <NavItem view="create-ticket" icon={PlusCircle} label="New Ticket" />
          {(user.role === UserRole.ADMIN || user.role === UserRole.TECHNICIAN) && (
            <NavItem view="all-tickets" icon={Settings} label="All Tickets (Staff)" />
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3 border-2 border-blue-500" />
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-300 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
