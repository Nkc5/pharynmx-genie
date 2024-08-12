//in array of object: clerkid, status, amount, creditUpdated

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type transactionDocument = HydratedDocument<Transaction>;

@Schema()
export class TransactionObject {

  @Prop()
  id: string;

  @Prop()
  status: string;

  @Prop()
  amount: number;

  @Prop()
  credit: number;

  @Prop({ type: Object })
  transactionData: any;

  constructor(
    id: string,
    status: string,
    amount: number,
    credit: number,
    transactionData: any,
  ) {
    this.id = id;
    this.status = status;
    this.amount = amount;
    this.credit = credit;
    this.transactionData = transactionData;
  }
}

const TransactionObjectSchema = SchemaFactory.createForClass(TransactionObject);

@Schema()
export class Transaction {
  @Prop()
  clerkId: string;

  @Prop({ type: [TransactionObjectSchema] })
  transactions: TransactionObject[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
