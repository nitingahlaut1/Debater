import { Module } from '@nestjs/common';
import { DebatesController } from './debates.controller';
import { DebatesService } from './debates.service';
import { DebateEngineService } from './debate-engine.service';
import { SseService } from './sse.service';
import { AgentsModule } from '../agents/agents.module';
import { JudgeModule } from '../judge/judge.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [AgentsModule, JudgeModule, LlmModule],
  controllers: [DebatesController],
  providers: [DebatesService, DebateEngineService, SseService],
  exports: [DebatesService, DebateEngineService, SseService],
})
export class DebatesModule {}
