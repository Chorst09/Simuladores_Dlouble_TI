"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Proposal, ProposalItem } from '@/types';

interface NegotiationRound {
  id: string;
  originalValue: number;
  discountPercentage: number;
  discountedValue: number;
  createdAt: Date;
  notes?: string;
}

interface NegotiationRoundsProps {
  proposal: Proposal;
  onSave: (updatedProposal: Proposal) => void;
  onClose: () => void;
}

export const NegotiationRounds: React.FC<NegotiationRoundsProps> = ({
  proposal,
  onSave,
  onClose
}) => {
  console.log('NegotiationRounds renderizado com proposta:', proposal);
  const { toast } = useToast();
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [negotiationDiscount, setNegotiationDiscount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('Desconto de 5%');
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>(proposal.proposalItems || proposal.products || []);

  const formatCurrency = (value: number | undefined | null) => {
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };

  const totalMonthly = proposalItems.reduce((sum, item) => sum + (item.monthly * item.quantity), 0);

  const handleApplyDiscount = () => {
    if (negotiationDiscount <= 0) {
      toast({ 
        title: "Erro", 
        description: "O desconto deve ser maior que 0%", 
        variant: "destructive" 
      });
      return;
    }

    if (negotiationDiscount > 100) {
      toast({ 
        title: "Erro", 
        description: "O desconto não pode ser maior que 100%", 
        variant: "destructive" 
      });
      return;
    }

    // Aplicar desconto aos produtos
    const discountedProducts = proposalItems.map(product => ({
      ...product,
      monthly: product.monthly * (1 - negotiationDiscount / 100)
    }));

    setProposalItems(discountedProducts);
    setCurrentRound(currentRound + 1);
    setNegotiationDiscount(0);
    setDiscountReason('');
    
    toast({ 
      title: "Desconto Aplicado!", 
      description: `Desconto de ${negotiationDiscount}% aplicado com sucesso.` 
    });
  };

  const handleSaveProposal = () => {
    const updatedProposal: Proposal = {
      ...proposal,
      proposalItems,
      products: proposalItems, // Adicionar também como products para compatibilidade
      totalMonthly: proposalItems.reduce((sum, item) => sum + (item.monthly * item.quantity), 0),
      totalSetup: proposalItems.reduce((sum, item) => sum + (item.setup * item.quantity), 0),
      updatedAt: new Date(),
      // Garantir que os dados do cliente e gerente estejam presentes
      clientData: proposal.clientData || proposal.client_data || proposal.client,
      accountManagerData: proposal.accountManagerData || proposal.account_manager_data || proposal.accountManager,
      status: proposal.status || 'Pendente'
    };

    onSave(updatedProposal);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Rodadas de Negociação</CardTitle>
            <CardDescription className="text-slate-400">
              Proposta: {proposal.proposalNumber} - Cliente: {proposal.clientData?.name}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Valor Inicial */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Valor Inicial</h3>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalMonthly)}</p>
          </div>

          {/* Rodada Atual */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-800">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">
              Rodada {currentRound}: Vendedor/Gerente de Contas
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="discount-reason" className="text-slate-300">Motivo do Desconto</Label>
                <Input 
                  id="discount-reason"
                  value={discountReason || ''}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Ex: Desconto de 5%"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="discount-percentage" className="text-slate-300">Desconto (%)</Label>
                <Input 
                  id="discount-percentage"
                  type="number"
                  value={negotiationDiscount || 0}
                  onChange={(e) => setNegotiationDiscount(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <p className="text-sm text-slate-400">Valor com desconto:</p>
                <p className="text-xl font-bold text-orange-400">
                  {formatCurrency(totalMonthly * (1 - negotiationDiscount / 100))}
                </p>
              </div>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleApplyDiscount}
                disabled={negotiationDiscount <= 0}
              >
                Aplicar {negotiationDiscount}% de Desconto
              </Button>
            </div>
          </div>

          {/* Produtos da Proposta */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Produtos da Proposta</h3>
            <div className="space-y-2">
              {proposalItems.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-center p-3 border border-slate-600 rounded bg-slate-700">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatCurrency(item.monthly * item.quantity)}</p>
                    <p className="text-sm text-slate-400">Qtd: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4 border-t border-slate-600">
            <Button 
              onClick={handleSaveProposal}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Proposta
            </Button>
            <Button variant="outline" onClick={handlePrint} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Download className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};