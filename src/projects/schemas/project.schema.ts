import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { LocalizedString } from '../../common/types/localized-string';
import { ProjectStatus } from '../enums/project-status.enum';
import { Currency } from '@/common/enums/currency.enum';

@Schema({ _id: false })
class GeoLocation {
  @Prop({ required: true })
  address: string;

  @Prop()
  city?: string;

  @Prop()
  district?: string;
}

@Schema({ _id: false })
class PriceRange {
  @Prop({enum: Currency, default: Currency.USD })
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
  @Prop({ type: LocalizedString, required: true })
  name: LocalizedString;

  @Prop({ type: LocalizedString })
  description?: LocalizedString;

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
}

export type ProjectDocument = HydratedDocument<Project>;
export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({
  'name.ka': 'text',
  'name.en': 'text',
  'name.ru': 'text',
  'description.ka': 'text',
  'description.en': 'text',
  'description.ru': 'text',
});
