import { Module } from '@nestjs/common';
import { SocketGateway } from './gateways/socket/socket.gateway';
import { SocketService } from './services/socket/socket.service';
import { CustomerQueueService } from './services/customer-queue/customer-queue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   // your database configuration
    // }),
    TypeOrmModule.forRootAsync({
      // 👈
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [SocketGateway, SocketService, CustomerQueueService],
  exports: [SocketService, CustomerQueueService],
})
export class WebsocketModule {}
