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
import { ReportsPage } from './components/ReportsPage';
import { Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { PermissionProvider } from './contexts/PermissionContext';

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

  // Login/Register State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  /* Auth state moved to top */

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const allUsers = db.getUsers();
    
    // Allow login by Username OR Email
    const user = allUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() || 
      (u.username && u.username.toLowerCase() === email.toLowerCase())
    );

    if (user) {
      const storedPassword = user.password || 'password123';
      
      if (password === storedPassword) {
         setUser(user);
         navigate('/');
         return;
      }
      
      setLoginError('Invalid password');
    } else {
      setLoginError('User not found');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (regPassword !== regConfirmPassword) {
      setLoginError('Passwords do not match');
      return;
    }

    const allUsers = db.getUsers();
    
    // Check for existing username
    const existingUser = allUsers.find(u => 
      (u.username && u.username.toLowerCase() === regUsername.toLowerCase())
    );

    if (existingUser) {
      setLoginError('Username already exists');
      return;
    }

    // Create new user
    const newUser = db.addUser({
      name: regUsername, // Auto-generated from username
      email: `${regUsername.toLowerCase()}@nexgen.local`, // Auto-generated email
      username: regUsername,
      password: regPassword,
      role: UserRole.EMPLOYEE, // Default role
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(regUsername)}&background=random`,
      department: 'General',
      pcNo: 'N/A',
      ipAddress: 'N/A',
      equipment: {
        network: false, cpu: false, printer: false, monitor: false, keyboard: false,
        antiVirus: false, upsAvr: false, defragment: false, signaturePad: false,
        webCamera: false, barcodeScanner: false, barcodePrinter: false, fingerPrintScanner: false, mouse: false
      }
    });

    setUser(newUser);
    navigate('/');
  };

  if (location.pathname === '/login') {
     return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-8 animate-fade-in relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          
          <div className="text-center">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-blue-100">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500 mt-2">
              {authMode === 'login' ? 'Sign in to NexGen IT Support' : 'Join NexGen IT Support'}
            </p>
          </div>
          
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center animate-shake">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="jdoe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="block w-full px-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="block w-full px-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center animate-shake">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Account
              </button>
            </form>
          )}

          <div className="pt-4 text-center border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setLoginError('');
                  // Clear fields
                  setEmail(''); setPassword('');
                  setRegUsername(''); setRegPassword(''); setRegConfirmPassword('');
                }}
                className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
              >
                {authMode === 'login' ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
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
        <Route path="/reports" element={
          user.role !== UserRole.EMPLOYEE ? (
            <ReportsPage currentUser={user} />
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
    <PermissionProvider>
      <HashRouter>
        <MainApp />
      </HashRouter>
    </PermissionProvider>
  );
};

export default App;