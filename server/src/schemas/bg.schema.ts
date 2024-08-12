import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BGDocument = HydratedDocument<BG>;

@Schema()
export class JobStatus {
  @Prop()
  status: string;

  @Prop()
  jobId: string;

  @Prop()
  path: string;

  @Prop()
  uploadedPath: string;

  @Prop({ default: false })
  deleted: boolean

  @Prop()
  credit: number;

  constructor(
    status: string,
    jobId: string,
    path: string,
    uploadedPath: string,
    credit: number,
  ) {
    this.status = status;
    this.jobId = jobId;
    this.path = path;
    this.uploadedPath = uploadedPath;
    this.credit = credit;
  }
}

const JobStatusSchema = SchemaFactory.createForClass(JobStatus);

@Schema()
export class BG {
  @Prop({ required: true })
  clerkId: string;

  @Prop({ type: [JobStatusSchema] })
  jobs: JobStatus[]; // object of job status(above)
}

export const BGSchema = SchemaFactory.createForClass(BG);
