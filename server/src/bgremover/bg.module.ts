import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { BGController } from './bg.controller';
import { BGProcessor } from './bg.processor';
import { AzureModule } from 'libs/azure/src';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { BGSchema } from 'src/schemas/bg.schema';
import { AVService } from 'src/avatar/av.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bg',
    }),
    MongooseModule.forFeature([{ name: 'bg', schema: BGSchema }]),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
    AzureModule,
    UserModule,
  ],
  controllers: [BGController],
  providers: [BGProcessor, AVService],
})
export class BGModule {}
