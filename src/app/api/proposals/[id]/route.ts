import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { requireAuthEnhanced as requireAuth, validateResourceAccess, ErrorResponses } from '@/lib/auth';

export const runtime = 'nodejs';

// DELETE /api/proposals/[id] - Delete proposal
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const { id } = params;
    
    // Check if user can delete this proposal
    const accessCheck = await validateResourceAccess(auth.user, id, 'proposal', 'delete');
    if (!accessCheck.allowed) {
      return ErrorResponses.forbidden(accessCheck.reason);
    }
    
    let query: string;
    let queryParams: any[];
    
    // Admin can delete any proposal, others can only delete their own
    if (auth.user.role === 'admin') {
      query = "DELETE FROM proposals WHERE id = $1 RETURNING id, client_data->>'name' as client_name";
      queryParams = [id];
    } else {
      query = "DELETE FROM proposals WHERE id = $1 AND user_id = $2 RETURNING id, client_data->>'name' as client_name";
      queryParams = [id, auth.user.id];
    }
    
    const result = await db.query(query, queryParams);
    
    if (result.rows.length === 0) {
      return ErrorResponses.notFound('Proposta');
    }
    
    return new Response(JSON.stringify({ 
      message: 'Proposta deletada com sucesso',
      proposal: result.rows[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return ErrorResponses.serverError('Erro ao deletar proposta');
  }
}

// PUT /api/proposals/[id] - Update proposal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  
  if (!auth.isAuthorized) {
    return auth.error === 'Token de acesso não fornecido' 
      ? ErrorResponses.unauthorized()
      : ErrorResponses.forbidden(auth.error);
  }

  try {
    const { id } = params;
    const proposalData = await request.json();
    
    // Check if user can modify this proposal
    const accessCheck = await validateResourceAccess(auth.user, id, 'proposal', 'write');
    if (!accessCheck.allowed) {
      return ErrorResponses.forbidden(accessCheck.reason);
    }
    
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
    
    let query: string;
    let queryParams: any[];
    
    // Admin can update any proposal, others can only update their own
    if (auth.user.role === 'admin') {
      query = `UPDATE proposals SET 
        client_data = $1,
        account_manager_data = $2,
        products = $3,
        total_setup = $4,
        total_monthly = $5,
        director_discount = $6,
        negotiation_rounds = $7,
        current_round = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`;
      queryParams = [
        JSON.stringify(proposalData.client_data || {}),
        JSON.stringify(proposalData.account_manager_data || {}),
        JSON.stringify(proposalData.products || []),
        proposalData.total_setup || 0,
        proposalData.total_monthly || 0,
        proposalData.director_discount ? JSON.stringify(proposalData.director_discount) : null,
        JSON.stringify(proposalData.negotiation_rounds || []),
        proposalData.current_round || 1,
        id
      ];
    } else {
      query = `UPDATE proposals SET 
        client_data = $1,
        account_manager_data = $2,
        products = $3,
        total_setup = $4,
        total_monthly = $5,
        director_discount = $6,
        negotiation_rounds = $7,
        current_round = $8,
        updated_at = NOW()
      WHERE id = $9 AND user_id = $10
      RETURNING *`;
      queryParams = [
        JSON.stringify(proposalData.client_data || {}),
        JSON.stringify(proposalData.account_manager_data || {}),
        JSON.stringify(proposalData.products || []),
        proposalData.total_setup || 0,
        proposalData.total_monthly || 0,
        proposalData.director_discount ? JSON.stringify(proposalData.director_discount) : null,
        JSON.stringify(proposalData.negotiation_rounds || []),
        proposalData.current_round || 1,
        id,
        auth.user.id
      ];
    }
    
    const result = await db.query(query, queryParams);
    
    if (result.rows.length === 0) {
      return ErrorResponses.notFound('Proposta');
    }
    
    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return ErrorResponses.serverError('Erro ao atualizar proposta');
  }
}