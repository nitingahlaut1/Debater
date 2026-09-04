'use client';

import React from 'react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeFooter() {
  const { isDark } = useTheme();

  return (
    <footer className={`border-t py-4 sm:py-6 text-center text-xs transition-colors duration-300 ${
      isDark
        ? 'border-slate-900 bg-slate-950/60 text-slate-500'
        : 'border-slate-200/90 bg-white/70 text-slate-500 font-medium'
    }`}>
      <p>AI Debate Arena • Multi-Agent Autonomous LLM Clash Platform powered by Grok API</p>
    </footer>
  );
}
