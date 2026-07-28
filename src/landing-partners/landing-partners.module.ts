import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LandingPartnersController } from './landing-partners.controller';
import { LandingPartnersService } from './landing-partners.service';
import {
  LandingPartner,
  LandingPartnerSchema,
} from './schemas/landing-partner.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LandingPartner.name, schema: LandingPartnerSchema },
    ]),
  ],
  controllers: [LandingPartnersController],
  providers: [LandingPartnersService],
  exports: [LandingPartnersService],
})
export class LandingPartnersModule {}
