export interface WSClient extends WebSocket {
  id: string;
  userId?: string;
  user?: any; // Add user property to store authenticated user data
}
