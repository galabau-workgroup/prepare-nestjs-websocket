import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';
import { SecureChatGateway } from './gateways/secure-chat.gateway';

@Module({
  providers: [ChatGateway, ChatService, SecureChatGateway],
  exports: [ChatService],
})
export class WebsocketModule {}
