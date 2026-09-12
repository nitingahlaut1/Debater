'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  fetchDebate,
  startDebate,
  subscribeToDebateStream,
} from '@/lib/api';
import {
  Debate,
  DebateMessage,
  JudgeScorecard,
  StreamEvent,
  AgentRole,
} from '@/lib/types';
import { speechSynthesizer } from '@/lib/audio';
import DebaterCard from '@/components/DebaterCard';
import DebateDuelStage from '@/components/DebateDuelStage';
import TranscriptFeed from '@/components/TranscriptFeed';
import JudgeVerdict from '@/components/JudgeVerdictModal';
import { useTheme } from '@/lib/ThemeContext';
import {
  Swords,
  Scale,
  ArrowLeft,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function DebateArenaPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const debateId = params.id as string;
  const { isDark } = useTheme();

  const [debate, setDebate] = useState<Debate | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [status, setStatus] = useState<string>('CREATED');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [activeSpeakerRole, setActiveSpeakerRole] = useState<AgentRole | null>(null);
  const [activeSpeakerName, setActiveSpeakerName] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [streamingRound, setStreamingRound] = useState<number | null>(null);
  const [judgeScorecard, setJudgeScorecard] = useState<JudgeScorecard | null>(null);
  const [judgeChunk, setJudgeChunk] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Live Audio State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioRole, setAudioRole] = useState<AgentRole | null>(null);
  const [audioSpokenText, setAudioSpokenText] = useState<string>('');
  const debateRef = useRef<Debate | null>(null);
  debateRef.current = debate;

  // Initialize Audio from URL param or default
  useEffect(() => {
    const isLiveVoice = searchParams.get('liveVoice') === 'true';
    if (isLiveVoice) {
      speechSynthesizer.toggle(true);
    }

    const unsubAudio = speechSynthesizer.subscribe((playing, role, text, revealedText) => {
      setIsAudioPlaying(playing);
      setAudioRole(role);
      setAudioSpokenText(revealedText || text);
    });

    return () => {
      unsubAudio();
      speechSynthesizer.stop();
    };
  }, [searchParams]);

  // Load debate data initially
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchDebate(debateId);
        if (isMounted) {
          setDebate(data);
          setMessages(data.messages || []);
          setStatus(data.status);
          setCurrentRound(data.currentRound || 1);
          if (data.result) {
            setJudgeScorecard(data.result);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load debate');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [debateId]);

  // Subscribe to real-time SSE stream
  useEffect(() => {
    if (!debateId) return;

    const unsubscribe = subscribeToDebateStream(
      debateId,
      (event: StreamEvent) => {
        handleStreamEvent(event);
      },
      (err) => {
        console.warn('SSE stream error/reconnecting:', err);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [debateId]);

  const handleStreamEvent = (event: StreamEvent) => {
    switch (event.type) {
      case 'status_change':
        if (event.status) setStatus(event.status);
        break;

      case 'round_advance':
        if (event.round) setCurrentRound(event.round);
        break;

      case 'agent_thinking':
        if (!speechSynthesizer.isEnabled() || !speechSynthesizer.isPlaying()) {
          setActiveSpeakerRole(event.agentRole || null);
          setActiveSpeakerName(event.agentName || null);
          setIsThinking(true);
          setStreamingText('');
          if (event.round) setStreamingRound(event.round);
        }
        break;

      case 'agent_chunk':
        // If Live Voice is disabled, stream raw LLM tokens immediately
        if (!speechSynthesizer.isEnabled()) {
          setIsThinking(false);
          if (event.chunk) {
            setStreamingText((prev) => prev + event.chunk);
          }
        }
        break;

      case 'agent_message_complete':
        if (event.message) {
          if (speechSynthesizer.isEnabled()) {
            // In Live Voice mode: Text generates progressively in real-time with the speech audio
            speechSynthesizer.enqueue({
              id: event.message.id,
              text: event.message.content,
              role: event.message.agent?.role || 'DEBATER_A',
              language: debateRef.current?.language || 'English',
              onStart: () => {
                setActiveSpeakerRole(event.message?.agent?.role || 'DEBATER_A');
                setActiveSpeakerName(event.message?.agent?.name || null);
                if (event.message?.round) {
                  setStreamingRound(event.message.round);
                  setCurrentRound(event.message.round);
                }
                setIsThinking(false);
                setStreamingText('');
              },
              onProgress: (revealed) => {
                // Progressive text stream generating in sync with voice
                setStreamingText(revealed);
              },
              onEnd: () => {
                // Turn finishes: finalize message in transcript feed
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === event.message?.id);
                  if (exists) return prev;
                  return [...prev, event.message!];
                });
                setStreamingText('');
                setActiveSpeakerRole(null);
                setActiveSpeakerName(null);
              },
            });
          } else {
            // Live Voice disabled: instant message completion
            setIsThinking(false);
            setStreamingText('');
            setActiveSpeakerRole(null);
            setActiveSpeakerName(null);
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === event.message?.id);
              if (exists) return prev;
              return [...prev, event.message!];
            });
          }
        }
        break;

      case 'judging_start':
        if (!speechSynthesizer.isEnabled() || !speechSynthesizer.isPlaying()) {
          setStatus('JUDGING');
          setActiveSpeakerRole('JUDGE');
          setIsThinking(true);
          setStreamingText('');
        }
        break;

      case 'judge_chunk':
        if (!speechSynthesizer.isEnabled()) {
          setIsThinking(false);
          if (event.chunk) {
            setJudgeChunk((prev) => prev + event.chunk);
          }
        }
        break;

      case 'judge_complete':
      case 'debate_complete':
        const scorecardResult = event.result;
        if (scorecardResult) {
          if (speechSynthesizer.isEnabled()) {
            speechSynthesizer.enqueue({
              id: 'judge-verdict',
              text: `Debate concluded. ${scorecardResult.finalVerdict}. ${scorecardResult.reasoning}`,
              role: 'JUDGE',
              language: debateRef.current?.language || 'English',
              onStart: () => {
                setStatus('JUDGING');
                setActiveSpeakerRole('JUDGE');
                setActiveSpeakerName('Judge Arbiter');
                setIsThinking(false);
                setStreamingText('');
              },
              onProgress: (revealed) => {
                setJudgeChunk(revealed);
                setStreamingText(revealed);
              },
              onEnd: () => {
                setStatus('COMPLETED');
                setJudgeScorecard(scorecardResult);
                setActiveSpeakerRole(null);
                setStreamingText('');
                // Refetch complete debate data to synchronize
                fetchDebate(debateId)
                  .then((updated) => {
                    setDebate(updated);
                    setMessages(updated.messages || []);
                  })
                  .catch(() => {});
              },
            });
          } else {
            setStatus('COMPLETED');
            setActiveSpeakerRole(null);
            setIsThinking(false);
            setStreamingText('');
            setJudgeScorecard(scorecardResult);
            fetchDebate(debateId)
              .then((updated) => {
                setDebate(updated);
                setMessages(updated.messages || []);
              })
              .catch(() => {});
          }
        }
        break;

      case 'debate_error':
        setStatus('FAILED');
        setError(event.error || 'Debate encountered an unexpected error');
        break;
    }
  };

  const handleStartDebate = async () => {
    try {
      setIsStarting(true);
      setError(null);
      await startDebate(debateId);
      setStatus('RUNNING');
    } catch (err: any) {
      setError(err.message || 'Failed to start debate');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Entering AI Debate Arena...</p>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className={`p-3 rounded-2xl ${isDark ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-rose-50 border border-rose-200 text-rose-500'}`}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Arena Initialization Notice</h2>
        <p className={`text-sm max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{error || 'Debate not found'}</p>
        <Link
          href="/"
          className={`px-4 py-2 rounded-xl text-xs font-semibold ${
            isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const agentA = debate.agents?.find((a) => a.role === 'DEBATER_A') || {
    id: 'a',
    debateId: debate.id,
    name: 'Agent A',
    role: 'DEBATER_A',
    position: 'Affirmative proposition',
    systemPrompt: '',
  };

  const agentB = debate.agents?.find((a) => a.role === 'DEBATER_B') || {
    id: 'b',
    debateId: debate.id,
    name: 'Agent B',
    role: 'DEBATER_B',
    position: 'Opposition proposition',
    systemPrompt: '',
  };

  const isCompleted = status === 'COMPLETED' || !!judgeScorecard;
  const isJudging = status === 'JUDGING';
  const isRunning = status === 'RUNNING';
  const isCreated = status === 'CREATED';

  const roundProgressPct = Math.min(
    100,
    Math.round(((currentRound - 1) / debate.rounds) * 100 + (isRunning ? (1 / debate.rounds) * 50 : 0)),
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-8 sm:pb-12">
      {/* Navigation Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
            isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Arena Lobby</span>
        </Link>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {isRunning && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold animate-pulse ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>LIVE • Round {currentRound} of {debate.rounds}</span>
            </div>
          )}

          {isJudging && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold animate-pulse ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              <Scale className="w-3.5 h-3.5" />
              <span>Judge Evaluating...</span>
            </div>
          )}

          {isCompleted && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${
              isDark
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-cyan-50 border-cyan-200 text-cyan-600'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Debate Concluded</span>
            </div>
          )}

          {isCreated && (
            <button
              onClick={handleStartDebate}
              disabled={isStarting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 hover:from-cyan-300 hover:to-indigo-400 shadow-md shadow-cyan-500/20"
            >
              {isStarting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>Start Debate</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Topic Banner */}
      <div className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl space-y-3 sm:space-y-4 ${
        isDark
          ? 'border-slate-800 bg-slate-900/70'
          : 'border-slate-200/90 bg-white/95 shadow-lg shadow-slate-200/50'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-2 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span className={`uppercase tracking-wider flex items-center gap-1.5 font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            <Swords className="w-3.5 h-3.5" /> AI Debate Chamber
          </span>
          <span className="flex items-center gap-2 flex-wrap">
            {debate.language && debate.language.includes('Hindi') && (
              <span className={`px-2 py-0.5 rounded font-extrabold border text-[10px] ${
                isDark
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border-amber-300/80'
              }`}>
                🇮🇳 हिन्दी
              </span>
            )}
            <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
              {debate.rounds} Rounds • {debate.language || 'English'} • {debate.style} Format
            </span>
          </span>
        </div>

        <h1 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          &ldquo;{debate.topic}&rdquo;
        </h1>

        {/* Round Progress Meter */}
        <div className="space-y-1.5 pt-2">
          <div className={`flex justify-between text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span>Round Progress</span>
            <span>
              {isCompleted
                ? 'All Rounds Completed'
                : `Round ${currentRound} / ${debate.rounds}`}
            </span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 transition-all duration-500"
              style={{ width: isCompleted ? '100%' : `${roundProgressPct}%` }}
            />
          </div>
        </div>
      </div>


      {/* Live Animated Debate Duel Stage */}
      <DebateDuelStage
        agentA={agentA}
        agentB={agentB}
        currentRound={currentRound}
        totalRounds={debate.rounds}
        activeSpeakerRole={activeSpeakerRole}
        activeSpeakerName={activeSpeakerName}
        isThinking={isThinking}
        streamingText={streamingText}
        status={status}
        judgeScorecard={judgeScorecard}
        language={debate.language || 'English'}
        isAudioPlaying={isAudioPlaying}
        audioRole={audioRole}
        audioSpokenText={audioSpokenText}
      />

      {/* Debater Profiles & Position Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
        <DebaterCard
          agent={agentA}
          isActive={(isAudioPlaying && audioRole === 'DEBATER_A') || activeSpeakerRole === 'DEBATER_A'}
          isThinking={activeSpeakerRole === 'DEBATER_A' && isThinking && !isAudioPlaying}
          isSpeaking={(isAudioPlaying && audioRole === 'DEBATER_A') || (activeSpeakerRole === 'DEBATER_A' && !isThinking)}
        />

        <DebaterCard
          agent={agentB}
          isActive={(isAudioPlaying && audioRole === 'DEBATER_B') || activeSpeakerRole === 'DEBATER_B'}
          isThinking={activeSpeakerRole === 'DEBATER_B' && isThinking && !isAudioPlaying}
          isSpeaking={(isAudioPlaying && audioRole === 'DEBATER_B') || (activeSpeakerRole === 'DEBATER_B' && !isThinking)}
        />
      </div>

      {/* Active Judge Evaluating Animation State */}
      {isJudging && !judgeScorecard && (
        <div className={`rounded-2xl sm:rounded-3xl border p-6 sm:p-8 text-center space-y-4 animate-pulse ${
          isDark
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-amber-200 bg-amber-50/50'
        }`}>
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20 ${
            isDark ? 'bg-amber-500/20 border-amber-500/40' : 'bg-amber-100 border-amber-200'
          }`}>
            <Scale className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" />
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Judge AI Reviewing Transcript</h3>
            <p className={`text-xs max-w-md mx-auto mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Evaluating logical validity, empirical evidence, rebuttal precision, persuasiveness, and identifying cognitive fallacies across all rounds...
            </p>
          </div>
        </div>
      )}

      {/* Victory Podium / Judge Decision when Completed */}
      {isCompleted && judgeScorecard && (
        <JudgeVerdict scorecard={judgeScorecard} debate={{ ...debate, messages }} />
      )}

      {/* Live Transcript & Argument Timeline */}
      <section className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Debate Timeline & Transcript</span>
          </h2>
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {messages.length} Exchanges Recorded
          </span>
        </div>

        <TranscriptFeed
          messages={messages}
          totalRounds={debate.rounds}
          streamingAgentRole={activeSpeakerRole}
          streamingAgentName={activeSpeakerName}
          streamingText={streamingText}
          streamingRound={streamingRound}
        />
      </section>
    </div>
  );
}
