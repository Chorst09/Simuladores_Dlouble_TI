# Design Document - Nova Proposta PABX/SIP

## Overview

Esta funcionalidade implementará um formulário modal de "Nova Proposta" que será acionado no calculador PABX/SIP. O formulário coletará dados do cliente e gerente de contas antes de prosseguir para os cálculos, seguindo o design visual fornecido.

## Architecture

### Component Structure
```
PABXSIPCalculator
├── NovaPropostaModal (novo componente)
│   ├── ClientDataForm
│   └── ManagerDataForm
└── Existing Calculator Components
```

### State Management
```typescript
interface PropostaData {
  cliente: {
    nome: string;
    projeto: string;
    email: string;
    telefone?: string;
  };
  gerente: {
    nome: string;
    email: string;
    telefone?: string;
  };
}
```

## Components and Interfaces

### NovaPropostaModal Component
```typescript
interface NovaPropostaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: PropostaData) => void;
}

const NovaPropostaModal: React.FC<NovaPropostaModalProps> = ({
  isOpen,
  onClose,
  onContinue
}) => {
  // Component implementation
}
```

### Form Validation Schema
```typescript
const validationSchema = {
  cliente: {
    nome: { required: true, minLength: 2 },
    projeto: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    telefone: { optional: true, pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ }
  },
  gerente: {
    nome: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    telefone: { optional: true, pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ }
  }
}
```

## Data Models

### PropostaData Interface
```typescript
interface PropostaData {
  id?: string;
  createdAt?: Date;
  cliente: {
    nome: string;
    projeto: string;
    email: string;
    telefone?: string;
  };
  gerente: {
    nome: string;
    email: string;
    telefone?: string;
  };
  status: 'draft' | 'active' | 'completed';
}
```

### Form State Management
```typescript
const [formData, setFormData] = useState<PropostaData>({
  cliente: {
    nome: '',
    projeto: '',
    email: '',
    telefone: ''
  },
  gerente: {
    nome: '',
    email: '',
    telefone: ''
  },
  status: 'draft'
});
```

## UI/UX Design

### Modal Layout
- **Background**: Dark overlay (rgba(0,0,0,0.8))
- **Modal**: Centered, max-width 800px, dark theme
- **Header**: "Nova Proposta" title with subtitle
- **Body**: Two-column layout for desktop, stacked for mobile
- **Footer**: Action buttons (Voltar, Continuar para Calculadora)

### Form Styling
```css
.nova-proposta-modal {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 2rem;
  color: white;
}

.form-section {
  background: #16213e;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-input {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.75rem;
  color: white;
  width: 100%;
}

.form-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### Responsive Design
- **Desktop**: Two-column layout (Cliente | Gerente)
- **Tablet**: Single column, sections stacked
- **Mobile**: Full-width, optimized spacing

## Error Handling

### Validation Errors
```typescript
interface ValidationErrors {
  cliente?: {
    nome?: string;
    projeto?: string;
    email?: string;
    telefone?: string;
  };
  gerente?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
}
```

### Error Display Strategy
- Inline validation on blur
- Real-time email format validation
- Error messages in Portuguese
- Visual indicators (red borders, error icons)

### Error Messages
```typescript
const errorMessages = {
  required: 'Este campo é obrigatório',
  email: 'Digite um email válido',
  telefone: 'Digite um telefone válido (ex: (11) 99999-9999)',
  minLength: 'Mínimo de 2 caracteres'
};
```

## Integration Points

### PABXSIPCalculator Integration
1. Add "Nova Proposta" button to calculator header
2. Manage modal state in parent component
3. Pass proposta data to calculator context
4. Update calculator header to show client/project info

### Data Flow
```
User clicks "Nova Proposta" 
→ Modal opens with empty form
→ User fills data
→ Validation occurs
→ Data saved to context/state
→ Modal closes
→ Calculator shows with proposta data
```

## Testing Strategy

### Unit Tests
- Form validation logic
- Component rendering
- State management
- Error handling

### Integration Tests
- Modal open/close behavior
- Form submission flow
- Data persistence
- Navigation between modal and calculator

### E2E Tests
- Complete user journey
- Form validation scenarios
- Responsive behavior
- Error state handling

## Performance Considerations

### Optimization Strategies
- Lazy load modal component
- Debounced validation
- Memoized form components
- Efficient re-renders

### Bundle Size
- Modal component code-splitting
- Shared validation utilities
- Optimized CSS-in-JS

## Accessibility

### WCAG Compliance
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

### Implementation Details
```typescript
// ARIA attributes
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Nova Proposta</h2>
  <form aria-label="Formulário de nova proposta">
    <fieldset aria-labelledby="client-legend">
      <legend id="client-legend">Dados do Cliente</legend>
      // Client fields
    </fieldset>
  </form>
</div>
```

## Security Considerations

### Input Sanitization
- XSS prevention
- Email validation
- Phone number formatting
- SQL injection prevention (if backend integration)

### Data Privacy
- No sensitive data logging
- Secure data transmission
- LGPD compliance considerations