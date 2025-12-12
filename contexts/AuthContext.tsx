import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/mockDatabase';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; user?: User }>;
}

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUserId) {
      const users = db.getUsers();
      const user = users.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      } else {
        // User not found, clear storage
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const allUsers = db.getUsers();
    
    // Allow login by Username OR Email
    const user = allUsers.find(u => 
      u.email.toLowerCase() === username.toLowerCase() || 
      (u.username && u.username.toLowerCase() === username.toLowerCase())
    );

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const storedPassword = user.password || 'password123';
    
    if (password !== storedPassword) {
      return { success: false, error: 'Invalid password' };
    }

    // Successful login
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, user.id);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; error?: string; user?: User }> => {
    const { username, password, confirmPassword } = userData;

    // Validate passwords match
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    const allUsers = db.getUsers();
    
    // Check for existing username
    const existingUser = allUsers.find(u => 
      (u.username && u.username.toLowerCase() === username.toLowerCase())
    );

    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Create new user
    const newUser = db.addUser({
      name: username,
      email: `${username.toLowerCase()}@nexgen.local`,
      username: username,
      password: password,
      role: UserRole.EMPLOYEE,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      department: 'General',
      pcNo: 'N/A',
      ipAddress: 'N/A',
      equipment: {
        network: false, cpu: false, printer: false, monitor: false, keyboard: false,
        antiVirus: false, upsAvr: false, defragment: false, signaturePad: false,
        webCamera: false, barcodeScanner: false, barcodePrinter: false, fingerPrintScanner: false, mouse: false
      }
    });

    // Auto-login after registration
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, newUser.id);

    return { success: true, user: newUser };
  }, []);

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: currentUser !== null,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
