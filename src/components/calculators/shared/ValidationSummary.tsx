"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidationState } from '@/utils/pabxValidation';

interface ValidationSummaryProps {
  validationState: ValidationState;
  title?: string;
  className?: string;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validationState,
  title = "Status da Configuração",
  className = ''
}) => {
  const getStatusIcon = () => {
    if (validationState.hasErrors) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    if (validationState.hasWarnings) {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
    if (validationState.isComplete) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <Clock className="h-5 w-5 text-gray-600" />;
  };

  const getStatusText = () => {
    if (validationState.hasErrors) {
      return "Configuração Incompleta";
    }
    if (validationState.hasWarnings) {
      return "Configuração com Avisos";
    }
    if (validationState.isComplete) {
      return "Configuração Completa";
    }
    return "Aguardando Configuração";
  };

  const getStatusColor = () => {
    if (validationState.hasErrors) {
      return "border-red-200 bg-red-50";
    }
    if (validationState.hasWarnings) {
      return "border-yellow-200 bg-yellow-50";
    }
    if (validationState.isComplete) {
      return "border-green-200 bg-green-50";
    }
    return "border-gray-200 bg-gray-50";
  };

  return (
    <Card className={cn(getStatusColor(), className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center space-x-2">
          {getStatusIcon()}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {getStatusText()}
          </p>
          
          {validationState.hasErrors && validationState.errorMessage && (
            <div className="text-sm text-red-700">
              <strong>Erro:</strong> {validationState.errorMessage}
            </div>
          )}
          
          {validationState.hasWarnings && validationState.warningMessage && (
            <div className="text-sm text-yellow-700">
              <strong>Aviso:</strong> {validationState.warningMessage}
            </div>
          )}
          
          {validationState.isComplete && (
            <div className="text-sm text-green-700">
              Todas as configurações necessárias foram selecionadas. Você pode prosseguir com o cálculo.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationSummary;