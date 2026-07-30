import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { ResumeStatus } from '../enums/resume-status.enum';

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
export class Resume {
  /** UUID of the uploaded résumé file (see FilesModule). */
  @Prop({ required: true })
  fileId: string;

  /** Original filename of the uploaded résumé, for display in the admin panel. */
  @Prop({ required: true })
  fileName: string;

  /** Position/job the applicant is applying for, if any. */
  @Prop()
  position?: string;

  @Prop({ type: String, enum: ResumeStatus, default: ResumeStatus.NEW })
  status: ResumeStatus;
}

export type ResumeDocument = HydratedDocument<Resume>;
export const ResumeSchema = SchemaFactory.createForClass(Resume);
