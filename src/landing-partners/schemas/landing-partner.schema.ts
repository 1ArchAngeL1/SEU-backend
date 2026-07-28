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
export class LandingPartner {
  @Prop({ required: true, trim: true })
  nameEn: string;

  @Prop({ required: true, trim: true })
  nameKa: string;

  @Prop()
  logoId?: string;

  @Prop({ trim: true })
  websiteLink?: string;

  @Prop({ trim: true })
  descriptionEn?: string;

  @Prop({ trim: true })
  descriptionKa?: string;
}

export type LandingPartnerDocument = HydratedDocument<LandingPartner>;
export const LandingPartnerSchema = SchemaFactory.createForClass(LandingPartner);
