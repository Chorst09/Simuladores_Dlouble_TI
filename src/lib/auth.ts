import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-that-is-long-enough';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'diretor';
  is_active: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'diretor';
  password_change_required?: boolean;
  [key: string]: unknown; // Add index signature to fix type compatibility
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload: JWTPayload & { password_change_required?: boolean }): Promise<string> {
  const tokenPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    password_change_required: payload.password_change_required || false,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  // Usar implementação simples de JWT para Edge Runtime
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(tokenPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHMAC(data, JWT_SECRET);
  
  return `${data}.${signature}`;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    
    // Verificar assinatura
    const expectedSignature = await signHMAC(data, JWT_SECRET);
    if (signature !== expectedSignature) return null;
    
    // Decodificar payload
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Verificar expiração
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

// Função auxiliar para assinar com HMAC usando Web Crypto API
async function signHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = new Uint8Array(signature);
  
  return btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Também verifica cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

export function requireAuth(allowedRoles: ('admin' | 'user' | 'diretor')[] = ['admin', 'user', 'diretor']) {
  return async (request: NextRequest) => {
    const token = getTokenFromRequest(request);
    if (!token) {
      return { error: 'Token não fornecido', status: 401 };
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return { error: 'Token inválido', status: 401 };
    }

    if (!allowedRoles.includes(payload.role)) {
      return { error: 'Permissão insuficiente', status: 403 };
    }

    return { user: payload };
  };
}

import db from './db';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'diretor' | 'user';
}

export interface AuthOptions {
  roles?: ('admin' | 'diretor' | 'user')[];
  requireOwnership?: boolean;
  resourceField?: string;
}

export interface AuthResult {
  user: AuthUser;
  isAuthorized: boolean;
  error?: string;
}

/**
 * Enhanced authentication middleware with role-based access control
 */
export async function requireAuthEnhanced(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthResult> {
  try {
    // Extract token from Authorization header
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return {
        user: null as any,
        isAuthorized: false,
        error: 'Token de acesso não fornecido'
      };
    }

    // Verify JWT token
    const payload = await verifyToken(token);
    
    if (!payload) {
      return {
        user: null as any,
        isAuthorized: false,
        error: 'Token inválido'
      };
    }

    // Get user from database with role information
    const userResult = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [payload.userId]
    );

    if (userResult.rows.length === 0) {
      return {
        user: null as any,
        isAuthorized: false,
        error: 'Usuário não encontrado'
      };
    }

    const user: AuthUser = userResult.rows[0];

    // Check role-based access if roles are specified
    if (options.roles && options.roles.length > 0) {
      if (!options.roles.includes(user.role)) {
        // Log unauthorized access attempt
        await logAccessAttempt({
          userId: user.id,
          action: 'access_denied',
          resource: request.url,
          allowed: false,
          reason: `Role '${user.role}' not in allowed roles: ${options.roles.join(', ')}`,
          ipAddress: getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined
        });

        return {
          user,
          isAuthorized: false,
          error: `Acesso negado. Permissão necessária: ${options.roles.join(' ou ')}`
        };
      }
    }

    // Log successful access
    await logAccessAttempt({
      userId: user.id,
      action: 'access_granted',
      resource: request.url,
      allowed: true,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    });

    return {
      user,
      isAuthorized: true
    };

  } catch (error) {
    console.error('Authentication error:', error);
    
    return {
      user: null as any,
      isAuthorized: false,
      error: 'Erro de autenticação'
    };
  }
}

/**
 * Check if user owns a specific resource
 */
export async function checkOwnership(
  userId: string,
  resourceId: string,
  resourceType: 'proposal' | 'user'
): Promise<boolean> {
  try {
    let query: string;
    let params: any[];

    switch (resourceType) {
      case 'proposal':
        query = 'SELECT user_id FROM proposals WHERE id = $1';
        params = [resourceId];
        break;
      case 'user':
        // Users can only access their own profile (unless admin/diretor)
        return userId === resourceId;
      default:
        return false;
    }

    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].user_id === userId;
  } catch (error) {
    console.error('Ownership check error:', error);
    return false;
  }
}

/**
 * Validate resource access based on user role and ownership
 */
export async function validateResourceAccess(
  user: AuthUser,
  resourceId: string,
  resourceType: 'proposal' | 'user',
  action: 'read' | 'write' | 'delete'
): Promise<{ allowed: boolean; reason?: string }> {
  // Admin has access to everything
  if (user.role === 'admin') {
    return { allowed: true };
  }

  // Director has read access to all proposals, write access to own
  if (user.role === 'diretor') {
    if (resourceType === 'proposal') {
      if (action === 'read') {
        return { allowed: true };
      }
      // For write/delete, check ownership
      const isOwner = await checkOwnership(user.id, resourceId, resourceType);
      return {
        allowed: isOwner,
        reason: isOwner ? undefined : 'Diretores podem apenas modificar suas próprias propostas'
      };
    }
    
    if (resourceType === 'user') {
      // Directors can only access their own user data
      return {
        allowed: user.id === resourceId,
        reason: user.id === resourceId ? undefined : 'Acesso negado aos dados de outros usuários'
      };
    }
  }

  // Regular users can only access their own resources
  if (user.role === 'user') {
    const isOwner = await checkOwnership(user.id, resourceId, resourceType);
    return {
      allowed: isOwner,
      reason: isOwner ? undefined : 'Usuários podem apenas acessar seus próprios recursos'
    };
  }

  return {
    allowed: false,
    reason: 'Role não reconhecido'
  };
}

/**
 * Log access attempts for audit purposes
 */
interface AccessLogEntry {
  userId: string;
  action: string;
  resource: string;
  allowed: boolean;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAccessAttempt(entry: AccessLogEntry): Promise<void> {
  try {
    await db.query(
      `INSERT INTO access_logs (user_id, action, resource, allowed, reason, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        entry.userId,
        entry.action,
        entry.resource,
        entry.allowed,
        entry.reason || null,
        entry.ipAddress || null,
        entry.userAgent || null
      ]
    );
  } catch (error) {
    console.error('Failed to log access attempt:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return undefined;
}

/**
 * Create standardized error responses
 */
export function createErrorResponse(status: number, message: string, details?: any) {
  return new Response(
    JSON.stringify({
      error: message,
      details,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Helper function to create common error responses
 */
export const ErrorResponses = {
  unauthorized: () => createErrorResponse(401, 'Token de acesso não fornecido ou inválido'),
  forbidden: (reason?: string) => createErrorResponse(403, 'Acesso negado', { reason }),
  notFound: (resource?: string) => createErrorResponse(404, `${resource || 'Recurso'} não encontrado`),
  serverError: (message?: string) => createErrorResponse(500, message || 'Erro interno do servidor')
};