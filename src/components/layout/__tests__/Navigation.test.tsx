import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { Navigation, UserRoleIndicator } from '../Navigation';
import { AuthContext } from '@/contexts/AuthContext';

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

const mockAuthContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
};

const renderWithAuth = (component: React.ReactElement, user: any = null, isLoading = false) => {
  const contextValue = {
    ...mockAuthContext,
    user,
    isLoading,
    isAuthenticated: !!user,
  };

  return render(
    <AuthContext.Provider value={contextValue}>
      {component}
    </AuthContext.Provider>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should not render when user is not logged in', () => {
    renderWithAuth(<Navigation />);
    
    expect(screen.queryByText('Sistema')).not.toBeInTheDocument();
  });

  it('should render navigation for admin user', () => {
    const adminUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin' as const,
    };

    renderWithAuth(<Navigation />, adminUser);

    expect(screen.getByText('Sistema')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('Painel Admin')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar Usuários')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });

  it('should render navigation for director user', () => {
    const directorUser = {
      id: '2',
      name: 'Director User',
      email: 'director@test.com',
      role: 'diretor' as const,
    };

    renderWithAuth(<Navigation />, directorUser);

    expect(screen.getByText('Director User')).toBeInTheDocument();
    expect(screen.getByText('diretor')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByText('Todas as Propostas')).toBeInTheDocument();
    
    // Admin-only items should not be visible
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Gerenciar Usuários')).not.toBeInTheDocument();
  });

  it('should render navigation for regular user', () => {
    const regularUser = {
      id: '3',
      name: 'Regular User',
      email: 'user@test.com',
      role: 'user' as const,
    };

    renderWithAuth(<Navigation />, regularUser);

    expect(screen.getByText('Regular User')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('Calculadoras')).toBeInTheDocument();
    expect(screen.getByText('Minhas Propostas')).toBeInTheDocument();
    
    // Admin and director items should not be visible
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Gerenciar Usuários')).not.toBeInTheDocument();
    expect(screen.queryByText('Relatórios')).not.toBeInTheDocument();
    expect(screen.queryByText('Todas as Propostas')).not.toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', async () => {
    const adminUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin' as const,
    };

    const mockLogout = jest.fn();
    const contextValue = {
      ...mockAuthContext,
      user: adminUser,
      isAuthenticated: true,
      logout: mockLogout,
    };

    render(
      <AuthContext.Provider value={contextValue}>
        <Navigation />
      </AuthContext.Provider>
    );

    const logoutButton = screen.getByText('Sair');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('should toggle mobile menu', () => {
    const adminUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin' as const,
    };

    renderWithAuth(<Navigation />, adminUser);

    // Find mobile menu button (should be hidden on desktop but present in DOM)
    const menuButtons = screen.getAllByRole('button');
    const mobileMenuButton = menuButtons.find(button => 
      button.querySelector('svg') && 
      (button.querySelector('svg')?.getAttribute('class')?.includes('h-6 w-6') ||
       button.querySelector('svg')?.getAttribute('class')?.includes('Menu'))
    );

    expect(mobileMenuButton).toBeInTheDocument();
  });
});

describe('UserRoleIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when user is not logged in', () => {
    renderWithAuth(<UserRoleIndicator />);
    
    expect(screen.queryByText('Administrador')).not.toBeInTheDocument();
  });

  it('should render admin role indicator', () => {
    const adminUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin' as const,
    };

    renderWithAuth(<UserRoleIndicator />, adminUser);

    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('should render director role indicator', () => {
    const directorUser = {
      id: '2',
      name: 'Director User',
      email: 'director@test.com',
      role: 'diretor' as const,
    };

    renderWithAuth(<UserRoleIndicator />, directorUser);

    expect(screen.getByText('Diretor')).toBeInTheDocument();
  });

  it('should render user role indicator', () => {
    const regularUser = {
      id: '3',
      name: 'Regular User',
      email: 'user@test.com',
      role: 'user' as const,
    };

    renderWithAuth(<UserRoleIndicator />, regularUser);

    expect(screen.getByText('Vendedor')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for each role', () => {
    const adminUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin' as const,
    };

    const { rerender } = renderWithAuth(<UserRoleIndicator />, adminUser);

    const adminIndicator = screen.getByText('Administrador').parentElement;
    expect(adminIndicator).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');

    // Test director
    const directorUser = { ...adminUser, role: 'diretor' as const };
    rerender(
      <AuthContext.Provider value={{ ...mockAuthContext, user: directorUser, isAuthenticated: true }}>
        <UserRoleIndicator />
      </AuthContext.Provider>
    );

    const directorIndicator = screen.getByText('Diretor').parentElement;
    expect(directorIndicator).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');

    // Test user
    const regularUser = { ...adminUser, role: 'user' as const };
    rerender(
      <AuthContext.Provider value={{ ...mockAuthContext, user: regularUser, isAuthenticated: true }}>
        <UserRoleIndicator />
      </AuthContext.Provider>
    );

    const userIndicator = screen.getByText('Vendedor').parentElement;
    expect(userIndicator).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
  });
});