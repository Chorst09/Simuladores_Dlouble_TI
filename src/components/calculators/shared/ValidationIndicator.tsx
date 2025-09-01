"use client";

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationIndicatorProps {
  hasErrors?: boolean;
  hasWarnings?: boolean;
  errorMessage?: string;
  warningMessage?: string;
  isComplete?: boolean;
  className?: string;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  hasErrors = false,
  hasWarnings = false,
  errorMessage = '',
  warningMessage = '',
  isComplete = false,
  className = ''
}) => {
  // Don't render if no validation state
  if (!hasErrors && !hasWarnings && !isComplete) {
    return null;
  }

  // Error state takes priority
  if (hasErrors && errorMessage) {
    return (
      <div className={cn(
        "mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2",
        className
      )}>
        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800 font-medium">
            Erro de Validação
          </p>
          <p className="text-sm text-red-700 mt-1">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  // Warning state
  if (hasWarnings && warningMessage) {
    return (
      <div className={cn(
        "mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2",
        className
      )}>
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-yellow-800 font-medium">
            Atenção
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            {warningMessage}
          </p>
        </div>
      </div>
    );
  }

  // Success/complete state
  if (isComplete) {
    return (
      <div className={cn(
        "mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2",
        className
      )}>
        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-green-800 font-medium">
            Configuração Completa
          </p>
          <p className="text-sm text-green-700 mt-1">
            Todas as seleções foram feitas. Você pode calcular os preços agora.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ValidationIndicator;