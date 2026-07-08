// Charge .env avant tout : les décorateurs de modules (JwtModule.register,
// activation de GoogleStrategy) lisent process.env dès l'import
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  // En production, refuser de démarrer avec une configuration dangereuse
  if (isProd) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET manquant ou trop court (32 caractères min.)');
    }
    if (!process.env.WEB_URL) {
      throw new Error('WEB_URL manquant : le CORS serait ouvert à tous');
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet());
  // Derrière le proxy de Railway/Render : nécessaire pour que le rate
  // limiting voie la vraie IP du client et non celle du proxy
  app.set('trust proxy', 1);
  app.enableCors({
    origin: process.env.WEB_URL?.split(',') ?? !isProd,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
