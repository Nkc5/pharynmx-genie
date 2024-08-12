import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
// import { JobStatus, Path } from 'src/schemas/sd.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AzureService } from 'defaultLibraryPrefix/tts';
import { AV, JobStatus, Path } from 'src/schemas/av.schema';
import { AVService } from './av.service';
import { SDService } from 'src/stablediffusion/sd.service';

@Controller('avatar')
export class AVController {
  constructor(
    private readonly configService: ConfigService,
    private readonly azureService: AzureService,
    private readonly avService: AVService,
    private readonly sdService: SDService,
    @InjectQueue('av') private readonly vrQueue: Queue,
    @InjectModel('av') private readonly avModel: Model<AV>,
  ) {}

  @Post()
  async transcode(@Req() req: Request, @Body() body: avQuery) {
    // console.log(req['clerkId']);
    let clerkId = req['clerkId'];

    const jobs = [];
    /* runpod api hit using query in params which will return uid of job */

    const modelData = this.sdService.getModels()

    const res = await fetch(`${this.configService.get<string>('IMAGE')}/run`, {
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
            task_type: "avatar",
            ethnicity: body.ethnicity,
            gender: body.gender,
            hair: body.hair,
            img_pose: `${this.avService.getPoses()[body.img_pose].png}`,
            age: body.age,
            cloth: body.cloth,
            seed: body.seed,
            img_no: body.img_no,
            clerkId: clerkId,
            hand_refiner: body.hand_refiner,
            model: modelData[body.model].model,
            method: modelData[body.model].method,
            height: 1344, 
            width: 768,
            steps: modelData[body.model].steps,
            cfg: modelData[body.model].cfg,
            // positive: '4k',
            negative: modelData[body.model].negative
          },
        },
      }),
    });
    const data = await res.json();
    console.log(data);
    jobs.push(data);

    /* send it in queue where it'll iterate through each job string and check its status if all are 
    complete then combine it with ffmpeg update db with credits */

    const id = crypto.randomUUID();

    const job = await this.vrQueue.add('generate', {
      jobId: id,
      clerkId: clerkId,
      jobs: jobs,
    });

    const userHistory = await this.avModel.findOne({
      clerkId: clerkId,
    });

    const newJobStatus = new JobStatus(
      'IN_PROGRESS',
      id,
      {
        ethnicity: body.ethnicity,
        gender: body.gender,
        hair: body.hair,
        img_pose: body.img_pose,
        age: body.age,
        cloth: body.cloth,
        seed: body.seed,
        img_no: body.img_no,
        hand_refiner: body.hand_refiner
      },
      [new Path('')],
      [''],
      0,
    );

    if (!userHistory) {
      await this.avModel.create({
        clerkId: clerkId,
        jobs: [newJobStatus],
      });
    } else {
      await this.avModel.findOneAndUpdate(
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

  @Get('/poses')
  getPoses(){
    return this.avService.getPoses()
  }

  @Get('/status/:id')
  async getStatus(@Req() req: Request, @Param('id') id: string) {
    // console.log(id);
    const data = await this.avModel.findOne(
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
  //   const data = await this.avModel.findOne({
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
  
    const data = await this.avModel.findOne({
      clerkId: req['clerkId'],
    }).sort({ createdAt: -1 });
    console.log("205====",data);
    if (!data) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
  
    // Using pagination directly within the query
    const paginatedJobs = await this.avModel.aggregate([
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
  async delete(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('imgId') imgId: string,
  ) {
    // console.log(imgId);

    const data = await this.avModel.findOne(
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
    // return data
    for (const i of data.jobs[0].path) {
      if (i.path === imgId) await this.azureService.deleteFile(i.path, 'file');
    }

    return await this.avModel.updateOne(
      {
        clerkId: req['clerkId'],
        'jobs.jobId': id,
        'jobs.path.path': imgId,
      },
      {
        $set: {
          'jobs.$[jobElem].path.$[pathElem].deleted': true, // Set deleted to true (or false as needed)
        },
      },
      {
        arrayFilters: [{ 'jobElem.jobId': id }, { 'pathElem.path': imgId }],
      },
    );
  }
}
