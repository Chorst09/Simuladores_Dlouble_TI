/**
 * Tests for ValidationSummary component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ValidationSummary } from '../ValidationSummary';
import { ValidationState } from '@/utils/pabxValidation';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-circle" className={className} />
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-circle" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid="alert-triangle" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <div data-testid="clock" className={className} />
  ),
}));

describe('ValidationSummary', () => {
  it('should render error state', () => {
    const validationState: ValidationState = {
      hasErrors: true,
      hasWarnings: false,
      errorMessage: 'Test error message',
      warningMessage: '',
      isComplete: false
    };

    render(<ValidationSummary validationState={validationState} />);

    expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    expect(screen.getByText('Configuração Incompleta')).toBeInTheDocument();
    expect(screen.getByText('Erro:')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render warning state', () => {
    const validationState: ValidationState = {
      hasErrors: false,
      hasWarnings: true,
      errorMessage: '',
      warningMessage: 'Test warning message',
      isComplete: false
    };

    render(<ValidationSummary validationState={validationState} />);

    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
    expect(screen.getByText('Configuração com Avisos')).toBeInTheDocument();
    expect(screen.getByText('Aviso:')).toBeInTheDocument();
    expect(screen.getByText('Test warning message')).toBeInTheDocument();
  });

  it('should render complete state', () => {
    const validationState: ValidationState = {
      hasErrors: false,
      hasWarnings: false,
      errorMessage: '',
      warningMessage: '',
      isComplete: true
    };

    render(<ValidationSummary validationState={validationState} />);

    expect(screen.getByTestId('check-circle')).toBeInTheDocument();
    expect(screen.getByText('Configuração Completa')).toBeInTheDocument();
    expect(screen.getByText('Todas as configurações necessárias foram selecionadas. Você pode prosseguir com o cálculo.')).toBeInTheDocument();
  });

  it('should render pending state', () => {
    const validationState: ValidationState = {
      hasErrors: false,
      hasWarnings: false,
      errorMessage: '',
      warningMessage: '',
      isComplete: false
    };

    render(<ValidationSummary validationState={validationState} />);

    expect(screen.getByTestId('clock')).toBeInTheDocument();
    expect(screen.getByText('Aguardando Configuração')).toBeInTheDocument();
  });

  it('should render custom title', () => {
    const validationState: ValidationState = {
      hasErrors: false,
      hasWarnings: false,
      errorMessage: '',
      warningMessage: '',
      isComplete: false
    };

    render(<ValidationSummary validationState={validationState} title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const validationState: ValidationState = {
      hasErrors: false,
      hasWarnings: false,
      errorMessage: '',
      warningMessage: '',
      isComplete: false
    };

    const { container } = render(
      <ValidationSummary validationState={validationState} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should prioritize error state styling', () => {
    const validationState: ValidationState = {
      hasErrors: true,
      hasWarnings: true,
      errorMessage: 'Error message',
      warningMessage: 'Warning message',
      isComplete: false
    };

    const { container } = render(<ValidationSummary validationState={validationState} />);

    expect(container.firstChild).toHaveClass('border-red-200', 'bg-red-50');
    expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    expect(screen.getByText('Configuração Incompleta')).toBeInTheDocument();
  });
});