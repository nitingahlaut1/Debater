'use client';

import React from 'react';
import { Agent, AgentRole } from '@/lib/types';
import { Brain, Radio } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface DebaterCardProps {
  agent: Agent;
  isActive: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
}

export default function DebaterCard({
  agent,
  isActive,
  isThinking,
  isSpeaking,
}: DebaterCardProps) {
  const { isDark } = useTheme();
  const isAgentA = agent.role === 'DEBATER_A';

  return (
    <div
      className={`rounded-2xl p-3 sm:p-4 md:p-5 border transition-all duration-500 relative overflow-hidden ${
        isActive
          ? isAgentA
            ? isDark
              ? 'border-cyan-500/80 bg-slate-900/90 shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-500/50'
              : 'border-cyan-400 bg-gradient-to-br from-cyan-50/90 via-sky-50/40 to-white shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-400/40'
            : isDark
              ? 'border-rose-500/80 bg-slate-900/90 shadow-2xl shadow-rose-500/20 ring-1 ring-rose-500/50'
              : 'border-rose-400 bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white shadow-xl shadow-rose-500/10 ring-2 ring-rose-400/40'
          : isDark
            ? 'border-slate-800 bg-slate-900/40 text-slate-400'
            : 'border-slate-200/90 bg-white text-slate-600 shadow-sm'
      }`}
    >
      {/* Background subtle radial glow */}
      {isActive && (
        <div
          className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
            isAgentA
              ? isDark ? 'bg-cyan-500/20' : 'bg-cyan-400/15'
              : isDark ? 'bg-rose-500/20' : 'bg-rose-400/15'
          }`}
        />
      )}

      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Avatar and Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="relative shrink-0">
            {/* Avatar image container */}
            <div
              className={`w-10 h-10 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-xl sm:rounded-2xl p-1 flex items-center justify-center transition-transform duration-300 ${
                isActive ? 'scale-105' : 'opacity-85'
              } ${
                isAgentA
                  ? 'bg-gradient-to-tr from-cyan-600 to-sky-400 shadow-md shadow-cyan-500/30'
                  : 'bg-gradient-to-tr from-rose-600 to-pink-400 shadow-md shadow-rose-500/30'
              }`}
            >
              <img
                src={
                  agent.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${isAgentA ? 'debaterA' : 'debaterB'}`
                }
                alt={agent.name}
                className={`w-full h-full object-cover rounded-lg sm:rounded-xl ${
                  isDark ? 'bg-slate-950' : 'bg-white'
                }`}
              />
            </div>

            {/* Speaking / Thinking Badge Overlay */}
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 ${
                  isDark ? 'border-slate-950' : 'border-white'
                }`}></span>
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-black text-sm sm:text-base tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {agent.name}
              </h3>
              <span
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase border ${
                  isAgentA
                    ? isDark
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-cyan-100 text-cyan-800 border-cyan-300/80'
                    : isDark
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-rose-100 text-rose-800 border-rose-300/80'
                }`}
              >
                {isAgentA ? 'FOR' : 'AGAINST'}
              </span>
            </div>

            <p className={`text-[11px] sm:text-xs line-clamp-1 mt-0.5 font-medium max-w-[160px] sm:max-w-[280px] ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {agent.position.replace('Affirmative proposition: ', '').replace('Opposition proposition: ', '')}
            </p>
          </div>
        </div>

        {/* Right: State Indicator */}
        <div className="flex flex-col items-end shrink-0">
          {isThinking ? (
            <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-bold animate-pulse ${
              isDark
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
            }`}>
              <Brain className="w-3 sm:w-3.5 h-3 sm:h-3.5 animate-spin" />
              <span className="hidden sm:inline">Formulating...</span>
              <span className="sm:hidden">...</span>
            </div>
          ) : isSpeaking ? (
            <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-bold ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
            }`}>
              <Radio className="w-3 sm:w-3.5 h-3 sm:h-3.5 animate-pulse text-emerald-500" />
              <span>Speaking</span>
            </div>
          ) : (
            <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded ${
              isDark ? 'text-slate-500 bg-slate-800/60' : 'text-slate-500 bg-slate-100'
            }`}>
              Standing By
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
