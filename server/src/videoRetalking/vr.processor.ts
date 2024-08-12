import { Process, Processor } from '@nestjs/bull';
import { HttpException, HttpStatus, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { AzureService } from 'defaultLibraryPrefix/tts';
import { User } from 'microsoft-cognitiveservices-speech-sdk';
import { Model } from 'mongoose';
import path, { dirname } from 'path';
import { JobStatus, VR } from 'src/schemas/vr.schema';
import { UserService } from 'src/user/user.service';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

@Processor('vr')
export class VRProcessor {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly azureService: AzureService,
    @InjectModel('user') private readonly userModel: Model<User>,
    @InjectModel('vr') private readonly vrModel: Model<VR>,
  ) {}
  private readonly logger = new Logger(VRProcessor.name);

  async combineVideoChunks(chunks: string[]): Promise<string> {
    try {
      const tempDir = `${dirname(__dirname)}/cache`;
      console.log(tempDir);

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // Decode and write base64 videos to temporary files
      const tempFiles = await Promise.all(
        chunks.map((base64Data, index) => {
          const tempFilePath = path.join(tempDir, `${crypto.randomUUID()}.mp4`);
          const buffer = Buffer.from(base64Data, 'base64');
          return new Promise<string>((resolve, reject) => {
            fs.writeFile(tempFilePath, buffer, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(tempFilePath);
              }
            });
          });
        }),
      );

      // Combine videos
      const combinedVideoPath = path.join(
        tempDir,
        `${crypto.randomUUID()}.mp4`,
      );
      await new Promise<void>((resolve, reject) => {
        const ffmpegCommand = ffmpeg();
        tempFiles.forEach((tempFile) => {
          ffmpegCommand.input(tempFile); // Add each input file separately
        });
        ffmpegCommand
          .on('error', (err) => reject(err))
          .on('end', () => resolve())
          .mergeToFile(combinedVideoPath);
      });

      // Optionally encode combined video back to Base64
      const combinedVideoBuffer = fs.readFileSync(combinedVideoPath);
      const combinedBase64 = combinedVideoBuffer.toString('base64');

      // Clean up temporary files
      tempFiles.forEach((tempFilePath) => {
        fs.unlinkSync(tempFilePath);
      });
      fs.unlinkSync(combinedVideoPath);
      // fs.rmdirSync(tempDir); // Remove the directory only after all files are deleted

      return combinedBase64;
    } catch (error) {
      throw new Error(`Failed to combine video chunks: ${error.message}`);
    }
  }

  async fetchDataWithRetry(jobs: any[], delay: number) {
    /* 
      take reference from https://docs.runpod.io/serverless/references/job-states
    */
    while (true) {
      let completed = 0;
      try {
        for (let i = 0; i < jobs.length; ++i) {
          const response = await fetch(
            `${this.configService.get<string>('VIDEO_RETALKING')}/status/${jobs[i].id}`,
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
            // console.log(completed, jobs.length);
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

    /* if failed cancel remaining jobs as well */

    if (data.status === 'FAILED' || data.status === 'CANCELLED') {
      console.log('failed exiting');
      console.log(data);
      
      for (const job of data.data) {
        console.log(job);
        
        if (job.status !== 'FAILED' || job.status !== 'CANCELLED') {
          await fetch(
            `${this.configService.get<string>('VIDEO_RETALKING')}/cancel/${job.id}`,
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
      await this.vrModel.updateOne(
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
        });
      return;
    }

    /* if completed then upload to azure and update db */

    if (data.status === 'COMPLETED') {
      let duration = 0;

      // handle callback
      const jobs = data.data;
      const chunks = [];
      for (const job of jobs) {
        // console.log(job);

        const binaryData = await this.azureService.getFile(
          job.output.data.path,
        );
        chunks.push(binaryData);
        duration += job.output.data.duration;
        // chunks.push(job.output.data);
      }

      /*
        iterate through results and create as file in cache folder in root

        now we need to combine those chunks in one video check its duration, calculate charges and upload 
        to azure as well 
      */

      const combined = await this.combineVideoChunks(chunks);

      const combinedBlob = await this.azureService.uploadFile(
        `videoRetalking/${job.data['clerkId']}/output/${crypto.randomUUID()}`,
        Buffer.from(combined, 'base64'),
      );
      // console.log(combinedBlob);

      /* 
        ive duration variable above need rates prolly fetch from db and calculate based on that
        replace credit: 95 with calculated one
      */
      console.log(job.data.jobId);

      // console.log(
        await this.vrModel.updateOne(
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
            'jobs.$.path': combinedBlob,
            'jobs.$.credit': 5
          }),
      // );
      await this.userService.updateCredit({
        clerkId: job.data.clerkId,
        wallet: 5,
        operation: 'dec'
      });

      // this.userService.updateCredit({
      //   clerkId: 'user_2gon3s2TCDHoEF6tyVMLPzBhPxU',
      // });
    }

  }
}
