import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend access
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
  });
  
  // Initialize Passport
  app.use(passport.initialize());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`QR Check-in Backend running on port ${port}`);
}
bootstrap();