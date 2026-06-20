import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { RoomType } from '../enums/room.enums';

@Schema({ _id: false })
export class Room {
  @Prop({ trim: true })
  nameEn?: string;

  @Prop({ trim: true })
  nameKa?: string;

  @Prop({ enum: RoomType, required: true })
  type: RoomType;

  @Prop({ min: 0 })
  size?: number;

  @Prop({ trim: true })
  descriptionEn?: string;

  @Prop({ trim: true })
  descriptionKa?: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
