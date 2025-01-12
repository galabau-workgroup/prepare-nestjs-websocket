import { WebSocket } from 'ws';
import { SendMessageDto } from '../websocket/dto/send-message.dto';
export function handleBye(client: WebSocket, data: SendMessageDto['data']) {
  client.send(
    JSON.stringify({
      type: 'bye_response',
      data: `Bye, ${data.user || 'Guest'}!`,
    }),
  );
}
