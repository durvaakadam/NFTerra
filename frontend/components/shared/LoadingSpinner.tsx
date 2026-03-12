'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-cyan-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-pink-500 border-l-purple-500 animate-spin animation-delay-100" style={{ animationDirection: 'reverse' }}></div>
      </div>
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
}
