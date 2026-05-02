import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Reservation {
  @Prop()
  reservedByName?: string;

  @Prop()
  reservedByEmail?: string;

  @Prop()
  reservedByPhone?: string;

  @Prop()
  reservedAt?: Date;

  @Prop()
  reservationExpiresAt?: Date;

  @Prop()
  notes?: string;
}
