import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Crown } from 'lucide-react';

interface DirectorDiscountProps {
    totalValue: number;
    onDiscountChange: (discount: number, discountedValue: number, reason: string) => void;
    initialDiscount?: number;
    initialReason?: string;
    disabled?: boolean;
    userEmail: string;
}

export const DirectorDiscount: React.FC<DirectorDiscountProps> = ({
    totalValue,
    onDiscountChange,
    initialDiscount = 0,
    initialReason = '',
    disabled = false,
    userEmail
}) => {
    const [discount, setDiscount] = useState<number>(initialDiscount);
    const [reason, setReason] = useState<string>(initialReason);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [pendingDiscount, setPendingDiscount] = useState<number>(0);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const validateDiscount = (value: number): string | null => {
        if (value < 0) return "O desconto não pode ser negativo";
        if (isNaN(value)) return "Por favor, insira um valor numérico válido";
        return null;
    };

    const handleDiscountChange = (newDiscount: number) => {
        const validation = validateDiscount(newDiscount);
        if (validation) {
            return;
        }

        if (newDiscount > 100) {
            setPendingDiscount(newDiscount);
            setShowConfirmation(true);
            return;
        }

        applyDiscount(newDiscount);
    };

    const applyDiscount = (discountValue: number) => {
        setDiscount(discountValue);
        const discountedValue = totalValue * (1 - discountValue / 100);
        onDiscountChange(discountValue, discountedValue, reason);
    };

    const handleConfirmHighDiscount = () => {
        applyDiscount(pendingDiscount);
        setShowConfirmation(false);
        setPendingDiscount(0);
    };

    const handleCancelHighDiscount = () => {
        setShowConfirmation(false);
        setPendingDiscount(0);
    };

    useEffect(() => {
        if (discount > 0) {
            const discountedValue = totalValue * (1 - discount / 100);
            onDiscountChange(discount, discountedValue, reason);
        }
    }, [totalValue, reason]);

    const discountedValue = totalValue * (1 - discount / 100);

    return (
        <>
            <Card className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-amber-600/50 text-white">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-amber-400">
                        <Crown className="h-5 w-5" />
                        Desconto Diretoria
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="director-discount" className="text-slate-300">
                                Desconto (%)
                            </Label>
                            <Input
                                id="director-discount"
                                type="number"
                                value={discount || 0}
                                onChange={(e) => handleDiscountChange(Number(e.target.value))}
                                min="0"
                                step="0.1"
                                disabled={disabled}
                                className="mt-1 bg-slate-700 border-slate-600 text-white"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <Label htmlFor="discount-reason" className="text-slate-300">
                                Motivo (Opcional)
                            </Label>
                            <Input
                                id="discount-reason"
                                value={reason || ''}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={disabled}
                                className="mt-1 bg-slate-700 border-slate-600 text-white"
                                placeholder="Ex: Desconto estratégico"
                            />
                        </div>
                    </div>

                    {discount > 0 && (
                        <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">Valor Original:</span>
                                <span className="font-semibold">{formatCurrency(totalValue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">Desconto ({discount}%):</span>
                                <span className="text-red-400 font-semibold">
                                    -{formatCurrency(totalValue - discountedValue)}
                                </span>
                            </div>
                            <div className="border-t border-slate-600 pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-amber-400 font-semibold">Valor Final:</span>
                                    <span className="text-amber-400 font-bold text-lg">
                                        {formatCurrency(discountedValue)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Funcionalidade exclusiva para Diretores
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-amber-400">
                            Confirmar Desconto Alto
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300">
                            Você está aplicando um desconto de {pendingDiscount}%, que é superior a 100%. 
                            Isso resultará em um valor negativo. Deseja continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            onClick={handleCancelHighDiscount}
                            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                        >
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleConfirmHighDiscount}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};