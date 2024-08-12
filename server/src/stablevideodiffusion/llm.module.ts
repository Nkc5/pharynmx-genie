import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmProcessor } from './llm.processor';

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