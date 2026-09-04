import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../agents/agents.service';
import { DebateEngineService } from './debate-engine.service';
import { CreateDebateDto } from './dto/create-debate.dto';
import { DebateStatus } from '@prisma/client';

@Injectable()
export class DebatesService {
  private readonly logger = new Logger(DebatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly agentsService: AgentsService,
    private readonly debateEngineService: DebateEngineService,
  ) {}

  async createDebate(createDto: CreateDebateDto) {
    const rounds = createDto.rounds || 3;
    const style = createDto.style || 'OXFORD';
    const difficulty = createDto.difficulty || 'STANDARD';
    const language = createDto.language || 'English';

    const debate = await this.prisma.debate.create({
      data: {
        topic: createDto.topic,
        rounds,
        style,
        difficulty,
        language,
        status: DebateStatus.CREATED,
      } as any,
    });

    // Create 3 agents (Debater A, Debater B, Judge) with language configuration
    await this.agentsService.setupDebateAgents(debate.id, debate.topic, style, language);

    return this.getDebateById(debate.id);
  }

  async getAllDebates() {
    return this.prisma.debate.findMany({
      include: {
        agents: true,
        result: true,
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDebateById(id: string) {
    const debate = await this.prisma.debate.findUnique({
      where: { id },
      include: {
        agents: true,
        messages: {
          include: { agent: true },
          orderBy: { createdAt: 'asc' },
        },
        result: true,
      },
    });

    if (!debate) {
      throw new NotFoundException(`Debate with ID "${id}" not found`);
    }

    return debate;
  }

  async startDebate(id: string) {
    const debate = await this.getDebateById(id);

    if (debate.status === DebateStatus.RUNNING || debate.status === DebateStatus.JUDGING) {
      return { message: 'Debate is already in progress', debate };
    }

    if (debate.status === DebateStatus.COMPLETED) {
      throw new BadRequestException('Debate has already finished');
    }

    // Launch execution asynchronously
    this.debateEngineService.runDebate(id).catch((err) => {
      this.logger.error(`Error running debate background loop for ${id}`, err);
    });

    return { message: 'Debate started successfully', debateId: id, status: 'RUNNING' };
  }

  async getDebateResult(id: string) {
    const result = await this.prisma.judgeResult.findUnique({
      where: { debateId: id },
    });

    if (!result) {
      throw new NotFoundException(`Judge result for debate ${id} not found or debate is still running`);
    }

    return result;
  }

  async deleteDebate(id: string) {
    await this.getDebateById(id);
    return this.prisma.debate.delete({
      where: { id },
    });
  }
}
