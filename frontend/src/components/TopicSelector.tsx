'use client';

import React from 'react';
import { Flame, Sparkles, Landmark, Globe2, ShieldAlert, Languages, Scale, Vote, Megaphone, Handshake } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface TopicPreset {
  id: string;
  category: string;
  topic: string;
  language: string;
  icon: React.ElementType;
}

const PRESET_TOPICS: TopicPreset[] = [
  {
    id: 'india-reservations',
    category: 'Indian Politics',
    topic: 'Should India reform its caste-based reservation system to include economic criteria for all communities?',
    language: 'English',
    icon: Scale,
  },
  {
    id: 'hindi-evm',
    category: 'हिन्दी • भारतीय राजनीति',
    topic: 'क्या भारत को EVM (इलेक्ट्रॉनिक वोटिंग मशीन) की जगह बैलेट पेपर पर वापस लौटना चाहिए?',
    language: 'Hindi (हिन्दी)',
    icon: Vote,
  },
  {
    id: 'us-china',
    category: 'Global Geopolitics',
    topic: 'The US-China rivalry will define the 21st century more than climate change or AI regulation.',
    language: 'English',
    icon: Globe2,
  },
  {
    id: 'hindi-one-nation',
    category: 'हिन्दी • संघीय ढांचा',
    topic: 'क्या "वन नेशन, वन इलेक्शन" भारत के लोकतंत्र को मजबूत करेगा या राज्यों की स्वायत्तता छीनेगा?',
    language: 'Hindi (हिन्दी)',
    icon: Landmark,
  },
  {
    id: 'free-speech',
    category: 'Democracy & Rights',
    topic: 'Social media platforms should be legally required to allow all political speech without moderation.',
    language: 'English',
    icon: Megaphone,
  },
  {
    id: 'india-pak-dialogue',
    category: 'South Asian Diplomacy',
    topic: 'India and Pakistan should prioritize unconditional diplomatic dialogue over military deterrence to resolve Kashmir.',
    language: 'English',
    icon: Handshake,
  },
];

interface TopicSelectorProps {
  currentTopic: string;
  onSelectTopic: (topic: string, language?: string) => void;
}

export default function TopicSelector({ currentTopic, onSelectTopic }: TopicSelectorProps) {
  const { isDark } = useTheme();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
        <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Trending Clash Presets</span>
        </div>
        <span className={`text-[10px] flex items-center gap-1 normal-case font-medium ${
          isDark ? 'text-cyan-400' : 'text-cyan-600'
        }`}>
          <Languages className="w-3 h-3" /> English &amp; हिन्दी presets available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {PRESET_TOPICS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = currentTopic === preset.topic;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectTopic(preset.topic, preset.language)}
              className={`p-3 text-left rounded-xl border transition-all duration-200 text-xs flex items-start gap-3 group ${
                isSelected
                  ? isDark
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'border-cyan-500 bg-gradient-to-br from-cyan-50/90 via-sky-50/50 to-white text-cyan-950 ring-2 ring-cyan-400/40 shadow-md shadow-cyan-500/10'
                  : isDark
                    ? 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    : 'border-slate-200/90 bg-white text-slate-700 hover:border-cyan-300 hover:bg-gradient-to-b hover:from-white hover:to-cyan-50/30 hover:shadow-md hover:-translate-y-0.5 shadow-sm'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors duration-200 ${
                  isSelected
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/25'
                    : isDark
                      ? 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-cyan-100 group-hover:text-cyan-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`block font-bold text-[10px] uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {preset.category}
                  </span>
                  {preset.language.includes('Hindi') && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold border ${
                      isDark
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-amber-100 text-amber-800 border-amber-300/80'
                    }`}>
                      हिन्दी
                    </span>
                  )}
                </div>
                <span className={`block line-clamp-2 leading-relaxed ${
                  isSelected
                    ? isDark ? 'font-semibold text-cyan-200' : 'font-bold text-cyan-950'
                    : isDark ? 'font-medium text-slate-300' : 'font-medium text-slate-800'
                }`}>
                  {preset.topic}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
