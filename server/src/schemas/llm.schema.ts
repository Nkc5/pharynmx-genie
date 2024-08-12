import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatCompletionMessageParam } from 'openai/resources';

export type LLMDocument = HydratedDocument<LLM>;

@Schema()
export class ChatBody {
  @Prop()
  role: string;

  @Prop()
  content: string;

  constructor(role: string, content: string) {
    this.role = role;
    this.content = content;
  }
}

const ChatBodySchema = SchemaFactory.createForClass(ChatBody);

@Schema({ timestamps: true })
export class ChatHistory {
  @Prop()
  workspace_id: string;

  @Prop()
  summary: string;

  @Prop({ type: [ChatBodySchema] })
  chat: ChatBody[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  constructor(workspace_id: string, chat: ChatBody[]) {
    this.workspace_id = workspace_id;
    this.chat = chat;
  }
}

const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);

@Schema()
export class LLM {
  @Prop({ required: true })
  clerkId: string;

  @Prop({ type: [ChatHistorySchema] })
  chatHistory: ChatHistory[];
}

export const LLMSchema = SchemaFactory.createForClass(LLM);
