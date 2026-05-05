import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PolygonPoint {
  @Prop({ required: true, min: 0, max: 100 })
  x: number;

  @Prop({ required: true, min: 0, max: 100 })
  y: number;
}

export const PolygonPointSchema = SchemaFactory.createForClass(PolygonPoint);
