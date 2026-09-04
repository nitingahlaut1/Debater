'use client';

import React, { useState } from 'react';
import { Volume2, Copy, Check, Sparkles } from 'lucide-react';
import { speechSynthesizer } from '@/lib/audio';
import { AgentRole } from '@/lib/types';
import { getTurnLabel } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';

interface SpeechBubbleProps {
  role: AgentRole;
  agentName: string;
  round: number;
  totalRounds: number;
  turn: string;
  content: string;
  isStreaming?: boolean;
  tokenCount?: number;
  timestamp?: string;
}

export default function SpeechBubble({
  role,
  agentName,
  round,
  totalRounds,
  turn,
  content,
  isStreaming = false,
  tokenCount,
  timestamp,
}: SpeechBubbleProps) {
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();
  const isAgentA = role === 'DEBATER_A';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    speechSynthesizer.toggle(true);
    speechSynthesizer.speak(content, role);
  };

  const turnTitle = getTurnLabel(turn, round, totalRounds);

  return (
    <div
      className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 border transition-all duration-300 relative ${
        isAgentA
          ? isDark
            ? 'bg-slate-900/90 border-cyan-500/30 shadow-lg shadow-cyan-500/5'
            : 'bg-gradient-to-br from-cyan-50/70 via-sky-50/30 to-white border-cyan-200/90 shadow-[0_4px_16px_rgba(14,165,233,0.06)]'
          : isDark
            ? 'bg-slate-900/90 border-rose-500/30 shadow-lg shadow-rose-500/5'
            : 'bg-gradient-to-br from-rose-50/70 via-pink-50/30 to-white border-rose-200/90 shadow-[0_4px_16px_rgba(244,63,94,0.06)]'
      }`}
    >
      {/* Header bar of bubble */}
      <div className={`flex items-center justify-between border-b pb-2 sm:pb-3 mb-2.5 sm:mb-3.5 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200/80'
      }`}>
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <span
            className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider ${
              isAgentA
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300/80'
                : isDark
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-rose-100 text-rose-800 border border-rose-300/80'
            }`}
          >
            {isAgentA ? 'AFFIRMATIVE' : 'OPPOSITION'}
          </span>
          <span className={`text-[11px] sm:text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {turnTitle}
          </span>
        </div>

        <div className={`flex items-center gap-1 sm:gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {tokenCount !== undefined && tokenCount > 0 && (
            <span className={`text-[10px] font-mono hidden sm:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              ~{tokenCount} tokens
            </span>
          )}

          <button
            onClick={handleSpeak}
            title="Read aloud with AI voice"
            className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <Volume2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            title="Copy argument"
            className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            {copied ? <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-500" /> : <Copy className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
          </button>
        </div>
      </div>

      {/* Content body */}
      <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium ${
        isDark ? 'text-slate-200' : 'text-slate-800'
      }`}>
        {content}
        {isStreaming && (
          <span
            className={`streaming-cursor ${isAgentA ? 'text-cyan-400' : 'text-rose-400'}`}
          />
        )}
      </div>

      {/* Footer info */}
      {timestamp && (
        <div className={`mt-2.5 sm:mt-3.5 pt-2 border-t flex justify-between items-center text-[10px] ${
          isDark ? 'border-slate-800/40 text-slate-500' : 'border-slate-200/60 text-slate-500 font-medium'
        }`}>
          <span>{agentName}</span>
          <span>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      )}
    </div>
  );
}
