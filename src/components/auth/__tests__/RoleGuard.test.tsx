import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleGuard, AdminOnly, DirectorOnly, DirectorAndAdminOnly, UserOnly } from '../RoleGuard';

// Mock do contexto de autenticação
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

describe('RoleGuard', () => {
  const TestContent = () => <div>Protected Content</div>;
  const FallbackContent = () => <div>Access Denied</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic RoleGuard functionality', () => {
    it('should not render content when user is null', () => {
      renderWithAuth(
        <RoleGuard allowedRoles={['admin']}>
          <TestContent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should not render content when loading', () => {
      renderWithAuth(
        <RoleGuard allowedRoles={['admin']}>
          <TestContent />
        </RoleGuard>,
        null,
        true
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render content when user has allowed role', () => {
      const adminUser = { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' as const };
      
      renderWithAuth(
        <RoleGuard allowedRoles={['admin']}>
          <TestContent />
        </RoleGuard>,
        adminUser
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not render content when user does not have allowed role', () => {
      const userUser = { id: '1', name: 'User', email: 'user@test.com', role: 'user' as const };
      
      renderWithAuth(
        <RoleGuard allowedRoles={['admin']}>
          <TestContent />
        </RoleGuard>,
        userUser
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render fallback when user does not have permission', () => {
      const userUser = { id: '1', name: 'User', email: 'user@test.com', role: 'user' as const };
      
      renderWithAuth(
        <RoleGuard allowedRoles={['admin']} fallback={<FallbackContent />}>
          <TestContent />
        </RoleGuard>,
        userUser
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should work with multiple allowed roles', () => {
      const directorUser = { id: '1', name: 'Director', email: 'director@test.com', role: 'diretor' as const };
      
      renderWithAuth(
        <RoleGuard allowedRoles={['admin', 'diretor']}>
          <TestContent />
        </RoleGuard>,
        directorUser
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('AdminOnly component', () => {
    it('should render content for admin user', () => {
      const adminUser = { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' as const };
      
      renderWithAuth(
        <AdminOnly>
          <TestContent />
        </AdminOnly>,
        adminUser
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not render content for non-admin user', () => {
      const userUser = { id: '1', name: 'User', email: 'user@test.com', role: 'user' as const };
      
      renderWithAuth(
        <AdminOnly>
          <TestContent />
        </AdminOnly>,
        userUser
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('DirectorOnly component', () => {
    it('should render content for director user', () => {
      const directorUser = { id: '1', name: 'Director', email: 'director@test.com', role: 'diretor' as const };
      
      renderWithAuth(
        <DirectorOnly>
          <TestContent />
        </DirectorOnly>,
        directorUser
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not render content for non-director user', () => {
      const userUser = { id: '1', name: 'User', email: 'user@test.com', role: 'user' as const };
      
      renderWithAuth(
        <DirectorOnly>
          <TestContent />
        </DirectorOnly>,
        userUser
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('DirectorAndAdminOnly component', () => {
    it('should render content for admin user', () => {
      const adminUser = { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' as const };
      
      renderWithAuth(
        <DirectorAndAdminOnly>
          <TestContent />
        </DirectorAndAdminOnly>,
        adminUser
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render content for director user', () => {
      const directorUser = { id: '1', name: 'Director', email: 'director@test.com', role: 'diretor' as const };
      
      renderWithAuth(
        <DirectorAndAdminOnly>
          <TestContent />
        </DirectorAndAdminOnly>,
        directorUser
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not render content for regular user', () => {
      const userUser = { id: '1', name: 'User', email: 'user@test.com', role: 'user' as const };
      
      renderWithAuth(
        <DirectorAndAdminOnly>
          <TestContent />
        </DirectorAndAdminOnly>,
        userUser
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('UserOnly component', () => {
    it('should render content for regular user', () => {
      const userUser = { id: '1', name: 'User', email: 'user@test.com', role: 'user' as const };
      
      renderWithAuth(
        <UserOnly>
          <TestContent />
        </UserOnly>,
        userUser
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not render content for admin user', () => {
      const adminUser = { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' as const };
      
      renderWithAuth(
        <UserOnly>
          <TestContent />
        </UserOnly>,
        adminUser
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});