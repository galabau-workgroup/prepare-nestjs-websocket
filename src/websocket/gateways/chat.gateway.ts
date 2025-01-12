import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from '../services/chat.service';
import { WS_EVENTS } from '../../shared/constants/ws-events.constant';
import { MessageResponseDto } from '../dto/message-response.dto';
import { WSClient } from '../interfaces/client.interface';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { SendMessageDto } from '../dto/send-message.dto';
import { Server } from 'ws';

@WebSocketGateway({
  path: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Chat Gateway');

  constructor(private chatService: ChatService) {}

  afterInit() {
    this.logger.log('ChatGateway initialized');

    this.server.on('connection', () => {
      this.logger.log('New client connected to Chat Gateway');
    });
  }

  handleConnection(client: WSClient) {
    client.id = uuidv4();
    this.chatService.addClient(client);
  }

  handleDisconnect(client: WSClient) {
    this.chatService.removeClient(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WS_EVENTS.MESSAGE)
  handleMessage(client: WSClient, payload: SendMessageDto): MessageResponseDto {
    try {
      const message = {
        type: payload.type,
        message: `Hello ${payload.data.user}`,
        userId: client.userId,
        timestamp: new Date(),
      };

      this.chatService.broadcast(message, client.id);

      return {
        success: true,
        data: message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }
}
