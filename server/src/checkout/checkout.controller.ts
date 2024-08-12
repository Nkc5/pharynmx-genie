import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post, Query } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionObject } from 'src/schemas/transaction.schema';
import { ProductService } from 'src/product/product.service';

@Controller('payment')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    @InjectModel('transaction') private readonly transactionModel: Model<Transaction>,
  ) {}

  @Post('/create-checkout-session')
  async createSession(@Body() body: checkoutData) {
    const session = await this.checkoutService.createSession(body.productId);
    return session;
  }

  @Get('/session-status')
  async getSession(@Query('session_id') session_id: string) {
    const session = await this.checkoutService.getSession(session_id);
    return session;
  }

  @Post('/getOrderId')
  async getOrderId(@Body() body: price) {
    const session = await this.checkoutService.getOrderId(body);
    return session;
  }

  @Post('/update')
  async updateStatus(@Body() body: payloadData) {
    console.log(body.productId);
    
    const data = await this.transactionModel.findOne({
      clerkId: body.clerkId,
    });
    const paymentData = await this.transactionModel.findOne({
      clerkId: body.clerkId,
      transactions: {
        $elemMatch: {
          id: body.payload.id,
        },
      },
    });
    const productData = await this.productService.findOne(body.productId)
    if(!productData)  throw new HttpException('Product not fount', HttpStatus.NOT_FOUND)
    // console.log(data, paymentData);

    let transactionObject = new TransactionObject(
      body.payload.id,
      body.payload.status,
      body.payload.amount / 100,
      productData.credit, // this place contains credit purchased from amount need to query first credit equivalent for that amount
      body.payload,
    );
    if (!data) {
      await this.transactionModel.create({
        clerkId: body.clerkId,
        transactions: transactionObject,
      });
    } else if (paymentData) {
      await this.transactionModel.findOneAndUpdate(
        {
          clerkId: body.clerkId,
          transactions: {
            $elemMatch: {
              id: body.payload.id,
            },
          },
        },
        {
          'transactions.$': transactionObject,
        },
        {
          new: true,
        },
      );
    } else {
      await this.transactionModel.findOneAndUpdate(
        {
          clerkId: body.clerkId,
        },
        {
          $push: {
            transactions: transactionObject,
          },
        },
        {
          new: true,
        },
      );
    }
    if (body.operation) {
      await this.userService.updateCredit({
        clerkId: body.clerkId,
        wallet: transactionObject.credit,
        operation: 'inc',
      });
    }
    return { message: "ok" }
  }

  @Post('/verify/:id')
  verify(@Body() detail: paymentDetail, @Param('id') id: string){
    console.log(id);
    return this.checkoutService.verifyPayment(id, detail)
  }
}
