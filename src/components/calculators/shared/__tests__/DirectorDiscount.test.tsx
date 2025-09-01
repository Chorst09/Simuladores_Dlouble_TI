import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DirectorDiscount } from '../DirectorDiscount';

// Mock do hook useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('DirectorDiscount Component', () => {
  const mockOnDiscountChange = jest.fn();
  const defaultProps = {
    originalValue: 1000,
    currentDiscount: null,
    onDiscountChange: mockOnDiscountChange,
    userEmail: 'diretor@test.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when no discount is applied', () => {
    render(<DirectorDiscount {...defaultProps} />);
    
    expect(screen.getByText('Desconto de Diretor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: 10')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Motivo do desconto')).toBeInTheDocument();
    expect(screen.getByText('Aplicar Desconto')).toBeInTheDocument();
  });

  it('should show current discount when applied', () => {
    const currentDiscount = {
      percentage: 15,
      appliedBy: 'diretor@test.com',
      appliedAt: '2024-01-01T10:00:00Z',
      reason: 'Cliente especial',
      originalValue: 1000,
      discountedValue: 850,
    };

    render(<DirectorDiscount {...defaultProps} currentDiscount={currentDiscount} />);
    
    expect(screen.getByText('Desconto Atual: 15%')).toBeInTheDocument();
    expect(screen.getByText('Cliente especial')).toBeInTheDocument();
    expect(screen.getByText('R$ 850,00')).toBeInTheDocument();
    expect(screen.getByText('Remover Desconto')).toBeInTheDocument();
  });

  it('should apply discount correctly', async () => {
    const user = userEvent.setup();
    render(<DirectorDiscount {...defaultProps} />);
    
    // Preencher campos
    await user.type(screen.getByPlaceholderText('Ex: 10'), '15');
    await user.type(screen.getByPlaceholderText('Motivo do desconto'), 'Desconto especial');
    
    // Aplicar desconto
    await user.click(screen.getByText('Aplicar Desconto'));
    
    await waitFor(() => {
      expect(mockOnDiscountChange).toHaveBeenCalledWith({
        percentage: 15,
        appliedBy: 'diretor@test.com',
        appliedAt: expect.any(String),
        reason: 'Desconto especial',
        originalValue: 1000,
        discountedValue: 850,
      });
    });
  });

  it('should show confirmation dialog for high discounts', async () => {
    const user = userEvent.setup();
    render(<DirectorDiscount {...defaultProps} />);
    
    // Preencher com desconto alto
    await user.type(screen.getByPlaceholderText('Ex: 10'), '150');
    await user.type(screen.getByPlaceholderText('Motivo do desconto'), 'Desconto muito alto');
    
    // Aplicar desconto
    await user.click(screen.getByText('Aplicar Desconto'));
    
    // Verificar se o diálogo de confirmação aparece
    await waitFor(() => {
      expect(screen.getByText('Confirmar Desconto Alto')).toBeInTheDocument();
      expect(screen.getByText(/Este desconto de 150% é muito alto/)).toBeInTheDocument();
    });
  });

  it('should remove discount correctly', async () => {
    const user = userEvent.setup();
    const currentDiscount = {
      percentage: 15,
      appliedBy: 'diretor@test.com',
      appliedAt: '2024-01-01T10:00:00Z',
      reason: 'Cliente especial',
      originalValue: 1000,
      discountedValue: 850,
    };

    render(<DirectorDiscount {...defaultProps} currentDiscount={currentDiscount} />);
    
    // Remover desconto
    await user.click(screen.getByText('Remover Desconto'));
    
    await waitFor(() => {
      expect(mockOnDiscountChange).toHaveBeenCalledWith(null);
    });
  });

  it('should validate discount percentage', async () => {
    const user = userEvent.setup();
    render(<DirectorDiscount {...defaultProps} />);
    
    // Tentar aplicar desconto sem preencher campos
    await user.click(screen.getByText('Aplicar Desconto'));
    
    // Verificar se não chama onDiscountChange
    expect(mockOnDiscountChange).not.toHaveBeenCalled();
  });

  it('should calculate discounted value correctly', async () => {
    const user = userEvent.setup();
    render(<DirectorDiscount {...defaultProps} />);
    
    // Preencher com 20% de desconto
    await user.type(screen.getByPlaceholderText('Ex: 10'), '20');
    await user.type(screen.getByPlaceholderText('Motivo do desconto'), 'Teste');
    
    // Aplicar desconto
    await user.click(screen.getByText('Aplicar Desconto'));
    
    await waitFor(() => {
      expect(mockOnDiscountChange).toHaveBeenCalledWith(
        expect.objectContaining({
          percentage: 20,
          originalValue: 1000,
          discountedValue: 800, // 1000 - (1000 * 20/100)
        })
      );
    });
  });
});