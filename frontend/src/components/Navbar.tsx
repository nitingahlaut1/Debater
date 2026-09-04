'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Swords, History, PlusCircle, Volume2, VolumeX, Sparkles, Sun, Moon, Menu, X } from 'lucide-react';
import { speechSynthesizer } from '@/lib/audio';
import { useTheme } from '@/lib/ThemeContext';

export default function Navbar() {
  const pathname = usePathname();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    setAudioEnabled(speechSynthesizer.isEnabled());
  }, []);

  const toggleAudio = () => {
    const newState = speechSynthesizer.toggle();
    setAudioEnabled(newState);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
      isDark
        ? 'border-slate-800/80 bg-slate-950/80'
        : 'border-slate-200/90 bg-white/85 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
              isDark ? 'bg-slate-950' : 'bg-white'
            }`}>
              <Swords className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12 ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`font-extrabold text-sm sm:text-lg tracking-tight text-transparent bg-clip-text ${
              isDark
                ? 'bg-gradient-to-r from-cyan-400 via-sky-200 to-rose-400'
                : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-rose-600'
            }`}>
              AI DEBATE ARENA
            </span>
            <span className={`text-[9px] sm:text-[10px] tracking-widest uppercase font-bold flex items-center gap-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 inline" /> Multi-Agent LLM Clash
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              pathname === '/'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-cyan-500/30'
                  : 'bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-300/60'
                : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Arena</span>
          </Link>

          <Link
            href="/history"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              pathname === '/history'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-cyan-500/30'
                  : 'bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-300/60'
                : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Archive</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-xl border text-sm transition-all flex items-center gap-1.5 ${
              isDark
                ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10'
                : 'border-slate-200/90 bg-white text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/60 shadow-sm'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Audio TTS Toggle */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Voice Synthesis Active' : 'Enable Voice Synthesis'}
            className={`p-2 rounded-xl border text-sm transition-all flex items-center gap-1.5 ${
              audioEnabled
                ? isDark
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'border-emerald-400/60 bg-emerald-50 text-emerald-700 shadow-sm'
                : isDark
                  ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  : 'border-slate-200/90 bg-white text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden lg:inline text-xs font-semibold">
              {audioEnabled ? 'Voice On' : 'Voice Off'}
            </span>
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-amber-400'
                : 'border-slate-200 bg-white text-slate-700 hover:text-indigo-600 shadow-sm'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 shadow-sm'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className={`sm:hidden border-t px-3 py-3 space-y-1 animate-fadeIn ${
          isDark ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white/95'
        }`}>
          <Link
            href="/"
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              pathname === '/'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                  : 'bg-cyan-50 text-cyan-600 border border-cyan-300/50'
                : isDark
                  ? 'text-slate-300 hover:bg-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Arena</span>
          </Link>

          <Link
            href="/history"
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              pathname === '/history'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                  : 'bg-cyan-50 text-cyan-600 border border-cyan-300/50'
                : isDark
                  ? 'text-slate-300 hover:bg-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Archive</span>
          </Link>

          <button
            onClick={toggleAudio}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              audioEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : isDark
                  ? 'text-slate-300 hover:bg-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Voice Synthesis On' : 'Voice Synthesis Off'}</span>
          </button>
        </div>
      )}
    </header>
  );
}
