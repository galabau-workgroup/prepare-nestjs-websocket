import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { WsAdapter } from '@nestjs/platform-ws';
import { CustomWebSocketAdapter } from './websocket/adapters/ws.adapter';
import { Logger } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Retrieve AuthService from the app's DI container
  const authService = app.get(AuthService);

  // Enable CORS
  // app.enableCors({
  //   origin: true,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   allowedHeaders: 'Content-Type, Accept',
  //   credentials: true,
  // });

  // Configure WebSocket adapter
  // const wsAdapter = new WsAdapter(app); // uses default adapter from '@nestjs/platform-ws'
  const wsAdapter = new CustomWebSocketAdapter(app, authService);
  app.useWebSocketAdapter(wsAdapter);

  // Start server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
