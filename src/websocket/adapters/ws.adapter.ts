import { WebSocketAdapter, INestApplication, Logger } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import * as WebSocket from 'ws';
import { Server } from 'ws';
import { IncomingMessage } from 'http';
import { AuthService } from '../../auth/auth.service';

export class CustomWebSocketAdapter implements WebSocketAdapter {
  private readonly logger = new Logger('CustomWebSocketAdapter');

  constructor(
    private readonly app: INestApplication,
    private readonly authService: AuthService,
  ) {}

  create(port: number, options: any = {}): Server {
    this.logger.log(`Creating WebSocket server on port ${port}`);
    return new Server({ port, ...options });
  }

  bindClientConnect(server: Server, callback: (client: WebSocket) => void) {
    console.log('Binding client connect');
    server.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const authorization = request.headers['authorization'];
      if (!authorization || !authorization.startsWith('Bearer ')) {
        ws.close(4001, 'Authorization header missing or malformed');
        return;
      }
      const token = authorization.split(' ')[1];

      console.log(`New client connected, used token: ${token}`);
      callback(ws);
    });

    server.on('error', (err) => {
      console.error('WebSocket Server Error:', err);
    });
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): void {
    console.log('Binding message handlers');
    fromEvent(client, 'message')
      .pipe(
        mergeMap((message) => this.handleMessage(message, handlers, process)),
        filter((result) => !!result),
      )
      .subscribe(
        (response) => {
          client.send(JSON.stringify(response));
        },
        (error) => {
          this.logger.error(`Error handling message: ${error.message}`);
        },
      );
  }

  private handleMessage(
    buffer: any,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    let parsedMessage: any;

    try {
      parsedMessage = JSON.parse(buffer.data);
      this.logger.debug(`Received message: ${JSON.stringify(parsedMessage)}`);
    } catch (error) {
      this.logger.error(`Error parsing message: ${error.message}`);
      return EMPTY;
    }

    const handler = handlers.find((h) => h.message === parsedMessage.type); // Changed from message.event to message.type
    if (!handler) {
      this.logger.warn(
        `No handler found for message type: ${parsedMessage.type}`,
      );
      return EMPTY;
    }

    return process(handler.callback(parsedMessage));
  }

  close(server: Server): void {
    this.logger.log('Closing WebSocket Server');
    server.close();
  }
}
