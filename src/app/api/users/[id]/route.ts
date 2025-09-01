import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuthEnhanced as requireAuth, validateResourceAccess, ErrorResponses, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/users/[id] - Get user by ID (admin or own profile)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const { id } = await params;
    
    // Check if user can access this profile
    const accessCheck = await validateResourceAccess(auth.user, id, 'user', 'read');
    if (!accessCheck.allowed) {
      return ErrorResponses.forbidden(accessCheck.reason);
    }
    
    const result = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return ErrorResponses.notFound('Usuário');
    }
    
    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return ErrorResponses.serverError('Erro ao buscar usuário');
  }
}

// PUT /api/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, { roles: ['admin'] });
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const { id } = await params;
    const { email, name, role, password } = await request.json();
    
    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'diretor', 'user'];
      if (!validRoles.includes(role)) {
        return new Response(JSON.stringify({ error: 'Role inválido' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (existingUser.rows.length > 0) {
        return new Response(JSON.stringify({ error: 'Email já está em uso' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    
    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    
    if (role) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }
    
    if (password) {
      const hashedPassword = await hashPassword(password);
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    values.push(id);
    
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING id, email, name, role, updated_at`,
      values
    );
    
    if (result.rows.length === 0) {
      return ErrorResponses.notFound('Usuário');
    }
    
    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return ErrorResponses.serverError('Erro ao atualizar usuário');
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, { roles: ['admin'] });
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const { id } = await params;
    
    // Prevent admin from deleting themselves
    if (auth.user.id === id) {
      return new Response(JSON.stringify({ error: 'Não é possível deletar sua própria conta' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, name',
      [id]
    );
    
    if (result.rows.length === 0) {
      return ErrorResponses.notFound('Usuário');
    }
    
    return new Response(JSON.stringify({ 
      message: 'Usuário deletado com sucesso',
      user: result.rows[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return ErrorResponses.serverError('Erro ao deletar usuário');
  }
}