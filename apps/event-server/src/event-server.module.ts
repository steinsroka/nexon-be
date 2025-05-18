import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequestModule } from './reward-request/reward-request.module';
import { RewardModule } from './reward/reward.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/nexon-db',
        ),
      }),
    }),
    EventModule,
    RewardModule,
    RewardRequestModule,
  ],
  controllers: [],
  providers: [],
})
export class EventServerModule {}
