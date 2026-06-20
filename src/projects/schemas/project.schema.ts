import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { ProjectStatus } from '../enums/project-status.enum';
import { Currency } from '@/common/enums/currency.enum';

@Schema({ _id: false })
class GeoLocation {
  @Prop({ required: true, trim: true })
  addressEn: string;

  @Prop({ required: true, trim: true })
  addressKa: string;

  @Prop({ trim: true })
  cityEn?: string;

  @Prop({ trim: true })
  cityKa?: string;

  @Prop({ trim: true })
  districtEn?: string;

  @Prop({ trim: true })
  districtKa?: string;
}

@Schema({ _id: false })
class PriceRange {
  @Prop({ enum: Currency, default: Currency.USD })
  currency: Currency;

  @Prop()
  minPrice?: number;

  @Prop()
  maxPrice?: number;

  @Prop()
  minPricePerSqm?: number;

  @Prop()
  maxPricePerSqm?: number;
}

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
export class Project {
  @Prop({ required: true, trim: true })
  nameEn: string;

  @Prop({ required: true, trim: true })
  nameKa: string;

  @Prop({ trim: true })
  descriptionEn?: string;

  @Prop({ trim: true })
  descriptionKa?: string;

  @Prop({ type: GeoLocation, required: true })
  location: GeoLocation;

  @Prop({ enum: ProjectStatus, default: ProjectStatus.PLANNING, index: true })
  status: ProjectStatus;

  @Prop()
  startDate?: Date;

  @Prop()
  expectedCompletionDate?: Date;

  @Prop()
  actualCompletionDate?: Date;

  @Prop({ default: 0, min: 0 })
  totalBuildings: number;

  @Prop({ default: 0, min: 0 })
  totalUnits: number;

  @Prop({ default: 0, min: 0 })
  availableUnits: number;

  @Prop({ default: 0, min: 0 })
  totalLandArea?: number; // m²

  @Prop()
  mainImage?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  videoUrl?: string;

  @Prop({ type: PriceRange })
  priceRange?: PriceRange;

  @Prop()
  renderImage?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false, index: true })
  isFeatured: boolean;

  @Prop()
  googleMapLink?: string;

  @Prop({ min: 0 })
  minSizeApartment?: number;

  @Prop({ min: 0 })
  maxSizeApartment?: number;

  @Prop({ trim: true })
  benefitsEn?: string;

  @Prop({ trim: true })
  benefitsKa?: string;
}

export type ProjectDocument = HydratedDocument<Project>;
export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({
  nameEn: 'text',
  nameKa: 'text',
  descriptionEn: 'text',
  descriptionKa: 'text',
});
