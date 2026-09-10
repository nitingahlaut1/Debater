'use client';

import React from 'react';
import { AgentRole } from '@/lib/types';
import { Brain, Mic, Sparkles, Trophy, Zap, Shield, BookOpen, Scale } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export type CharacterArchetype = 'futurist' | 'scholar' | 'litigator' | 'bot';

interface AnimatedDebaterCharacterProps {
  role: AgentRole;
  name: string;
  position: string;
  isSpeaking: boolean;
  isThinking: boolean;
  isOpponentSpeaking?: boolean;
  isWinner?: boolean;
  archetype?: CharacterArchetype;
  streamingSnippet?: string;
}

export default function AnimatedDebaterCharacter({
  role,
  name,
  position,
  isSpeaking,
  isThinking,
  isOpponentSpeaking = false,
  isWinner = false,
  archetype = 'scholar',
  streamingSnippet,
}: AnimatedDebaterCharacterProps) {
  const { isDark } = useTheme();
  const isAgentA = role === 'DEBATER_A';

  // Primary colors
  const mainColor = isAgentA ? '#0ea5e9' : '#f43f5e';
  const mainColorLight = isAgentA ? '#38bdf8' : '#fb7185';
  const mainColorDark = isAgentA ? '#0284c7' : '#e11d48';
  const accentGlow = isAgentA ? 'rgba(14, 165, 233, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  // Determine overall character animation class
  let bodyAnimClass = 'animate-debater-idle';
  if (isSpeaking) {
    bodyAnimClass = isAgentA ? 'animate-debater-argue-left' : 'animate-debater-argue-right';
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${isAgentA ? 'items-start sm:items-center' : 'items-end sm:items-center'}`}>
      
      {/* Thought Matrix Floating Bubble (When Thinking) */}
      {isThinking && (
        <div className={`absolute -top-16 z-30 animate-thought-float flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow-xl backdrop-blur-md ${
          isDark 
            ? 'bg-slate-900/95 border-indigo-500/50 text-indigo-300 shadow-indigo-500/20' 
            : 'bg-white/95 border-indigo-300 text-indigo-800 shadow-indigo-200/50'
        }`}>
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider">Formulating logic</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
          {/* Little thought bubble trailing dots */}
          <div className={`absolute -bottom-2 ${isAgentA ? 'left-8' : 'right-8'} w-2 h-2 rounded-full ${isDark ? 'bg-slate-900 border border-indigo-500/40' : 'bg-white border border-indigo-300'}`} />
          <div className={`absolute -bottom-4 ${isAgentA ? 'left-6' : 'right-6'} w-1.5 h-1.5 rounded-full ${isDark ? 'bg-slate-900 border border-indigo-500/40' : 'bg-white border border-indigo-300'}`} />
        </div>
      )}

      {/* Opponent Listening / Note-Taking Reaction Badge */}
      {isOpponentSpeaking && !isSpeaking && !isThinking && (
        <div className={`absolute -top-10 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-bold shadow-md transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/90 border-slate-700 text-slate-300' 
            : 'bg-white/90 border-slate-200 text-slate-700'
        }`}>
          <Shield className={`w-3 h-3 ${isAgentA ? 'text-cyan-400' : 'text-rose-400'}`} />
          <span>Analyzing rebuttal...</span>
        </div>
      )}

      {/* Winner Triumphant Crown / Sparkle */}
      {isWinner && (
        <div className="absolute -top-14 z-30 animate-bounce flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/40 border border-yellow-200">
          <Trophy className="w-4 h-4 fill-current" />
          <span>VICTOR</span>
        </div>
      )}

      {/* Aura Glow Behind Character */}
      <div 
        className={`absolute top-4 w-36 h-36 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none ${
          isSpeaking ? 'opacity-80 scale-125' : isThinking ? 'opacity-50' : 'opacity-20'
        }`}
        style={{
          background: isSpeaking ? accentGlow : isThinking ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
        }}
      />

      {/* SVG Character Avatar & Stage Presence */}
      <div className={`relative w-44 h-48 sm:w-52 sm:h-56 transition-transform duration-500 ${bodyAnimClass}`}>
        <svg 
          viewBox="0 0 200 220" 
          className="w-full h-full filter drop-shadow-md"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id={`suit-grad-${role}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isAgentA ? '#0284c7' : '#e11d48'} />
              <stop offset="100%" stopColor={isAgentA ? '#0f172a' : '#1e1b4b'} />
            </linearGradient>
            <linearGradient id={`skin-grad-${role}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd8b8" />
              <stop offset="100%" stopColor="#f6ba8e" />
            </linearGradient>
            <linearGradient id={`hair-grad-${role}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isAgentA ? '#1e293b' : '#334155'} />
              <stop offset="100%" stopColor={isAgentA ? '#090d16' : '#0f172a'} />
            </linearGradient>
            <linearGradient id={`visor-grad-${role}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={mainColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={mainColorLight} stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id={`glow-mic-${role}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={mainColorLight} stopOpacity="0.8" />
              <stop offset="100%" stopColor={mainColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* BACK HAIR / SHADOW */}
          <ellipse cx="100" cy="72" rx="36" ry="38" fill={`url(#hair-grad-${role})`} />

          {/* EARS */}
          <circle cx="64" cy="78" r="7" fill={`url(#skin-grad-${role})`} />
          <circle cx="136" cy="78" r="7" fill={`url(#skin-grad-${role})`} />

          {/* HEAD / FACE */}
          <rect x="68" y="44" width="64" height="68" rx="28" fill={`url(#skin-grad-${role})`} />

          {/* HAIR / COIFFURE */}
          {archetype === 'futurist' ? (
            <path 
              d="M 66,60 C 66,35 134,35 134,60 C 130,48 115,40 100,40 C 85,40 70,48 66,60 Z" 
              fill={isAgentA ? '#0284c7' : '#e11d48'} 
            />
          ) : (
            <path 
              d="M 64,62 C 64,30 136,30 136,62 C 130,46 116,42 100,42 C 84,42 70,46 64,62 Z" 
              fill={`url(#hair-grad-${role})`} 
            />
          )}

          {/* EYEBROWS */}
          {isSpeaking ? (
            // Animated intense arguing eyebrows
            isAgentA ? (
              <g className="transition-all duration-300">
                <line x1="76" y1="62" x2="92" y2="67" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="108" y1="67" x2="124" y2="64" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            ) : (
              <g className="transition-all duration-300">
                <line x1="76" y1="64" x2="92" y2="67" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="108" y1="67" x2="124" y2="62" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            )
          ) : isThinking ? (
            // Raised inquisitive thinking eyebrow
            <g>
              <line x1="76" y1="60" x2="92" y2="64" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              <line x1="108" y1="63" x2="124" y2="63" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : isOpponentSpeaking ? (
            // Sceptical / evaluating eyebrow
            <g>
              <line x1="76" y1="63" x2="92" y2="63" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              <line x1="108" y1="61" x2="124" y2="65" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : (
            // Neutral calm eyebrows
            <g>
              <line x1="76" y1="63" x2="92" y2="63" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              <line x1="108" y1="63" x2="124" y2="63" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {/* EYES (with blinking animation) */}
          <g className="animate-eye-blink">
            {/* Left Eye */}
            <circle cx="84" cy="74" r="5" fill="#0f172a" />
            <circle cx="85.5" cy="72.5" r="1.5" fill="#ffffff" />
            {/* Right Eye */}
            <circle cx="116" cy="74" r="5" fill="#0f172a" />
            <circle cx="117.5" cy="72.5" r="1.5" fill="#ffffff" />

            {/* Glasses / Visor for special archetypes */}
            {archetype === 'scholar' && (
              <g stroke={isDark ? '#e2e8f0' : '#334155'} strokeWidth="1.5" fill="none">
                <circle cx="84" cy="74" r="9" />
                <circle cx="116" cy="74" r="9" />
                <line x1="93" y1="74" x2="107" y2="74" />
              </g>
            )}
            {archetype === 'futurist' && (
              <rect x="74" y="68" width="52" height="12" rx="4" fill={`url(#visor-grad-${role})`} opacity="0.9" />
            )}
          </g>

          {/* NOSE */}
          <path d="M 100,76 L 98,84 L 102,84" stroke="#e29b68" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* MOUTH */}
          {isSpeaking ? (
            // Moving talking mouth with teeth/interior
            <g className="animate-mouth-talk">
              <ellipse cx="100" cy="95" rx="9" ry="6" fill="#881337" />
              <rect x="94" y="90" width="12" height="3" rx="1.5" fill="#ffffff" />
            </g>
          ) : isThinking ? (
            // Pouting / contemplative small mouth
            <circle cx="100" cy="95" r="3" fill="#881337" />
          ) : (
            // Confident slight smile
            <path d="M 94,94 Q 100,98 106,94" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}

          {/* NECK */}
          <rect x="92" y="106" width="16" height="14" fill={`url(#skin-grad-${role})`} />

          {/* TORSO / SUIT */}
          <path 
            d="M 60,120 L 140,120 L 152,190 L 48,190 Z" 
            fill={`url(#suit-grad-${role})`} 
          />

          {/* SHIRT & TIE / COLLAR */}
          <polygon points="100,146 86,120 114,120" fill="#ffffff" />
          <polygon 
            points="98,124 102,124 104,148 100,154 96,148" 
            fill={isAgentA ? '#38bdf8' : '#fb7185'} 
          />

          {/* ARMS & DEBATE GESTURES */}
          {/* Left Arm */}
          {isAgentA && isSpeaking ? (
            // Agent A (facing right): Emphatic Pointing gesture toward opponent (to the right)
            <g className="animate-arm-point-left">
              <path 
                d="M 64,128 Q 90,126 125,120 Q 140,118 155,116" 
                stroke={isDark ? '#0284c7' : '#0369a1'} 
                strokeWidth="14" 
                strokeLinecap="round" 
                fill="none" 
              />
              {/* Pointing Hand with Index Finger extended */}
              <circle cx="156" cy="116" r="6" fill="#f6ba8e" />
              <line x1="156" y1="116" x2="170" y2="114" stroke="#f6ba8e" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : (
            // Natural resting arm
            <path 
              d="M 64,128 Q 52,150 56,180" 
              stroke={isDark ? '#0f172a' : '#1e293b'} 
              strokeWidth="14" 
              strokeLinecap="round" 
              fill="none" 
            />
          )}

          {/* Right Arm */}
          {!isAgentA && isSpeaking ? (
            // Agent B (facing left): Emphatic Pointing gesture toward opponent (to the left)
            <g className="animate-arm-point-right">
              <path 
                d="M 136,128 Q 110,126 75,120 Q 60,118 45,116" 
                stroke={isDark ? '#e11d48' : '#be123c'} 
                strokeWidth="14" 
                strokeLinecap="round" 
                fill="none" 
              />
              {/* Pointing Hand with Index Finger extended towards left */}
              <circle cx="44" cy="116" r="6" fill="#f6ba8e" />
              <line x1="44" y1="116" x2="30" y2="114" stroke="#f6ba8e" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : isThinking ? (
            // Hand to chin thinking gesture
            <g>
              <path 
                d="M 136,128 Q 120,115 106,98" 
                stroke={isDark ? (isAgentA ? '#0284c7' : '#e11d48') : '#334155'} 
                strokeWidth="12" 
                strokeLinecap="round" 
                fill="none" 
              />
              <circle cx="104" cy="98" r="6" fill="#f6ba8e" />
            </g>
          ) : isOpponentSpeaking ? (
            // Note taking clipboard / defense posture
            <g>
              <path 
                d="M 136,128 Q 120,150 110,165" 
                stroke={isDark ? (isAgentA ? '#0284c7' : '#e11d48') : '#334155'} 
                strokeWidth="12" 
                strokeLinecap="round" 
                fill="none" 
              />
              {/* Digital Tablet / Notepad */}
              <rect x="94" y="152" width="22" height="28" rx="3" fill="#1e293b" stroke={mainColor} strokeWidth="1.5" />
              <line x1="98" y1="160" x2="112" y2="160" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="98" y1="166" x2="108" y2="166" stroke="#94a3b8" strokeWidth="1.5" />
            </g>
          ) : (
            // Natural resting arm
            <path 
              d="M 136,128 Q 148,150 144,180" 
              stroke={isDark ? '#0f172a' : '#1e293b'} 
              strokeWidth="14" 
              strokeLinecap="round" 
              fill="none" 
            />
          )}

          {/* PODIUM & HOLOGRAPHIC MICROPHONE */}
          {/* Podium Base Stand */}
          <polygon 
            points="35,215 165,215 150,175 50,175" 
            fill={isDark ? '#090d16' : '#f1f5f9'} 
            stroke={mainColor} 
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          {/* Podium Top Bar */}
          <rect 
            x="30" 
            y="170" 
            width="140" 
            height="10" 
            rx="5" 
            fill={isDark ? '#1e293b' : '#ffffff'} 
            stroke={mainColor} 
            strokeWidth="2" 
          />

          {/* Podium LED Badge */}
          <rect 
            x="70" 
            y="186" 
            width="60" 
            height="18" 
            rx="4" 
            fill={isDark ? '#020617' : '#ffffff'} 
            stroke={mainColor} 
            strokeWidth="1.5" 
          />
          <text 
            x="100" 
            y="199" 
            textAnchor="middle" 
            fontSize="9" 
            fontWeight="900" 
            fill={mainColor}
            letterSpacing="1"
          >
            {isAgentA ? 'AFFIRMATIVE' : 'OPPOSITION'}
          </text>

          {/* MICROPHONE STEM & HEAD */}
          <path 
            d={isAgentA ? "M 75,170 Q 75,148 90,140" : "M 125,170 Q 125,148 110,140"} 
            stroke={isDark ? '#94a3b8' : '#475569'} 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
          />
          <ellipse 
            cx={isAgentA ? "92" : "108"} 
            cy="138" 
            rx="4" 
            ry="6" 
            fill={isSpeaking ? mainColorLight : '#64748b'} 
          />

          {/* Active Speaking Sound Waves radiating from Mic */}
          {isSpeaking && (
            <g>
              <circle 
                cx={isAgentA ? "92" : "108"} 
                cy="138" 
                r="10" 
                stroke={mainColorLight} 
                strokeWidth="1.5" 
                fill="none" 
                className="animate-soundwave-ripple" 
              />
              <circle 
                cx={isAgentA ? "92" : "108"} 
                cy="138" 
                r="18" 
                stroke={mainColor} 
                strokeWidth="1" 
                fill="none" 
                className="animate-soundwave-ripple" 
                style={{ animationDelay: '0.4s' }}
              />
            </g>
          )}
        </svg>
      </div>

      {/* Podium Bottom Status Card with Live EQ Bars */}
      <div className={`mt-1 sm:mt-2 w-full max-w-[210px] sm:max-w-[240px] px-3 py-2 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
        isSpeaking
          ? isAgentA
            ? isDark
              ? 'bg-slate-900/90 border-cyan-500 shadow-lg shadow-cyan-500/20'
              : 'bg-cyan-50/90 border-cyan-400 shadow-md shadow-cyan-500/10'
            : isDark
              ? 'bg-slate-900/90 border-rose-500 shadow-lg shadow-rose-500/20'
              : 'bg-rose-50/90 border-rose-400 shadow-md shadow-rose-500/10'
          : isDark
            ? 'bg-slate-900/50 border-slate-800 text-slate-400'
            : 'bg-white/90 border-slate-200 text-slate-600 shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h4 className={`font-black text-xs sm:text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {name}
            </h4>
            <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {position.replace('Affirmative proposition: ', '').replace('Opposition proposition: ', '')}
            </p>
          </div>

          {/* Equalizer Visualizer or State Badge */}
          {isSpeaking ? (
            <div className="flex items-end gap-0.5 h-5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-1 bg-emerald-400 rounded-full animate-eq-1" />
              <span className="w-1 bg-emerald-400 rounded-full animate-eq-2" />
              <span className="w-1 bg-emerald-400 rounded-full animate-eq-3" />
            </div>
          ) : isThinking ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
              <Brain className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Thinking</span>
            </div>
          ) : (
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
              isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'
            }`}>
              Standby
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
