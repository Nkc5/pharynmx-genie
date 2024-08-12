import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ unique: true })
  productId: string;

  /* added two zeroes in the end of amount bc razorpay requires it */
  @Prop()
  amount: number;

  @Prop()
  credit: number;

  @Prop()
  currency: string;

}

export const ProductSchema = SchemaFactory.createForClass(Product);
