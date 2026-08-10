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

  // Manual display order (ascending — lower shows first). Set via the admin
  // reorder UI. Defaults to 0 so unordered records fall back to the secondary
  // createdAt sort.
  @Prop({ default: 0, index: true })
  sortOrder: number;
}

export type LandingPartnerDocument = HydratedDocument<LandingPartner>;
export const LandingPartnerSchema = SchemaFactory.createForClass(LandingPartner);
