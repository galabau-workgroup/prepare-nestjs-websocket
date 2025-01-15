import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WsResponse,
} from '@nestjs/websockets';
import { SocketService } from '../../services/socket/socket.service';
import { MessageDto } from '../../dto/message.dto';

@WebSocketGateway()
export class SocketGateway {
  constructor(private socketService: SocketService) {}

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() messageDto: MessageDto,
  ): Promise<WsResponse<any>> {
    await this.socketService.handleMessage(messageDto);

    return {
      event: 'messageReceived',
      data: { status: 'queued', customerId: messageDto.customerId },
    };
  }
}
