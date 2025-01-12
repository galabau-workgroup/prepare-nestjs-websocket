import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Logger } from '@nestjs/common';
import { MessageResponseDto } from '../dto/message-response.dto';
import { MessageHandlers } from '../../handlers';
import { SendMessageDto } from '../dto/send-message.dto';
// import { AuthGuard } from '../auth/auth.guard';
// import { UseGuards } from '@nestjs/common';

// @UseGuards(AuthGuard)
@WebSocketGateway({
  transports: ['websocket'],
  path: '/secure-chat',
})
export class SecureChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Secure Chat Gateway');

  afterInit() {
    this.logger.log('Secure Chat Gateway initialized');

    this.server.on('connection', () => {
      this.logger.log('New client connected to Secure Chat Gateway');
    });
  }

  async handleConnection(client: WebSocket, request: Request): Promise<void> {
    // const token = this.getTokenFromHeader(request);
    //
    // if (!token) {
    //   await this.rejectConnection(client, 4401, 'Missing Authorization header');
    //   return;
    // }
    //
    // if (!(await this.verifyToken(token))) {
    //   await this.rejectConnection(client, 4403, 'Invalid token provided');
    //   return;
    // }

    client.send('Connection established');

    client.on('message', (message: string) => {
      this.routeMessage(client, message);
    });

    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'welcome',
          data: 'Welcome to the WebSocket server!',
        }),
      );
    }
  }

  async handleDisconnect(client: WebSocket): Promise<void> {
    console.log('Client disconnected');
    client.close();
  }

  private routeMessage(client: WebSocket, rawMessage: string) {
    try {
      const { type, data } = JSON.parse(rawMessage) as SendMessageDto;

      const handler = MessageHandlers[type];
      if (handler) {
        handler(client, data);
      } else {
        console.error(`No handler found for message type: ${type}`);
        client.send(
          JSON.stringify({
            type: 'error',
            data: `Unknown message type: ${type}`,
          }),
        );
      }
    } catch (error) {
      console.error('Invalid message format:', error.message);
      client.send(
        JSON.stringify({
          type: 'error',
          data: 'Invalid message format',
        }),
      );
    }
  }

  // private async rejectConnection(
  //   client: WebSocket,
  //   code: number,
  //   reason: string,
  // ) {
  //   console.error(`Connection rejected: ${reason}`);
  //   // Send rejection message to client
  //   client.send(JSON.stringify({ error: reason, code }));
  //
  //   // Close the connection immediately to prevent reconnection
  //   client.close(code, reason);
  // }

  // private getTokenFromHeader(request: Request): string | null {
  //   const authHeader = request.headers['authorization'];
  //   if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //     return null;
  //   }
  //   return authHeader.split(' ')[1];
  // }

  // private async verifyToken(token: string) {
  //   // Replace this with your actual token verification logic
  //   return token === 'VALID_TOKEN';
  // }

  // public async verifyToken(token: string): Promise<string> {
  //   const apiUrl = 'https://api.software.net/me';
  //
  //   try {
  //     const response = await axios.get(apiUrl, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //
  //     if (response.status === 200 && response.data.customer_id) {
  //       return response.data.customer_id;
  //     }
  //
  //     throw new Error('Invalid token or customer ID not found');
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       console.error('Axios error occurred:', error.message);
  //
  //       throw new Error(
  //         `Authentication failed: ${error.response?.status || 'Unknown status'} - ${error.message}`,
  //       );
  //     }
  //
  //     console.error('Unexpected error:', error);
  //     // Preserve original error context
  //     throw error;
  //   }
  // }

  // @SubscribeMessage('secureMessage')
  // handleMessage(
  //   @ConnectedSocket() client: WebSocket,
  //   @MessageBody() message: { data: { user: string; text: string } },
  // ): void {
  //   console.log('Message received:', message);
  //
  //   // Send a reply to the sender
  //   if (client.readyState === WebSocket.OPEN) {
  //     client.send(
  //       JSON.stringify({
  //         type: 'reply',
  //         data: `Hello ${message.data.user}, you said: '${message.data.text}'`,
  //       }),
  //     );
  //   }
  //
  //   // Broadcast the message to all other clients
  //   this.server.clients.forEach((connectedClient) => {
  //     if (
  //       connectedClient !== client &&
  //       connectedClient.readyState === WebSocket.OPEN
  //     ) {
  //       connectedClient.send(
  //         JSON.stringify({
  //           type: 'broadcast',
  //           data: `${message.data.user} says: "${message.data.text}"`,
  //         }),
  //       );
  //     }
  //   });
  // }

  // @SubscribeMessage('hello')
  // handleHello(
  //   @ConnectedSocket() client: WebSocket,
  //   @MessageBody() message: any,
  // ): void {
  //   console.log('Message received:', message);
  //
  //   console.log('client', client);
  //
  //   // Send a reply to the sender
  //   if (client.readyState === WebSocket.OPEN) {
  //     client.send(
  //       JSON.stringify({
  //         type: 'reply',
  //         data: 'We say hello too!!',
  //       }),
  //     );
  //   }
  // }
}
