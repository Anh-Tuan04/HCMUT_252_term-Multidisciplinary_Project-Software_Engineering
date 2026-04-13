import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { ParkingLotModule } from './modules/parking_lot/parking_lot.module';
import { ParkingSlotModule } from './modules/parking_slot/parking_slot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    PrismaModule,
    ParkingLotModule,
    ParkingSlotModule,
    AuthModule,
    MailModule
  ]
})
export class AppModule {}
