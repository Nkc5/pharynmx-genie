import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { razorpayProvider, stripeProvider } from './checkout.provider';
import { TransactionSchema } from 'src/schemas/transaction.schema';
import { UserService } from 'src/user/user.service';
import { ProductService } from 'src/product/product.service';
import { ProductSchema } from 'src/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'transaction', schema: TransactionSchema }]),
    MongooseModule.forFeature([{ name: 'product', schema: ProductSchema }]),
  ],
  controllers: [CheckoutController],
  providers: [stripeProvider, razorpayProvider, CheckoutService, UserService, ProductService],
})
export class CheckoutModule {}
