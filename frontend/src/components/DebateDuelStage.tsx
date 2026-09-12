'use client';

import React, { useState, useEffect } from 'react';
import { Agent, AgentRole, JudgeScorecard } from '@/lib/types';
import AnimatedDebaterCharacter, { CharacterArchetype } from './AnimatedDebaterCharacter';
import { useTheme } from '@/lib/ThemeContext';
import { 
  Swords, 
  Sparkles, 
  Scale, 
  Volume2, 
  VolumeX, 
  Zap, 
  Flame, 
  ThumbsUp, 
  AlertCircle,
  Lightbulb,
  Radio,
  Mic,
  SkipForward,
} from 'lucide-react';
import { speechSynthesizer } from '@/lib/audio';

interface ReactionParticle {
  id: number;
  emoji: string;
  x: number;
}

interface DebateDuelStageProps {
  agentA: Agent;
  agentB: Agent;
  currentRound: number;
  totalRounds: number;
  activeSpeakerRole: AgentRole | null;
  activeSpeakerName: string | null;
  isThinking: boolean;
  streamingText: string;
  status: string;
  judgeScorecard: JudgeScorecard | null;
  language?: string;
  isAudioPlaying?: boolean;
  audioRole?: AgentRole | null;
  audioSpokenText?: string;
}

