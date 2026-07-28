import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateLandingPartnerDto } from './create-landing-partner.dto';
import { RequestBody } from '@/common/dto/request-body.dto';

export class UpdateLandingPartnerDto extends PartialType(CreateLandingPartnerDto) {}

export class UpdateLandingPartnerRequest extends RequestBody<UpdateLandingPartnerDto> {
  @ApiProperty({ type: () => UpdateLandingPartnerDto })
  @ValidateNested()
  @Type(() => UpdateLandingPartnerDto)
  declare data: UpdateLandingPartnerDto;
}
