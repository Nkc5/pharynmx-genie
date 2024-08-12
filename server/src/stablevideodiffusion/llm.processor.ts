import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

async function fetchDataWithRetry(url, delay = 10000) {
  let i = 0
  while (true) {
    console.log('still here');
    
    try {
      if(i === 2)  return "ok"
      // const response = await fetch(url);
      // if (response.ok) {
      //   const data = await response.json();
      //   return data; // Exit the loop and return the data when fetch is successful
      // }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    ++i
    // Wait for the specified delay before the next attempt
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}


@Processor('llm')
export class LlmProcessor {
  private readonly logger = new Logger(LlmProcessor.name);

  @Process('generate')
  async handleGeneration(job: Job) {
    this.logger.debug('Start transcoding...');
    this.logger.debug(job.data);
    const data = await fetchDataWithRetry('https://api.example.com/data')
    console.log(data);
    
    // .then(data => console.log('Fetched data:', data))
    // .catch(error => console.error('Failed to fetch data:', error));
    this.logger.debug('Transcoding completed');
    const res = await fetch('http://localhost:5000/user/updateCredit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clerkId: 'user_2gon3s2TCDHoEF6tyVMLPzBhPxU' }),
    });

    const result = await res.json();
    console.log(result);
  }
}
