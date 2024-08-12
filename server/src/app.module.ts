import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { BullModule } from '@nestjs/bull';
import { LlmModule } from './llm/llm.module';
import { CheckoutModule } from './checkout/checkout.module';
import configuration from './config/configuration';
import { VRModule } from './videoRetalking/vr.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductModule } from './product/product.module';
import { SDModule } from './stablediffusion/sd.module';
import { LoggerMiddleware } from './common/middleware/middleware';
import { AVModule } from './avatar/av.module';
import { BGModule } from './bgremover/bg.module';
import { HDModule } from './headshot/hd.module';
import { GDmodule } from './googleDrive/gd.module';
import { OauthModule } from './Oauth/Oauth.module';
// import { CDModule } from './cloudinary/cd.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env.production' : `.env.${ENV}`,
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      dbName: 'my-saas',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: 6379,
      },
    }),
    UserModule,
    LlmModule,
    VRModule,
    SDModule,
    CheckoutModule,
    ProductModule,
    AVModule,
    BGModule,
    HDModule,
    GDmodule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude('user/add')
      .forRoutes('user', 'videoretalking', 'comfy', 'llm', 'avatar', 'background', 'headshot');
  }
}
