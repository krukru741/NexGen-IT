import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/mockDatabase';

interface UserContextType {
  users: User[];
  loading: boolean;
  addUser: (userData: Omit<User, 'id'>) => User;
  updateUser: (user: User) => User;
  deleteUser: (id: string) => boolean;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  refreshUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load users on mount
  useEffect(() => {
    const loadedUsers = db.getUsers();
    setUsers(loadedUsers);
    setLoading(false);
  }, []);

  const refreshUsers = useCallback(() => {
    const loadedUsers = db.getUsers();
    setUsers(loadedUsers);
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id'>): User => {
    const newUser = db.addUser(userData);
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((user: User): User => {
    const updatedUser = db.updateUser(user);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    return updatedUser;
  }, []);

  const deleteUser = useCallback((id: string): boolean => {
    const success = db.deleteUser(id);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
    return success;
  }, []);

  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(u => u.id === id);
  }, [users]);

  const getUsersByRole = useCallback((role: UserRole): User[] => {
    return users.filter(u => u.role === role);
  }, [users]);

  const value: UserContextType = {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    getUsersByRole,
    refreshUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = (): UserContextType => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
