import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

import {
  PolygonPoint,
  PolygonPointSchema,
} from '@/common/schemas/polygon-point.schema';

export type FloorDocument = HydratedDocument<Floor>;

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
export class Floor {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Building',
    required: true,
    index: true,
  })
  building: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  })
  project: Types.ObjectId;

  @Prop({ required: true, min: -10, index: true })
  floorNumber: number;

  @Prop({ trim: true })
  floorImageId?: string;

  @Prop({ default: 0, min: 0 })
  totalUnits: number;

  @Prop({ default: 0, min: 0 })
  availableUnits: number;

  @Prop()
  renderImage?: string;

  @Prop({ type: [PolygonPointSchema], default: [] })
  polygon: PolygonPoint[];
}

export const FloorSchema = SchemaFactory.createForClass(Floor);

FloorSchema.index({ building: 1, floorNumber: 1 }, { unique: true });
