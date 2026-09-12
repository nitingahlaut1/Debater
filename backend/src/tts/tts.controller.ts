import { Controller, Post, Get, Body, Res, HttpStatus, Query, Logger } from '@nestjs/common';
import { Response } from 'express';
import { TtsService } from './tts.service';

@Controller('tts')
export class TtsController {
  private readonly logger = new Logger(TtsController.name);

  constructor(private readonly ttsService: TtsService) {}

  @Get('status')
  getStatus(@Query('key') customKey?: string) {
    const hasKey = this.ttsService.isAvailable(customKey);
    return {
      available: hasKey,
      engine: hasKey ? 'elevenlabs' : 'browser',
      voices: {
        DEBATER_A: 'Liam (TX3LPaxmHKxFdv7VOQHJ - Energetic Articulate Tenor Visionary)',
        DEBATER_B: 'Adam (pNInz6obpgDQGcFmaJgB - Deep Resonant Baritone Realist)',
        JUDGE: 'Daniel (onwK4e9ZLuTAKqWW03F9 - Authoritative British Male Arbiter)',
      },
    };
  }

  @Post('synthesize')
  async synthesize(
    @Body() body: { text: string; role?: string; language?: string; apiKey?: string },
    @Res() res: Response,
  ) {
    try {
      if (!body.text || !body.text.trim()) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Text is required for TTS synthesis' });
      }

      const audioBuffer = await this.ttsService.generateSpeech(
        body.text,
        body.role || 'DEBATER_A',
        body.language || 'English',
        body.apiKey,
      );

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      });

      return res.send(audioBuffer);
    } catch (err: any) {
      this.logger.warn(`TTS synthesis failed: ${err.message}`);
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        error: 'TTS_FAILED',
        message: err.message,
      });
    }
  }
}
