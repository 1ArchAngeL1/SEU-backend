import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

import { LocalizedString } from '@/common/types/localized-string';

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
export class ApartmentType {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  })
  project: Types.ObjectId;

  @Prop({ type: LocalizedString })
  name?: LocalizedString;

  @Prop({ required: true, min: 0, index: true })
  bedrooms: number;

  @Prop({ required: true, min: 0 })
  sizeFrom: number;

  @Prop({ required: true, min: 0 })
  sizeTo: number;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: LocalizedString })
  description?: LocalizedString;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export type ApartmentTypeDocument = HydratedDocument<ApartmentType>;
export const ApartmentTypeSchema = SchemaFactory.createForClass(ApartmentType);

ApartmentTypeSchema.index({ project: 1, bedrooms: 1 });
