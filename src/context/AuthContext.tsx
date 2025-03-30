
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { toast } from "sonner";

// Sample data
const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // In a real app, this would be hashed
    role: 'admin',
    fullName: 'Admin User',
    active: true
  },
  {
    id: '2',
    username: 'sales1',
    password: 'sales123', // In a real app, this would be hashed
    role: 'sales',
    fullName: 'John Sales',
    active: true
  },
  {
    id: '3',
    username: 'manager1',
    password: 'manager123', // In a real app, this would be hashed
    role: 'manager',
    fullName: 'Jane Manager',
    active: true
  }
];

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isSales: boolean;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  changePassword: (userId: string, newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get user from localStorage
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem('currentUser');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser);
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : initialUsers;
  });

  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Save currentUser to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => 
      u.username === username && 
      u.password === password && 
      u.active
    );

    if (user) {
      setCurrentUser(user);
      toast.success(`Welcome back, ${user.fullName}`);
      return true;
    } else {
      toast.error('Invalid username or password');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast.info('Logged out successfully');
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isSales = currentUser?.role === 'sales';

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    };
    setUsers([...users, newUser]);
    toast.success('User added successfully');
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
    toast.success('User updated successfully');
    
    // Update currentUser if it's the one being modified
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, active: !user.active } : user
    ));
    toast.success(`User ${users.find(u => u.id === id)?.active ? 'deactivated' : 'activated'} successfully`);
  };

  const changePassword = (userId: string, newPassword: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, password: newPassword } : user
    ));
    toast.success('Password changed successfully');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      isManager,
      isSales,
      addUser,
      updateUser,
      toggleUserStatus,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
