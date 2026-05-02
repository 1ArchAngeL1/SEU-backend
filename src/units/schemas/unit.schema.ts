import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

import { LocalizedString } from '@/common/types/localized-string';
import { Room, RoomSchema } from '@/room/schemas/room.schema';
import { FurnishingStatus, UnitStatus, UnitType } from '../enums/unit.enums';
import { Price } from '@/units/schemas/price.schema';
import { Reservation } from '@/units/schemas/reservation.schema';
import { SaleRecord } from '@/units/schemas/sale.schema';

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
export class Unit {
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

  @Prop({ required: true, trim: true, index: true })
  unitNumber: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Floor',
    required: true,
    index: true,
  })
  floor: Types.ObjectId;

  @Prop({ required: true, min: -10, index: true })
  floorNumber: number;

  @Prop({ enum: UnitStatus, default: UnitStatus.AVAILABLE, index: true })
  status: UnitStatus;

  @Prop({ enum: UnitType, required: true, default: UnitType.LIVING, index: true })
  type: UnitType;

  @Prop({ type: [RoomSchema], default: [] })
  rooms: Room[];

  @Prop({ default: 0, min: 0, required: false })
  bedrooms?: number;

  @Prop({ default: 0, min: 0, required: false })
  bathrooms?: number;

  @Prop({ default: 0, min: 0, required: false })
  livingRooms?: number;

  @Prop({ default: 0, min: 0, required: false })
  balconies?: number;

  @Prop({ default: 0, min: 0, required: false })
  terraces?: number;

  @Prop({ required: true, min: 0, index: true })
  totalSize: number;

  @Prop({ min: 0 })
  livableArea?: number;

  @Prop({ min: 0 })
  balconySize?: number;

  @Prop({ min: 0 })
  terraceSize?: number;

  @Prop({ type: Price, required: true })
  price: Price;

  @Prop({ enum: FurnishingStatus, default: FurnishingStatus.ROUGH_DRAFT })
  furnishingStatus: FurnishingStatus;

  @Prop({ type: String })
  mainImage?: string;

  @Prop({ required: false })
  planImage?: string;

  @Prop({ type: String, required: false })
  twoDContent?: string;

  @Prop({ type: String, required: false })
  threeDContent?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  videoTourUrl?: string;

  @Prop({ type: LocalizedString })
  description?: LocalizedString;

  @Prop({ type: Reservation })
  reservation?: Reservation;

  @Prop({ type: SaleRecord })
  saleRecord?: SaleRecord;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export type UnitDocument = HydratedDocument<Unit>;
export const UnitSchema = SchemaFactory.createForClass(Unit);

UnitSchema.index({ building: 1, unitNumber: 1 }, { unique: true });
UnitSchema.index({ project: 1, status: 1 });
UnitSchema.index({ project: 1, type: 1 });
UnitSchema.index({ project: 1, bedrooms: 1, totalSize: 1 });
UnitSchema.index({ 'price.amount': 1 });
UnitSchema.index({
  'description.ka': 'text',
  'description.en': 'text',
  'description.ru': 'text',
});
