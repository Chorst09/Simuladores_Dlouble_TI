import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'diretor' | 'user';
  is_active: boolean;
  created_at?: string;
  password_change_required?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshingRef = useRef(false);

  const isAuthenticated = !!user;

  // Função para buscar dados do usuário atual
  const refreshUser = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (refreshingRef.current) {
      return;
    }

    refreshingRef.current = true;
    
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        setUser(null);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token inválido, remover
        localStorage.removeItem('auth-token');
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      localStorage.removeItem('auth-token');
      setUser(null);
    } finally {
      setIsLoading(false);
      refreshingRef.current = false;
    }
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar token
        localStorage.setItem('auth-token', data.token);
        
        // Atualizar dados do usuário
        await refreshUser();
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erro ao fazer login' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      // Chamar API de logout para limpar cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar dados locais
      localStorage.removeItem('auth-token');
      setUser(null);
    }
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    refreshUser();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}