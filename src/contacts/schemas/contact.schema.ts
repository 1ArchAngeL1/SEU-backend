import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

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
  // Name is optional — only the phone number is required.
  @Prop()
  name?: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({ type: String, enum: ContactStatus, default: ContactStatus.OPEN })
  status: ContactStatus;

  // Set only when the request was sent from an apartment page, so the admin
  // panel can show which unit the visitor asked about. Absent on the generic
  // contact / landing forms.
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Unit',
    index: true,
  })
  unit?: Types.ObjectId;
}

export type ContactDocument = HydratedDocument<Contact>;
export const ContactSchema = SchemaFactory.createForClass(Contact);
