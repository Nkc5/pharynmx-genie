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
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { AzureService } from 'libs/azure/src';
import path, { dirname } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { JobStatus, VR, VRSchema } from 'src/schemas/vr.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VRService } from './vr.service';
import { Response } from 'express';

@Controller('videoretalking')
export class VRController {
  constructor(
    private readonly configService: ConfigService,
    private readonly azureService: AzureService,
    private readonly vrService: VRService,
    @InjectQueue('vr') private readonly vrQueue: Queue,
    @InjectModel('vr') private readonly vrModel: Model<VR>,
  ) {}

  @Post()
  async transcode(@Req() req: Request, @Body() body: vrQuery) {
    let clerkId = req['clerkId'];
    console.log(body);

    // Validate input
    if (!body.text || body.text.trim() === '') {
      throw new HttpException('Text is required', HttpStatus.BAD_REQUEST);
    }

    const locale = body.voice.substring(
      body.voice.length - 5,
      body.voice.length,
    );
    console.log(locale);
    console.log(this.vrService.getAssets('videos')[body.image]);
    console.log(this.vrService.getAssets('audios')[body.voice]);
    // await this.azureService.getFile(`videoRetalking/static/videos/${this.vrService.getAssets("videos")[body.image]}`)
    // return { "dat": "ok" }

    // Split task into chunks of 20 words

    const words = body.text.split(' ');
    const chunks = [];
    let currentChunk = '';

    for (const word of words) {
      if ((currentChunk + word).split(' ').length <= 20) {
        currentChunk += word + ' ';
      } else {
        chunks.push(currentChunk.trim());
        currentChunk = word + ' ';
      }
    }

    // Push the last remaining chunk
    if (currentChunk.trim() !== '') {
      chunks.push(currentChunk.trim());
    }
    // console.log(chunks);
    // return chunks

    // Call TTS API for each chunk
    const results = [];
    for (const chunk of chunks) {
      const { filename }: any = await this.azureService.textToSpeech(
        chunk,
        `${locale}-${body.voice.split('-')[1]}`,
        locale,
      );
      const dir =
        this.configService.get<string>('NODE_ENV') === 'development'
          ? dirname(__dirname) + '/public' + filename
          : __dirname + '/public' + filename;
      results.push(dir);
    }

    /* upload video from client using azure blob and send its url in body after that read those tts audio 
    into base64 and yeet em to runpod. runpod will download video and upload result and send url in 
    response we'll update credit here and send url to client and render there using blob download */

    const jobs = [];
    for (const result of results) {
      const audioBuffer = fs.readFileSync(result);
      const audio = await this.azureService.uploadFile(
        `videoRetalking/${clerkId}/cache/${crypto.randomUUID()}`,
        audioBuffer,
      );
      // console.log(video, audio);

      /* runpod api hit using query in params which will return uid of job */

      const res = await fetch(
        `${this.configService.get<string>('VIDEO_RETALKING')}/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.configService.get<string>('RUNPOD_API_KEY')}`,
          },
          body: JSON.stringify({
            input: {
              clerkId: clerkId,
              container: this.configService.get<string>('AZURE_STORAGE_NAME'),
              video: `videoRetalking/static/videos/${this.vrService.getAssets('videos')[body.image]}`,
              audio: audio,
            },
          }),
        },
      );
      const data = await res.json();
      // console.log(data);

      /* append those into jobs array */

      jobs.push(data);
    }

    /* send it in queue where it'll iterate through each job string and check its status if all are 
    complete then combine it with ffmpeg update db with credits */

    const id = crypto.randomUUID();

    const job = await this.vrQueue.add('generate', {
      jobId: id,
      clerkId: clerkId,
      jobs: jobs,
    });

    const data = await this.vrModel.findOne({
      clerkId: clerkId,
    });

    const newJobStatus = new JobStatus(
      'IN_PROGRESS',
      {
        voice: body.voice,
        image: body.image,
        text: body.text,
      },
      id,
      '',
      0,
    );

    if (!data) {
      await this.vrModel.create({
        clerkId: clerkId,
        jobs: [newJobStatus],
      });
    } else {
      await this.vrModel.findOneAndUpdate(
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
    return newJobStatus.jobId;
  }

  @Post('audio')
  async GetAudioPreview(
    @Body() body,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    console.log('body', body);

    try {
      let clerkId = req['clerkId'];

      const locale = body.voice.substring(
        body.voice.length - 5,
        body.voice.length,
      );

      // Split task into chunks of 20 words

      const words = body.text.split(' ');
      const chunks = [];
      let currentChunk = '';

      for (const word of words) {
        if ((currentChunk + word).split(' ').length <= 20) {
          currentChunk += word + ' ';
        } else {
          chunks.push(currentChunk.trim());
          currentChunk = word + ' ';
        }
      }

      // Push the last remaining chunk
      if (currentChunk.trim() !== '') {
        chunks.push(currentChunk.trim());
      }
      // console.log(chunks);
      // return chunks

      // Call TTS API for each chunk
      const results = [];
      for (const chunk of chunks) {
        const { filename }: any = await this.azureService.textToSpeech(
          chunk,
          `${locale}-${body.voice.split('-')[1]}`,
          locale,
        );
        const dir = 'public' + filename;
        results.push(dir);
      }

      const buffers = await Promise.all(
        results.map(async (file) => {
          const data = await fs.promises.readFile(file);
          return data;
        }),
      );

      console.log('buffers', buffers);

      // Concatenate buffers
      const concatenatedBuffer = Buffer.concat(buffers);

      const uuid = crypto.randomUUID();

      const outputPath = path.join('public/speech', `${uuid}.wav`);

      // Write the concatenated buffer to a new file
      await fs.promises.writeFile(outputPath, concatenatedBuffer);

      const newPath = outputPath.replace('public', "");
      console.log("newPath", newPath)

      return res.send({ fileName: newPath });
    } catch (error) {
      console.log('error', error.message);
      return res.json(error.message);
    }
  }

  @Get()
  async getFile(@Query('url') url: string) {
    if (!url || url.length === 0) {
      throw new HttpException('url is required', HttpStatus.BAD_REQUEST);
    }
    return await this.azureService.getFile(url);
  }

  // @Get('/history')
  // async getHistory(@Req() req: Request) {
  //   const data = await this.vrModel.findOne({
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

    const data = await this.vrModel
      .findOne({
        clerkId: req['clerkId'],
      })
      .sort({ createdAt: -1 });
    console.log('205====', data);
    if (!data) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);

    // Using pagination directly within the query
    const paginatedJobs = await this.vrModel.aggregate([
      { $match: { clerkId: req['clerkId'] } },
      { $unwind: '$jobs' },
      { $sort: { 'jobs.createdAt': -1 } },
      { $skip: skip },
      { $limit: limit },
      { $group: { _id: '$_id', jobs: { $push: '$jobs' } } },
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

  @Get('/status/:id')
  async getStatus(@Req() req: Request, @Param('id') id: string) {
    // console.log(id);
    const data = await this.vrModel.findOne(
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
    // console.log(data);

    return data.jobs[0];
  }

  @Get('/assets')
  async getAssets(@Query('type') type: string) {
    return this.vrService.getAssets(type);
  }

  @Delete()
  async deleteBlob(@Query() query: deleteQuery) {
    await this.azureService.deleteFile(query.url, query.type);
  }
}
