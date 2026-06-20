import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

import {
  PolygonPoint,
  PolygonPointSchema,
} from '@/common/schemas/polygon-point.schema';
import { BuildingStatus } from '../enums/building-status.enum';

@Schema({ _id: false })
class BuildingLocation {
  @Prop({ trim: true })
  addressEn?: string;

  @Prop({ trim: true })
  addressKa?: string;
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

  @Prop({ required: true, trim: true })
  nameEn: string; // e.g. "Block A" or "Tower 1"

  @Prop({ required: true, trim: true })
  nameKa: string;

  @Prop({ required: true, trim: true, uppercase: true, index: true })
  block: string; // e.g. "A", "B", "C"

  @Prop({ type: BuildingLocation })
  location?: BuildingLocation;

  @Prop({ enum: BuildingStatus, default: BuildingStatus.PLANNING, index: true })
  status: BuildingStatus;

  @Prop({ default: 0, min: 0 })
  floorsAboveGround: number;

  @Prop({ default: 0, min: 0 })
  totalUnits: number;

  @Prop({ default: 0, min: 0 })
  availableUnits: number;

  @Prop({ default: 0, min: 0 })
  totalSize?: number; // built area m²

  @Prop({ default: 0, min: 0 })
  livableArea?: number; // habitable m²

  @Prop({ default: 0, min: 0 })
  basementLevels: number;

  @Prop({ min: 0, max: 100, default: 0 })
  constructionProgress: number; // %

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  mainImage?: string;

  @Prop({ trim: true })
  descriptionEn?: string;

  @Prop({ trim: true })
  descriptionKa?: string;

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
  nameEn: 'text',
  nameKa: 'text',
  descriptionEn: 'text',
  descriptionKa: 'text',
});
