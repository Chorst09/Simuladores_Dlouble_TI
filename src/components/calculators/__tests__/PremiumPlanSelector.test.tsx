import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PremiumPlanSelector } from '../PremiumPlanSelector';

describe('PremiumPlanSelector', () => {
  const mockOnPlanChange = jest.fn();

  beforeEach(() => {
    mockOnPlanChange.mockClear();
  });

  it('renders correctly when visible', () => {
    render(
      <PremiumPlanSelector
        selectedPlan={null}
        onPlanChange={mockOnPlanChange}
        visible={true}
      />
    );

    expect(screen.getByText('Plano Premium')).toBeInTheDocument();
    expect(screen.getByText('Essencial')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(
      <PremiumPlanSelector
        selectedPlan={null}
        onPlanChange={mockOnPlanChange}
        visible={false}
      />
    );

    expect(screen.queryByText('Plano Premium')).not.toBeInTheDocument();
  });

  it('shows warning message when no plan is selected', () => {
    render(
      <PremiumPlanSelector
        selectedPlan={null}
        onPlanChange={mockOnPlanChange}
        visible={true}
      />
    );

    expect(screen.getByText(/Selecione um plano Premium para continuar/)).toBeInTheDocument();
  });

  it('shows confirmation message when plan is selected', () => {
    render(
      <PremiumPlanSelector
        selectedPlan="essencial"
        onPlanChange={mockOnPlanChange}
        visible={true}
      />
    );

    expect(screen.getByText(/Selecionado: Plano Essencial/)).toBeInTheDocument();
    expect(screen.getByText(/Agora selecione o tipo de cobrança/)).toBeInTheDocument();
  });

  it('calls onPlanChange when essencial is selected', () => {
    render(
      <PremiumPlanSelector
        selectedPlan={null}
        onPlanChange={mockOnPlanChange}
        visible={true}
      />
    );

    const essencialRadio = screen.getByLabelText(/Essencial/);
    fireEvent.click(essencialRadio);

    expect(mockOnPlanChange).toHaveBeenCalledWith('essencial');
  });

  it('calls onPlanChange when professional is selected', () => {
    render(
      <PremiumPlanSelector
        selectedPlan={null}
        onPlanChange={mockOnPlanChange}
        visible={true}
      />
    );

    const professionalRadio = screen.getByLabelText(/Professional/);
    fireEvent.click(professionalRadio);

    expect(mockOnPlanChange).toHaveBeenCalledWith('professional');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <PremiumPlanSelector
        selectedPlan={null}
        onPlanChange={mockOnPlanChange}
        visible={true}
        disabled={true}
      />
    );

    const essencialRadio = screen.getByRole('radio', { name: /essencial/i });
    const professionalRadio = screen.getByRole('radio', { name: /professional/i });

    expect(essencialRadio).toBeDisabled();
    expect(professionalRadio).toBeDisabled();
  });

  it('shows correct selected plan', () => {
    render(
      <PremiumPlanSelector
        selectedPlan="professional"
        onPlanChange={mockOnPlanChange}
        visible={true}
      />
    );

    const professionalRadio = screen.getByRole('radio', { name: /professional/i });
    expect(professionalRadio).toBeChecked();
  });

  it('has proper descriptions for each plan', () => {
    render(
      <PremiumPlanSelector
        selectedPlan={null}
        onPlanChange={mockOnPlanChange}
        visible={true}
      />
    );

    expect(screen.getByText(/Plano básico Premium com recursos essenciais para pequenas e médias empresas/)).toBeInTheDocument();
    expect(screen.getByText(/Plano avançado Premium com recursos completos para empresas de grande porte/)).toBeInTheDocument();
  });
});