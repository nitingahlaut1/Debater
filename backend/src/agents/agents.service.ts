import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentRole } from '../common/interfaces/debate.interface';
import { buildDebaterASystemPrompt } from './prompts/debater-a.prompt';
import { buildDebaterBSystemPrompt } from './prompts/debater-b.prompt';
import { buildJudgeSystemPrompt } from './prompts/judge.prompt';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  derivePositions(topic: string, language: string = 'English'): { positionA: string; positionB: string } {
    if (language.toLowerCase().includes('hindi') || language === 'हिन्दी') {
      return {
        positionA: `सकारात्मक पक्ष (Affirmative): "${topic}" के पक्ष में ठोस तर्कों और व्यावहारिक साक्ष्यों के साथ समर्थन करता है।`,
        positionB: `विपक्ष (Opposition): "${topic}" के विपक्ष में तार्किक विश्लेषण, संभावित जोखिमों और वैकल्पिक समाधानों के साथ खंडन करता है।`,
      };
    }

    return {
      positionA: `Affirmative proposition: Supports and argues in favor of "${topic}" with empirical rationale and proactive vision.`,
      positionB: `Opposition proposition: Contests and argues against "${topic}" highlighting systemic risks, counter-evidence, and alternative models.`,
    };
  }

  async setupDebateAgents(
    debateId: string,
    topic: string,
    style: string = 'OXFORD',
    language: string = 'English',
    agentAContext?: string,
    agentBContext?: string,
  ) {
    const { positionA, positionB } = this.derivePositions(topic, language);

    const agentA = await this.prisma.agent.create({
      data: {
        debateId,
        name: language.toLowerCase().includes('hindi') ? 'एजेंट A (पक्ष)' : 'Agent A',
        role: AgentRole.DEBATER_A,
        position: positionA,
        systemPrompt: buildDebaterASystemPrompt(topic, positionA, style, language, agentAContext),
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=debaterA&backgroundColor=0284c7',
      },
    });

    const agentB = await this.prisma.agent.create({
      data: {
        debateId,
        name: language.toLowerCase().includes('hindi') ? 'एजेंट B (विपक्ष)' : 'Agent B',
        role: AgentRole.DEBATER_B,
        position: positionB,
        systemPrompt: buildDebaterBSystemPrompt(topic, positionB, style, language, agentBContext),
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=debaterB&backgroundColor=e11d48',
      },
    });

    const judge = await this.prisma.agent.create({
      data: {
        debateId,
        name: language.toLowerCase().includes('hindi') ? 'न्यायाधीश (Judge Arbiter)' : 'Judge Arbiter',
        role: AgentRole.JUDGE,
        position: language.toLowerCase().includes('hindi')
          ? 'निष्पक्ष वाद-विवाद निर्णायक एवं मूल्यांकक'
          : 'Impartial Debate Evaluator and Scoring Official',
        systemPrompt: buildJudgeSystemPrompt(topic, language),
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=judgeArbiter&backgroundColor=ca8a04',
      },
    });

    this.logger.log(`Created 3 agents for debate ${debateId} in language ${language}`);
    return { agentA, agentB, judge };
  }
}
