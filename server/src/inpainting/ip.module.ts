import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { LlmController } from './ip.controller';
import { LlmProcessor } from './ip.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'llm',
    }),
  ],
  controllers: [LlmController],
  providers: [LlmProcessor],
})
export class LlmModule {}