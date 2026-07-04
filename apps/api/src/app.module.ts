import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ReligionsModule } from './religions/religions.module';
import { LieuxModule } from './lieux/lieux.module';
import { FavorisModule } from './favoris/favoris.module';
import { SignalementsModule } from './signalements/signalements.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ReligionsModule,
    LieuxModule,
    FavorisModule,
    SignalementsModule,
    AdminModule,
  ],
})
export class AppModule {}
