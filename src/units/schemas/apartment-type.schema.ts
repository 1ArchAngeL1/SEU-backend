import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

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

  @Prop({ trim: true })
  nameEn?: string;

  @Prop({ trim: true })
  nameKa?: string;

  @Prop({ required: true, min: 0, index: true })
  bedrooms: number;

  @Prop({ required: true, min: 0 })
  sizeFrom: number;

  @Prop({ required: true, min: 0 })
  sizeTo: number;

  @Prop({ type: String })
  image?: string;

  @Prop({ trim: true })
  descriptionEn?: string;

  @Prop({ trim: true })
  descriptionKa?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export type ApartmentTypeDocument = HydratedDocument<ApartmentType>;
export const ApartmentTypeSchema = SchemaFactory.createForClass(ApartmentType);

ApartmentTypeSchema.index({ project: 1, bedrooms: 1 });
