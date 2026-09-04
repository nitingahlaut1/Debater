import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { StreamEvent } from '../common/interfaces/debate.interface';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private readonly debateStreams = new Map<string, Subject<MessageEvent>>();

  getStream(debateId: string): Observable<MessageEvent> {
    if (!this.debateStreams.has(debateId)) {
      this.debateStreams.set(debateId, new Subject<MessageEvent>());
    }
    return this.debateStreams.get(debateId)!.asObservable();
  }

  emitEvent(debateId: string, event: StreamEvent) {
    if (!this.debateStreams.has(debateId)) {
      this.debateStreams.set(debateId, new Subject<MessageEvent>());
    }

    const subject = this.debateStreams.get(debateId)!;
    subject.next({
      data: event,
    });
  }

  removeStream(debateId: string) {
    if (this.debateStreams.has(debateId)) {
      const subject = this.debateStreams.get(debateId)!;
      subject.complete();
      this.debateStreams.delete(debateId);
    }
  }
}
