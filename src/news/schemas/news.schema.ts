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
  @Prop({ required: true, trim: true })
  headerEn: string;

  @Prop({ required: true, trim: true })
  headerKa: string;

  @Prop({ required: true, trim: true })
  descriptionEn: string;

  @Prop({ required: true, trim: true })
  descriptionKa: string;

  @Prop({ type: [String], default: [] })
  image: string[];

  // Optional article video — a file-service id (or external URL).
  @Prop({ trim: true })
  video?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  // When true, this article is shown as the wide main banner on the news
  // page. Only one article should carry this flag (enforced in the service).
  @Prop({ default: false, index: true })
  isMain: boolean;

  // Manual display order (ascending — lower shows first). Set via the admin
  // reorder UI. Defaults to 0 so unordered records fall back to the secondary
  // createdAt sort.
  @Prop({ default: 0, index: true })
  sortOrder: number;
}

export type NewsDocument = HydratedDocument<News>;
export const NewsSchema = SchemaFactory.createForClass(News);
