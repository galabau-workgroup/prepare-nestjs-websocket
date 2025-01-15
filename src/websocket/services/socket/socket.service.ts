import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { CustomerQueueService } from '../customer-queue/customer-queue.service';
import { MessageDto } from '../../dto/message.dto';

@Injectable()
export class SocketService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private customerQueueService: CustomerQueueService,
  ) {}

  async handleMessage(messageDto: MessageDto): Promise<void> {
    // Save message to database
    const message = this.messageRepository.create({
      customerId: messageDto.customerId,
      content: messageDto.content,
    });
    await this.messageRepository.save(message);

    // Get customer's queue and add processing task
    const queue = this.customerQueueService.getOrCreateQueue(
      messageDto.customerId,
    );

    queue.next(async () => {
      // Simulate message processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update message as processed
      await this.messageRepository.update(message.id, { processed: true });

      return message;
    });
  }
}
