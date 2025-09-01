import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PremiumPricingEditor } from '../PremiumPricingEditor';
import { PremiumPlanPricing } from '@/types';
import { PremiumEditablePricingState, PremiumEditablePricingActions } from '@/hooks/usePremiumEditablePricing';

// Mock data
const mockPrices: PremiumPlanPricing = {
  essencial: {
    ilimitado: {
      setup: { '10': 1400, '20': 2200, '30': 2700, '50': 3200, '100': 3700, '500': 0, '1000': 0 },
      monthly: { '10': 35, '20': 33, '30': 31, '50': 29, '100': 27, '500': 25, '1000': 23 },
      hosting: { '10': 220, '20': 250, '30': 280, '50': 320, '100': 380, '500': 0, '1000': 0 },
      device: { '10': 40, '20': 38, '30': 36, '50': 34, '100': 32, '500': 0, '1000': 0 }
    },
    tarifado: {
      setup: { '10': 1300, '20': 2100, '30': 2600, '50': 3100, '100': 3600, '500': 0, '1000': 0 },
      monthly: { '10': 32, '20': 30, '30': 28, '50': 26, '100': 24, '500': 22, '1000': 20 },
      hosting: { '10': 200, '20': 230, '30': 260, '50': 300, '100': 360, '500': 0, '1000': 0 },
      device: { '10': 38, '20': 36, '30': 34, '50': 32, '100': 30, '500': 0, '1000': 0 }
    }
  },
  professional: {
    ilimitado: {
      setup: { '10': 1600, '20': 2400, '30': 2900, '50': 3400, '100': 3900, '500': 0, '1000': 0 },
      monthly: { '10': 45, '20': 43, '30': 41, '50': 39, '100': 37, '500': 35, '1000': 33 },
      hosting: { '10': 280, '20': 320, '30': 360, '50': 420, '100': 500, '500': 0, '1000': 0 },
      device: { '10': 50, '20': 48, '30': 46, '50': 44, '100': 42, '500': 0, '1000': 0 }
    },
    tarifado: {
      setup: { '10': 1500, '20': 2300, '30': 2800, '50': 3300, '100': 3800, '500': 0, '1000': 0 },
      monthly: { '10': 42, '20': 40, '30': 38, '50': 36, '100': 34, '500': 32, '1000': 30 },
      hosting: { '10': 260, '20': 300, '30': 340, '50': 400, '100': 480, '500': 0, '1000': 0 },
      device: { '10': 47, '20': 45, '30': 43, '50': 41, '100': 39, '500': 0, '1000': 0 }
    }
  }
};

const mockState: PremiumEditablePricingState = {
  isEditing: false,
  editingPlan: null,
  editingBillingType: null,
  editedPrices: mockPrices,
  errors: new Map(),
  isSaving: false
};

const mockActions: PremiumEditablePricingActions = {
  startEditing: jest.fn(),
  cancelEditing: jest.fn(),
  saveChanges: jest.fn(),
  updatePrice: jest.fn(),
  validateValue: jest.fn(),
  isEditingPlanBilling: jest.fn(),
  resetToDefaults: jest.fn()
};

