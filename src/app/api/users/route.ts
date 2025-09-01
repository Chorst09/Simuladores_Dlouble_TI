import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuthEnhanced as requireAuth, ErrorResponses, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/users - List users (admin only)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { roles: ['admin'] });
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const result = await db.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return ErrorResponses.serverError('Erro ao buscar usuários');
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { roles: ['admin'] });
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const { email, password, name, role } = await request.json();
    
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'Email, senha e nome são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate role
    const validRoles = ['admin', 'diretor', 'user'];
    const userRole = role || 'user';
    if (!validRoles.includes(userRole)) {
      return new Response(JSON.stringify({ error: 'Role inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Usuário já existe' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Insert new user
    const result = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email, hashedPassword, name, userRole]
    );
    
    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return ErrorResponses.serverError('Erro ao criar usuário');
  }
}