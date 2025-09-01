import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Loader2 } from 'lucide-react';

interface EditableControlsProps {
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => Promise<boolean>;
  onCancel: () => void;
  hasErrors?: boolean;
  className?: string;
}

export const EditableControls: React.FC<EditableControlsProps> = React.memo(({
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  hasErrors = false,
  className = ''
}) => {
  const handleSave = async () => {
    await onSave();
  };

  if (!isEditing) {
    return (
      <div className={`flex justify-center ${className}`}>
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      <Button
        onClick={handleSave}
        disabled={isSaving || hasErrors}
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-500"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </>
        )}
      </Button>
      
      <Button
        onClick={onCancel}
        disabled={isSaving}
        variant="outline"
        size="sm"
        className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 disabled:bg-gray-500"
      >
        <X className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
    </div>
  );
});