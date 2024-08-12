import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { ProductService } from 'src/product/product.service';
// import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly productService: ProductService,
    @Inject('STRIPE') private stripe: Stripe,
    @Inject('RAZORPAY') private instance: Razorpay,
    @Inject(ConfigService) private configService: ConfigService,
  ) {}
  async createSession(priceId: string) {
    // const stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'));
    const session = await this.stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      // billing_address_collection: 'required',
      payment_method_options: {
        card: {
          request_three_d_secure: 'any',
        },
      },
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: `price_1PKvwQSFFXHNmcW1ugzUjXvi`,
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${this.configService.get<string>('DOMAIN')}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return { clientSecret: session.client_secret };
  }

  async getSession(sessionId: string) {
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async getOrderId(price: price) {
    const data = await this.productService.findOne(price.productId)
    
    if(data){
      let response = await this.instance.orders.create({
        amount: data.amount,
        currency: data.currency,
        receipt: `${crypto.randomUUID()}`,
        payment_capture: true,
        notes: {
          clerkId: price.clerkId,
          productId: price.productId
        }
      });
      console.log(response);
      return { message: response };  
    }else {
      throw new HttpException('Invalid product ID', HttpStatus.NOT_FOUND)
    }
  }

  async verifyPayment(id: string, detail: paymentDetail){
    console.log(detail);
    
    return await this.instance.payments.capture(id, detail.amount, detail.currency)
  }
}
