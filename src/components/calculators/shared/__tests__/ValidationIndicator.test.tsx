/**
 * Tests for ValidationIndicator component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ValidationIndicator } from '../ValidationIndicator';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-circle" className={className} />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-circle" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid="alert-triangle" className={className} />
  ),
}));

describe('ValidationIndicator', () => {
  it('should not render when no validation state is provided', () => {
    const { container } = render(<ValidationIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should render error state', () => {
    render(
      <ValidationIndicator
        hasErrors={true}
        errorMessage="Test error message"
      />
    );

    expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    expect(screen.getByText('Erro de Validação')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render warning state', () => {
    render(
      <ValidationIndicator
        hasWarnings={true}
        warningMessage="Test warning message"
      />
    );

    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
    expect(screen.getByText('Atenção')).toBeInTheDocument();
    expect(screen.getByText('Test warning message')).toBeInTheDocument();
  });

  it('should render complete state', () => {
    render(
      <ValidationIndicator
        isComplete={true}
      />
    );

    expect(screen.getByTestId('check-circle')).toBeInTheDocument();
    expect(screen.getByText('Configuração Completa')).toBeInTheDocument();
    expect(screen.getByText('Todas as seleções foram feitas. Você pode calcular os preços agora.')).toBeInTheDocument();
  });

  it('should prioritize error state over warning state', () => {
    render(
      <ValidationIndicator
        hasErrors={true}
        hasWarnings={true}
        errorMessage="Test error"
        warningMessage="Test warning"
      />
    );

    expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    expect(screen.getByText('Erro de Validação')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.queryByText('Test warning')).not.toBeInTheDocument();
  });

  it('should prioritize error state over complete state', () => {
    render(
      <ValidationIndicator
        hasErrors={true}
        isComplete={true}
        errorMessage="Test error"
      />
    );

    expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    expect(screen.getByText('Erro de Validação')).toBeInTheDocument();
    expect(screen.queryByText('Configuração Completa')).not.toBeInTheDocument();
  });

  it('should prioritize warning state over complete state', () => {
    render(
      <ValidationIndicator
        hasWarnings={true}
        isComplete={true}
        warningMessage="Test warning"
      />
    );

    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
    expect(screen.getByText('Atenção')).toBeInTheDocument();
    expect(screen.queryByText('Configuração Completa')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ValidationIndicator
        hasErrors={true}
        errorMessage="Test error"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});