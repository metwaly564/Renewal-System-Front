import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, type AdminUser, type LoginPayload } from '../services/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

function getStoredAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem('renewal_admin');
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(getStoredAdmin);
  const navigate = useNavigate();

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await loginApi(payload);
    localStorage.setItem('renewal_token', result.token);
    localStorage.setItem('renewal_admin', JSON.stringify(result.admin));
    setAdmin(result.admin);
    navigate('/dashboard');
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('renewal_token');
    localStorage.removeItem('renewal_admin');
    setAdmin(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

// ─── Protected Route ──────────────────────────────────────────────────────────

import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
