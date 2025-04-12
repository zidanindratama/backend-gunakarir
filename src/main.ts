import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const whitelist = ['http://localhost:3000'];

  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  app.enableCors({
    origin: whitelist,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(3001);
}
bootstrap();
