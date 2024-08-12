import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VRDocument = HydratedDocument<VR>;

@Schema()
export class JobStatus {
  @Prop()
  status: string;

  @Prop({ type: Object })
  prompt: Object;

  @Prop()
  jobId: string;

  @Prop()
  path: string;

  @Prop()
  credit: number;

  constructor(status: string, prompt: Object, jobId: string, path: string, credit: number) {
    this.status = status;
    this.prompt = prompt;
    this.jobId = jobId;
    this.path = path;
    this.credit = credit;
  }
}

const JobStatusSchema = SchemaFactory.createForClass(JobStatus);

@Schema()
export class VR {
  @Prop({ required: true })
  clerkId: string;

  @Prop({ type: [JobStatusSchema] })
  jobs: JobStatus[]; // object of job status(above)
}

export const VRSchema = SchemaFactory.createForClass(VR);
