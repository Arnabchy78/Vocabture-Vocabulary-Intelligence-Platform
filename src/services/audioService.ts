// ─────────────────────────────────────────────
//  LexiQ — Audio Service
//  Uses browser's built-in Web Speech API
//  Free, offline, no API key needed
// ─────────────────────────────────────────────

class AudioService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoice();

    // Voices load asynchronously in some browsers
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoice();
    }
  }

  private loadVoice() {
    const voices = this.synth.getVoices();

    // Prefer high-quality English voices
    this.voice =
      voices.find((v) => v.name === 'Google UK English Female') ||
      voices.find((v) => v.name === 'Google US English') ||
      voices.find((v) => v.lang === 'en-US' && v.name.includes('Female')) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null;
  }

  /**
   * Speak a word out loud
   */
  speak(text: string, options?: { rate?: number; pitch?: number }) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.rate = options?.rate ?? 0.9;   // Slightly slower for clarity
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    this.synth.speak(utterance);
  }

  /**
   * Stop any ongoing speech
   */
  stop() {
    this.synth.cancel();
  }

  /**
   * Check if speech is supported
   */
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

// Singleton instance
export const audioService = new AudioService();