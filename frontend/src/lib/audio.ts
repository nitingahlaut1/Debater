/**
 * Web Speech API text-to-speech helper with customized voice tone for each agent role and multilingual support
 */
class SpeechSynthesizer {
  private enabled: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  toggle(enable?: boolean): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    this.enabled = enable !== undefined ? enable : !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  speak(text: string, role: 'DEBATER_A' | 'DEBATER_B' | 'JUDGE', language: string = 'English') {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Clean markdown before speaking
    const cleanText = text
      .replace(/\*\*|__/g, '')
      .replace(/[*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/•/g, '')
      .trim();

    this.stop();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();

    const isHindi = language.toLowerCase().includes('hindi') || /[\u0900-\u097F]/.test(cleanText);

    if (isHindi) {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.includes('Hindi') || v.name.includes('Kalpana') || v.name.includes('Hemant'));
      if (hindiVoice) utterance.voice = hindiVoice;
      utterance.rate = 1.0;
    } else {
      if (role === 'DEBATER_A') {
        utterance.pitch = 1.15;
        utterance.rate = 1.05;
        const preferred = voices.find((v) => v.name.includes('David') || v.name.includes('Guy') || v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
      } else if (role === 'DEBATER_B') {
        utterance.pitch = 0.9;
        utterance.rate = 1.0;
        const preferred = voices.find((v) => v.name.includes('Mark') || v.name.includes('George') || v.lang.startsWith('en-GB'));
        if (preferred) utterance.voice = preferred;
      } else {
        utterance.pitch = 0.8;
        utterance.rate = 0.95;
      }
    }

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechSynthesizer = new SpeechSynthesizer();
