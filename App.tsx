import React, { useState, useEffect } from 'react';
import { db } from './services/mockDatabase';
import { User, Ticket, UserRole } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { CreateTicket } from './components/CreateTicket';
import { TicketDetail } from './components/TicketDetail';
import { Lock } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    // Load tickets initially
    setTickets(db.getTickets());
  }, []);

  const handleLogin = (role: UserRole) => {
    const users = db.getUsers();
    const found = users.find(u => u.role === role);
    if (found) {
      setUser(found);
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const handleCreateTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    db.createTicket(ticketData);
    setTickets(db.getTickets()); // Refresh
    setView('my-tickets');
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket); // Update detailed view
  };

  // Simple Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">NexGen IT</h1>
            <p className="text-gray-500 mt-2">Sign in to access the support portal</p>
          </div>
          
          <div className="space-y-4">
            <button onClick={() => handleLogin(UserRole.EMPLOYEE)} className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex items-center group">
              <div className="bg-gray-100 p-2 rounded-lg mr-4 group-hover:bg-blue-200">👤</div>
              <div>
                <span className="block font-semibold text-gray-900">Alice Employee</span>
                <span className="text-sm text-gray-500">Submit tickets & view status</span>
              </div>
            </button>
            <button onClick={() => handleLogin(UserRole.TECHNICIAN)} className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex items-center group">
              <div className="bg-gray-100 p-2 rounded-lg mr-4 group-hover:bg-blue-200">🛠️</div>
              <div>
                <span className="block font-semibold text-gray-900">Bob Technician</span>
                <span className="text-sm text-gray-500">Solve tickets & update logs</span>
              </div>
            </button>
            <button onClick={() => handleLogin(UserRole.ADMIN)} className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex items-center group">
              <div className="bg-gray-100 p-2 rounded-lg mr-4 group-hover:bg-blue-200">🛡️</div>
              <div>
                <span className="block font-semibold text-gray-900">Charlie Admin</span>
                <span className="text-sm text-gray-500">Full system access</span>
              </div>
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">Mock Login for Demonstration</p>
        </div>
      </div>
    );
  }

  // If a ticket is selected for detail view, show it modal-style or page-style
  if (selectedTicket) {
    return (
      <Layout user={user} onLogout={handleLogout} currentView={view} onNavigate={(v) => { setSelectedTicket(null); setView(v); }}>
        <TicketDetail 
          ticket={selectedTicket} 
          currentUser={user} 
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdateTicket}
        />
      </Layout>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        // Filter tickets based on role for dashboard if needed, or show all stats
        return <Dashboard tickets={tickets} />;
      case 'create-ticket':
        return <CreateTicket userId={user.id} userName={user.name} onSubmit={handleCreateTicket} onCancel={() => setView('dashboard')} />;
      case 'my-tickets':
        const myTickets = tickets.filter(t => t.requesterId === user.id);
        return <TicketList tickets={myTickets} onSelectTicket={setSelectedTicket} title="My Tickets" />;
      case 'all-tickets':
        if (user.role === UserRole.EMPLOYEE) {
            setView('dashboard'); // Security fallback
            return null; 
        }
        return <TicketList tickets={tickets} onSelectTicket={setSelectedTicket} title="All System Tickets" />;
      default:
        return <Dashboard tickets={tickets} />;
    }
  };

  return (
    <Layout user={user} onLogout={handleLogout} currentView={view} onNavigate={(v) => { setView(v); setSelectedTicket(null); }}>
      {renderContent()}
    </Layout>
  );
};

export default App;
