import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { openaiProvider } from './llm.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { LLM, LLMSchema } from 'src/schemas/llm.schema';
import { LlmService } from './llm.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'llm', schema: LLMSchema }]),
  ],
  controllers: [LlmController],
  providers: [openaiProvider, LlmService],
})
export class LlmModule {}