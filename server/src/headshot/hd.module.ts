import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { HDController } from './hd.controller';
import { HDProcessor } from './hd.processor';
import { AzureModule } from 'libs/azure/src';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { AVService } from './hd.service';
import { HDSchema } from 'src/schemas/hd.schema';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'hd',
    }),
    MongooseModule.forFeature([{ name: 'hd', schema: HDSchema }]),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),  
    AzureModule,
    UserModule
  ],
  controllers: [HDController],
  providers: [HDProcessor, AVService],
})
export class HDModule {}