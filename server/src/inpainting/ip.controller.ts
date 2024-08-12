import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Post } from '@nestjs/common';
import { Queue } from 'bull';

@Controller('llm')
export class LlmController {
  constructor(@InjectQueue('llm') private readonly llmQueue: Queue) {}

  @Post('generate')
  async transcode(@Body() body: any) {
    // runpod api hit using query in params which will return uid of job
    const job = await this.llmQueue.add('generate', {
      clerkId: body.clerkId,
      jobId: 5, // replace 5 with jobID returned by runpod
    });
    console.log(job.id);
    return job.id
  }
}