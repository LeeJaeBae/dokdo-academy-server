import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // body size limit
  app.use(
    bodyParser.json({
      limit: '10mb',
    }),
  );
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  await app.enableCors(); // <- Add this line
  await app.listen(1024);
}
bootstrap();
