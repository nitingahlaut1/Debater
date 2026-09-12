import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ElevenLabsVoiceMap {
  DEBATER_A: string;
  DEBATER_B: string;
  JUDGE: string;
}

const DEFAULT_VOICES: ElevenLabsVoiceMap = {
  DEBATER_A: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - energetic, vibrant, articulate male tenor visionary
  DEBATER_B: 'pNInz6obpgDQGcFmaJgB', // Adam - deep, resonant, gravelly male baritone realist
  JUDGE: 'onwK4e9ZLuTAKqWW03F9',     // Daniel - measured, authoritative, British male arbiter
};

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private audioCache = new Map<string, Buffer>();

  constructor(private configService: ConfigService) {}

  getApiKey(customKey?: string): string {
    if (customKey?.trim()) return customKey.trim();
    if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
    const configKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    if (configKey) return configKey.trim();

    try {
      const dotenv = require('dotenv');
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        if (envConfig.ELEVENLABS_API_KEY) {
          process.env.ELEVENLABS_API_KEY = envConfig.ELEVENLABS_API_KEY;
          return envConfig.ELEVENLABS_API_KEY.trim();
        }
      }
    } catch (e) {}

    return '';
  }

  isAvailable(customKey?: string): boolean {
    return !!this.getApiKey(customKey);
  }

  async generateSpeech(
    text: string,
    role: string = 'DEBATER_A',
    language: string = 'English',
    customKey?: string,
  ): Promise<Buffer> {
    const apiKey = this.getApiKey(customKey);
    if (!apiKey) {
      throw new Error(
        'ElevenLabs API Key is not configured. Please set ELEVENLABS_API_KEY in backend .env or provide your key in settings.',
      );
    }

    const voiceId =
      role === 'DEBATER_B'
        ? DEFAULT_VOICES.DEBATER_B
        : role === 'JUDGE'
          ? DEFAULT_VOICES.JUDGE
          : DEFAULT_VOICES.DEBATER_A;

    // Distinct voice settings per role to maximize auditory differentiation
    const voiceSettings =
      role === 'DEBATER_B'
        ? {
            // Deep, steady, grounded realist baritone
            stability: 0.70,
            similarity_boost: 0.88,
            style: 0.18,
            use_speaker_boost: true,
          }
        : role === 'JUDGE'
          ? {
              // Measured, formal, authoritative arbiter
              stability: 0.80,
              similarity_boost: 0.92,
              style: 0.10,
              use_speaker_boost: true,
            }
          : {
              // High-energy, articulate, expressive visionary tenor
              stability: 0.38,
              similarity_boost: 0.75,
              style: 0.55,
              use_speaker_boost: true,
            };

    // In-memory cache key
    const cacheKey = `${voiceId}_${text.trim()}`;
    if (this.audioCache.has(cacheKey)) {
      this.logger.log(`Serving cached ElevenLabs audio for ${role}`);
      return this.audioCache.get(cacheKey)!;
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    this.logger.log(`Calling ElevenLabs API for role: ${role}, voiceId: ${voiceId}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      this.logger.error(`ElevenLabs API error (${response.status}): ${errText}`);
      throw new Error(`ElevenLabs TTS failed (${response.status}): ${errText || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cache management (keep max 100 audio files in memory)
    if (this.audioCache.size > 100) {
      const firstKey = this.audioCache.keys().next().value;
      if (firstKey) this.audioCache.delete(firstKey);
    }
    this.audioCache.set(cacheKey, buffer);

    return buffer;
  }
}
