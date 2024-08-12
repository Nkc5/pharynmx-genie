import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { AzureService } from 'defaultLibraryPrefix/tts';
import { User } from 'microsoft-cognitiveservices-speech-sdk';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { AV, JobStatus, Path } from 'src/schemas/av.schema';
import { HD } from 'src/schemas/hd.schema';

@Processor('hd')
export class HDProcessor {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly azureService: AzureService,
    @InjectModel('user') private readonly userModel: Model<User>,
    @InjectModel('hd') private readonly hdModel: Model<HD>,
  ) {}
  private readonly logger = new Logger(HDProcessor.name);

  async fetchDataWithRetry(jobs: any[], delay: number) {
    /* 
      take reference from https://docs.runpod.io/serverless/references/job-states
    */
    while (true) {
      let completed = 0;
      try {
        for (let i = 0; i < jobs.length; ++i) {
          const response = await fetch(
            `${this.configService.get<string>('IMAGE')}/status/${jobs[i].id}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${this.configService.get<string>('RUNPOD_API_KEY')}`,
              },
            },
          );

          const data = await response.json();
          // console.log(data);

          if (jobs[i].status !== data.status) {
            jobs[i] = data;
          }

          if (data.status === 'COMPLETED') {
            ++completed;
            console.log(completed, jobs.length);
          }
          if (data.status === 'FAILED') {
            return {
              status: 'FAILED',
              data: jobs,
            };
          }
          if (data.status === 'CANCELLED') {
            return {
              status: 'CANCELLED',
              data: jobs,
            };
          }
          if (completed === jobs.length) {
            return {
              status: 'COMPLETED',
              data: jobs,
            };
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
      // Wait for the specified delay before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  @Process('generate')
  async handleGeneration(job: Job) {
    // this.logger.debug('Start transcoding...');
    this.logger.debug(job.data['jobs']);
    const data = await this.fetchDataWithRetry(job.data['jobs'], 10000);
    console.log(data);

    /* if failed cancel remaining jobs as well */

    if (data.status === 'FAILED' || data.status === 'CANCELLED') {
      console.log('failed exiting');
      console.log(data);

      for (const job of data.data) {
        console.log(job);

        if (job.status !== 'FAILED' || job.status !== 'CANCELLED') {
          await fetch(
            `${this.configService.get<string>('IMAGE')}/cancel/${job.id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${this.configService.get<string>('RUNPOD_API_KEY')}`,
              },
            },
          );
          // console.log(await response.json());
        }
      }

      await this.hdModel.updateOne(
        {
          clerkId: job.data.clerkId,
          jobs: {
            $elemMatch: {
              jobId: job.data.jobId,
            },
          },
        },
        {
          'jobs.$.status': 'FAILED',
        },
      );
      return;
    }

    /* if completed then upload to azure and update db */

    if (data.status === 'COMPLETED') {
      // handle callback
      const jobs = data.data;
      const paths = [];
      const seeds = [];
      for (const job of jobs) {
        console.log(job);
        // for (const op of job.output){
        if (job.output.length === 2) {
          paths.push(new Path(job.output[1].image_blob1));
          seeds.push(job.output[0].seed0);
        } else {
          paths.push(new Path(job.output[4].image_blob1));
          paths.push(new Path(job.output[5].image_blob2));
          paths.push(new Path(job.output[6].image_blob3));
          paths.push(new Path(job.output[7].image_blob4));
          seeds.push(job.output[0].seed0);
          seeds.push(job.output[1].seed1);
          seeds.push(job.output[2].seed2);
          seeds.push(job.output[3].seed3);
        }
      }      

        await this.hdModel.updateOne(
          {
            clerkId: job.data.clerkId,
            jobs: {
              $elemMatch: {
                jobId: job.data.jobId,
              },
            },
          },
          {
            'jobs.$.status': 'COMPLETED',
            'jobs.$.path': paths,
            'jobs.$.seed': seeds,
          },
        ),
      await this.userService.updateCredit({
        clerkId: job.data.clerkId,
        wallet: 5,
        operation: 'dec',
      });
    }
  }
}
