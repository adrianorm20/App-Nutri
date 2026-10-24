import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type AuthUser, type AuthSession, type SignInData, type SignUpData } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: SignInData) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const activeSession = await authService.checkSession();
        if (activeSession) {
          setSession(activeSession);
          setUser(activeSession.user);
        }
      } catch (err) {
        console.error('Falha ao inicializar autenticação:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (data: SignInData) => {
    setError(null);
    try {
      const result = await authService.signIn(data);
      setSession(result.session);
      setUser(result.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
      throw err;
    }
  };

  const signup = async (data: SignUpData) => {
    setError(null);
    try {
      await authService.signUp(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
