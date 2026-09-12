import { AgentRole } from './types';

export interface SpeechQueueItem {
  id: string;
  text: string;
  role: AgentRole;
  language?: string;
  onStart?: () => void;
  onProgress?: (revealedText: string) => void;
  onEnd?: () => void;
}

export type AudioStateListener = (
  isPlaying: boolean,
  activeRole: AgentRole | null,
  currentText: string,
  revealedText: string,
) => void;

/**
 * Enhanced Real-Time Debate Speech Synthesizer with distinct voice profiles,
 * turn-based queuing, live synchronized text generation with speech, and 1.0x rate across all voices.
 */
class SpeechSynthesizer {
  private enabled: boolean = false;
  private queue: SpeechQueueItem[] = [];
  private isProcessing: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeRole: AgentRole | null = null;
  private currentSpokenText: string = '';
  private currentRevealedText: string = '';
  private progressTimer: any = null;
  private listeners: Set<AudioStateListener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Load available voices
      const loadVoices = () => {
        this.availableVoices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isProcessing, this.activeRole, this.currentSpokenText, this.currentRevealedText);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) =>
      l(this.isProcessing, this.activeRole, this.currentSpokenText, this.currentRevealedText),
    );
  }

  toggle(enable?: boolean): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
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

  /**
   * Queue a message to be spoken in sequence with natural turn-taking
   */
  enqueue(item: SpeechQueueItem) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
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
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

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

  private cleanMarkdown(text: string): string {
    return text
      .replace(/\*\*|__/g, '')
      .replace(/[*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/•/g, '')
      .replace(/>/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .trim();
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
        if (role === 'DEBATER_A') {
          // Prefer higher/female Hindi voice for Agent A if available
          const female = hindiVoices.find(
            (v) =>
              v.name.toLowerCase().includes('kalpana') ||
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('swara'),
          );
          return female || hindiVoices[0];
        } else if (role === 'DEBATER_B') {
          // Prefer deeper/male Hindi voice for Agent B
          const male = hindiVoices.find(
            (v) =>
              v.name.toLowerCase().includes('hemant') ||
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('madhav'),
          );
          return male || (hindiVoices.length > 1 ? hindiVoices[1] : hindiVoices[0]);
        }
        return hindiVoices[0];
      }
    }

    // English / General International Voice Selection
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    if (role === 'DEBATER_A') {
      // Agent A: Clear, higher-pitched, articulate tenor/female voice
      const preferredA = pool.find(
        (v) =>
          v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('Victoria') ||
          v.name.includes('Zira') ||
          v.name.includes('Google US English') ||
          v.name.includes('Jenny') ||
          v.name.includes('Guy'),
      );
      return preferredA || pool[0];
    } else if (role === 'DEBATER_B') {
      // Agent B: Deep, resonant baritone, deliberate voice
      const preferredB = pool.find(
        (v) =>
          v.name.includes('Daniel') ||
          v.name.includes('George') ||
          v.name.includes('David') ||
          v.name.includes('Mark') ||
          v.name.includes('Google UK English Male') ||
          v.name.includes('Oliver') ||
          v.name.includes('Ryan'),
      );
      return preferredB || (pool.length > 1 ? pool[1] : pool[0]);
    } else {
      // Judge: Authoritative, balanced arbiter voice
      const preferredJudge = pool.find(
        (v) =>
          v.name.includes('Google UK English Female') ||
          v.name.includes('Serena') ||
          v.name.includes('Alex') ||
          v.name.includes('Arthur'),
      );
      return preferredJudge || pool[0];
    }
  }

  private clearProgressTimer() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private processNextInQueue() {
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

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const isHindi =
      (currentItem.language && currentItem.language.toLowerCase().includes('hindi')) ||
      /[\u0900-\u097F]/.test(cleanedText);

    // Set voice tone based on Agent Role
    const voice = this.selectVoice(currentItem.role, isHindi);
    if (voice) {
      utterance.voice = voice;
    }

    // ALL VOICES ARE STRICTLY 1.25x RATE
    utterance.rate = 1.25;

    if (isHindi) {
      utterance.lang = 'hi-IN';
      if (currentItem.role === 'DEBATER_A') {
        utterance.pitch = 1.18; // Energetic tenor
      } else if (currentItem.role === 'DEBATER_B') {
        utterance.pitch = 0.85; // Deep baritone
      } else {
        utterance.pitch = 0.95; // Balanced judge
      }
    } else {
      if (currentItem.role === 'DEBATER_A') {
        // Agent A: Sharp, higher-pitched, confident visionary
        utterance.pitch = 1.2;
      } else if (currentItem.role === 'DEBATER_B') {
        // Agent B: Deep, resonant baritone, skeptical realist
        utterance.pitch = 0.82;
      } else {
        // Judge: Authoritative, solemn, measured
        utterance.pitch = 0.92;
      }
    }

    const words = cleanedText.split(/\s+/).filter(Boolean);

    // Track speech synthesis boundary events
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
      // At 1.25x rate, average speaking pace is ~3.8 words/sec (~260ms/word)
      const msPerWord = 260;

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
      // Small natural conversational breath pause between debate turns
      setTimeout(() => {
        this.processNextInQueue();
      }, 400);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback notice:', e);
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

  stop() {
    this.clearProgressTimer();
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSynthesizer = new SpeechSynthesizer();
