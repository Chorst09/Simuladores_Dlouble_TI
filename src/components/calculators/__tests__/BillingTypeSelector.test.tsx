import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BillingTypeSelector } from '../BillingTypeSelector';

describe('BillingTypeSelector', () => {
  const mockOnTypeChange = jest.fn();

  beforeEach(() => {
    mockOnTypeChange.mockClear();
  });

  it('renders correctly when visible', () => {
    render(
      <BillingTypeSelector
        selectedType={null}
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    expect(screen.getByText('Tipo de Cobrança')).toBeInTheDocument();
    expect(screen.getByText('Ilimitado')).toBeInTheDocument();
    expect(screen.getByText('Tarifado')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(
      <BillingTypeSelector
        selectedType={null}
        onTypeChange={mockOnTypeChange}
        visible={false}
      />
    );

    expect(screen.queryByText('Tipo de Cobrança')).not.toBeInTheDocument();
  });

  it('shows warning message when no type is selected', () => {
    render(
      <BillingTypeSelector
        selectedType={null}
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    expect(screen.getByText(/Selecione o tipo de cobrança para continuar/)).toBeInTheDocument();
  });

  it('shows confirmation message when ilimitado is selected', () => {
    render(
      <BillingTypeSelector
        selectedType="ilimitado"
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    expect(screen.getByText(/Selecionado: Tipo Ilimitado/)).toBeInTheDocument();
    expect(screen.getByText(/Configuração completa! Você pode calcular os preços agora./)).toBeInTheDocument();
  });

  it('shows confirmation message when tarifado is selected', () => {
    render(
      <BillingTypeSelector
        selectedType="tarifado"
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    expect(screen.getByText(/Selecionado: Tipo Tarifado/)).toBeInTheDocument();
    expect(screen.getByText(/Configuração completa! Você pode calcular os preços agora./)).toBeInTheDocument();
  });

  it('calls onTypeChange when ilimitado is selected', () => {
    render(
      <BillingTypeSelector
        selectedType={null}
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    const ilimitadoRadio = screen.getByLabelText(/Ilimitado/);
    fireEvent.click(ilimitadoRadio);

    expect(mockOnTypeChange).toHaveBeenCalledWith('ilimitado');
  });

  it('calls onTypeChange when tarifado is selected', () => {
    render(
      <BillingTypeSelector
        selectedType={null}
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    const tarifadoRadio = screen.getByLabelText(/Tarifado/);
    fireEvent.click(tarifadoRadio);

    expect(mockOnTypeChange).toHaveBeenCalledWith('tarifado');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <BillingTypeSelector
        selectedType={null}
        onTypeChange={mockOnTypeChange}
        visible={true}
        disabled={true}
      />
    );

    const ilimitadoRadio = screen.getByRole('radio', { name: /ilimitado/i });
    const tarifadoRadio = screen.getByRole('radio', { name: /tarifado/i });

    expect(ilimitadoRadio).toBeDisabled();
    expect(tarifadoRadio).toBeDisabled();
  });

  it('shows correct selected type', () => {
    render(
      <BillingTypeSelector
        selectedType="tarifado"
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    const tarifadoRadio = screen.getByRole('radio', { name: /tarifado/i });
    expect(tarifadoRadio).toBeChecked();
  });

  it('has proper descriptions for each billing type', () => {
    render(
      <BillingTypeSelector
        selectedType={null}
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    expect(screen.getByText(/Plano com chamadas ilimitadas e preço fixo mensal/)).toBeInTheDocument();
    expect(screen.getByText(/Plano com cobrança baseada no consumo de chamadas/)).toBeInTheDocument();
  });

  it('does not show confirmation when no type is selected', () => {
    render(
      <BillingTypeSelector
        selectedType={null}
        onTypeChange={mockOnTypeChange}
        visible={true}
      />
    );

    expect(screen.queryByText(/Selecionado:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Configuração completa!/)).not.toBeInTheDocument();
  });
});