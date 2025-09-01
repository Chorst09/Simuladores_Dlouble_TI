/**
 * Tests for RequiredFieldIndicator component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RequiredFieldIndicator } from '../RequiredFieldIndicator';

describe('RequiredFieldIndicator', () => {
  it('should not render when required is false', () => {
    const { container } = render(<RequiredFieldIndicator required={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when required is not provided (defaults to false)', () => {
    const { container } = render(<RequiredFieldIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should render asterisk when required is true', () => {
    render(<RequiredFieldIndicator required={true} />);
    
    const indicator = screen.getByText('*');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('aria-label', 'Campo obrigatório');
  });

  it('should apply custom className', () => {
    render(<RequiredFieldIndicator required={true} className="custom-class" />);
    
    const indicator = screen.getByText('*');
    expect(indicator).toHaveClass('custom-class');
  });

  it('should have default styling classes', () => {
    render(<RequiredFieldIndicator required={true} />);
    
    const indicator = screen.getByText('*');
    expect(indicator).toHaveClass('text-red-500', 'ml-1');
  });
});