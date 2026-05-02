import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FileDocument = HydratedDocument<FileEntity>;

@Schema({
  collection: 'files',
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.storagePath;
      return ret;
    },
  },
})
export class FileEntity {
  @Prop({ required: true, unique: true, index: true })
  uuid: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true, min: 0 })
  size: number;

  @Prop({ required: true })
  storagePath: string;
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);
