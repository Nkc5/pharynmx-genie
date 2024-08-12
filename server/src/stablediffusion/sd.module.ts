import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SDController } from './sd.controller';
import { SDProcessor } from './sd.processor';
import { AzureModule } from 'libs/azure/src';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { SDSchema } from 'src/schemas/sd.schema';
import { SDService } from './sd.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sd',
    }),
    MongooseModule.forFeature([{ name: 'sd', schema: SDSchema }]),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),  
    AzureModule,
    UserModule
  ],
  controllers: [SDController],
  providers: [SDProcessor, SDService],
})
export class SDModule {}