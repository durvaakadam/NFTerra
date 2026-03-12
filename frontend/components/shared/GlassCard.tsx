'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  variant?: 'default' | 'flat' | 'inset';
}

export function GlassCard({ children, className, onClick, animated = true, variant = 'default' }: GlassCardProps) {
  const base =
    variant === 'flat'
      ? 'panel-flat'
      : variant === 'inset'
        ? 'inset-panel'
        : 'panel';

  return (
    <div
      onClick={onClick}
      className={cn(
        base,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
