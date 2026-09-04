'use client';

import React, { useEffect } from 'react';
import { JudgeScorecard, Debate } from '@/lib/types';
import ScoreMeter from './ScoreMeter';
import {
  Trophy,
  Scale,
  CheckCircle2,
  XCircle,
  Sparkles,
  Download,
  TrendingUp,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '@/lib/ThemeContext';

interface JudgeVerdictProps {
  scorecard: JudgeScorecard;
  debate: Debate;
}

export default function JudgeVerdict({ scorecard, debate }: JudgeVerdictProps) {
  const { isDark } = useTheme();
  const isAgentAWinner = scorecard.winner.includes('Agent A');
  const isAgentBWinner = scorecard.winner.includes('Agent B');
  const isTie = !isAgentAWinner && !isAgentBWinner;

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: isAgentAWinner
          ? ['#0284c7', '#38bdf8', '#eab308']
          : ['#e11d48', '#fb7185', '#eab308'],
      });
    } catch (e) {
      // Ignored if canvas not available
    }
  }, [isAgentAWinner]);

  const handleExportMarkdown = () => {
    let md = `# AI Debate Arena — Official Transcript & Verdict\n\n`;
    md += `**Topic:** ${debate.topic}\n`;
    md += `**Rounds:** ${debate.rounds}\n`;
    md += `**Winner:** ${scorecard.winner}\n`;
    md += `**Scores:** Agent A (${scorecard.agentAScore}) vs Agent B (${scorecard.agentBScore})\n\n`;
    md += `## Judge's Verdict\n${scorecard.finalVerdict}\n\n`;
    md += `## Detailed Reasoning\n${scorecard.reasoning}\n\n`;
    md += `## Debate Transcript\n\n`;

    debate.messages?.forEach((m) => {
      const speaker = m.agent?.name || (m.agentId ? 'Debater' : 'Speaker');
      md += `### Round ${m.round} - ${m.turn} (${speaker})\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-${debate.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const data = {
      debate,
      judgeScorecard: scorecard,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-${debate.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6 sm:space-y-8 animate-fadeIn ${
      isDark
        ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-amber-500/10'
        : 'border-amber-300/80 bg-gradient-to-b from-amber-50/70 via-white to-white shadow-xl shadow-amber-500/10'
    }`}>
      {/* Ambient background glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-amber-500/10' : 'bg-amber-500/5'
      }`} />

      {/* Header Trophy & Winner Declaration */}
      <div className="text-center relative space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30">
          <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
            isDark ? 'bg-slate-950' : 'bg-white'
          }`}>
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 animate-bounce" />
          </div>
        </div>

        <div>
          <span className={`text-xs uppercase font-extrabold tracking-widest flex items-center justify-center gap-1.5 ${
            isDark ? 'text-amber-400/90' : 'text-amber-600'
          }`}>
            <Sparkles className="w-3.5 h-3.5" /> Official Judge Decision
          </span>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-1 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {isTie ? 'DEBATE ENDED IN A TIE' : `${scorecard.winner.toUpperCase()} VICTORIOUS`}
          </h2>
        </div>

        <p className={`text-xs sm:text-sm max-w-2xl mx-auto italic font-serif leading-relaxed px-3 sm:px-4 py-2.5 rounded-xl border ${
          isDark
            ? 'text-slate-300 bg-amber-500/5 border-amber-500/20'
            : 'text-slate-800 bg-amber-50/80 border-amber-200/80 shadow-sm'
        }`}>
          &ldquo;{scorecard.finalVerdict}&rdquo;
        </p>
      </div>

      {/* Overall Scoreboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Agent A Card */}
        <div
          className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all ${
            isAgentAWinner
              ? isDark
                ? 'border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                : 'border-cyan-400 bg-gradient-to-br from-cyan-50/90 via-sky-50/40 to-white shadow-md ring-2 ring-cyan-400/40'
              : isDark
                ? 'border-slate-800 bg-slate-900/40 opacity-90'
                : 'border-slate-200/90 bg-white/90 shadow-sm opacity-90'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className={`w-3 h-3 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-cyan-500'} shadow-sm shadow-cyan-400`} />
              <span className={`font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Agent A (Affirmative)</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isAgentAWinner && <Award className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500" />}
              <span className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                {scorecard.agentAScore}
              </span>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/100</span>
            </div>
          </div>
          <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
              style={{ width: `${scorecard.agentAScore}%` }}
            />
          </div>
        </div>

        {/* Agent B Card */}
        <div
          className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all ${
            isAgentBWinner
              ? isDark
                ? 'border-rose-500 bg-rose-950/30 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/40'
                : 'border-rose-400 bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white shadow-md ring-2 ring-rose-400/40'
              : isDark
                ? 'border-slate-800 bg-slate-900/40 opacity-90'
                : 'border-slate-200/90 bg-white/90 shadow-sm opacity-90'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className={`w-3 h-3 rounded-full ${isDark ? 'bg-rose-400' : 'bg-rose-500'} shadow-sm shadow-rose-400`} />
              <span className={`font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Agent B (Opposition)</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isAgentBWinner && <Award className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500" />}
              <span className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                {scorecard.agentBScore}
              </span>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/100</span>
            </div>
          </div>
          <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-1000"
              style={{ width: `${scorecard.agentBScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Head-to-Head Criteria Breakdown */}
      <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 space-y-3 sm:space-y-4 ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200/90 bg-white shadow-sm'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Scale className="w-4 h-4 text-amber-500" />
            <span>Evaluation Criteria Breakdown (0 - 10)</span>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <span className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>Agent A (FOR)</span>
            <span className={isDark ? 'text-rose-400' : 'text-rose-700'}>Agent B (AGAINST)</span>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <ScoreMeter
            label="Logical Rigor & Validity"
            scoreA={scorecard.scores?.agentA?.logic || 8}
            scoreB={scorecard.scores?.agentB?.logic || 8}
          />
          <ScoreMeter
            label="Evidence & Empirical Grounding"
            scoreA={scorecard.scores?.agentA?.evidence || 8}
            scoreB={scorecard.scores?.agentB?.evidence || 8}
          />
          <ScoreMeter
            label="Rebuttal & Clash Precision"
            scoreA={scorecard.scores?.agentA?.rebuttal || 8}
            scoreB={scorecard.scores?.agentB?.rebuttal || 8}
          />
          <ScoreMeter
            label="Clarity & Structural Coherence"
            scoreA={scorecard.scores?.agentA?.clarity || 8}
            scoreB={scorecard.scores?.agentB?.clarity || 8}
          />
          <ScoreMeter
            label="Persuasiveness & Impact"
            scoreA={scorecard.scores?.agentA?.persuasiveness || 8}
            scoreB={scorecard.scores?.agentB?.persuasiveness || 8}
          />
          {scorecard.scores?.agentA?.accuracy !== undefined && (
            <ScoreMeter
              label="Factual & Conceptual Accuracy"
              scoreA={scorecard.scores?.agentA?.accuracy || 8}
              scoreB={scorecard.scores?.agentB?.accuracy || 8}
            />
          )}
        </div>
      </div>

      {/* Judge's Detailed Reasoning */}
      <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 space-y-2.5 ${
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200/90 bg-white shadow-sm'
      }`}>
        <h4 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 ${
          isDark ? 'text-slate-200' : 'text-slate-900'
        }`}>
          <TrendingUp className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span>Judge&apos;s Comprehensive Reasoning</span>
        </h4>
        <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {scorecard.reasoning}
        </p>
      </div>

      {/* Side-by-Side Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Agent A Analysis */}
        <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 space-y-3 sm:space-y-4 ${
          isDark
            ? 'border-cyan-500/20 bg-slate-900/40'
            : 'border-cyan-200/80 bg-gradient-to-br from-cyan-50/50 via-white to-white shadow-sm'
        }`}>
          <h4 className={`font-black text-sm flex items-center gap-2 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
            <span>Agent A Performance Audit</span>
          </h4>

          <div className="space-y-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Key Strengths:
            </span>
            <ul className="space-y-1.5">
              {scorecard.agentAStrengths?.map((item, idx) => (
                <li key={idx} className={`text-xs font-medium flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200/80'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Identified Weaknesses:
            </span>
            <ul className="space-y-1.5">
              {scorecard.agentAWeaknesses?.map((item, idx) => (
                <li key={idx} className={`text-xs font-medium flex items-start gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Agent B Analysis */}
        <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 space-y-3 sm:space-y-4 ${
          isDark
            ? 'border-rose-500/20 bg-slate-900/40'
            : 'border-rose-200/80 bg-gradient-to-br from-rose-50/50 via-white to-white shadow-sm'
        }`}>
          <h4 className={`font-black text-sm flex items-center gap-2 ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
            <span>Agent B Performance Audit</span>
          </h4>

          <div className="space-y-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Key Strengths:
            </span>
            <ul className="space-y-1.5">
              {scorecard.agentBStrengths?.map((item, idx) => (
                <li key={idx} className={`text-xs font-medium flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200/80'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Identified Weaknesses:
            </span>
            <ul className="space-y-1.5">
              {scorecard.agentBWeaknesses?.map((item, idx) => (
                <li key={idx} className={`text-xs font-medium flex items-start gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Export & Actions */}
      <div className={`flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 pt-4 border-t ${
        isDark ? 'border-slate-800/80' : 'border-slate-200/80'
      }`}>
        <div className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          Debate ID: <span className={`font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{debate.id}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportMarkdown}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={handleExportJson}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}

