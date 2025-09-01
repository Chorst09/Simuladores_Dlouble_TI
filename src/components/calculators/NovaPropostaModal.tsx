"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClientData, AccountManagerData } from '@/types';

interface PropostaData {
  cliente: ClientData;
  gerente: AccountManagerData;
}

interface NovaPropostaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: PropostaData) => void;
  initialData?: PropostaData;
  isEditing?: boolean;
}

interface ValidationErrors {
  cliente?: {
    name?: string;
    projectName?: string;
    email?: string;
    phone?: string;
  };
  gerente?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

const NovaPropostaModal: React.FC<NovaPropostaModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<PropostaData>({
    cliente: {
      name: initialData?.cliente.name || '',
      projectName: initialData?.cliente.projectName || '',
      email: initialData?.cliente.email || '',
      phone: initialData?.cliente.phone || ''
    },
    gerente: {
      name: initialData?.gerente.name || '',
      email: initialData?.gerente.email || '',
      phone: initialData?.gerente.phone || ''
    }
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Função de validação
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validar dados do cliente
    if (!formData.cliente.name.trim()) {
      newErrors.cliente = { ...newErrors.cliente, name: 'Este campo é obrigatório' };
    }
    if (!formData.cliente.projectName.trim()) {
      newErrors.cliente = { ...newErrors.cliente, projectName: 'Este campo é obrigatório' };
    }
    if (!formData.cliente.email.trim()) {
      newErrors.cliente = { ...newErrors.cliente, email: 'Este campo é obrigatório' };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.cliente.email)) {
      newErrors.cliente = { ...newErrors.cliente, email: 'Digite um email válido' };
    }

    // Validar dados do gerente
    if (!formData.gerente.name.trim()) {
      newErrors.gerente = { ...newErrors.gerente, name: 'Este campo é obrigatório' };
    }
    if (!formData.gerente.email.trim()) {
      newErrors.gerente = { ...newErrors.gerente, email: 'Este campo é obrigatório' };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.gerente.email)) {
      newErrors.gerente = { ...newErrors.gerente, email: 'Digite um email válido' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para lidar com mudanças nos campos do cliente
  const handleClientChange = (field: keyof ClientData, value: string) => {
    setFormData(prev => ({
      ...prev,
      cliente: {
        ...prev.cliente,
        [field]: value
      }
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors.cliente?.[field]) {
      setErrors(prev => ({
        ...prev,
        cliente: {
          ...prev.cliente,
          [field]: undefined
        }
      }));
    }
  };

  // Função para lidar com mudanças nos campos do gerente
  const handleManagerChange = (field: keyof AccountManagerData, value: string) => {
    setFormData(prev => ({
      ...prev,
      gerente: {
        ...prev.gerente,
        [field]: value
      }
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors.gerente?.[field]) {
      setErrors(prev => ({
        ...prev,
        gerente: {
          ...prev.gerente,
          [field]: undefined
        }
      }));
    }
  };

  // Função para continuar para a calculadora
  const handleContinue = () => {
    if (validateForm()) {
      onContinue(formData);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Editar Proposta' : 'Nova Proposta'}
          </h2>
          <p className="text-gray-400">
            {isEditing ? 'Edite os dados do cliente e gerente de contas.' : 'Preencha os dados do cliente e gerente de contas.'}
          </p>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Dados do Cliente */}
          <div className="bg-[#16213e] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Dados do Cliente</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName" className="text-white text-sm font-medium mb-2 block">
                  Nome do Cliente *
                </Label>
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Nome completo do cliente"
                  value={formData.cliente.name}
                  onChange={(e) => handleClientChange('name', e.target.value)}
                  className="bg-[#0f172a] border-[#334155] text-white placeholder-gray-500 focus:border-blue-500 h-12"
                />
                {errors.cliente?.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.cliente.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="projectName" className="text-white text-sm font-medium mb-2 block">
                  Nome do Projeto *
                </Label>
                <Input
                  id="projectName"
                  type="text"
                  placeholder="Nome do projeto"
                  value={formData.cliente.projectName}
                  onChange={(e) => handleClientChange('projectName', e.target.value)}
                  className="bg-[#0f172a] border-[#334155] text-white placeholder-gray-500 focus:border-blue-500 h-12"
                />
                {errors.cliente?.projectName && (
                  <p className="text-red-400 text-sm mt-1">{errors.cliente.projectName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="clientEmail" className="text-white text-sm font-medium mb-2 block">
                  Email do Cliente *
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="email@cliente.com"
                  value={formData.cliente.email}
                  onChange={(e) => handleClientChange('email', e.target.value)}
                  className="bg-[#0f172a] border-[#334155] text-white placeholder-gray-500 focus:border-blue-500 h-12"
                />
                {errors.cliente?.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.cliente.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="clientPhone" className="text-white text-sm font-medium mb-2 block">
                  Telefone do Cliente
                </Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.cliente.phone}
                  onChange={(e) => handleClientChange('phone', e.target.value)}
                  className="bg-[#0f172a] border-[#334155] text-white placeholder-gray-500 focus:border-blue-500 h-12"
                />
                {errors.cliente?.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.cliente.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dados do Gerente de Contas */}
          <div className="bg-[#16213e] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Dados do Gerente de Contas</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="managerName" className="text-white text-sm font-medium mb-2 block">
                  Nome do Gerente *
                </Label>
                <Input
                  id="managerName"
                  type="text"
                  placeholder="Nome completo do gerente"
                  value={formData.gerente.name}
                  onChange={(e) => handleManagerChange('name', e.target.value)}
                  className="bg-[#0f172a] border-[#334155] text-white placeholder-gray-500 focus:border-blue-500 h-12"
                />
                {errors.gerente?.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.gerente.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="managerEmail" className="text-white text-sm font-medium mb-2 block">
                  Email do Gerente *
                </Label>
                <Input
                  id="managerEmail"
                  type="email"
                  placeholder="gerente@empresa.com"
                  value={formData.gerente.email}
                  onChange={(e) => handleManagerChange('email', e.target.value)}
                  className="bg-[#0f172a] border-[#334155] text-white placeholder-gray-500 focus:border-blue-500 h-12"
                />
                {errors.gerente?.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.gerente.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="managerPhone" className="text-white text-sm font-medium mb-2 block">
                  Telefone do Gerente
                </Label>
                <Input
                  id="managerPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.gerente.phone}
                  onChange={(e) => handleManagerChange('phone', e.target.value)}
                  className="bg-[#0f172a] border-[#334155] text-white placeholder-gray-500 focus:border-blue-500 h-12"
                />
                {errors.gerente?.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.gerente.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3"
          >
            ← Voltar
          </Button>
          
          <Button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            {isEditing ? 'Salvar Alterações →' : 'Continuar para Calculadora →'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NovaPropostaModal;