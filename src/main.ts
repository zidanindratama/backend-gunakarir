import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new PrismaClientExceptionFilter());

  const whitelist = [
    'http://localhost:3000',
    'http://gunakarir.vercel.app',
    'https://frontend-gunakarir.vercel.app',
  ];

  app.enableCors({
    origin: whitelist,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(3001);
}
bootstrap();
