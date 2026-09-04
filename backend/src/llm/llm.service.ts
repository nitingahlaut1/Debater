import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatMessage, CompletionOptions, StreamCallbacks } from './llm.interface';
import { MockLlmService } from './mock-llm.service';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private openaiClient: OpenAI | null = null;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly providerName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly mockLlmService: MockLlmService,
  ) {
    const rawKey = (
      this.configService.get<string>('GROQ_API_KEY') ||
      this.configService.get<string>('GROK_API_KEY') ||
      ''
    ).trim();

    this.apiKey = rawKey;

    if (rawKey.startsWith('gsk_')) {
      // Groq Cloud LPU
      this.providerName = 'Groq Cloud (LPU)';
      this.baseUrl = this.configService.get<string>('GROQ_BASE_URL', 'https://api.groq.com/openai/v1');
      this.defaultModel = this.configService.get<string>('GROQ_MODEL', 'openai/gpt-oss-120b');
    } else {
      // xAI Grok
      this.providerName = 'xAI Grok';
      this.baseUrl = this.configService.get<string>('GROK_BASE_URL', 'https://api.x.ai/v1');
      this.defaultModel = this.configService.get<string>('GROK_MODEL', 'grok-2-latest');
    }

    if (this.apiKey && this.apiKey !== 'your_api_key' && this.apiKey !== 'your_grok_api_key_here') {
      try {
        this.openaiClient = new OpenAI({
          apiKey: this.apiKey,
          baseURL: this.baseUrl,
        });
        this.logger.log(`Initialized ${this.providerName} API client with endpoint "${this.baseUrl}" and model "${this.defaultModel}"`);
      } catch (error) {
        this.logger.error(`Failed to initialize OpenAI client for ${this.providerName}, using Mock simulator`, error);
      }
    } else {
      this.logger.warn('No valid LLM API key detected in environment. Operating in high-fidelity simulation mode.');
    }
  }

  isLiveLlmAvailable(): boolean {
    return !!this.openaiClient;
  }

  getProviderInfo(): { provider: string; model: string; baseUrl: string; isLive: boolean } {
    return {
      provider: this.providerName,
      model: this.defaultModel,
      baseUrl: this.baseUrl,
      isLive: !!this.openaiClient,
    };
  }

  async generateCompletion(
    messages: ChatMessage[],
    options: CompletionOptions = {},
  ): Promise<string> {
    if (!this.openaiClient) {
      return this.mockLlmService.generateCompletion(messages, options);
    }

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: this.defaultModel,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        response_format: options.responseFormatJson ? { type: 'json_object' } : undefined,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      this.logger.error(`${this.providerName} API completion failed (${error.message}). Falling back to simulation.`, error.stack);
      return this.mockLlmService.generateCompletion(messages, options);
    }
  }

  async streamCompletion(
    messages: ChatMessage[],
    callbacks: StreamCallbacks,
    options: CompletionOptions = {},
  ): Promise<string> {
    if (!this.openaiClient) {
      return this.mockLlmService.streamCompletion(messages, callbacks, options);
    }

    try {
      const stream = await this.openaiClient.chat.completions.create({
        model: this.defaultModel,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        response_format: options.responseFormatJson ? { type: 'json_object' } : undefined,
        stream: true,
      });

      let fullText = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          callbacks.onChunk(delta);
        }
      }

      if (callbacks.onComplete) {
        callbacks.onComplete(fullText);
      }

      return fullText;
    } catch (error: any) {
      this.logger.error(`${this.providerName} API stream failed (${error.message}). Falling back to simulated stream.`, error.stack);
      return this.mockLlmService.streamCompletion(messages, callbacks, options);
    }
  }
}
