'use client';

import React from 'react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 relative ${
      isDark
        ? 'bg-slate-950/80 text-slate-100'
        : 'text-slate-900 light-dot-grid'
    } ${className || ''}`}>
      {children}
    </div>
  );
}
