import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessagesByDebate(debateId: string) {
    return this.prisma.debateMessage.findMany({
      where: { debateId },
      include: {
        agent: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(data: {
    debateId: string;
    agentId: string;
    round: number;
    turn: string;
    content: string;
    tokenCount?: number;
  }) {
    return this.prisma.debateMessage.create({
      data: {
        debateId: data.debateId,
        agentId: data.agentId,
        round: data.round,
        turn: data.turn,
        content: data.content,
        tokenCount: data.tokenCount || 0,
      },
      include: {
        agent: true,
      },
    });
  }
}
