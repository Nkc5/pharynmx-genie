import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  constructor(
    private configService: ConfigService,
    @Inject('OPENAI') private openai: OpenAI,
  ) {}

  async createCompletion(prompt: any): Promise<any> {
    console.log("13===",prompt);
    const response = await this.openai.chat.completions.create({
      messages: prompt,
      model: 'gpt-3.5-turbo',
    });

    // console.log('response', response);
    /*
      sample output of response
      {
    "id": "chatcmpl-9YXHo3rfHLoOA8jfFwyeIfj8T3FRz",
    "object": "chat.completion",
    "created": 1718018132,
    "model": "gpt-3.5-turbo-0125",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "Hello! How can I assist you today?"
            },
            "logprobs": null,
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 16,
        "completion_tokens": 9,
        "total_tokens": 25
    },
    "system_fingerprint": null
}
    */
    // prompt.push(response.choices[0].message);
    return response.choices[0].message;
  }
}
