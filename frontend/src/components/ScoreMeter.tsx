'use client';

import React from 'react';
import { useTheme } from '@/lib/ThemeContext';

interface ScoreMeterProps {
  label: string;
  scoreA: number; // 0-10
  scoreB: number; // 0-10
  maxScore?: number;
}

export default function ScoreMeter({ label, scoreA, scoreB, maxScore = 10 }: ScoreMeterProps) {
  const pctA = Math.round((scoreA / maxScore) * 100);
  const pctB = Math.round((scoreB / maxScore) * 100);
  const { isDark } = useTheme();

  return (
    <div className="space-y-1 sm:space-y-1.5 py-1">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className={`font-mono text-xs sm:text-sm font-black ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{scoreA}</span>
        <span className={`font-bold tracking-wider uppercase text-[10px] sm:text-[11px] text-center px-1 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {label}
        </span>
        <span className={`font-mono text-xs sm:text-sm font-black ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{scoreB}</span>
      </div>

      <div className="grid grid-cols-2 gap-1 sm:gap-1.5 items-center">
        {/* Debater A Bar (fills right to left) */}
        <div className={`h-2 sm:h-2.5 rounded-l-full overflow-hidden flex justify-end border-l border-y ${
          isDark ? 'bg-slate-900 border-cyan-500/20' : 'bg-slate-100 border-cyan-300/40'
        }`}>
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-l-full transition-all duration-1000 ease-out shadow-sm shadow-cyan-500/50"
            style={{ width: `${pctA}%` }}
          />
        </div>

        {/* Debater B Bar (fills left to right) */}
        <div className={`h-2 sm:h-2.5 rounded-r-full overflow-hidden flex justify-start border-r border-y ${
          isDark ? 'bg-slate-900 border-rose-500/20' : 'bg-slate-100 border-rose-300/40'
        }`}>
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-r-full transition-all duration-1000 ease-out shadow-sm shadow-rose-500/50"
            style={{ width: `${pctB}%` }}
          />
        </div>
      </div>
    </div>
  );
}
