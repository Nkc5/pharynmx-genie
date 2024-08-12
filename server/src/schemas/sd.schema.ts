import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SDDocument = HydratedDocument<SD>;

export class Path {
  @Prop({ default: false })
  deleted: boolean;
  
  @Prop()
  path: string

  constructor(path: string){
    this.path = path,
    this.deleted
  }
}

@Schema({ timestamps: true })
export class JobStatus {
  @Prop()
  status: string;

  @Prop()
  jobId: string;

  @Prop({ type: Object })
  params: Object

  @Prop({ type: [Path] })
  path: Path[];

  @Prop()
  seed: string[];

  @Prop()
  credit: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  constructor(
    status: string,
    jobId: string,
    params: Object,
    path: Path[],
    seed: string[],
    credit: number, 
  ) {
    this.status = status;
    this.jobId = jobId;
    this.params = params;
    this.path = path;
    this.seed = seed;
    this.credit = credit;   
  }
}

const JobStatusSchema = SchemaFactory.createForClass(JobStatus);

@Schema()
export class SD {
  @Prop({ required: true })
  clerkId: string;

  @Prop({ type: [JobStatusSchema] })
  jobs: JobStatus[]; // object of job status(above)
}

export const SDSchema = SchemaFactory.createForClass(SD);
