import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
// import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

   // Increase payload limit
   app.use(bodyParser.json({ limit: '50mb' }));
   app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  //  app.use(cors());
   
  await app.listen(process.env.PORT);
}
bootstrap();
