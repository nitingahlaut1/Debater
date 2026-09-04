import { Controller, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('debates/:id/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async getMessages(@Param('id') debateId: string) {
    return this.messagesService.getMessagesByDebate(debateId);
  }
}