describe('PremiumPricingEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all pricing tables correctly', () => {
    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={mockState}
        actions={mockActions}
      />
    );

    // Check if all plan titles are rendered
    expect(screen.getByText('Plano Essencial')).toBeInTheDocument();
    expect(screen.getByText('Plano Professional')).toBeInTheDocument();

    // Check if all billing type combinations are rendered
    expect(screen.getByText('Essencial - Ilimitado')).toBeInTheDocument();
    expect(screen.getByText('Essencial - Tarifado')).toBeInTheDocument();
    expect(screen.getByText('Professional - Ilimitado')).toBeInTheDocument();
    expect(screen.getByText('Professional - Tarifado')).toBeInTheDocument();
  });

  it('displays prices correctly in non-editing mode', () => {
    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={mockState}
        actions={mockActions}
      />
    );

    // Check if prices are displayed as formatted currency
    expect(screen.getByText('R$ 1.400')).toBeInTheDocument(); // Setup price for Essencial Ilimitado 10 ramais
    expect(screen.getByText('R$ 35')).toBeInTheDocument(); // Monthly price for Essencial Ilimitado 10 ramais
    expect(screen.getByText('A combinar')).toBeInTheDocument(); // Should show for 0 values
  });

  it('shows edit buttons when not editing', () => {
    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={mockState}
        actions={mockActions}
      />
    );

    const editButtons = screen.getAllByText('Editar');
    expect(editButtons).toHaveLength(4); // One for each plan-billing combination
  });

  it('calls startEditing when edit button is clicked', () => {
    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={mockState}
        actions={mockActions}
      />
    );

    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    expect(mockActions.startEditing).toHaveBeenCalledWith('essencial', 'ilimitado');
  });

  it('shows input fields when editing', () => {
    const editingState = {
      ...mockState,
      isEditing: true,
      editingPlan: 'essencial',
      editingBillingType: 'ilimitado'
    };

    mockActions.isEditingPlanBilling.mockImplementation(
      (plan: string, billingType: string) => 
        plan === 'essencial' && billingType === 'ilimitado'
    );

    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={editingState}
        actions={mockActions}
      />
    );

    // Should show input fields instead of text
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('shows save, cancel, and reset buttons when editing', () => {
    const editingState = {
      ...mockState,
      isEditing: true,
      editingPlan: 'essencial',
      editingBillingType: 'ilimitado'
    };

    mockActions.isEditingPlanBilling.mockImplementation(
      (plan: string, billingType: string) => 
        plan === 'essencial' && billingType === 'ilimitado'
    );

    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={editingState}
        actions={mockActions}
      />
    );

    expect(screen.getByText('Salvar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Resetar')).toBeInTheDocument();
  });

  it('calls updatePrice when input value changes', () => {
    const editingState = {
      ...mockState,
      isEditing: true,
      editingPlan: 'essencial',
      editingBillingType: 'ilimitado'
    };

    mockActions.isEditingPlanBilling.mockImplementation(
      (plan: string, billingType: string) => 
        plan === 'essencial' && billingType === 'ilimitado'
    );

    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={editingState}
        actions={mockActions}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '1500' } });

    expect(mockActions.updatePrice).toHaveBeenCalled();
  });

  it('calls saveChanges when save button is clicked', () => {
    const editingState = {
      ...mockState,
      isEditing: true,
      editingPlan: 'essencial',
      editingBillingType: 'ilimitado'
    };

    mockActions.isEditingPlanBilling.mockImplementation(
      (plan: string, billingType: string) => 
        plan === 'essencial' && billingType === 'ilimitado'
    );

    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={editingState}
        actions={mockActions}
      />
    );

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    expect(mockActions.saveChanges).toHaveBeenCalled();
  });

  it('calls cancelEditing when cancel button is clicked', () => {
    const editingState = {
      ...mockState,
      isEditing: true,
      editingPlan: 'essencial',
      editingBillingType: 'ilimitado'
    };

    mockActions.isEditingPlanBilling.mockImplementation(
      (plan: string, billingType: string) => 
        plan === 'essencial' && billingType === 'ilimitado'
    );

    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={editingState}
        actions={mockActions}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockActions.cancelEditing).toHaveBeenCalled();
  });

  it('displays validation errors', () => {
    const errorState = {
      ...mockState,
      isEditing: true,
      editingPlan: 'essencial',
      editingBillingType: 'ilimitado',
      errors: new Map([['essencial-ilimitado-setup-10', 'Valor deve ser maior que zero']])
    };

    mockActions.isEditingPlanBilling.mockImplementation(
      (plan: string, billingType: string) => 
        plan === 'essencial' && billingType === 'ilimitado'
    );

    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={errorState}
        actions={mockActions}
      />
    );

    expect(screen.getByText('Erros de Validação:')).toBeInTheDocument();
    expect(screen.getByText('• Valor deve ser maior que zero')).toBeInTheDocument();
  });

  it('shows saving state on save button', () => {
    const savingState = {
      ...mockState,
      isEditing: true,
      editingPlan: 'essencial',
      editingBillingType: 'ilimitado',
      isSaving: true
    };

    mockActions.isEditingPlanBilling.mockImplementation(
      (plan: string, billingType: string) => 
        plan === 'essencial' && billingType === 'ilimitado'
    );

    render(
      <PremiumPricingEditor
        prices={mockPrices}
        state={savingState}
        actions={mockActions}
      />
    );

    expect(screen.getByText('Salvando...')).toBeInTheDocument();
  });
});