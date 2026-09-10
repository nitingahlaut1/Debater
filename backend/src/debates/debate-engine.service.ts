import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { JudgeService } from '../judge/judge.service';
import { SseService } from './sse.service';
import { AgentRole, DebateStatus } from '../common/interfaces/debate.interface';
import { ChatMessage } from '../llm/llm.interface';

@Injectable()
export class DebateEngineService {
  private readonly logger = new Logger(DebateEngineService.name);
  private activeDebates = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
    private readonly judgeService: JudgeService,
    private readonly sseService: SseService,
  ) {}

  isDebateActive(debateId: string): boolean {
    return this.activeDebates.has(debateId);
  }

  async runDebate(debateId: string): Promise<void> {
    if (this.activeDebates.has(debateId)) {
      this.logger.warn(`Debate ${debateId} is already executing`);
      return;
    }

    this.activeDebates.add(debateId);

    try {
      const debate = await this.prisma.debate.findUnique({
        where: { id: debateId },
        include: {
          agents: true,
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!debate) {
        throw new Error(`Debate ${debateId} not found`);
      }

      if (debate.status === DebateStatus.COMPLETED) {
        this.logger.log(`Debate ${debateId} is already completed`);
        return;
      }

      const agentA = debate.agents.find((a) => a.role === AgentRole.DEBATER_A);
      const agentB = debate.agents.find((a) => a.role === AgentRole.DEBATER_B);
      const judge = debate.agents.find((a) => a.role === AgentRole.JUDGE);

      if (!agentA || !agentB || !judge) {
        throw new Error(`Missing agents for debate ${debateId}`);
      }

      // Update status to RUNNING
      await this.prisma.debate.update({
        where: { id: debateId },
        data: { status: DebateStatus.RUNNING },
      });

      this.sseService.emitEvent(debateId, {
        type: 'status_change',
        debateId,
        status: 'RUNNING',
        timestamp: new Date().toISOString(),
      });

      const totalRounds = debate.rounds;
      // Determine starting round based on existing messages
      const existingMessageCount = debate.messages.length;
      const startRound = Math.floor(existingMessageCount / 2) + 1;

      for (let r = startRound; r <= totalRounds; r++) {
        // Advance Round
        await this.prisma.debate.update({
          where: { id: debateId },
          data: { currentRound: r },
        });

        this.sseService.emitEvent(debateId, {
          type: 'round_advance',
          debateId,
          round: r,
          timestamp: new Date().toISOString(),
        });

        // ----------------- AGENT A TURN -----------------
        const turnA = r === 1 ? 'OPENING_ARGUMENT' : r === totalRounds ? 'CLOSING_STATEMENT' : 'REBUTTAL_&_EXPANSION';
        await this.executeAgentTurn(debateId, debate.topic, agentA, r, turnA);

        await new Promise((resolve) => setTimeout(resolve, 800));

        // ----------------- AGENT B TURN -----------------
        const turnB = r === 1 ? 'OPENING_COUNTER' : r === totalRounds ? 'CLOSING_STATEMENT' : 'COUNTER_&_REBUTTAL';
        await this.executeAgentTurn(debateId, debate.topic, agentB, r, turnB);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // ----------------- JUDGING STAGE -----------------
      await this.prisma.debate.update({
        where: { id: debateId },
        data: { status: DebateStatus.JUDGING },
      });

      this.sseService.emitEvent(debateId, {
        type: 'status_change',
        debateId,
        status: 'JUDGING',
        timestamp: new Date().toISOString(),
      });

      this.sseService.emitEvent(debateId, {
        type: 'judging_start',
        debateId,
        timestamp: new Date().toISOString(),
      });

      // Evaluate debate
      const judgeScorecard = await this.judgeService.evaluateDebate(
        debateId,
        (chunk) => {
          this.sseService.emitEvent(debateId, {
            type: 'judge_chunk',
            debateId,
            chunk,
            timestamp: new Date().toISOString(),
          });
        },
      );

      // Complete debate
      await this.prisma.debate.update({
        where: { id: debateId },
        data: {
          status: DebateStatus.COMPLETED,
          winner: judgeScorecard.winner,
          completedAt: new Date(),
        },
      });

      this.sseService.emitEvent(debateId, {
        type: 'judge_complete',
        debateId,
        result: judgeScorecard,
        timestamp: new Date().toISOString(),
      });

      this.sseService.emitEvent(debateId, {
        type: 'debate_complete',
        debateId,
        result: judgeScorecard,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Debate ${debateId} completed successfully. Winner: ${judgeScorecard.winner}`);
    } catch (error: any) {
      this.logger.error(`Error in debate execution ${debateId}`, error.stack);
      await this.prisma.debate.update({
        where: { id: debateId },
        data: { status: DebateStatus.FAILED },
      });

      this.sseService.emitEvent(debateId, {
        type: 'debate_error',
        debateId,
        error: error.message || 'Unknown error occurred during debate execution',
        timestamp: new Date().toISOString(),
      });
    } finally {
      this.activeDebates.delete(debateId);
    }
  }

  private async executeAgentTurn(
    debateId: string,
    topic: string,
    agent: any,
    round: number,
    turn: string,
  ): Promise<void> {
    this.sseService.emitEvent(debateId, {
      type: 'agent_thinking',
      debateId,
      round,
      agentRole: agent.role,
      agentName: agent.name,
      timestamp: new Date().toISOString(),
    });

    // Fetch up-to-date messages
    const allMessages = await this.prisma.debateMessage.findMany({
      where: { debateId },
      include: { agent: true },
      orderBy: { createdAt: 'asc' },
    });

    const isDebaterA = agent.role === AgentRole.DEBATER_A;

    // Build chat completion messages
    const chatMessages: ChatMessage[] = [
      {
        role: 'system',
        content: agent.systemPrompt,
      },
    ];

    if (allMessages.length === 0) {
      chatMessages.push({
        role: 'user',
        content: `You are delivering your opening argument for Round 1 on the topic "${topic}". State your core thesis and foundational arguments clearly.`,
      });
    } else {
      // Add conversation context
      const formattedHistory = allMessages
        .map((m) => {
          const speaker = m.agent.role === AgentRole.DEBATER_A ? 'Agent A (Affirmative)' : 'Agent B (Opposition)';
          return `[Round ${m.round} - ${m.turn}] ${speaker}:\n${m.content}`;
        })
        .join('\n\n');

      const opponentRole = isDebaterA ? 'Agent B (Opposition)' : 'Agent A (Affirmative)';
      const instructions =
        turn === 'CLOSING_STATEMENT'
          ? `This is Round ${round} (FINAL ROUND). Deliver your decisive closing statement. Synthesize why your side won and dismantle the core premises of ${opponentRole}.`
          : `This is Round ${round} (${turn}). Carefully analyze and respond directly to the latest points made by ${opponentRole}. Challenge their logical premises and defend your position.`;

      chatMessages.push({
        role: 'user',
        content: `DEBATE TRANSCRIPT SO FAR:\n\n${formattedHistory}\n\n---\nYOUR INSTRUCTIONS:\n${instructions}`,
      });
    }

    let fullContent = '';

    await this.llmService.streamCompletion(
      chatMessages,
      {
        onChunk: (chunk) => {
          this.sseService.emitEvent(debateId, {
            type: 'agent_chunk',
            debateId,
            round,
            agentRole: agent.role,
            agentName: agent.name,
            chunk,
            timestamp: new Date().toISOString(),
          });
        },
        onComplete: (text) => {
          fullContent = text;
        },
      },
      {
        temperature: 0.7,
        maxTokens: 500,
      },
    );

    // Persist message in database
    const savedMessage = await this.prisma.debateMessage.create({
      data: {
        debateId,
        agentId: agent.id,
        round,
        turn,
        content: fullContent,
        tokenCount: Math.ceil(fullContent.length / 4),
      },
      include: { agent: true },
    });

    this.sseService.emitEvent(debateId, {
      type: 'agent_message_complete',
      debateId,
      round,
      agentRole: agent.role,
      agentName: agent.name,
      message: savedMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
