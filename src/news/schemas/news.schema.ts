import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
export class News {
  @Prop({ required: true })
  header: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  image: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export type NewsDocument = HydratedDocument<News>;
export const NewsSchema = SchemaFactory.createForClass(News);
