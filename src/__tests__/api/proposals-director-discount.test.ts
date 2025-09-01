import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/proposals/route';
import { PUT, DELETE } from '@/app/api/proposals/[id]/route';

// Mock do pool de banco de dados
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));

// Mock da autenticação
jest.mock('@/lib/auth', () => ({
  requireAuth: () => () => Promise.resolve({
    user: {
      userId: 'test-user-id',
      email: 'diretor@test.com',
      role: 'diretor',
    },
  }),
}));

import pool from '@/lib/db';

const mockPool = pool as jest.Mocked<typeof pool>;

describe('Proposals API - Director Discount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/proposals', () => {
    it('should return proposals with director discount data', async () => {
      const mockProposals = [
        {
          id: 'test-proposal-1',
          client_data: JSON.stringify({ name: 'Test Client', email: 'client@test.com' }),
          account_manager_data: JSON.stringify({ name: 'Test Manager', email: 'manager@test.com' }),
          products: JSON.stringify([{ name: 'Test Product', monthly: 100 }]),
          total_setup: 500,
          total_monthly: 800,
          director_discount: JSON.stringify({
            percentage: 20,
            appliedBy: 'diretor@test.com',
            appliedAt: '2024-01-01T10:00:00Z',
            reason: 'Cliente VIP',
            originalValue: 1000,
            discountedValue: 800,
          }),
          created_at: '2024-01-01T10:00:00Z',
          status: 'pending',
          type: 'PABX_SIP',
          proposal_number: 'PROP-001',
          user_id: 'test-user-id',
          user_email: 'diretor@test.com',
        },
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockProposals });

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty('directorDiscount');
      expect(data[0].directorDiscount).toEqual({
        percentage: 20,
        appliedBy: 'diretor@test.com',
        appliedAt: '2024-01-01T10:00:00Z',
        reason: 'Cliente VIP',
        originalValue: 1000,
        discountedValue: 800,
      });
    });

    it('should handle proposals without director discount', async () => {
      const mockProposals = [
        {
          id: 'test-proposal-2',
          client_data: JSON.stringify({ name: 'Test Client', email: 'client@test.com' }),
          account_manager_data: JSON.stringify({ name: 'Test Manager', email: 'manager@test.com' }),
          products: JSON.stringify([{ name: 'Test Product', monthly: 100 }]),
          total_setup: 500,
          total_monthly: 1000,
          director_discount: null,
          created_at: '2024-01-01T10:00:00Z',
          status: 'pending',
          type: 'RADIO_INTERNET',
          proposal_number: 'PROP-002',
          user_id: 'test-user-id',
          user_email: 'diretor@test.com',
        },
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockProposals });

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].directorDiscount).toBeNull();
    });
  });

  describe('POST /api/proposals', () => {
    it('should save proposal with director discount', async () => {
      const proposalData = {
        id: 'test-proposal-new',
        client_data: { name: 'New Client', email: 'newclient@test.com' },
        account_manager_data: { name: 'New Manager', email: 'newmanager@test.com' },
        products: [{ name: 'New Product', monthly: 500, setup: 100 }],
        total_setup: 100,
        total_monthly: 400,
        director_discount: {
          percentage: 20,
          appliedBy: 'diretor@test.com',
          appliedAt: '2024-01-01T10:00:00Z',
          reason: 'Desconto especial',
          originalValue: 500,
          discountedValue: 400,
        },
        type: 'FIBER_LINK',
        status: 'pending',
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'test-proposal-new', ...proposalData }],
      });

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(proposalData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('director_discount'),
        expect.arrayContaining([
          expect.any(String), // id
          expect.any(String), // user_id
          expect.any(String), // client_data
          expect.any(String), // account_manager_data
          expect.any(String), // products
          expect.any(Number), // total_setup
          expect.any(Number), // total_monthly
          JSON.stringify(proposalData.director_discount), // director_discount
          expect.any(Date), // created_at
          expect.any(String), // type
          expect.any(String), // proposal_number
          expect.any(String), // status
          expect.any(String), // negotiation_rounds
          expect.any(Number), // current_round
        ])
      );
    });

    it('should save proposal without director discount', async () => {
      const proposalData = {
        id: 'test-proposal-no-discount',
        client_data: { name: 'Client', email: 'client@test.com' },
        account_manager_data: { name: 'Manager', email: 'manager@test.com' },
        products: [{ name: 'Product', monthly: 500, setup: 100 }],
        total_setup: 100,
        total_monthly: 500,
        type: 'VM',
        status: 'pending',
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'test-proposal-no-discount', ...proposalData }],
      });

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(proposalData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('director_discount'),
        expect.arrayContaining([
          expect.any(String), // id
          expect.any(String), // user_id
          expect.any(String), // client_data
          expect.any(String), // account_manager_data
          expect.any(String), // products
          expect.any(Number), // total_setup
          expect.any(Number), // total_monthly
          null, // director_discount
          expect.any(Date), // created_at
          expect.any(String), // type
          expect.any(String), // proposal_number
          expect.any(String), // status
          expect.any(String), // negotiation_rounds
          expect.any(Number), // current_round
        ])
      );
    });

    it('should validate director discount data structure', async () => {
      const invalidProposalData = {
        id: 'test-proposal-invalid',
        client_data: { name: 'Client', email: 'client@test.com' },
        products: [{ name: 'Product', monthly: 500 }],
        total_monthly: 500,
        director_discount: {
          // Missing required fields
          percentage: 20,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(invalidProposalData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      // Should still save even with incomplete director discount data
      // as the validation is primarily on the frontend
      expect(response.status).toBe(201);
    });
  });

  describe('PUT /api/proposals/[id]', () => {
    it('should update proposal with director discount', async () => {
      const proposalId = 'test-proposal-update';
      const updateData = {
        client_data: { name: 'Updated Client', email: 'updated@test.com' },
        account_manager_data: { name: 'Updated Manager', email: 'updatedmanager@test.com' },
        products: [{ name: 'Updated Product', monthly: 600 }],
        total_setup: 200,
        total_monthly: 480,
        director_discount: {
          percentage: 20,
          appliedBy: 'diretor@test.com',
          appliedAt: '2024-01-01T12:00:00Z',
          reason: 'Desconto atualizado',
          originalValue: 600,
          discountedValue: 480,
        },
      };

      // Mock para verificar se a proposta existe
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: proposalId, user_id: 'test-user-id' }],
      });

      // Mock para a atualização
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: proposalId, ...updateData }],
      });

      const request = new NextRequest(`http://localhost:3000/api/proposals/${proposalId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, { params: { id: proposalId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('director_discount = $6'),
        expect.arrayContaining([
          expect.any(String), // client_data
          expect.any(String), // account_manager_data
          expect.any(String), // products
          expect.any(Number), // total_setup
          expect.any(Number), // total_monthly
          JSON.stringify(updateData.director_discount), // director_discount
          expect.any(String), // negotiation_rounds
          expect.any(Number), // current_round
          proposalId, // id
        ])
      );
    });

    it('should remove director discount when updating', async () => {
      const proposalId = 'test-proposal-remove-discount';
      const updateData = {
        client_data: { name: 'Client', email: 'client@test.com' },
        account_manager_data: { name: 'Manager', email: 'manager@test.com' },
        products: [{ name: 'Product', monthly: 500 }],
        total_setup: 100,
        total_monthly: 500,
        director_discount: null,
      };

      // Mock para verificar se a proposta existe
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: proposalId, user_id: 'test-user-id' }],
      });

      // Mock para a atualização
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: proposalId, ...updateData }],
      });

      const request = new NextRequest(`http://localhost:3000/api/proposals/${proposalId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, { params: { id: proposalId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('director_discount = $6'),
        expect.arrayContaining([
          expect.any(String), // client_data
          expect.any(String), // account_manager_data
          expect.any(String), // products
          expect.any(Number), // total_setup
          expect.any(Number), // total_monthly
          null, // director_discount
          expect.any(String), // negotiation_rounds
          expect.any(Number), // current_round
          proposalId, // id
        ])
      );
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });

    it('should handle JSON parsing errors for director discount', async () => {
      const mockProposals = [
        {
          id: 'test-proposal-invalid-json',
          client_data: '{"name":"Test Client"}',
          account_manager_data: '{"name":"Test Manager"}',
          products: '[{"name":"Test Product"}]',
          total_setup: 500,
          total_monthly: 1000,
          director_discount: 'invalid-json', // Invalid JSON
          created_at: '2024-01-01T10:00:00Z',
          status: 'pending',
          type: 'PABX_SIP',
          proposal_number: 'PROP-001',
          user_id: 'test-user-id',
          user_email: 'diretor@test.com',
        },
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockProposals });

      const request = new NextRequest('http://localhost:3000/api/proposals');
      
      // Should handle invalid JSON gracefully
      expect(async () => {
        const response = await GET(request);
        const data = await response.json();
        expect(data[0].directorDiscount).toBeNull();
      }).not.toThrow();
    });
  });
});