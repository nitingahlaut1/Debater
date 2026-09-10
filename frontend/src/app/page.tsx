'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopicSelector from '@/components/TopicSelector';
import { createDebate, startDebate } from '@/lib/api';
import { useTheme } from '@/lib/ThemeContext';
import {
  Swords,
  Sparkles,
  Scale,
  BrainCircuit,
  Zap,
  ArrowRight,
  Shield,
  Languages,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Bot,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [topic, setTopic] = useState('');
  const [rounds, setRounds] = useState(3);
  const [style, setStyle] = useState('OXFORD');
  const [difficulty, setDifficulty] = useState('STANDARD');
  const [language, setLanguage] = useState('English');
  const [agentAContext, setAgentAContext] = useState('');
  const [agentBContext, setAgentBContext] = useState('');
  const [showDirectives, setShowDirectives] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage('Please enter or select a debate topic.');
      return;
    }

    setErrorMessage('');
    setIsCreating(true);

    try {
      // 1. Create debate with chosen language and custom directives
      const debate = await createDebate({
        topic: topic.trim(),
        rounds,
        style,
        difficulty,
        language,
        agentAContext: agentAContext.trim() || undefined,
        agentBContext: agentBContext.trim() || undefined,
      });

      // 2. Start debate execution
      await startDebate(debate.id);

      // 3. Redirect to live arena
      router.push(`/debates/${debate.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize debate arena');
      setIsCreating(false);
    }
  };

  const handleSelectPreset = (selectedTopic: string, selectedLang?: string) => {
    setTopic(selectedTopic);
    if (selectedLang) {
      setLanguage(selectedLang);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-3 sm:space-y-4 pt-2 sm:pt-8 relative">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-sm ${
          isDark
            ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
            : 'border-cyan-300/80 bg-cyan-50 text-cyan-800'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Next-Gen Autonomous LLM Debate Arena</span>
        </div>

        <h1 className={`text-3xl sm:text-4xl md:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Where AI Agents Clash in{' '}
          <span className={`text-transparent bg-clip-text ${
            isDark
              ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400'
              : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-rose-600'
          }`}>
            High-Stakes Logic
          </span>
        </h1>

        <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Pitch two autonomous AI agents against each other on any topic in English, Hindi (हिन्दी), and more. Watch them formulate arguments in real-time while an impartial AI Judge scores their rigor.
        </p>
      </section>

      {/* Main Creation Card */}
      <div className={`glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 shadow-2xl relative overflow-hidden ${
        isDark ? 'border border-slate-800' : 'border border-slate-200/90 shadow-2xl shadow-slate-200/50'
      }`}>
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-cyan-500/5' : 'bg-cyan-500/10'
        }`} />
        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-rose-500/5' : 'bg-rose-500/10'
        }`} />

        <form onSubmit={handleStart} className="space-y-6 sm:space-y-8 relative">
          {/* Topic Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className={`block text-sm font-bold tracking-wide ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                1. Enter Debate Proposition or Question
              </label>
              {language.includes('Hindi') && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                  isDark
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-amber-800 bg-amber-100 border-amber-300'
                }`}>
                  हिन्दी वाद-विवाद मोड सक्रिय
                </span>
              )}
            </div>
            <div className="relative">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  language.includes('Hindi')
                    ? 'उदा. क्या कृत्रिम बुद्धिमत्ता (AI) आने वाले दशक में सॉफ्टवेयर डेवलपर्स का स्थान ले लेगी?'
                    : 'e.g. Should India adopt a Presidential system of government?'
                }
                rows={3}
                required
                className={`w-full rounded-xl sm:rounded-2xl border p-3 sm:p-4 text-sm sm:text-base font-medium focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-white/95 border-slate-200/90 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Trending Presets */}
            <TopicSelector currentTopic={topic} onSelectTopic={handleSelectPreset} />
          </div>

          {/* Configuration Grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t ${
            isDark ? 'border-slate-800/80' : 'border-slate-200'
          }`}>
            {/* Debate Language */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Languages className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span>Language (भाषा)</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold focus:outline-none focus:border-cyan-500 shadow-sm ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-cyan-300'
                    : 'bg-white border-slate-200/90 text-cyan-800'
                }`}
              >
                <option value="English">🇬🇧 English</option>
                <option value="Hindi (हिन्दी)">🇮🇳 Hindi (हिन्दी)</option>
                <option value="Hinglish">🇮🇳 Hinglish (Hindi-English)</option>
                <option value="Spanish (Español)">🇪🇸 Spanish (Español)</option>
                <option value="French (Français)">🇫🇷 French (Français)</option>
                <option value="German (Deutsch)">🇩🇪 German (Deutsch)</option>
                <option value="Japanese (日本語)">🇯🇵 Japanese (日本語)</option>
              </select>
            </div>

            {/* Rounds Selector */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Number of Rounds
              </label>
              <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/90 border-slate-200'
              }`}>
                {[1, 2, 3, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRounds(r)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      rounds === r
                        ? isDark
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25'
                        : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-850'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {r} {r === 1 ? 'Rnd' : 'Rnds'}
                  </button>
                ))}
              </div>
            </div>

            {/* Debate Style */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Debate Format
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-cyan-500 shadow-sm ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200/90 text-slate-800'
                }`}
              >
                <option value="OXFORD">Oxford Parliamentary</option>
                <option value="SOCRATIC">Socratic Dialectic</option>
                <option value="RAPID_FIRE">Rapid Fire</option>
                <option value="ACADEMIC">Academic Symposia</option>
              </select>
            </div>

            {/* Rigor / Difficulty */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Rhetorical Rigor
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-cyan-500 shadow-sm ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200/90 text-slate-800'
                }`}
              >
                <option value="STANDARD">Standard Intellectual</option>
                <option value="DEEP_THINKER">Deep First-Principles</option>
                <option value="GRANDMASTER">Grandmaster / Fallacy Hunt</option>
              </select>
            </div>
          </div>

          {/* Optional Agent A & Agent B Custom Directives Panel */}
          <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
            isDark
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-slate-50/80 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setShowDirectives(!showDirectives)}
              className={`w-full p-3.5 sm:p-4 flex items-center justify-between text-left transition-colors ${
                isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className={`p-1.5 rounded-lg border ${
                  isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
                }`}>
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-xs sm:text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Customize Agent A &amp; Agent B Directives (Optional)
                  </span>
                  <span className={`text-[11px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Instruct agents with custom facts, persona nuances, sources, or specific argument angles.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(agentAContext.trim() || agentBContext.trim()) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Directives Active
                  </span>
                )}
                {showDirectives ? (
                  <ChevronUp className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                )}
              </div>
            </button>

            {showDirectives && (
              <div className={`p-4 sm:p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 ${
                isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white'
              }`}>
                {/* Agent A Custom Directives */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <label className={`text-xs font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                        Agent A (Affirmative) Instructions
                      </label>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                      isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    }`}>
                      FOR
                    </span>
                  </div>

                  {/* Preset quick buttons for Agent A */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '📊 Data & Empirical Studies', text: 'Emphasize verified economic data, peer-reviewed empirical studies, and quantifiable productivity gains.' },
                      { label: '🚀 Tech & Innovation', text: 'Argue from technological accelerationism, exponential innovation curves, and competitive advantages.' },
                      { label: '⚖️ Legal & Rights', text: 'Anchor arguments in constitutional principles, individual liberty, and institutional modernization.' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAgentAContext((prev) => prev ? `${prev}\n${preset.text}` : preset.text)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                          isDark
                            ? 'bg-slate-900 border-cyan-500/30 text-slate-300 hover:text-cyan-300 hover:border-cyan-500'
                            : 'bg-cyan-50/60 border-cyan-200 text-cyan-800 hover:bg-cyan-100'
                        }`}
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={agentAContext}
                    onChange={(e) => setAgentAContext(e.target.value)}
                    placeholder="e.g. Focus on economic growth in developing markets, cite historical industrial revolutions, and maintain an optimistic vision..."
                    rows={3}
                    className={`w-full rounded-xl border p-2.5 text-xs font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Agent B Custom Directives */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                      <label className={`text-xs font-bold ${isDark ? 'text-rose-300' : 'text-rose-800'}`}>
                        Agent B (Opposition) Instructions
                      </label>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                      isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      AGAINST
                    </span>
                  </div>

                  {/* Preset quick buttons for Agent B */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '🛡️ Ethical & Privacy Risks', text: 'Highlight ethical hazards, systemic privacy infringements, and algorithmic opacity.' },
                      { label: '📉 Socio-Economic Disruption', text: 'Dissect labor displacement, widening inequality, and uncalculated transition costs.' },
                      { label: '🔍 Dissect Fallacies', text: 'Ruthlessly scrutinize Agent A for false equivalences, hasty generalizations, and unsupported premises.' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAgentBContext((prev) => prev ? `${prev}\n${preset.text}` : preset.text)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                          isDark
                            ? 'bg-slate-900 border-rose-500/30 text-slate-300 hover:text-rose-300 hover:border-rose-500'
                            : 'bg-rose-50/60 border-rose-200 text-rose-800 hover:bg-rose-100'
                        }`}
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={agentBContext}
                    onChange={(e) => setAgentBContext(e.target.value)}
                    placeholder="e.g. Challenge unverified assumptions, emphasize human accountability, and highlight the risks of unmonitored automation..."
                    rows={3}
                    className={`w-full rounded-xl border p-2.5 text-xs font-medium focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold ${
              isDark
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}>
              {errorMessage}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isCreating || !topic.trim()}
            className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-extrabold text-sm sm:text-base transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 ${
              isDark
                ? 'text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-xl shadow-cyan-500/20'
                : 'text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25'
            }`}
          >
            {isCreating ? (
              <>
                <BrainCircuit className="w-5 h-5 animate-spin" />
                <span>Summoning Agents & Initializing Arena...</span>
              </>
            ) : (
              <>
                <Swords className="w-5 h-5" />
                <span className="hidden sm:inline">Enter The Debate Arena ({language})</span>
                <span className="sm:hidden">Start Debate</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Feature Pillar Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2 sm:pt-6">
        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2.5 transition-all duration-300 ${
          isDark
            ? 'border-slate-800/80 bg-slate-900/40'
            : 'border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }`}>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600 shadow-sm'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Real-Time Autonomous Clash</h3>
          <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Debater A (Affirmative) and Debater B (Opposition) analyze each other&apos;s arguments dynamically in your chosen language.
          </p>
        </div>

        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2.5 transition-all duration-300 ${
          isDark
            ? 'border-slate-800/80 bg-slate-900/40'
            : 'border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }`}>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
          <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>6-Point Impartial Judge</h3>
          <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            The third AI agent impartially scores Logic, Evidence, Rebuttal, Clarity, Persuasiveness, and Accuracy with transparent reasoning in the debate language.
          </p>
        </div>

        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2.5 transition-all duration-300 ${
          isDark
            ? 'border-slate-800/80 bg-slate-900/40'
            : 'border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }`}>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
          }`}>
            <Shield className="w-5 h-5" />
          </div>
          <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Multilingual Voice TTS</h3>
          <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Listen to the debate live with native speech synthesis supporting English, Hindi (हिन्दी), and international voices.
          </p>
        </div>
      </section>
    </div>
  );
}
