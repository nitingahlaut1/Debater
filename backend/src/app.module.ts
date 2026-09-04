import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LlmModule } from './llm/llm.module';
import { AgentsModule } from './agents/agents.module';
import { JudgeModule } from './judge/judge.module';
import { MessagesModule } from './messages/messages.module';
import { DebatesModule } from './debates/debates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    LlmModule,
    AgentsModule,
    JudgeModule,
    MessagesModule,
    DebatesModule,
  ],
})
export class AppModule {}
