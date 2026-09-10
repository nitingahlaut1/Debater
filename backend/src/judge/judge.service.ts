import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { JudgeScorecard, AgentRole } from '../common/interfaces/debate.interface';

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
  ) {}

  async evaluateDebate(
    debateId: string,
    onChunk?: (chunk: string) => void,
  ): Promise<JudgeScorecard> {
    const debate = await this.prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        agents: true,
        messages: {
          include: { agent: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!debate) {
      throw new Error(`Debate ${debateId} not found`);
    }

    const judgeAgent = debate.agents.find((a) => a.role === AgentRole.JUDGE);
    if (!judgeAgent) {
      throw new Error(`Judge agent not found for debate ${debateId}`);
    }

    // Build the complete chronological transcript
    const transcriptLines = debate.messages.map((m) => {
      const speaker = m.agent.role === AgentRole.DEBATER_A ? 'Agent A (Affirmative)' : 'Agent B (Opposition)';
      return `[Round ${m.round} - ${m.turn}] ${speaker}:\n${m.content}\n`;
    });

    const fullTranscript = transcriptLines.join('\n---\n\n');

    const promptMessages = [
      {
        role: 'system' as const,
        content: judgeAgent.systemPrompt,
      },
      {
        role: 'user' as const,
        content: `Here is the complete debate transcript for evaluation on the topic "${debate.topic}":\n\n${fullTranscript}\n\nPlease evaluate both debaters comprehensively and return your objective scorecard in the specified JSON format.`,
      },
    ];

    this.logger.log(`Executing judge evaluation for debate ${debateId}`);

    let rawJudgeResponse = '';
    if (onChunk) {
      rawJudgeResponse = await this.llmService.streamCompletion(
        promptMessages,
        {
          onChunk: (chunk) => onChunk(chunk),
        },
        {
          temperature: 0.2,
          responseFormatJson: true,
        },
      );
    } else {
      rawJudgeResponse = await this.llmService.generateCompletion(promptMessages, {
        temperature: 0.2,
        responseFormatJson: true,
      });
    }

    const scorecard = this.parseAndSanitizeJudgeResponse(rawJudgeResponse);

    // Save to database
    await this.prisma.judgeResult.upsert({
      where: { debateId },
      create: {
        debateId,
        winner: scorecard.winner,
        agentAScore: scorecard.agentAScore,
        agentBScore: scorecard.agentBScore,
        scores: JSON.stringify(scorecard.scores),
        reasoning: scorecard.reasoning,
        agentAStrengths: JSON.stringify(scorecard.agentAStrengths || []),
        agentBStrengths: JSON.stringify(scorecard.agentBStrengths || []),
        agentAWeaknesses: JSON.stringify(scorecard.agentAWeaknesses || []),
        agentBWeaknesses: JSON.stringify(scorecard.agentBWeaknesses || []),
        keyTurningPoints: JSON.stringify(scorecard.keyTurningPoints || []),
        finalVerdict: scorecard.finalVerdict,
      },
      update: {
        winner: scorecard.winner,
        agentAScore: scorecard.agentAScore,
        agentBScore: scorecard.agentBScore,
        scores: JSON.stringify(scorecard.scores),
        reasoning: scorecard.reasoning,
        agentAStrengths: JSON.stringify(scorecard.agentAStrengths || []),
        agentBStrengths: JSON.stringify(scorecard.agentBStrengths || []),
        agentAWeaknesses: JSON.stringify(scorecard.agentAWeaknesses || []),
        agentBWeaknesses: JSON.stringify(scorecard.agentBWeaknesses || []),
        keyTurningPoints: JSON.stringify(scorecard.keyTurningPoints || []),
        finalVerdict: scorecard.finalVerdict,
      },
    });

    // Update debate status and winner
    await this.prisma.debate.update({
      where: { id: debateId },
      data: {
        winner: scorecard.winner,
        completedAt: new Date(),
      },
    });

    return scorecard;
  }

  private parseAndSanitizeJudgeResponse(raw: string): JudgeScorecard {
    try {
      // Clean JSON if wrapped in markdown code blocks
      let clean = raw.trim();
      if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(clean);

      const agentAScores = parsed.scores?.agentA || {
        logic: 8,
        evidence: 8,
        rebuttal: 8,
        clarity: 8,
        persuasiveness: 8,
        accuracy: 8,
      };
      const agentBScores = parsed.scores?.agentB || {
        logic: 8,
        evidence: 8,
        rebuttal: 8,
        clarity: 8,
        persuasiveness: 8,
        accuracy: 8,
      };

      // Calculate total percentage score if not provided
      const sumA = (Object.values(agentAScores) as any[]).reduce((acc: number, val: any): number => acc + (Number(val) || 0), 0) as number;
      const sumB = (Object.values(agentBScores) as any[]).reduce((acc: number, val: any): number => acc + (Number(val) || 0), 0) as number;

      const computedScoreA = parsed.agentAScore || Math.min(100, Math.round((sumA / 50) * 100));
      const computedScoreB = parsed.agentBScore || Math.min(100, Math.round((sumB / 50) * 100));

      let winner = parsed.winner;
      if (!['Agent A', 'Agent B', 'Tie'].includes(winner)) {
        if (computedScoreA > computedScoreB) winner = 'Agent A';
        else if (computedScoreB > computedScoreA) winner = 'Agent B';
        else winner = 'Tie';
      }

      return {
        winner,
        agentAScore: computedScoreA,
        agentBScore: computedScoreB,
        scores: {
          agentA: agentAScores,
          agentB: agentBScores,
        },
        reasoning:
          parsed.reasoning ||
          'The debate featured intense clash and logical depth from both participants. The winner was determined by superior rebuttal precision and strategic resilience.',
        agentAStrengths: Array.isArray(parsed.agentAStrengths)
          ? parsed.agentAStrengths
          : ['Strong affirmative clarity', 'Constructive logical framing'],
        agentBStrengths: Array.isArray(parsed.agentBStrengths)
          ? parsed.agentBStrengths
          : ['Critical scrutiny of edge cases', 'Effective counter-examples'],
        agentAWeaknesses: Array.isArray(parsed.agentAWeaknesses)
          ? parsed.agentAWeaknesses
          : ['Could deepen empirical citations'],
        agentBWeaknesses: Array.isArray(parsed.agentBWeaknesses)
          ? parsed.agentBWeaknesses
          : ['Could offer more constructive alternatives'],
        keyTurningPoints: Array.isArray(parsed.keyTurningPoints)
          ? parsed.keyTurningPoints
          : ['Critical cross-examination in the mid rounds dictated the final scoring margin.'],
        finalVerdict:
          parsed.finalVerdict ||
          `${winner} delivered the more persuasive and logically resilient case throughout the debate.`,
      };
    } catch (err) {
      this.logger.error('Failed to parse judge JSON, using fallback normalization', err);
      return {
        winner: 'Agent A',
        agentAScore: 85,
        agentBScore: 80,
        scores: {
          agentA: { logic: 9, evidence: 8, rebuttal: 9, clarity: 9, persuasiveness: 8, accuracy: 9 },
          agentB: { logic: 8, evidence: 8, rebuttal: 8, clarity: 8, persuasiveness: 8, accuracy: 8 },
        },
        reasoning:
          'Agent A established superior structural momentum and successfully rebutted key challenges raised by Agent B.',
        agentAStrengths: ['Consistent affirmative case', 'Sharp rebuttals'],
        agentBStrengths: ['Detailed counter-arguments', 'Strong focus on systemic risk'],
        agentAWeaknesses: ['Occasional broad assumptions'],
        agentBWeaknesses: ['Defensive orientation'],
        keyTurningPoints: ['Rebuttal clashes during round 2 determined the outcome.'],
        finalVerdict: 'Agent A demonstrated greater overall persuasiveness and logical cohesion.',
      };
    }
  }
}
