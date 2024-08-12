import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { VRController } from './vr.controller';
import { VRProcessor } from './vr.processor';
import { AzureModule } from 'libs/azure/src';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { VRSchema } from 'src/schemas/vr.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { VRService } from './vr.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'vr',
    }),
    MongooseModule.forFeature([{ name: 'vr', schema: VRSchema }]),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),  
    AzureModule,
    UserModule
  ],
  controllers: [VRController],
  providers: [VRProcessor, VRService],
})
export class VRModule {}