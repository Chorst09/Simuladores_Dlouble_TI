import { renderHook, act } from '@testing-library/react';
import { usePremiumEditablePricing } from '../usePremiumEditablePricing';
import { PremiumPlanPricing } from '@/types';

// Mock the validation utility
jest.mock('@/utils/pricingValidation', () => ({
  validatePricingValue: jest.fn((value: number) => ({
    isValid: value > 0,
    error: value <= 0 ? 'Valor deve ser maior que zero' : null
  }))
}));

const mockInitialPrices: PremiumPlanPricing = {
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

describe('usePremiumEditablePricing', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices)
    );

    const [state] = result.current;

    expect(state.isEditing).toBe(false);
    expect(state.editingPlan).toBe(null);
    expect(state.editingBillingType).toBe(null);
    expect(state.editedPrices).toEqual(mockInitialPrices);
    expect(state.errors.size).toBe(0);
    expect(state.isSaving).toBe(false);
  });

  it('starts editing correctly', () => {
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices)
    );

    act(() => {
      const [, actions] = result.current;
      actions.startEditing('essencial', 'ilimitado');
    });

    const [state] = result.current;
    expect(state.isEditing).toBe(true);
    expect(state.editingPlan).toBe('essencial');
    expect(state.editingBillingType).toBe('ilimitado');
    expect(state.errors.size).toBe(0);
  });

  it('cancels editing correctly', () => {
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices)
    );

    act(() => {
      const [, actions] = result.current;
      actions.startEditing('essencial', 'ilimitado');
    });

    act(() => {
      const [, actions] = result.current;
      actions.cancelEditing();
    });

    const [state] = result.current;
    expect(state.isEditing).toBe(false);
    expect(state.editingPlan).toBe(null);
    expect(state.editingBillingType).toBe(null);
    expect(state.errors.size).toBe(0);
    expect(state.isSaving).toBe(false);
  });

  it('updates price correctly', () => {
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices)
    );

    act(() => {
      const [, actions] = result.current;
      actions.updatePrice('essencial', 'ilimitado', 'setup', '10', 1500);
    });

    const [state] = result.current;
    expect(state.editedPrices.essencial.ilimitado.setup['10']).toBe(1500);
  });

  it('validates isEditingPlanBilling correctly', () => {
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices)
    );

    act(() => {
      const [, actions] = result.current;
      actions.startEditing('essencial', 'ilimitado');
    });

    const [, actions] = result.current;
    expect(actions.isEditingPlanBilling('essencial', 'ilimitado')).toBe(true);
    expect(actions.isEditingPlanBilling('professional', 'ilimitado')).toBe(false);
    expect(actions.isEditingPlanBilling('essencial', 'tarifado')).toBe(false);
  });

  it('saves changes successfully with onSave callback', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(true);
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices, mockOnSave)
    );

    act(() => {
      const [, actions] = result.current;
      actions.startEditing('essencial', 'ilimitado');
      actions.updatePrice('essencial', 'ilimitado', 'setup', '10', 1500);
    });

    await act(async () => {
      const [, actions] = result.current;
      const success = await actions.saveChanges();
      expect(success).toBe(true);
    });

    expect(mockOnSave).toHaveBeenCalled();
    const [state] = result.current;
    expect(state.isEditing).toBe(false);
    expect(state.editingPlan).toBe(null);
    expect(state.editingBillingType).toBe(null);
  });

  it('handles save failure correctly', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(false);
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices, mockOnSave)
    );

    act(() => {
      const [, actions] = result.current;
      actions.startEditing('essencial', 'ilimitado');
    });

    await act(async () => {
      const [, actions] = result.current;
      const success = await actions.saveChanges();
      expect(success).toBe(false);
    });

    const [state] = result.current;
    expect(state.isSaving).toBe(false);
    expect(state.isEditing).toBe(true); // Should still be editing on failure
  });

  it('validates prices before saving', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(true);
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices, mockOnSave)
    );

    act(() => {
      const [, actions] = result.current;
      actions.startEditing('essencial', 'ilimitado');
      actions.updatePrice('essencial', 'ilimitado', 'setup', '10', -100); // Invalid value
    });

    await act(async () => {
      const [, actions] = result.current;
      const success = await actions.saveChanges();
      expect(success).toBe(false);
    });

    const [state] = result.current;
    expect(state.errors.size).toBeGreaterThan(0);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('resets to defaults correctly', () => {
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices)
    );

    act(() => {
      const [, actions] = result.current;
      actions.updatePrice('essencial', 'ilimitado', 'setup', '10', 9999);
    });

    // Verify price was changed
    let [state] = result.current;
    expect(state.editedPrices.essencial.ilimitado.setup['10']).toBe(9999);

    act(() => {
      const [, actions] = result.current;
      actions.resetToDefaults();
    });

    // Verify price was reset
    [state] = result.current;
    expect(state.editedPrices.essencial.ilimitado.setup['10']).toBe(1400);
    expect(state.errors.size).toBe(0);
  });

  it('clears errors when updating price', () => {
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices)
    );

    // Manually add an error
    act(() => {
      const [state] = result.current;
      state.errors.set('essencial-ilimitado-setup-10', 'Test error');
    });

    act(() => {
      const [, actions] = result.current;
      actions.updatePrice('essencial', 'ilimitado', 'setup', '10', 1500);
    });

    const [state] = result.current;
    expect(state.errors.has('essencial-ilimitado-setup-10')).toBe(false);
  });

  it('skips validation for "A combinar" values (0)', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(true);
    const { result } = renderHook(() => 
      usePremiumEditablePricing(mockInitialPrices, mockOnSave)
    );

    act(() => {
      const [, actions] = result.current;
      actions.startEditing('essencial', 'ilimitado');
      // Set a value to 0 (which represents "A combinar")
      actions.updatePrice('essencial', 'ilimitado', 'setup', '500', 0);
    });

    await act(async () => {
      const [, actions] = result.current;
      const success = await actions.saveChanges();
      expect(success).toBe(true);
    });

    expect(mockOnSave).toHaveBeenCalled();
  });
});