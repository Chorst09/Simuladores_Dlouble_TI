import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuthEnhanced as requireAuth, ErrorResponses } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/proposals - List proposals based on user role
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let query: string;
    let params: any[] = [];
    
    let baseQuery = `
      SELECT p.*, u.name as user_name, u.email as user_email 
      FROM proposals p 
      LEFT JOIN users u ON p.user_id = u.id
    `;

    let whereClauses: string[] = [];

    if (auth.user.role !== 'admin' && auth.user.role !== 'diretor') {
      whereClauses.push('p.user_id = $1');
      params.push(auth.user.id);
    }

    if (type) {
      whereClauses.push(`p.type = $${params.length + 1}`);
      params.push(type);
    }

    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    query = `${baseQuery} ORDER BY p.created_at DESC`;
    
    const result = await db.query(query, params);
    
    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Erro ao buscar propostas';
    return ErrorResponses.serverError(errorMessage);
  }
}

// POST /api/proposals - Create new proposal
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const proposalData = await request.json();
    
    // Validate director discount - only directors and admins can apply director discounts
    if (proposalData.director_discount && proposalData.director_discount > 0) {
      if (auth.user.role !== 'admin' && auth.user.role !== 'diretor') {
        return new Response(JSON.stringify({ 
          error: 'Apenas administradores e diretores podem aplicar descontos especiais' 
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Insert proposal with user_id
    const result = await db.query(
      `INSERT INTO proposals (
        id, user_id, client_data, account_manager_data, products, 
        total_setup, total_monthly, director_discount,
        negotiation_rounds, current_round, status, type, proposal_number, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
      RETURNING *`,
      [
        proposalData.id,
        auth.user.id,
        JSON.stringify(proposalData.client_data || {}),
        JSON.stringify(proposalData.account_manager_data || {}),
        JSON.stringify(proposalData.products || []),
        proposalData.total_setup || 0,
        proposalData.total_monthly || 0,
        proposalData.director_discount ? JSON.stringify(proposalData.director_discount) : null,
        JSON.stringify(proposalData.negotiation_rounds || []),
        proposalData.current_round || 1,
        proposalData.status || 'Pendente',
        proposalData.type || 'PABX_SIP',
        proposalData.proposal_number
      ]
    );
    
    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return ErrorResponses.serverError('Erro ao criar proposta');
  }
}