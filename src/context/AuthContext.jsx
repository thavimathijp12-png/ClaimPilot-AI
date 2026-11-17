import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_ACCOUNTS } from '../data/mockUsers';
import { storage } from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to Marcus Chen or Admin or stored user with refreshed avatar
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = storage.get('auth_user');
    if (saved) {
      const matched = DEMO_ACCOUNTS.find(u => u.id === saved.id || u.email === saved.email);
      if (matched) return { ...saved, avatar: matched.avatar };
      return saved;
    }
    return DEMO_ACCOUNTS[0]; // Admin by default so all features are visible
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(storage.get('auth_user', true)); // logged in by default for rapid review or can logout
  });

  useEffect(() => {
    if (currentUser && isAuthenticated) {
      storage.set('auth_user', currentUser);
    } else {
      storage.remove('auth_user');
    }
  }, [currentUser, isAuthenticated]);

  const login = (email, password, remember = true) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const found = DEMO_ACCOUNTS.find(
          u => u.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (!found) {
          reject(new Error('Invalid email address. Please select one of the demo accounts.'));
          return;
        }

        if (found.password !== password) {
          reject(new Error('Incorrect password. See demo credentials below.'));
          return;
        }

        setCurrentUser(found);
        setIsAuthenticated(true);
        if (remember) {
          storage.set('auth_user', found);
        }
        resolve(found);
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    storage.remove('auth_user');
  };

  const switchRole = (roleCode) => {
    const target = DEMO_ACCOUNTS.find(u => u.roleCode === roleCode);
    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      storage.set('auth_user', target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchRole,
        demoAccounts: DEMO_ACCOUNTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

