import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlanModalitySelector } from '../PlanModalitySelector';

describe('PlanModalitySelector', () => {
  const mockOnModalityChange = jest.fn();

  beforeEach(() => {
    mockOnModalityChange.mockClear();
  });

  it('renders correctly with standard selected', () => {
    render(
      <PlanModalitySelector
        selectedModality="standard"
        onModalityChange={mockOnModalityChange}
      />
    );

    expect(screen.getByText('Modalidade PABX')).toBeInTheDocument();
    expect(screen.getAllByText('PABX Standard')[0]).toBeInTheDocument();
    expect(screen.getByText('PABX Premium')).toBeInTheDocument();
    expect(screen.getByText('Plano tradicional com preços da tabela padrão')).toBeInTheDocument();
  });

  it('renders correctly with premium selected', () => {
    render(
      <PlanModalitySelector
        selectedModality="premium"
        onModalityChange={mockOnModalityChange}
      />
    );

    expect(screen.getByText('Selecione um plano Premium para continuar')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /PABX Premium/ })).toBeChecked();
  });

  it('shows premium plan details when both plan and billing type are selected', () => {
    render(
      <PlanModalitySelector
        selectedModality="premium"
        onModalityChange={mockOnModalityChange}
        premiumPlan="essencial"
        premiumBillingType="ilimitado"
      />
    );

    expect(screen.getByText('Plano Essencial - Ilimitado')).toBeInTheDocument();
  });

  it('shows validation warnings when showValidation is true and premium selections are incomplete', () => {
    render(
      <PlanModalitySelector
        selectedModality="premium"
        onModalityChange={mockOnModalityChange}
        showValidation={true}
      />
    );

    expect(screen.getByText('⚠️ Para usar PABX Premium, você deve selecionar:')).toBeInTheDocument();
    expect(screen.getByText('• Um plano (Essencial ou Professional)')).toBeInTheDocument();
    expect(screen.getByText('• Um tipo de cobrança (Ilimitado ou Tarifado)')).toBeInTheDocument();
  });

  it('calls onModalityChange when standard is selected', () => {
    render(
      <PlanModalitySelector
        selectedModality="premium"
        onModalityChange={mockOnModalityChange}
      />
    );

    const standardRadio = screen.getByRole('radio', { name: /PABX Standard/ });
    fireEvent.click(standardRadio);

    expect(mockOnModalityChange).toHaveBeenCalledWith('standard');
  });

  it('calls onModalityChange when premium is selected', () => {
    render(
      <PlanModalitySelector
        selectedModality="standard"
        onModalityChange={mockOnModalityChange}
      />
    );

    const premiumRadio = screen.getByRole('radio', { name: /PABX Premium/ });
    fireEvent.click(premiumRadio);

    expect(mockOnModalityChange).toHaveBeenCalledWith('premium');
  });

  it('disables radio buttons when disabled prop is true', () => {
    render(
      <PlanModalitySelector
        selectedModality="standard"
        onModalityChange={mockOnModalityChange}
        disabled={true}
      />
    );

    const standardRadio = screen.getByRole('radio', { name: /PABX Standard/ });
    const premiumRadio = screen.getByRole('radio', { name: /PABX Premium/ });

    expect(standardRadio).toBeDisabled();
    expect(premiumRadio).toBeDisabled();
  });

  it('shows correct selection feedback', () => {
    const { rerender } = render(
      <PlanModalitySelector
        selectedModality="standard"
        onModalityChange={mockOnModalityChange}
      />
    );

    expect(screen.getByRole('radio', { name: /PABX Standard/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /PABX Premium/ })).not.toBeChecked();

    rerender(
      <PlanModalitySelector
        selectedModality="premium"
        onModalityChange={mockOnModalityChange}
      />
    );

    expect(screen.getByRole('radio', { name: /PABX Premium/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /PABX Standard/ })).not.toBeChecked();
    expect(screen.getByText('Selecione um plano Premium para continuar')).toBeInTheDocument();
  });
});