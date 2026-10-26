import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/errors/http-exception.filter';
import { isAllowedFrontendOrigin } from './shared/http/frontend-origin';
import { isIsoDate } from './shared/date/date-utils';

type CorsAllowedOrigin = boolean | string | RegExp | Array<string | RegExp>;
type CorsOriginCallback = (error: Error | null, allowed?: CorsAllowedOrigin) => void;

export async function createNestApplication() {
  dotenv.config({ path: resolve(process.cwd(), '../.env') });
  dotenv.config({ path: resolve(process.cwd(), '.env') });

  const assessmentToday = process.env.ASSESSMENT_TODAY ?? '2026-05-15';
  if (!isIsoDate(assessmentToday)) {
    throw new Error('ASSESSMENT_TODAY must be a valid YYYY-MM-DD date');
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('');
  const configuredFrontendOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());
  const allowPrivateNetworkOrigins = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: (origin: string | undefined, callback: CorsOriginCallback) => {
      callback(
        null,
        !origin ||
          isAllowedFrontendOrigin(
            origin,
            configuredFrontendOrigins,
            allowPrivateNetworkOrigins,
          ),
      );
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  return app;
}
