'use client';

import React, { useState } from 'react';
import { DebateMessage, AgentRole } from '@/lib/types';
import SpeechBubble from './SpeechBubble';
import { MessageSquare, Search } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface TranscriptFeedProps {
  messages: DebateMessage[];
  totalRounds: number;
  streamingAgentRole: AgentRole | null;
  streamingAgentName: string | null;
  streamingText: string;
  streamingRound: number | null;
}

export default function TranscriptFeed({
  messages,
  totalRounds,
  streamingAgentRole,
  streamingAgentName,
  streamingText,
  streamingRound,
}: TranscriptFeedProps) {
  const [selectedRound, setSelectedRound] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();

  const filteredMessages = messages.filter((m) => {
    const matchesRound = selectedRound === 'ALL' || m.round === selectedRound;
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agent?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRound && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Controls Bar */}
      <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border ${
        isDark
          ? 'bg-slate-900/60 border-slate-800/80'
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Round Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedRound('ALL')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 ${
              selectedRound === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : isDark
                  ? 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            All ({messages.length})
          </button>

          {Array.from({ length: totalRounds }, (_, i) => i + 1).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRound(r)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 ${
                selectedRound === r
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : isDark
                    ? 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              Rnd {r}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500/50 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="space-y-3 sm:space-y-4">
        {filteredMessages.length === 0 && !streamingText && (
          <div className={`text-center py-8 sm:py-12 border border-dashed rounded-2xl sm:rounded-3xl p-6 ${
            isDark ? 'border-slate-800' : 'border-slate-300'
          }`}>
            <MessageSquare className={`w-8 sm:w-10 h-8 sm:h-10 mx-auto mb-2 opacity-60 ${
              isDark ? 'text-slate-600' : 'text-slate-400'
            }`} />
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No debate arguments recorded yet.</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Start the debate to observe real-time AI clash.</p>
          </div>
        )}

        {filteredMessages.map((msg) => (
          <SpeechBubble
            key={msg.id}
            role={msg.agent?.role || 'DEBATER_A'}
            agentName={msg.agent?.name || 'Agent'}
            round={msg.round}
            totalRounds={totalRounds}
            turn={msg.turn}
            content={msg.content}
            tokenCount={msg.tokenCount}
            timestamp={msg.createdAt}
          />
        ))}

        {/* Live Streaming Speech Bubble */}
        {streamingAgentRole && streamingText && (
          <SpeechBubble
            role={streamingAgentRole}
            agentName={streamingAgentName || (streamingAgentRole === 'DEBATER_A' ? 'Agent A' : 'Agent B')}
            round={streamingRound || 1}
            totalRounds={totalRounds}
            turn="LIVE_GENERATING"
            content={streamingText}
            isStreaming={true}
          />
        )}
      </div>
    </div>
  );
}
