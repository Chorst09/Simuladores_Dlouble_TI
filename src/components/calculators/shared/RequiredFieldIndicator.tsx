"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RequiredFieldIndicatorProps {
  required?: boolean;
  className?: string;
}

export const RequiredFieldIndicator: React.FC<RequiredFieldIndicatorProps> = ({
  required = false,
  className = ''
}) => {
  if (!required) {
    return null;
  }

  return (
    <span className={cn("text-red-500 ml-1", className)} aria-label="Campo obrigatório">
      *
    </span>
  );
};

export default RequiredFieldIndicator;