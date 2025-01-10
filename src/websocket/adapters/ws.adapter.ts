import { WebSocketAdapter, INestApplication, Logger } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import * as WebSocket from 'ws';
import { Server } from 'ws';
import { AuthService } from '../../auth/auth.service';
import { IncomingMessage } from 'http';

export class CustomWebSocketAdapter implements WebSocketAdapter {
  private readonly logger = new Logger('CustomWebSocketAdapter');
  private wsServer: Server;

  constructor(
    private readonly app: INestApplication,
    private readonly authService: AuthService,
  ) {}

  create(port: number, options: any = {}): Server {
    if (!this.wsServer) {
      const httpServer = this.app.getHttpServer();

      // Attach the WebSocket server to the existing HTTP server
      this.wsServer = new Server({ server: httpServer, ...options });

      // Log the actual port dynamically after the server is bound
      httpServer.on('listening', () => {
        const address = httpServer.address();
        const actualPort =
          typeof address === 'string' ? address : address?.port;
        this.logger.log(
          `WebSocket server attached to HTTP server on port ${actualPort}`,
        );
      });
    }
    return this.wsServer;
  }

  bindClientConnect(server: Server, callback: (client: WebSocket) => void) {
    server.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const authorization = request.headers['authorization'];
      if (!authorization || !authorization.startsWith('Bearer ')) {
        ws.close(4001, 'Authorization header missing or malformed');
        return;
      }
      const token = authorization.split(' ')[1];

      this.logger.log(`New client connected with token: ${token}`);
      callback(ws);
    });

    server.on('error', (err) => {
      this.logger.error('WebSocket Server Error:', err);
    });
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): void {
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

  close(): void {
    if (this.wsServer) {
      this.logger.log('Closing WebSocket Server');
      this.wsServer.close();
    }
  }
}
