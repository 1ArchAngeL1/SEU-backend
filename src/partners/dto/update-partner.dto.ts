import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreatePartnerDto } from './create-partner.dto';
import { RequestBody } from '@/common/dto/request-body.dto';

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {}

export class UpdatePartnerRequest extends RequestBody<UpdatePartnerDto> {
  @ApiProperty({ type: () => UpdatePartnerDto })
  @ValidateNested()
  @Type(() => UpdatePartnerDto)
  declare data: UpdatePartnerDto;
}
