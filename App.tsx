import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PermissionProvider } from './contexts/PermissionContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import { UserProvider } from './contexts/UserContext';
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
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { UserRole } from './types';

/**
 * Protected Route wrapper - redirects to login if not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Role-based Route wrapper - redirects to home if user doesn't have required role
 */
const RoleRoute: React.FC<{ children: React.ReactElement; allowedRoles: UserRole[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

/**
 * Main application routes
 */
const AppRoutes: React.FC = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout user={currentUser} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-ticket" element={<CreateTicket />} />
        <Route path="/my-tickets" element={<TicketList />} />
        <Route path="/tickets/:ticketId" element={<TicketDetail />} />
        
        {/* Staff routes */}
        <Route 
          path="/staff" 
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}>
              <StaffList />
            </RoleRoute>
          } 
        />
        <Route 
          path="/staff/:staffId" 
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}>
              <TicketList />
            </RoleRoute>
          } 
        />
        
        {/* Admin/Technician only routes */}
        <Route 
          path="/messages" 
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}>
              <MessagesPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}>
              <ReportsPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="/all-tickets" 
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}>
              <AllSystemTickets />
            </RoleRoute>
          } 
        />
        
        {/* Admin only routes */}
        <Route 
          path="/settings" 
          element={
            <RoleRoute allowedRoles={[UserRole.ADMIN]}>
              <SettingsPage />
            </RoleRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

/**
 * Root App component with all providers
 */
const App: React.FC = () => {
  return (
    <HashRouter>
      <PermissionProvider>
        <AuthProvider>
          <UserProvider>
            <TicketProvider>
              <AppRoutes />
            </TicketProvider>
          </UserProvider>
        </AuthProvider>
      </PermissionProvider>
    </HashRouter>
  );
};

export default App;