import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class SaleRecord {
  @Prop()
  buyerName?: string;

  @Prop()
  buyerEmail?: string;

  @Prop()
  buyerPhone?: string;

  @Prop()
  soldAt?: Date;

  @Prop({ min: 0 })
  finalPrice?: number;

  @Prop()
  paymentMethod?: string;

  @Prop()
  partnerBank?: string;

  @Prop()
  contractNumber?: string;

  @Prop()
  notes?: string;
}
