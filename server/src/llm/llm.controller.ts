import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { LlmService } from './llm.service';
import { ChatBody, ChatHistory, LLM } from 'src/schemas/llm.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('llm')
export class LlmController {
  constructor(
    private readonly llmService: LlmService,
    @InjectModel('llm') private readonly llmModel: Model<LLM>,
  ) {}

  @Post()
  async complete(@Req() req: Request, @Body() body: llmQuery) {
    let clerkId = req['clerkId'];

    const data = await this.llmModel.findOne({
      clerkId: clerkId,
    });

    const workspace = await this.llmModel.findOne(
      {
        clerkId: clerkId,
      },
      {
        chatHistory: {
          $elemMatch: {
            workspace_id: body.workspaceId,
          },
        },
      },
    );

    const workspaceId = crypto.randomUUID();
    let response = null
    if (!data) {
      const chatHistory = new ChatHistory(workspaceId, [
        { role: 'system', content: "You're helpful assistant" },
        { role: 'user', content: body.prompt },
      ]);
      const resp = await this.llmService.createCompletion(chatHistory.chat);
      response = resp
      chatHistory.chat.push(resp);

      let history =  [...chatHistory.chat]
      let obj = { role: "user", content: "Can you give me context of above conversation in 3 words?" }
      history.push(obj)
     
      const respSummary = await this.llmService.createCompletion(history);
      chatHistory['summary'] = respSummary.content

      await this.llmModel.create({
        clerkId: clerkId,
        chatHistory: chatHistory,
      });
    } else if (!workspace.chatHistory) {
      let chatHistory = new ChatHistory(workspaceId, [
        { role: 'system', content: "You're helpful assistant" },
        { role: 'user', content: body.prompt },
      ]);
      const resp = await this.llmService.createCompletion(chatHistory.chat);
      response = resp
      chatHistory.chat.push(resp);

      let history =  [...chatHistory.chat]
      let obj = { role: "user", content: "Can you give me context of above conversation in 3 words?" }
      history.push(obj)
     
      const respSummary = await this.llmService.createCompletion(history);
      chatHistory['summary'] = respSummary.content
     
      await this.llmModel.updateOne(
        {
          clerkId: clerkId,
        },
        {
          $push: {
            chatHistory: chatHistory,
          },

        },
      );
    } else {
      workspace.chatHistory[0].chat.push({
        role: 'user',
        content: body.prompt,
      });
      const resp = await this.llmService.createCompletion(
        workspace.chatHistory[0].chat,
      );
      response = resp
      workspace.chatHistory[0].chat.push(resp);

      await this.llmModel.updateOne(
        {
          clerkId: clerkId,
          'chatHistory.workspace_id': body.workspaceId,
        },
        {
          'chatHistory.$.chat': workspace.chatHistory[0].chat,
        },
      );
      // console.log(data);
    }
    // console.log(response);

    return {
      workspace_id: body.workspaceId || workspaceId,
      content: response,
    };

    // now calculate token and deduct credit of user sample output is in service file for response

    // const db = await this.llmModel.create({workspace_id: crypto.randomUUID(), content: response.message.content})

    // return job.id
  }

  @Get()
  async getHistory(@Req() req: Request) {
    const data = await this.llmModel.findOne({
      clerkId: req['clerkId'],
    });

    if (!data) throw new HttpException('No chat found', HttpStatus.NOT_FOUND);
    return data.chatHistory;
  }

  @Get('/workspaces')
  async getWorkspaceId(@Req() req: Request) {
    const data = await this.llmModel.findOne({
      clerkId: req['clerkId'],
    });
    if (!data) throw new HttpException('No chat found', HttpStatus.NOT_FOUND);
    const workspaces = [];
    for (const i of data.chatHistory) {
      workspaces.push({
        workspace_id: i?.workspace_id,
        summary: i.summary,
        createdAt: i?.createdAt,
      });
    }
    return workspaces;
  }

  @Get('/chat/:id')
  async getChatHistory(@Req() req: Request, @Param('id') id: string) {
    const clerkId = req['clerkId'];

    const data = await this.llmModel.findOne(
      {
        clerkId: clerkId,
      },
      {
        chatHistory: {
          $elemMatch: {
            workspace_id: id,
          },
        },
      },
    );
    // console.log(data);

    if (!data || data.chatHistory.length === 0)
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return data.chatHistory[0];
  }

  @Delete('/:id')
  async deleteChat(@Req() req: Request, @Param('id') id: string) {
    const clerkId = req['clerkId'];
    const data = await this.llmModel.findOne(
      {
        clerkId: clerkId,
      },
      {
        chatHistory: {
          $elemMatch: {
            workspace_id: id,
          },
        },
      },
    );
    // console.log(data);
    if (!data || data.chatHistory.length === 0)
      throw new HttpException('Invalid ID', HttpStatus.NOT_FOUND);

    return await this.llmModel.updateOne(
      {
        clerkId,
      },
      {
        $pull: {
          chatHistory: {
            workspace_id: id,
          },
        },
      },
    );
  }
}
