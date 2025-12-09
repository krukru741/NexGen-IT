import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { db } from './services/mockDatabase';
import { User, Ticket, UserRole } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { CreateTicket } from './components/CreateTicket';
import { TicketDetail } from './components/TicketDetail';
import { StaffList } from './components/StaffList';
import { SettingsPage } from './components/SettingsPage';
import { AllSystemTickets } from './components/AllSystemTickets';
import { MessagesPage } from './components/MessagesPage';
import { Lock } from 'lucide-react';

// Wrapper for Staff Ticket List to extract params
const StaffTicketView: React.FC<{ tickets: Ticket[], users: User[], onSelectTicket: (t: Ticket) => void, currentUser: User, onUpdate: (t: Ticket) => void }> = ({ tickets, users, onSelectTicket, currentUser, onUpdate }) => {
  const { staffId } = useParams();
  const staffMember = users.find(u => u.id === staffId);
  
  if (!staffMember) {
    return <div className="p-8 text-center text-gray-500">Staff member not found.</div>;
  }

  const assignedTickets = tickets.filter(t => t.assignedToId === staffId);

  return (
    <TicketList 
      tickets={assignedTickets} 
      onSelectTicket={onSelectTicket} 
      title={`Tickets Assigned to ${staffMember.name}`}
      user={currentUser}
      onUpdate={onUpdate}
    />
  );
};

// Wrapper for Ticket Detail to extract params
const TicketDetailView: React.FC<{ tickets: Ticket[], user: User, onUpdate: (t: Ticket) => void }> = ({ tickets, user, onUpdate }) => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket) {
    return <div className="p-8 text-center text-gray-500">Ticket not found.</div>;
  }

  return (
    <TicketDetail 
      ticket={ticket} 
      currentUser={user} 
      onClose={() => navigate(-1)}
      onUpdate={onUpdate}
    />
  );
};

// Wrapper for Create Ticket to handle navigation
const CreateTicketView: React.FC<{ user: User, onCreate: (t: any) => void }> = ({ user, onCreate }) => {
  const navigate = useNavigate();
  return (
    <CreateTicket 
      userId={user.id} 
      userName={user.name} 
      onSubmit={onCreate} 
      onCancel={() => navigate(-1)} 
    />
  );
};

const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load data initially
    setTickets(db.getTickets());
    setUsers(db.getUsers());
  }, []);

  const handleLogin = (role: UserRole) => {
    const allUsers = db.getUsers();
    const found = allUsers.find(u => u.role === role);
    if (found) {
      setUser(found);
      navigate('/');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const handleCreateTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTicket = db.createTicket(ticketData);
    setTickets(db.getTickets()); // Refresh
    navigate('/my-tickets');
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const handleSelectTicket = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  // Simple Login Screen
  if (!user && !location.pathname.includes('/login')) {
    return <Navigate to="/login" />;
  }

  if (location.pathname === '/login') {
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

  if (!user) return null; // Should be handled by Navigate above

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard tickets={tickets} currentUser={user} onCreateTicket={() => navigate('/create-ticket')} />} />
        <Route path="/create-ticket" element={<CreateTicketView user={user} onCreate={handleCreateTicket} />} />
        <Route path="/my-tickets" element={
          <TicketList 
            tickets={tickets.filter(t => t.requesterId === user.id)} 
            onSelectTicket={handleSelectTicket} 
            title="My Tickets"
            user={user}
            onUpdate={handleUpdateTicket}
          />
        } />
        <Route path="/staff" element={<StaffList currentUser={user} />} />
        <Route path="/staff/:staffId" element={
          <StaffTicketView 
            tickets={tickets} 
            users={users} 
            onSelectTicket={handleSelectTicket} 
            currentUser={user}
            onUpdate={handleUpdateTicket}
          />
        } />
        <Route path="/messages" element={
          user.role !== UserRole.EMPLOYEE ? (
            <MessagesPage currentUser={user} />
          ) : <Navigate to="/" />
        } />
        <Route path="/all-tickets" element={
          user.role !== UserRole.EMPLOYEE ? (
            <AllSystemTickets 
              tickets={tickets} 
              users={users}
              onSelectTicket={handleSelectTicket} 
              onUpdateTicket={handleUpdateTicket}
            />
          ) : <Navigate to="/" />
        } />
        <Route path="/tickets/:ticketId" element={
          <TicketDetailView tickets={tickets} user={user} onUpdate={handleUpdateTicket} />
        } />
        <Route path="/settings" element={
          user.role === UserRole.ADMIN ? (
            <SettingsPage />
          ) : <Navigate to="/" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
};

export default App;