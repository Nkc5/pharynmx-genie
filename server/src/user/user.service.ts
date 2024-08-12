import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  async create(params: CreateUserDto): Promise<User> {
    const checkDup = await this.userModel.find({
      username: params.username,
    });
    if (checkDup.length > 0) {
      throw new HttpException('Username already exist', 400);
    }
    // check user in archived if exist restore credit with creation
    const createdUser = await this.userModel.create(params);
    return createdUser;
  }

  async delete(params: CreateUserDto) {
    const checkDup = await this.userModel.findOne({
      clerkId: params.clerkId,
    });

    if (!checkDup) {
      throw new HttpException('Not found', 404);
    }
    const deletedUser = await this.userModel.deleteOne({
      clerkId: params.clerkId,
    });
    return deletedUser;
  }

  async updateCredit(params: UpdateUserDto) {
    try {
      let updateValue = 0;
      if (params.operation === 'inc') {
        updateValue = params.wallet;
      } else if (params.operation === 'dec') {
        updateValue = -params.wallet; // Negative value to deduct
      } else {
        throw new HttpException('Invalid operation', 400);
      }
      const updatedUserCredit = await this.userModel.findOneAndUpdate(
        { clerkId: params.clerkId },
        { $inc: { wallet: updateValue } },
        { new: true },
      );
      if (!updatedUserCredit) throw new HttpException('Update Failed', 500);
      return updatedUserCredit
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getCountry(id: string) {
    console.log(id);
    
    const user = await this.userModel.findOne({ clerkId: id });
    if (user) {
      return { 'data': user.country ? user.country : 'None'};
    }
  }

  async getUser(id: string){
    let data = await this.userModel.findOne({ clerkId: id })
    if(!data)   throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    else return data
  }
}
