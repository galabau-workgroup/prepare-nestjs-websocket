import { WebSocket } from 'ws';
import { SendMessageDto } from '../websocket/dto/send-message.dto';
export function handleHello(client: WebSocket, data: SendMessageDto['data']) {
  client.send(
    JSON.stringify({
      type: 'hello_response',
      data: `Hello, ${data.user || 'Guest'}!`,
    }),
  );
}
