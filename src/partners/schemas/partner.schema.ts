import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      return ret;
    },
  },
})
export class Partner {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  logoId?: string;

  @Prop()
  mail?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  facebookLink?: string;

  @Prop()
  discountPercentage?: number;
}

export type PartnerDocument = HydratedDocument<Partner>;
export const PartnerSchema = SchemaFactory.createForClass(Partner);
