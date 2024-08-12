import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/add')
  async addUser(@Body() body: addUser) {
    let newUser = null;
    if (body.clerkId && body.email && body.username) {
      try {
        newUser = await this.userService.create(body);
        return newUser;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    throw new HttpException('Missing credentials', HttpStatus.BAD_REQUEST);
  }

  @Get()
  async getUser(@Req() req: Request){
    let clerkId = req['clerkId']
    return await this.userService.getUser(clerkId)
  }

  @Delete('/delete')
  async deleteUser(@Body() body: addUser) {
    if (body) {
      try {
        const deletedUser = await this.userService.delete(body);
        return deletedUser;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    throw new HttpException('Missing ID', HttpStatus.BAD_REQUEST);
  }

  @Put('/updateCredit')
  async updateCredit(@Body() body: updateUser) {
    if (body) {
      try {
        const updatedUser = await this.userService.updateCredit(body);
        return updatedUser;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    throw new HttpException('Missing ID', HttpStatus.BAD_REQUEST);
  }

  @Get('/get-country')
  async getCountry(@Query('q') clerkId: string) {
    if(clerkId) {
      try {
        const country = await this.userService.getCountry(clerkId);
        return country;
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    throw new HttpException('Missing ID', HttpStatus.BAD_REQUEST);
  }
}
