import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Provider } from '@nestjs/common';
// import * as Razorpay from 'razorpay';
const Razorpay = require('razorpay');

export const stripeProvider: Provider = {
  provide: 'STRIPE',
  useFactory: (configService: ConfigService) => {
    return new Stripe(configService.get<string>('STRIPE_SECRET_KEY'));
  },
  inject: [ConfigService],
};

export const razorpayProvider: Provider = {
    provide: 'RAZORPAY',
    useFactory: (configService: ConfigService) => {
      return new Razorpay({
        key_id: configService.get<string>('RAZOR_KEY_ID'),
        key_secret: configService.get<string>('RAZOR_SECRET_KEY'),
      });
    },
    inject: [ConfigService],
  };
