import { Module } from '@nestjs/common';
import { JudgeService } from './judge.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [LlmModule],
  providers: [JudgeService],
  exports: [JudgeService],
})
export class JudgeModule {}
