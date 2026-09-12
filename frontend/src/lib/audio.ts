import { AgentRole } from './types';
import { synthesizeElevenLabsSpeech } from './api';

export interface SpeechQueueItem {
  id: string;
  text: string;
  role: AgentRole;
  language?: string;
  onStart?: () => void;
  onProgress?: (revealedText: string) => void;
  onEnd?: () => void;
}

export type AudioEngineType = 'elevenlabs' | 'webspeech';

export type AudioStateListener = (
  isPlaying: boolean,
  activeRole: AgentRole | null,
  currentText: string,
  revealedText: string,
  engine?: AudioEngineType,
) => void;

/**
 * High-Fidelity Studio Debate Speech Synthesizer with ElevenLabs AI Voice Engine
 * and seamless fallback to studio natural neural Web Speech synthesis.
 */
class SpeechSynthesizer {
  private enabled: boolean = false;
  private queue: SpeechQueueItem[] = [];
  private isProcessing: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private activeRole: AgentRole | null = null;
  private currentSpokenText: string = '';
  private currentRevealedText: string = '';
  private currentEngine: AudioEngineType = 'webspeech';
  private progressTimer: any = null;
  private listeners: Set<AudioStateListener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];
  private customApiKey: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      // Load saved ElevenLabs API key if user configured one
      const savedKey = localStorage.getItem('debater_elevenlabs_api_key');
      if (savedKey) {
        this.customApiKey = savedKey.trim();
      }

      // Initialize Web Speech fallback voices
      if ('speechSynthesis' in window) {
        const loadVoices = () => {
          this.availableVoices = window.speechSynthesis.getVoices();
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
    }
  }

  setApiKey(key: string) {
    this.customApiKey = key.trim();
    if (typeof window !== 'undefined') {
      if (this.customApiKey) {
        localStorage.setItem('debater_elevenlabs_api_key', this.customApiKey);
      } else {
        localStorage.removeItem('debater_elevenlabs_api_key');
      }
    }
  }

  getApiKey(): string {
    return this.customApiKey;
  }

  subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(
      this.isProcessing,
      this.activeRole,
      this.currentSpokenText,
      this.currentRevealedText,
      this.currentEngine,
    );
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) =>
      l(
        this.isProcessing,
        this.activeRole,
        this.currentSpokenText,
        this.currentRevealedText,
        this.currentEngine,
      ),
    );
  }

  toggle(enable?: boolean): boolean {
    if (typeof window === 'undefined') return false;
    this.enabled = enable !== undefined ? enable : !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    this.notify();
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isPlaying(): boolean {
    return this.isProcessing;
  }

  getActiveRole(): AgentRole | null {
    return this.activeRole;
  }

  getCurrentText(): string {
    return this.currentSpokenText;
  }

  getRevealedText(): string {
    return this.currentRevealedText;
  }

  getCurrentEngine(): AudioEngineType {
    return this.currentEngine;
  }

  /**
   * Queue a message to be spoken in sequence with natural turn-taking
   */
  enqueue(item: SpeechQueueItem) {
    if (!this.enabled || typeof window === 'undefined') {
      if (item.onStart) item.onStart();
      if (item.onProgress) item.onProgress(item.text);
      if (item.onEnd) item.onEnd();
      return;
    }
    this.queue.push(item);
    if (!this.isProcessing) {
      this.processNextInQueue();
    }
  }

  /**
   * Immediately speak a piece of text (clearing existing queue if interrupt is true)
   */
  speak(
    text: string,
    role: AgentRole,
    language: string = 'English',
    interrupt: boolean = false,
    onStart?: () => void,
    onProgress?: (revealedText: string) => void,
    onEnd?: () => void,
  ) {
    if (!this.enabled || typeof window === 'undefined') return;

    if (interrupt) {
      this.stop();
    }

    this.enqueue({
      id: `${Date.now()}-${Math.random()}`,
      text,
      role,
      language,
      onStart,
      onProgress,
      onEnd,
    });
  }

  /**
   * Humanize and clean markdown text for natural, authentic speech delivery.
   */
  private cleanMarkdown(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\be\.g\.,?\s*/gi, 'for example, ')
      .replace(/\bi\.e\.,?\s*/gi, 'that is, ')
      .replace(/\bvs\.\s*/gi, 'versus ')
      .replace(/\bvs\b/gi, 'versus')
      .replace(/\bw\/\s*/gi, 'with ')
      .replace(/&amp;/g, 'and')
      .replace(/&/g, ' and ')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[•\-\*]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\[\d+\]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1')
      .trim();
  }

  private clearProgressTimer() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private async processNextInQueue() {
    this.clearProgressTimer();

    if (this.queue.length === 0 || !this.enabled) {
      this.isProcessing = false;
      this.activeRole = null;
      this.currentSpokenText = '';
      this.currentRevealedText = '';
      this.notify();
      return;
    }

    const currentItem = this.queue.shift();
    if (!currentItem) return;

    const cleanedText = this.cleanMarkdown(currentItem.text);
    if (!cleanedText) {
      if (currentItem.onEnd) currentItem.onEnd();
      this.processNextInQueue();
      return;
    }

    this.isProcessing = true;
    this.activeRole = currentItem.role;
    this.currentSpokenText = cleanedText;
    this.currentRevealedText = '';
    this.notify();

    if (currentItem.onStart) {
      currentItem.onStart();
    }

    // 1. First Attempt: ElevenLabs AI Studio Speech Synthesis
    try {
      const audioBlob = await synthesizeElevenLabsSpeech({
        text: cleanedText,
        role: currentItem.role,
        language: currentItem.language || 'English',
        apiKey: this.customApiKey || undefined,
      });

      if (audioBlob && audioBlob.size > 100) {
        this.currentEngine = 'elevenlabs';
        this.notify();
        this.playElevenLabsAudio(audioBlob, cleanedText, currentItem);
        return;
      }
    } catch (elevenLabsErr: any) {
      console.warn(
        '[SpeechSynthesizer] ElevenLabs voice synthesis notice (falling back to Studio Neural Web Speech):',
        elevenLabsErr.message || elevenLabsErr,
      );
    }

    // 2. Fallback: Studio Natural Neural Web Speech API
    this.currentEngine = 'webspeech';
    this.notify();
    this.playWebSpeechAudio(cleanedText, currentItem);
  }

  /**
   * Play ElevenLabs generated MP3 audio with synchronized text progress
   */
  private playElevenLabsAudio(
    audioBlob: Blob,
    cleanedText: string,
    currentItem: SpeechQueueItem,
  ) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    this.currentAudioElement = audio;
    audio.playbackRate = 1.25;

    const words = cleanedText.split(/\s+/).filter(Boolean);

    // Sync progressive text generation directly with audio playback time
    audio.ontimeupdate = () => {
      if (!this.isProcessing || !audio.duration) return;
      const progress = Math.min(1, audio.currentTime / audio.duration);
      const targetWordCount = Math.min(words.length, Math.ceil(progress * words.length));
      const generated = words.slice(0, targetWordCount).join(' ');

      if (generated.length > this.currentRevealedText.length) {
        this.currentRevealedText = generated;
        this.notify();
        if (currentItem.onProgress) {
          currentItem.onProgress(this.currentRevealedText);
        }
      }
    };

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      this.currentAudioElement = null;
      this.currentRevealedText = cleanedText;
      this.notify();
      if (currentItem.onProgress) {
        currentItem.onProgress(cleanedText);
      }
      if (currentItem.onEnd) {
        currentItem.onEnd();
      }
      setTimeout(() => {
        this.processNextInQueue();
      }, 400);
    };

    audio.onerror = (e) => {
      console.warn('[SpeechSynthesizer] Audio element error, falling back to Web Speech:', e);
      URL.revokeObjectURL(audioUrl);
      this.currentAudioElement = null;
      this.playWebSpeechAudio(cleanedText, currentItem);
    };

    audio.play().catch((err) => {
      console.warn('[SpeechSynthesizer] Playback was interrupted or blocked:', err);
      URL.revokeObjectURL(audioUrl);
      this.currentAudioElement = null;
      this.playWebSpeechAudio(cleanedText, currentItem);
    });
  }

  /**
   * Play studio natural Web Speech API audio with boundary & timer text sync
   */
  private playWebSpeechAudio(cleanedText: string, currentItem: SpeechQueueItem) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (currentItem.onEnd) currentItem.onEnd();
      this.processNextInQueue();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const isHindi =
      (currentItem.language && currentItem.language.toLowerCase().includes('hindi')) ||
      /[\u0900-\u097F]/.test(cleanedText);

    const voice = this.selectVoice(currentItem.role, isHindi);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.volume = 1.0;

    // Distinct pitch & rate per role for clear auditory separation
    if (currentItem.role === 'DEBATER_A') {
      utterance.rate = 1.25;
      utterance.pitch = 1.18; // Bright, articulate, energetic tenor
    } else if (currentItem.role === 'DEBATER_B') {
      utterance.rate = 1.18;
      utterance.pitch = 0.80; // Deep, resonant, grounded baritone
    } else {
      utterance.rate = 1.10;
      utterance.pitch = 0.95; // Stately, authoritative arbiter
    }

    if (isHindi) {
      utterance.lang = 'hi-IN';
    }

    const words = cleanedText.split(/\s+/).filter(Boolean);

    utterance.onboundary = (event) => {
      if (event.charIndex !== undefined) {
        const charIndex = event.charIndex;
        let nextSpace = cleanedText.indexOf(' ', charIndex);
        if (nextSpace === -1) nextSpace = cleanedText.length;
        else nextSpace = Math.min(cleanedText.length, nextSpace + 1);

        const updated = cleanedText.substring(0, nextSpace);
        if (updated.length > this.currentRevealedText.length) {
          this.currentRevealedText = updated;
          this.notify();
          if (currentItem.onProgress) {
            currentItem.onProgress(this.currentRevealedText);
          }
        }
      }
    };

    utterance.onstart = () => {
      const startTime = Date.now();
      const msPerWord = currentItem.role === 'DEBATER_A' ? 240 : 270;

      this.progressTimer = setInterval(() => {
        if (!this.isProcessing) {
          this.clearProgressTimer();
          return;
        }
        const elapsed = Date.now() - startTime;
        const targetWordIndex = Math.min(words.length, Math.floor(elapsed / msPerWord) + 1);
        const generated = words.slice(0, targetWordIndex).join(' ');

        if (generated.length > this.currentRevealedText.length) {
          this.currentRevealedText = generated;
          this.notify();
          if (currentItem.onProgress) {
            currentItem.onProgress(this.currentRevealedText);
          }
        }
      }, 100);
    };

    utterance.onend = () => {
      this.clearProgressTimer();
      this.currentRevealedText = cleanedText;
      this.notify();
      if (currentItem.onProgress) {
        currentItem.onProgress(cleanedText);
      }
      if (currentItem.onEnd) {
        currentItem.onEnd();
      }
      setTimeout(() => {
        this.processNextInQueue();
      }, 400);
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesizer] Speech synthesis playback notice:', e);
      this.clearProgressTimer();
      this.currentRevealedText = cleanedText;
      this.notify();
      if (currentItem.onProgress) {
        currentItem.onProgress(cleanedText);
      }
      if (currentItem.onEnd) {
        currentItem.onEnd();
      }
      this.processNextInQueue();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private selectVoice(role: AgentRole, isHindi: boolean): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0 && typeof window !== 'undefined') {
      this.availableVoices = window.speechSynthesis.getVoices();
    }

    const voices = this.availableVoices;
    if (voices.length === 0) return null;

    if (isHindi) {
      const hindiVoices = voices.filter(
        (v) => v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi'),
      );
      if (hindiVoices.length > 0) {
        const maleHindiVoices = hindiVoices.filter((v) =>
          v.name.includes('Madhur') ||
          v.name.includes('Hemant') ||
          v.name.includes('Madhav') ||
          v.name.toLowerCase().includes('male'),
        );
        const activeHindiPool = maleHindiVoices.length > 0 ? maleHindiVoices : hindiVoices;
        if (role === 'DEBATER_A') {
          return activeHindiPool[0] || hindiVoices[0];
        } else if (role === 'DEBATER_B') {
          return activeHindiPool.length > 1 ? activeHindiPool[1] : activeHindiPool[0];
        } else {
          return activeHindiPool.length > 2 ? activeHindiPool[2] : activeHindiPool[0];
        }
      }
    }

    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const candidateVoices = englishVoices.length > 0 ? englishVoices : voices;
    const maleVoices = candidateVoices.filter((v) => {
      const name = v.name.toLowerCase();
      return (
        !name.includes('female') &&
        !name.includes('zira') &&
        !name.includes('samantha') &&
        !name.includes('jenny') &&
        !name.includes('aria') &&
        !name.includes('sonia') &&
        !name.includes('libby') &&
        !name.includes('serena') &&
        !name.includes('kalpana') &&
        !name.includes('swara')
      );
    });
    const pool = maleVoices.length > 0 ? maleVoices : candidateVoices;

    if (role === 'DEBATER_A') {
      // Energetic, articulate tenor male voice (Guy Natural, Christopher Natural, Alex, Google US Male, David)
      const preferredA = pool.find(
        (v) =>
          v.name.includes('Guy Online (Natural)') ||
          v.name.includes('Christopher Online (Natural)') ||
          v.name.includes('Google US English Male') ||
          v.name.includes('Google US English') ||
          v.name.includes('Alex') ||
          v.name.includes('David'),
      );
      return preferredA || pool[0];
    } else if (role === 'DEBATER_B') {
      // Deep resonant baritone male voice (Ryan Natural, Daniel Enhanced, George, Mark, Evan)
      const preferredB = pool.find(
        (v) =>
          v.name.includes('Ryan Online (Natural)') ||
          v.name.includes('Daniel (Enhanced)') ||
          v.name.includes('George') ||
          v.name.includes('Mark') ||
          v.name.includes('Evan (Premium)') ||
          v.name.includes('Daniel') ||
          v.name.includes('Google UK English Male'),
      );
      return preferredB || (pool.length > 1 ? pool[1] : pool[0]);
    } else {
      // Measured, authoritative arbiter male voice (Brian Natural, Arthur, Google UK Male)
      const preferredJudge = pool.find(
        (v) =>
          v.name.includes('Brian Online (Natural)') ||
          v.name.includes('Arthur (Premium)') ||
          v.name.includes('Arthur') ||
          v.name.includes('Google UK English Male') ||
          v.name.includes('Alex') ||
          v.name.includes('Christopher Online (Natural)') ||
          v.name.includes('David'),
      );
      return preferredJudge || (pool.length > 2 ? pool[2] : pool[0]);
    }
  }

  stop() {
    this.clearProgressTimer();
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
    const remaining = [...this.queue];
    this.queue = [];
    remaining.forEach((item) => {
      if (item.onEnd) item.onEnd();
    });

    this.isProcessing = false;
    this.activeRole = null;
    this.currentSpokenText = '';
    this.currentRevealedText = '';
    this.notify();
  }

  skip() {
    this.clearProgressTimer();
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
      this.processNextInQueue();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSynthesizer = new SpeechSynthesizer();
