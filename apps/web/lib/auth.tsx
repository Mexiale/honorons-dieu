'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { api } from './api';
import { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  setSession: (token: string, user?: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  setSession: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback(async (token: string, u?: User) => {
    localStorage.setItem('hd_token', token);
    if (u) {
      setUser(u);
    } else {
      setUser(await api<User>('/auth/me'));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hd_token');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('hd_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api<User>('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('hd_token'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