export default function DebateDuelStage({
  agentA,
  agentB,
  currentRound,
  totalRounds,
  activeSpeakerRole,
  activeSpeakerName,
  isThinking,
  streamingText,
  status,
  judgeScorecard,
  language = 'English',
  isAudioPlaying = false,
  audioRole = null,
  audioSpokenText = '',
}: DebateDuelStageProps) {
  const { isDark } = useTheme();
  const [archetype, setArchetype] = useState<CharacterArchetype>('scholar');
  const [reactions, setReactions] = useState<ReactionParticle[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(speechSynthesizer.isEnabled());

  useEffect(() => {
    setAudioEnabled(speechSynthesizer.isEnabled());
    const unsub = speechSynthesizer.subscribe((playing) => {
      setAudioEnabled(speechSynthesizer.isEnabled());
    });
    return () => unsub();
  }, []);

  const effectiveSpeakerRole: AgentRole | null = (isAudioPlaying && audioRole) ? audioRole : activeSpeakerRole;
  
  const isAgentASpeaking = (effectiveSpeakerRole === 'DEBATER_A') && (!isThinking || (isAudioPlaying && audioRole === 'DEBATER_A'));
  const isAgentAThinking = activeSpeakerRole === 'DEBATER_A' && isThinking && !isAudioPlaying;

  const isAgentBSpeaking = (effectiveSpeakerRole === 'DEBATER_B') && (!isThinking || (isAudioPlaying && audioRole === 'DEBATER_B'));
  const isAgentBThinking = activeSpeakerRole === 'DEBATER_B' && isThinking && !isAudioPlaying;

  const isJudging = status === 'JUDGING';
  const isCompleted = status === 'COMPLETED' || !!judgeScorecard;

  const winner = judgeScorecard?.winner;
  const isAgentAWinner = isCompleted && winner === 'Agent A';
  const isAgentBWinner = isCompleted && winner === 'Agent B';

  // Toggle TTS audio
  const handleToggleAudio = () => {
    const newState = !audioEnabled;
    speechSynthesizer.toggle(newState);
    setAudioEnabled(newState);
  };

  const handleSkipSpeech = () => {
    speechSynthesizer.skip();
  };

  // Add audience reaction
  const triggerReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80% horizontal position
    setReactions((prev) => [...prev, { id, emoji, x }]);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  const displayText = streamingText || (isAudioPlaying ? audioSpokenText : '');

  return (
    <div className={`relative rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-500 shadow-2xl ${
      isDark
        ? 'bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 border-slate-800 shadow-cyan-500/5'
        : 'bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100/80 border-slate-200/90 shadow-slate-200/60'
    }`}>
      
      {/* Dynamic Stage Lighting / Spotlights */}
      <div 
        className={`absolute top-0 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isAgentASpeaking ? 'opacity-80 scale-125' : 'opacity-15'
        } ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-400/25'}`}
      />
      <div 
        className={`absolute top-0 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isAgentBSpeaking ? 'opacity-80 scale-125' : 'opacity-15'
        } ${isDark ? 'bg-rose-500/20' : 'bg-rose-400/25'}`}
      />

      {/* Stage Atmosphere Grid Overlay */}
      <div className={`absolute inset-0 pointer-events-none opacity-30 ${isDark ? 'light-dot-grid' : 'light-dot-grid'}`} />

      {/* Header Bar of the Duel Stage */}
      <div className={`relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b backdrop-blur-md ${
        isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200/80 bg-white/60'
      }`}>
        {/* Left: Stage Title & Live Status */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
            isDark 
              ? 'bg-slate-900 border-slate-700 text-cyan-400' 
              : 'bg-white border-slate-200 text-cyan-700 shadow-sm'
          }`}>
            <Swords className="w-3.5 h-3.5" />
            <span>Live Debate Arena</span>
          </div>

          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isJudging ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 animate-spin" /> AI Judge Deliberating
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Verdict Delivered
              </span>
            ) : (
              <span>Round {currentRound} of {totalRounds}</span>
            )}
          </span>

          {/* Live Audio Indicator */}
          {audioEnabled && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Voice Active</span>
            </span>
          )}
        </div>

        {/* Right: Interactive Controls (Voice Toggle, Skip, Archetype selector) */}
        <div className="flex items-center gap-2">
          {/* Audio TTS toggle */}
          <button
            onClick={handleToggleAudio}
            title={audioEnabled ? 'Voice debate enabled (Click to mute)' : 'Click to enable live voice debate'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
              audioEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm'
                : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>

          {isAudioPlaying && (
            <button
              onClick={handleSkipSpeech}
              title="Skip current speech turn"
              className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Archetype switcher */}
          <div className="relative flex items-center">
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as CharacterArchetype)}
              aria-label="Select Debater Avatar Style"
              className={`text-[11px] font-bold py-1 px-2.5 rounded-xl border focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 focus:border-cyan-500'
                  : 'bg-white border-slate-200 text-slate-700 focus:border-cyan-500 shadow-sm'
              }`}
            >
              <option value="scholar">🎓 Scholar</option>
              <option value="futurist">⚡ Cyber Bot</option>
              <option value="litigator">⚖️ Litigator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Audience Reaction Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-40">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-16 animate-float-reaction text-2xl filter drop-shadow-lg"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* MAIN DUEL STAGE */}
      <div className="relative z-10 px-3 sm:px-6 pt-6 sm:pt-10 pb-6 sm:pb-8">
        
        {/* Debater A vs Debater B Character Clash Layout */}
        <div className="grid grid-cols-12 items-center gap-2 sm:gap-4 relative min-h-[220px] sm:min-h-[270px]">
          
          {/* DEBATER A (Left Side - Affirmative) */}
          <div className="col-span-5 flex flex-col items-center sm:items-start justify-center">
            <AnimatedDebaterCharacter
              role="DEBATER_A"
              name={agentA.name}
              position={agentA.position}
              isSpeaking={isAgentASpeaking}
              isThinking={isAgentAThinking}
              isOpponentSpeaking={isAgentBSpeaking}
              isWinner={isAgentAWinner}
              archetype={archetype}
              streamingSnippet={isAgentASpeaking ? displayText : undefined}
            />
            {/* Voice Tone Tag */}
            <div className={`mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border text-center ${
              isDark
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                : 'bg-cyan-50 text-cyan-800 border-cyan-200'
            }`}>
              🗣️ Tenor Voice (1.25x Rate)
            </div>
          </div>

          {/* CENTER STAGE CLASH & LOGIC BEAM */}
          <div className="col-span-2 flex flex-col items-center justify-center relative select-none">
            
            {/* Dynamic Energy Beam Traveling Between Podiums */}
            {isAgentASpeaking && (
              <div className="absolute top-1/2 left-0 right-0 h-1 sm:h-1.5 -translate-y-1/2 overflow-hidden pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400 animate-pulse" />
                <div className="absolute inset-0 bg-cyan-400 blur-sm opacity-80" />
              </div>
            )}
            {isAgentBSpeaking && (
              <div className="absolute top-1/2 left-0 right-0 h-1 sm:h-1.5 -translate-y-1/2 overflow-hidden pointer-events-none">
                <div className="w-full h-full bg-gradient-to-l from-rose-400 via-pink-300 to-cyan-400 animate-pulse" />
                <div className="absolute inset-0 bg-rose-400 blur-sm opacity-80" />
              </div>
            )}

            {/* Central VS Sphere / Clash Orb */}
            <div className={`relative z-20 w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isAgentASpeaking
                ? 'border-cyan-400 bg-slate-950 text-cyan-400 ring-4 ring-cyan-500/30 animate-clash-pulse'
                : isAgentBSpeaking
                  ? 'border-rose-400 bg-slate-950 text-rose-400 ring-4 ring-rose-500/30 animate-clash-pulse'
                  : isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-300'
                    : 'border-slate-300 bg-white text-slate-700 shadow-md'
            }`}>
              <span className="font-black text-xs sm:text-base tracking-tighter">
                VS
              </span>

              {/* Clash sparks when active */}
              {(isAgentASpeaking || isAgentBSpeaking) && (
                <Sparkles className="w-3.5 h-3.5 absolute -top-2 text-amber-400 animate-spin" />
              )}
            </div>

            {/* Subtitle Under Center Orb */}
            <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider mt-2 ${
              isAgentASpeaking ? 'text-cyan-400 font-black' : isAgentBSpeaking ? 'text-rose-400 font-black' : isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {isAgentASpeaking ? 'AFFIRMATIVE' : isAgentBSpeaking ? 'OPPOSITION' : 'FACE-OFF'}
            </span>
          </div>

          {/* DEBATER B (Right Side - Opposition) */}
          <div className="col-span-5 flex flex-col items-center sm:items-end justify-center">
            <AnimatedDebaterCharacter
              role="DEBATER_B"
              name={agentB.name}
              position={agentB.position}
              isSpeaking={isAgentBSpeaking}
              isThinking={isAgentBThinking}
              isOpponentSpeaking={isAgentASpeaking}
              isWinner={isAgentBWinner}
              archetype={archetype}
              streamingSnippet={isAgentBSpeaking ? displayText : undefined}
            />
            {/* Voice Tone Tag */}
            <div className={`mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border text-center ${
              isDark
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              🗣️ Baritone Voice (1.25x Rate)
            </div>
          </div>

        </div>

        {/* LIVE ARGUMENT / SPEECH CALLOUT BANNER */}
        {displayText && (isAgentASpeaking || isAgentBSpeaking) && (
          <div className={`mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 animate-fadeIn ${
            isAgentASpeaking
              ? isDark
                ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-100 shadow-lg shadow-cyan-500/5'
                : 'bg-cyan-50/80 border-cyan-200 text-cyan-950 shadow-sm'
              : isDark
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-100 shadow-lg shadow-rose-500/5'
                : 'bg-rose-50/80 border-rose-200 text-rose-950 shadow-sm'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b pb-1.5 border-current/10">
              <div className="flex items-center gap-2">
                <Radio className={`w-3.5 h-3.5 animate-pulse ${isAgentASpeaking ? 'text-cyan-400' : 'text-rose-400'}`} />
                <span className="text-xs font-black uppercase tracking-wider">
                  {isAgentASpeaking ? `${agentA.name} Speaking (Tenor • 1.25x Rate)` : `${agentB.name} Speaking (Baritone • 1.25x Rate)`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAudioPlaying && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 animate-pulse">
                    <Mic className="w-3 h-3" /> Voice &amp; Text Sync
                  </span>
                )}
                <span className="text-[10px] font-bold opacity-75">Live Generation</span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line line-clamp-3 sm:line-clamp-4 font-medium">
              {displayText}
              <span className={`streaming-cursor ${isAgentASpeaking ? 'text-cyan-400' : 'text-rose-400'}`} />
            </p>
          </div>
        )}

        {/* JUDGE ARBITER EVALUATING BANNER */}
        {isJudging && (
          <div className={`mt-4 sm:mt-6 p-4 rounded-2xl border text-center space-y-2 animate-pulse ${
            isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center justify-center gap-2 text-sm font-black uppercase">
              <Scale className="w-5 h-5 animate-spin" />
              <span>AI Judge Deliberation in Progress</span>
            </div>
            <p className="text-xs max-w-xl mx-auto opacity-85">
              Weighing empirical evidence, logical deduction, rebuttal sharpness, and detecting fallacies...
            </p>
          </div>
        )}

      </div>

      {/* STAGE FOOTER: Interactive Audience Reactions Bar */}
      <div className={`relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-t backdrop-blur-md ${
        isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-200/80 bg-white/80'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Audience Reactions:
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <button
              onClick={() => triggerReaction('👏')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-transform hover:scale-110 active:scale-95 ${
                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
            >
              👏 Applaud
            </button>
            <button
              onClick={() => triggerReaction('🔥')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-transform hover:scale-110 active:scale-95 ${
                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
            >
              🔥 Point!
            </button>
            <button
              onClick={() => triggerReaction('⚖️')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-transform hover:scale-110 active:scale-95 ${
                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
            >
              ⚖️ Objection
            </button>
            <button
              onClick={() => triggerReaction('💡')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-transform hover:scale-110 active:scale-95 ${
                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
            >
              💡 Insight
            </button>
          </div>
        </div>

        <div className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Language: <span className="font-bold">{language}</span>
        </div>
      </div>

    </div>
  );
}
