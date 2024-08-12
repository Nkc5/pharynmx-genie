import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { JobStatus } from 'src/schemas/bg.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AzureService } from 'defaultLibraryPrefix/tts';
import { BG } from 'src/schemas/bg.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { getFileValidator } from 'src/common/validator';

@Controller('background')
export class BGController {
  constructor(
    private readonly configService: ConfigService,
    private readonly azureService: AzureService,
    @InjectQueue('bg') private readonly bgQueue: Queue,
    @InjectModel('bg') private readonly bgModel: Model<BG>,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async transcode(
    @Req() req: Request,
    @UploadedFile(getFileValidator())
    file: Express.Multer.File,
  ) {
    // console.log(req['clerkId']);
    let clerkId = req['clerkId'];
    // console.log(file.buffer.toString('base64'));
    const uploadedPath = await this.azureService.uploadFile(
      `bg_remove/${clerkId}/cache/${crypto.randomUUID()}`,
      file.buffer,
    );

    const jobs = [];
    /* runpod api hit using query in params which will return uid of job */
    
    const res = await fetch(
      `${this.configService.get<string>('BACKGROUND')}/run`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.configService.get<string>('RUNPOD_API_KEY')}`,
        },
        body: JSON.stringify({
          input: {
            container: this.configService.get<string>('AZURE_STORAGE_NAME'),
            inputs: {
              clerkId: clerkId,
              image_blob: uploadedPath,
            },
          },
        }),
      },
    );
    const data = await res.json();
    console.log(data);
    jobs.push(data);

    // /* send it in queue where it'll iterate through each job string and check its status if all are
    // complete then combine it with ffmpeg update db with credits */

    const id = crypto.randomUUID();

    const job = await this.bgQueue.add('generate', {
      jobId: id,
      clerkId: clerkId,
      jobs: jobs,
    });

    const userHistory = await this.bgModel.findOne({
      clerkId: clerkId,
    });

    const newJobStatus = new JobStatus('IN_PROGRESS', id, '', uploadedPath, 0);

    if (!userHistory) {
      await this.bgModel.create({
        clerkId: clerkId,
        jobs: [newJobStatus],
      });
    } else {
      await this.bgModel.findOneAndUpdate(
        {
          clerkId: clerkId,
        },
        {
          $push: {
            jobs: newJobStatus,
          },
        },
        { new: true },
      );
    }
    console.log(newJobStatus.jobId);

    return newJobStatus.jobId;
  }

  @Get()
  async getFile(@Query('url') url: string) {
    if (!url || url.length === 0) {
      throw new HttpException('url is required', HttpStatus.BAD_REQUEST);
    }
    return await this.azureService.getFile(url);
  }

  @Get('/status/:id')
  async getStatus(@Req() req: Request, @Param('id') id: string) {
    // console.log(id);
    const data = await this.bgModel.findOne(
      {
        clerkId: req['clerkId'],
      },
      {
        jobs: {
          $elemMatch: {
            jobId: id,
          },
        },
      },
    );
    if (!data || data.jobs.length === 0)
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return data.jobs[0];
  }

  // @Get('/history')
  // async getHistory(@Req() req: Request) {
  //   const data = await this.bgModel.findOne({
  //     clerkId: req['clerkId'],
  //   });
  //   if (!data) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
  //   return data.jobs;
  // }

  @Get('/history')
  async getHistory(@Req() req: Request) {
    const page = parseInt(req['query'].page as string) || 1;
    const limit = parseInt(req['query'].limit as string) || 10;
    const skip = (page - 1) * limit;
  
    const data = await this.bgModel.findOne({
      clerkId: req['clerkId'],
    }).sort({ createdAt: -1 });
    console.log("205====",data);
    if (!data) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
  
    // Using pagination directly within the query
    const paginatedJobs = await this.bgModel.aggregate([
      { $match: { clerkId: req['clerkId'] } },
      { $unwind: "$jobs" },
      { $sort: { "jobs.createdAt": -1 } },
      { $skip: skip },
      { $limit: limit },
      { $group: { _id: "$_id", jobs: { $push: "$jobs" } } }
    ]);
  
    if (!paginatedJobs || !paginatedJobs.length) {
      return { page, limit, total: 0, jobs: [] };
    }
  
    const totalJobs = data.jobs.length;
    
    return {
      page,
      limit,
      total: totalJobs,
      jobs: paginatedJobs[0].jobs,
    };
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    // console.log(imgId);

    const data = await this.bgModel.findOne(
      {
        clerkId: req['clerkId'],
      },
      {
        jobs: {
          $elemMatch: {
            jobId: id,
          },
        },
      },
    );
    if (data.jobs.length === 0 || data.jobs[0].status === 'FAILED')
      throw new HttpException('Invalid jobid', HttpStatus.BAD_REQUEST);

    await this.azureService.deleteFile(data.jobs[0].path, 'file');

    return await this.bgModel.updateOne(
      {
        clerkId: req['clerkId'],
        'jobs.jobId': id,
      },
      {
        $set: {
          'jobs.$.deleted': true, // Set deleted to true (or false as needed)
        },
      },
    );
    // return data
  }
}
