import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Obter token do header Authorization
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    // Verificar e decodificar o token
    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Buscar dados atualizados do usuário
    const result = await pool.query(
      'SELECT id, email, name, role, is_active, created_at FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Usuário inativo' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        password_change_required: false,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}