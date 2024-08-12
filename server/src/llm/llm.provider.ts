import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import OpenAI from 'openai';

export const openaiProvider: Provider = {
    provide: 'OPENAI',
    useFactory: (configService: ConfigService) => {
      return new OpenAI({
        apiKey: configService.get<string>('OPENAI_API_KEY')
      });
    },
    inject: [ConfigService],
  };
