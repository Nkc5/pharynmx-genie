import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  clerkId: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  username: string;

  @Prop()
  country: string;

  @Prop({ default: 100 })
  wallet: number;

}

export const UserSchema = SchemaFactory.createForClass(User);
