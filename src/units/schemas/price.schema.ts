import { Prop, Schema } from '@nestjs/mongoose';
import { Currency } from '@/common/enums/currency.enum';

@Schema({ _id: false })
export class Price {
  @Prop({ enum: Currency, default: Currency.USD })
  currency: Currency;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ min: 0 })
  pricePerSqm?: number;

  @Prop({ default: 0, min: 0 })
  discount?: number;

  @Prop({ min: 0 })
  originalPrice?: number;
}
