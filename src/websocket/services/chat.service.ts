import { Injectable } from '@nestjs/common';
import { WSClient } from '../interfaces/client.interface';
import { Message } from '../interfaces/message.interface';

@Injectable()
export class ChatService {
  private clients: Map<string, WSClient> = new Map();

  addClient(client: WSClient): void {
    this.clients.set(client.id, client);
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  broadcast(message: Message, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
