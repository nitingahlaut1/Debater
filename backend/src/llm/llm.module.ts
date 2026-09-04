import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { MockLlmService } from './mock-llm.service';

@Module({
  providers: [LlmService, MockLlmService],
  exports: [LlmService, MockLlmService],
})
export class LlmModule {}
