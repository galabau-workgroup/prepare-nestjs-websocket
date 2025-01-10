import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';
// import { SecureChatGateway } from './gateways/secure-chat.gateway';

@Module({
  providers: [
    // SecureChatGateway,
    ChatGateway,
    ChatService,
  ],
  exports: [ChatService],
})
export class WebsocketModule {}
