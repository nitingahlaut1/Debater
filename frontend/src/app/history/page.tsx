'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchDebates, deleteDebate } from '@/lib/api';
import { Debate } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';
import {
  History,
  Trophy,
  Swords,
  Search,
  Trash2,
  ExternalLink,
  ArrowRight,
  Award,
  Loader2,
} from 'lucide-react';

export default function HistoryPage() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterWinner, setFilterWinner] = useState<string>('ALL');
  const { isDark } = useTheme();

  useEffect(() => {
    loadDebates();
  }, []);

  const loadDebates = async () => {
    try {
      setLoading(true);
      const data = await fetchDebates();
      setDebates(data);
    } catch (err) {
      console.error('Failed to load debates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this debate record?')) return;
    try {
      await deleteDebate(id);
      setDebates((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete debate:', err);
    }
  };

  const filteredDebates = debates.filter((d) => {
    const matchesSearch =
      search.trim() === '' || d.topic.toLowerCase().includes(search.toLowerCase());
    const matchesWinner =
      filterWinner === 'ALL' ||
      (filterWinner === 'AGENT_A' && d.winner?.includes('Agent A')) ||
      (filterWinner === 'AGENT_B' && d.winner?.includes('Agent B')) ||
      (filterWinner === 'TIE' && d.winner === 'Tie');
    return matchesSearch && matchesWinner;
  });

  const totalCompleted = debates.filter((d) => d.status === 'COMPLETED').length;
  const winsA = debates.filter((d) => d.winner?.includes('Agent A')).length;
  const winsB = debates.filter((d) => d.winner?.includes('Agent B')).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-8 sm:pb-12">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 sm:pb-6 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200/80'
      }`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <History className="w-6 sm:w-7 h-6 sm:h-7 text-cyan-400" />
            <span>Debate Arena Archive</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Browse, review, and analyze historical clashes and AI judge scorecards.
          </p>
        </div>

        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:from-cyan-300 hover:to-indigo-400 shadow-md shadow-cyan-500/10 shrink-0 w-fit"
        >
          <Swords className="w-4 h-4" />
          <span>Launch New Debate</span>
        </Link>
      </div>

      {/* Analytics Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all duration-300 ${
          isDark
            ? 'border-slate-800 bg-slate-900/50'
            : 'border-slate-200/90 bg-white shadow-sm hover:shadow-md'
        }`}>
          <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-1 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Total Debates
          </span>
          <span className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{debates.length}</span>
        </div>

        <div className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all duration-300 ${
          isDark
            ? 'border-slate-800 bg-slate-900/50'
            : 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-white shadow-sm hover:shadow-md'
        }`}>
          <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-1 ${
            isDark ? 'text-slate-400' : 'text-emerald-700'
          }`}>
            Completed Clashes
          </span>
          <span className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{totalCompleted}</span>
        </div>

        <div className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all duration-300 ${
          isDark
            ? 'border-cyan-500/20 bg-slate-900/50'
            : 'border-cyan-200/80 bg-gradient-to-br from-cyan-50/60 via-white to-white shadow-sm hover:shadow-md'
        }`}>
          <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-1 ${
            isDark ? 'text-cyan-400' : 'text-cyan-700'
          }`}>
            Agent A Wins
          </span>
          <span className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{winsA}</span>
        </div>

        <div className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all duration-300 ${
          isDark
            ? 'border-rose-500/20 bg-slate-900/50'
            : 'border-rose-200/80 bg-gradient-to-br from-rose-50/60 via-white to-white shadow-sm hover:shadow-md'
        }`}>
          <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-1 ${
            isDark ? 'text-rose-400' : 'text-rose-700'
          }`}>
            Agent B Wins
          </span>
          <span className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{winsB}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
        isDark
          ? 'bg-slate-900/60 border-slate-800'
          : 'bg-white/95 border-slate-200/90 shadow-sm'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search debate topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500'
                : 'bg-white border-slate-200/90 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setFilterWinner('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterWinner === 'ALL'
                ? isDark
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-cyan-600 text-white shadow-sm'
                : isDark
                  ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            All Outcomes
          </button>
          <button
            onClick={() => setFilterWinner('AGENT_A')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterWinner === 'AGENT_A'
                ? isDark
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-cyan-600 text-white shadow-sm'
                : isDark
                  ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            Agent A Wins
          </button>
          <button
            onClick={() => setFilterWinner('AGENT_B')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterWinner === 'AGENT_B'
                ? isDark
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-600 text-white shadow-sm'
                : isDark
                  ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            Agent B Wins
          </button>
        </div>
      </div>

      {/* Debates List */}
      {loading ? (
        <div className="py-16 sm:py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading debate records...</p>
        </div>
      ) : filteredDebates.length === 0 ? (
        <div className={`text-center py-16 sm:py-20 rounded-2xl sm:rounded-3xl border border-dashed p-6 sm:p-8 ${
          isDark ? 'border-slate-800' : 'border-slate-300'
        }`}>
          <Trophy className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>No debates found</h3>
          <p className={`text-xs mt-1 max-w-sm mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {debates.length === 0
              ? 'No debates have been created yet. Launch your first multi-agent clash!'
              : 'No debate matches your filter criteria.'}
          </p>
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl text-xs font-bold shadow-sm ${
              isDark
                ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                : 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100'
            }`}
          >
            <span>Create Debate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredDebates.map((deb) => {
            const isWinnerA = deb.winner?.includes('Agent A');
            const isWinnerB = deb.winner?.includes('Agent B');

            return (
              <Link
                key={deb.id}
                href={`/debates/${deb.id}`}
                className={`group rounded-xl sm:rounded-2xl border p-4 sm:p-5 transition-all duration-300 relative flex flex-col justify-between space-y-3 sm:space-y-4 ${
                  isDark
                    ? 'border-slate-800/90 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                    : 'border-slate-200/90 bg-white hover:border-cyan-300 hover:shadow-md hover:-translate-y-0.5 shadow-sm'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between text-[11px] mb-2 flex-wrap gap-1">
                    <span className={`font-semibold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      {formatDate(deb.createdAt)}
                    </span>
                    <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {deb.rounds} Rounds • {deb.style}
                    </span>
                  </div>

                  {/* Topic Title */}
                  <h3 className={`text-sm sm:text-base font-extrabold transition-colors line-clamp-2 leading-snug ${
                    isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-600'
                  }`}>
                    {deb.topic}
                  </h3>
                </div>

                {/* Outcome & Bottom Bar */}
                <div className={`pt-2.5 sm:pt-3 border-t flex items-center justify-between ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200/80'
                }`}>
                  <div>
                    {deb.status === 'COMPLETED' && deb.winner ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Award
                          className={`w-4 h-4 ${
                            isWinnerA
                              ? isDark ? 'text-cyan-400' : 'text-cyan-600'
                              : isWinnerB
                                ? isDark ? 'text-rose-400' : 'text-rose-600'
                                : 'text-amber-500'
                          }`}
                        />
                        <span
                          className={`text-xs font-extrabold uppercase tracking-wider ${
                            isWinnerA
                              ? isDark ? 'text-cyan-400' : 'text-cyan-700'
                              : isWinnerB
                                ? isDark ? 'text-rose-400' : 'text-rose-700'
                                : 'text-amber-600'
                          }`}
                        >
                          Winner: {deb.winner}
                        </span>
                        {deb.result && (
                          <span className={`text-[11px] font-mono font-semibold ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            ({deb.result.agentAScore} - {deb.result.agentBScore})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'text-amber-400/90' : 'text-amber-600'
                      }`}>
                        Status: {deb.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(deb.id, e)}
                      title="Delete debate record"
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark
                          ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'} group-hover:translate-x-0.5 transition-transform`}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

