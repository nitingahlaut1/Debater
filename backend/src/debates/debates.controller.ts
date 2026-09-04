import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { DebatesService } from './debates.service';
import { SseService } from './sse.service';
import { CreateDebateDto } from './dto/create-debate.dto';
import { Observable } from 'rxjs';

@Controller('debates')
export class DebatesController {
  constructor(
    private readonly debatesService: DebatesService,
    private readonly sseService: SseService,
  ) {}

  @Post()
  async createDebate(@Body() createDebateDto: CreateDebateDto) {
    return this.debatesService.createDebate(createDebateDto);
  }

  @Get()
  async getAllDebates() {
    return this.debatesService.getAllDebates();
  }

  @Get(':id')
  async getDebate(@Param('id') id: string) {
    return this.debatesService.getDebateById(id);
  }

  @Post(':id/start')
  async startDebate(@Param('id') id: string) {
    return this.debatesService.startDebate(id);
  }

  @Get(':id/result')
  async getDebateResult(@Param('id') id: string) {
    return this.debatesService.getDebateResult(id);
  }

  @Sse(':id/stream')
  streamDebate(@Param('id') id: string): Observable<MessageEvent> {
    return this.sseService.getStream(id);
  }

  @Delete(':id')
  async deleteDebate(@Param('id') id: string) {
    return this.debatesService.deleteDebate(id);
  }
}
