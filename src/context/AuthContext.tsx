import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  onAuthStateChanged, 
  FirebaseUser 
} from '../services/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOutUser();
    } catch (err: any) {
      console.error('Logout error:', err);
      setAuthError(err.message || 'Failed to sign out');
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
