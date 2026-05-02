import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { RoomType } from '../enums/room.enums';

@Schema({ _id: false })
export class Room {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ enum: RoomType, required: true })
  type: RoomType;

  @Prop({ min: 0 })
  size?: number;

  @Prop({ trim: true })
  description?: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
