import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

import {
  PolygonPoint,
  PolygonPointSchema,
} from '@/common/schemas/polygon-point.schema';
import { LocalizedString } from '@/common/types/localized-string';
import { BuildingStatus } from '../enums/building-status.enum';

@Schema({ _id: false })
class BuildingLocation {
  @Prop()
  address?: string;
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
export class Building {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  })
  project: Types.ObjectId;

  @Prop({ type: LocalizedString, required: true })
  name: LocalizedString; // e.g. "Block A" or "Tower 1"

  @Prop({ required: true, trim: true, uppercase: true, index: true })
  block: string; // e.g. "A", "B", "C"

  @Prop({ type: BuildingLocation })
  location?: BuildingLocation;

  @Prop({ enum: BuildingStatus, default: BuildingStatus.PLANNING, index: true })
  status: BuildingStatus;

  @Prop({ default: 0, min: 0 })
  basementFloors: number;

  @Prop({ default: 0, min: 0 })
  totalUnits: number;

  @Prop({ default: 0, min: 0 })
  availableUnits: number;

  @Prop({ default: 0, min: 0 })
  totalSize?: number; // built area m²

  @Prop({ default: 0, min: 0 })
  livableArea?: number; // habitable m²

  @Prop({ default: 0, min: 0 })
  parkingSpaces: number;

  @Prop({ min: 0, max: 100, default: 0 })
  constructionProgress: number; // %

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  mainImage?: string;

  @Prop({ type: LocalizedString })
  description?: LocalizedString;

  @Prop()
  renderImage?: string;

  @Prop({ type: [PolygonPointSchema], default: [] })
  polygon: PolygonPoint[];

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export type BuildingDocument = HydratedDocument<Building>;
export const BuildingSchema = SchemaFactory.createForClass(Building);

BuildingSchema.index({ project: 1, block: 1 }, { unique: true });
BuildingSchema.index({
  'name.ka': 'text',
  'name.en': 'text',
  'name.ru': 'text',
  'description.ka': 'text',
  'description.en': 'text',
  'description.ru': 'text',
});
