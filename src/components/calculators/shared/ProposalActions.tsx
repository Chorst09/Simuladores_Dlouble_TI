"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Proposal } from '@/types';

interface ProposalActionsProps {
  proposal: Proposal;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposal: Proposal) => void;
  onView: (proposal: Proposal) => void;
}

export const ProposalActions: React.FC<ProposalActionsProps> = ({
  proposal,
  onEdit,
  onDelete,
  onView
}) => {
  return (
    <div className="flex gap-1 min-w-fit">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onEdit(proposal)} 
        title="Editar proposta"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onView(proposal)} 
        title="Visualizar proposta"
        className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onDelete(proposal)} 
        title="Excluir proposta" 
        className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};