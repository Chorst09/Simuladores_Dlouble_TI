"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Download, Printer } from "lucide-react";
import { Proposal } from '@/types';

interface ProposalViewerProps {
  proposal: Proposal;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalViewer: React.FC<ProposalViewerProps> = ({
  proposal,
  isOpen,
  onClose
}) => {
  const formatCurrency = (value: number | undefined | null) => {
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const handlePrint = () => {
    const printContent = document.getElementById('proposal-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Proposta ${proposal.proposalNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
                .proposal-title { font-size: 20px; margin: 10px 0; }
                .section { margin: 20px 0; }
                .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .client-info, .manager-info { display: inline-block; width: 48%; vertical-align: top; }
                .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .products-table th, .products-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .products-table th { background-color: #f5f5f5; }
                .totals { text-align: right; margin-top: 20px; }
                .total-line { margin: 5px 0; }
                .final-total { font-size: 18px; font-weight: bold; color: #059669; }
                .director-discount { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
                .director-discount-title { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
                .discount-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
                .discount-summary { border-top: 1px solid #cbd5e1; padding-top: 10px; }
                .original-value { text-decoration: line-through; color: #64748b; }
                .discounted-value { font-weight: bold; color: #2563eb; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Visualizar Proposta</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div id="proposal-print-content">
            {/* Cabeçalho da Empresa */}
            <div className="header text-center mb-8">
              <h1 className="company-name text-2xl font-bold text-blue-600 mb-2">
                Sua Empresa
              </h1>
              <h2 className="proposal-title text-xl font-semibold">
                Proposta Comercial
              </h2>
              <p className="text-gray-600">
                Proposta Nº: {proposal.proposalNumber || proposal.id}
              </p>
              <p className="text-gray-600">
                Data: {formatDate(proposal.createdAt || new Date())}
              </p>
            </div>

            {/* Informações do Cliente e Gerente */}
            <div className="section mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="client-info">
                  <h3 className="section-title text-lg font-semibold border-b pb-2 mb-3">
                    Dados do Cliente
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Nome:</strong> {proposal.clientData?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {proposal.clientData?.email || 'N/A'}</p>
                    <p><strong>Telefone:</strong> {proposal.clientData?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="manager-info">
                  <h3 className="section-title text-lg font-semibold border-b pb-2 mb-3">
                    Gerente de Contas
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Nome:</strong> {proposal.accountManagerData?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {proposal.accountManagerData?.email || 'N/A'}</p>
                    <p><strong>Telefone:</strong> {proposal.accountManagerData?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Produtos/Serviços */}
            <div className="section mb-6">
              <h3 className="section-title text-lg font-semibold border-b pb-2 mb-4">
                Produtos/Serviços
              </h3>
              <div className="overflow-x-auto">
                <table className="products-table w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-3 text-left">Produto/Serviço</th>
                      <th className="border p-3 text-left">Descrição</th>
                      <th className="border p-3 text-center">Qtd</th>
                      <th className="border p-3 text-right">Valor Unit.</th>
                      <th className="border p-3 text-right">Setup</th>
                      <th className="border p-3 text-right">Total Mensal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.proposalItems?.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="border p-3">{item.name}</td>
                        <td className="border p-3 text-sm">{item.description}</td>
                        <td className="border p-3 text-center">{item.quantity}</td>
                        <td className="border p-3 text-right">{formatCurrency(item.unitPrice || item.monthly)}</td>
                        <td className="border p-3 text-right">{formatCurrency(item.setup * item.quantity)}</td>
                        <td className="border p-3 text-right font-semibold">
                          {formatCurrency(item.monthly * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Desconto de Diretor */}
            {proposal.directorDiscount && (
              <div className="section mb-6">
                <h3 className="section-title text-lg font-semibold border-b pb-2 mb-4 text-blue-600">
                  Desconto de Diretoria
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Percentual de Desconto:</strong> {proposal.directorDiscount.percentage}%</p>
                      <p><strong>Aplicado por:</strong> {proposal.directorDiscount.appliedBy}</p>
                    </div>
                    <div>
                      <p><strong>Data de Aplicação:</strong> {formatDate(proposal.directorDiscount.appliedAt)}</p>
                      <p><strong>Motivo:</strong> {proposal.directorDiscount.reason}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor original:</span>
                      <span className="text-sm line-through text-gray-500">
                        {formatCurrency(proposal.directorDiscount.originalValue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-blue-600">
                      <span>Valor com desconto:</span>
                      <span>{formatCurrency(proposal.directorDiscount.discountedValue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Totais */}
            <div className="totals">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="total-line flex justify-between">
                    <span>Total Setup:</span>
                    <span className="font-semibold">{formatCurrency(proposal.totalSetup || 0)}</span>
                  </div>
                  {proposal.directorDiscount && (
                    <div className="total-line flex justify-between text-gray-500 text-sm">
                      <span>Total Mensal (original):</span>
                      <span className="line-through">{formatCurrency(proposal.directorDiscount.originalValue)}</span>
                    </div>
                  )}
                  <div className="total-line flex justify-between final-total text-lg border-t pt-2">
                    <span>Total Mensal{proposal.directorDiscount ? ' (com desconto)' : ''}:</span>
                    <span className={proposal.directorDiscount ? 'text-blue-600' : ''}>
                      {formatCurrency(proposal.totalMonthly || 0)}
                    </span>
                  </div>
                  {proposal.directorDiscount && (
                    <div className="total-line flex justify-between text-green-600 text-sm">
                      <span>Economia:</span>
                      <span>
                        {formatCurrency(proposal.directorDiscount.originalValue - proposal.directorDiscount.discountedValue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="section mt-8">
              <h3 className="section-title text-lg font-semibold border-b pb-2 mb-4">
                Informações Adicionais
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Status:</strong> {proposal.status || 'Rascunho'}</p>
                <p><strong>Tipo:</strong> {proposal.type || 'N/A'}</p>
                <p><strong>Data de Criação:</strong> {formatDate(proposal.createdAt || new Date())}</p>
                {proposal.updatedAt && (
                  <p><strong>Última Atualização:</strong> {formatDate(proposal.updatedAt)}</p>
                )}
              </div>
            </div>

            {/* Rodapé */}
            <div className="footer mt-12 pt-6 border-t text-center text-sm text-gray-500">
              <p>Esta proposta é válida por 30 dias a partir da data de emissão.</p>
              <p>Para dúvidas ou esclarecimentos, entre em contato conosco.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};