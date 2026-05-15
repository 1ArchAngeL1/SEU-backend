import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { ContactStatus } from '../enums/contact-status.enum';

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
export class Contact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({ type: String, enum: ContactStatus, default: ContactStatus.OPEN })
  status: ContactStatus;
}

export type ContactDocument = HydratedDocument<Contact>;
export const ContactSchema = SchemaFactory.createForClass(Contact);
