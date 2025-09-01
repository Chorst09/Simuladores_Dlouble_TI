import React from 'react';
import { renderHook } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import { useRoleAccess, usePermission } from '../useRoleAccess';

// Mock do contexto de autenticação
const mockAuthContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
};

const createWrapper = (user: any = null) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={{ ...mockAuthContext, user, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

describe('useRoleAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is null', () => {
    it('should return all permissions as false', () => {
      const { result } = renderHook(() => useRoleAccess(), {
        wrapper: createWrapper(null),
      });

      expect(result.current).toEqual({
        canAccessAdmin: false,
        canAccessReports: false,
        canManageUsers: false,
        canViewAllProposals: false,
        canApplyDirectorDiscount: false,
        canDeleteProposals: false,
        canEditOtherProposals: false,
      });
    });
  });

  describe('when user is admin', () => {
    const adminUser = {
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin' as const,
    };

    it('should return correct permissions for admin', () => {
      const { result } = renderHook(() => useRoleAccess(), {
        wrapper: createWrapper(adminUser),
      });

      expect(result.current).toEqual({
        canAccessAdmin: true,
        canAccessReports: true,
        canManageUsers: true,
        canViewAllProposals: true,
        canApplyDirectorDiscount: false, // Apenas diretor pode aplicar desconto especial
        canDeleteProposals: true,
        canEditOtherProposals: true,
      });
    });
  });

  describe('when user is diretor', () => {
    const directorUser = {
      id: '1',
      name: 'Director',
      email: 'director@test.com',
      role: 'diretor' as const,
    };

    it('should return correct permissions for director', () => {
      const { result } = renderHook(() => useRoleAccess(), {
        wrapper: createWrapper(directorUser),
      });

      expect(result.current).toEqual({
        canAccessAdmin: false,
        canAccessReports: true,
        canManageUsers: false,
        canViewAllProposals: true,
        canApplyDirectorDiscount: true,
        canDeleteProposals: true,
        canEditOtherProposals: false,
      });
    });
  });

  describe('when user is regular user', () => {
    const regularUser = {
      id: '1',
      name: 'User',
      email: 'user@test.com',
      role: 'user' as const,
    };

    it('should return correct permissions for regular user', () => {
      const { result } = renderHook(() => useRoleAccess(), {
        wrapper: createWrapper(regularUser),
      });

      expect(result.current).toEqual({
        canAccessAdmin: false,
        canAccessReports: false,
        canManageUsers: false,
        canViewAllProposals: false,
        canApplyDirectorDiscount: false,
        canDeleteProposals: true, // Pode deletar suas próprias propostas
        canEditOtherProposals: false,
      });
    });
  });
});

describe('usePermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('admin permissions', () => {
    const adminUser = {
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin' as const,
    };

    it('should return true for admin access', () => {
      const { result } = renderHook(() => usePermission('admin', 'access'), {
        wrapper: createWrapper(adminUser),
      });

      expect(result.current).toBe(true);
    });

    it('should return true for user management', () => {
      const { result } = renderHook(() => usePermission('users', 'manage'), {
        wrapper: createWrapper(adminUser),
      });

      expect(result.current).toBe(true);
    });

    it('should return true for viewing all proposals', () => {
      const { result } = renderHook(() => usePermission('proposals', 'viewAll'), {
        wrapper: createWrapper(adminUser),
      });

      expect(result.current).toBe(true);
    });
  });

  describe('director permissions', () => {
    const directorUser = {
      id: '1',
      name: 'Director',
      email: 'director@test.com',
      role: 'diretor' as const,
    };

    it('should return false for admin access', () => {
      const { result } = renderHook(() => usePermission('admin', 'access'), {
        wrapper: createWrapper(directorUser),
      });

      expect(result.current).toBe(false);
    });

    it('should return true for reports access', () => {
      const { result } = renderHook(() => usePermission('reports', 'access'), {
        wrapper: createWrapper(directorUser),
      });

      expect(result.current).toBe(true);
    });

    it('should return true for director discount', () => {
      const { result } = renderHook(() => usePermission('discounts', 'applyDirector'), {
        wrapper: createWrapper(directorUser),
      });

      expect(result.current).toBe(true);
    });
  });

  describe('regular user permissions', () => {
    const regularUser = {
      id: '1',
      name: 'User',
      email: 'user@test.com',
      role: 'user' as const,
    };

    it('should return false for admin access', () => {
      const { result } = renderHook(() => usePermission('admin', 'access'), {
        wrapper: createWrapper(regularUser),
      });

      expect(result.current).toBe(false);
    });

    it('should return false for reports access', () => {
      const { result } = renderHook(() => usePermission('reports', 'access'), {
        wrapper: createWrapper(regularUser),
      });

      expect(result.current).toBe(false);
    });

    it('should return true for proposal deletion', () => {
      const { result } = renderHook(() => usePermission('proposals', 'delete'), {
        wrapper: createWrapper(regularUser),
      });

      expect(result.current).toBe(true);
    });
  });

  describe('invalid permissions', () => {
    const adminUser = {
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin' as const,
    };

    it('should return false for invalid resource', () => {
      const { result } = renderHook(() => usePermission('invalid', 'access'), {
        wrapper: createWrapper(adminUser),
      });

      expect(result.current).toBe(false);
    });

    it('should return false for invalid action', () => {
      const { result } = renderHook(() => usePermission('admin', 'invalid'), {
        wrapper: createWrapper(adminUser),
      });

      expect(result.current).toBe(false);
    });
  });

  describe('when user is null', () => {
    it('should return false for any permission', () => {
      const { result } = renderHook(() => usePermission('admin', 'access'), {
        wrapper: createWrapper(null),
      });

      expect(result.current).toBe(false);
    });
  });
});