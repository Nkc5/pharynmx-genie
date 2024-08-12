import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AVController } from './av.controller';
import { AVProcessor } from './av.processor';
import { AzureModule } from 'libs/azure/src';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { AVSchema } from 'src/schemas/av.schema';
import { AVService } from './av.service';
import { SDService } from 'src/stablediffusion/sd.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'av',
    }),
    MongooseModule.forFeature([{ name: 'av', schema: AVSchema }]),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),  
    AzureModule,
    UserModule
  ],
  controllers: [AVController],
  providers: [AVProcessor, AVService, SDService],
})
export class AVModule {}